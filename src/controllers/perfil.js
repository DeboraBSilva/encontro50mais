require("dotenv").config();
const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

exports.getPergunta = async (req, res) => {
  let contador = parseInt(req.session.posicaoPergunta);
  console.log("antes do if", contador);
  if (req.query.contador) {
    contador--;
    if (contador < 0) {
      contador = 0;
    }
  } else {
    contador++;
  }
  req.session.posicaoPergunta = contador;
  console.log("depois do if", contador);
  console.log("req.query", req.query );
  knex
    .select("idPergunta", "descricao", "tipo")
    .from("pergunta")
    .orderBy("ordem", "asc")
    .limit(1)
    .offset(contador)
    .then((pergunta) => {
      
      knex
        .select("idOpcao", "descricao")
        .from("opcao")
        .where("idPergunta", pergunta[0].idPergunta)
        .then((opcoes) => {
          knex
            .select(
              "idPergunta",
              "idOpcao",
              "respostaTexto",
              "respostaNumero",
              "respostaIntervalo1",
              "respostaIntervalo2"
            )
            .from("resposta")
            .modify(function (queryBuilder) {
              if (req.session.idPessoa) {
                queryBuilder.where("idPessoa", req.session.idPessoa);
              }
            })
            .andWhere("idPergunta", pergunta[0].idPergunta)
            .then((respostas) => {
              res.render("pages/perfil", {
                pergunta: pergunta[0],
                opcoes,
                respostas,
              });
            })
            .catch((err) => {
              console.log(`Ocorreu um erro ao buscar as opções: ${err}`);
            });
        })
        .catch((err) => {
          console.log(`Ocorreu um erro ao buscar as opções: ${err}`);
        });
    })
    .catch((err) => {
      req.session.posicaoPergunta = 0;
      res.render("index_user");
      console.log(`Ocorreu um erro ao buscar a pergunta: ${err}`);
    });
};

exports.salvarResposta = async (req, res) => {
  knex("resposta")
    .modify(function (queryBuilder) {
      if (req.session.idPessoa) {
        queryBuilder.where("idPessoa", req.session.idPessoa);
      }
    })
    .andWhere("idPergunta", req.body.idPergunta)
    .del()
    .then(() => {
      let idsOpcoes = [];
      if (Array.isArray(req.body.idOpcao)) {
        idsOpcoes = req.body.idOpcao;
      } else {
        idsOpcoes = [req.body.idOpcao];
      }
      const resposta = idsOpcoes.map((idOpcao) => {
        return {
          idPessoa: req.session.idPessoa,
          idPergunta: req.body.idPergunta,
          idOpcao: idOpcao,
          respostaTexto: req.body.respostaTexto,
          respostaNumero: Number.isInteger(
            parseInt(req.body.respostaNumero, 10)
          )
            ? parseInt(req.body.respostaNumero, 10)
            : undefined,
          respostaIntervalo1: Number.isInteger(
            parseInt(req.body.respostaIntervalo1, 10)
          )
            ? parseInt(req.body.respostaIntervalo1, 10)
            : undefined,
          respostaIntervalo2: Number.isInteger(
            parseInt(req.body.respostaIntervalo2, 10)
          )
            ? parseInt(req.body.respostaIntervalo2, 10)
            : undefined,
        };
      });
      knex("resposta")
        .insert(resposta)
        .then(() => {
          res.redirect("/perfil");
        })
        .catch((err) => {
          console.log(
            `Ocorreu um erro ao tentar salvar a resposta! Erro: ${err}`
          );
        });
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao tentar salvar a resposta! Erro: ${err}`);
    });
};
