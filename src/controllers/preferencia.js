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
  let contador = parseInt(req.session.posicaoPerguntaPreferencia);
  if (req.query.contador) {
    contador--;
    if (contador < 0) {
      contador = 0;
    }
  } else {
    contador++;
  }
  req.session.posicaoPerguntaPreferencia = contador;
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
              "respostaIntervalo1",
              "respostaIntervalo2"
            )
            .from("preferencia")
            .modify(function (queryBuilder) {
              if (req.session.idPessoa) {
                queryBuilder.where("idPessoa", req.session.idPessoa);
              }
            })
            .andWhere("idPergunta", pergunta[0].idPergunta)
            .then((respostas) => {
              res.render("pages/preferencia", {
                apelido: req.session.apelido,
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
      req.session.posicaoPerguntaPreferencia = 0;
      res.render("index_user", {
        apelido: req.session.apelido,
      });
      console.log(`Ocorreu um erro ao buscar a pergunta: ${err}`);
    });
};

exports.salvarPreferencia = async (req, res) => {
  knex("preferencia")
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

      const preferencia = idsOpcoes.map((idOpcao) => {
        return {
          idPessoa: req.session.idPessoa,
          idPergunta: req.body.idPergunta,
          idOpcao: idOpcao,
          respostaTexto: req.body.respostaTexto,
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
      knex("preferencia")
        .insert(preferencia)
        .then(() => {
          res.redirect("/preferencia");
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
