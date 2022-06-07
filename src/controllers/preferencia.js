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
              new Promise((resolve, reject) => {
                getCandidatos(req.session.idPessoa, resolve, reject);
              })
                .then((candidatos) => {
                  res.render("pages/preferencia", {
                    user: req.session.user,
                    apelido: req.session.apelido,
                    tipo: req.session.tipo,
                    pergunta: pergunta[0],
                    opcoes,
                    respostas,
                    qtCandidatos: candidatos.length,
                  });
                })
                .catch((err) => {
                  console.log(`Ocorreu um erro ao buscar candidatos: ${err}`);
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
      res.render("index", {
        user: req.session.user,
        apelido: req.session.apelido,
        tipo: req.session.tipo,
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
      if (
        !req.body.idOpcao &&
        !req.body.respostaTexto &&
        !req.body.respostaIntervalo1 &&
        !req.body.respostaIntervalo2
      ) {
        res.redirect("/preferencia");
        return;
      }

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

const getCandidatos = async (idPessoa, resolve, reject) => {
  knex
    .select("preferencia.idPessoa")
    .from("preferencia")
    .andWhere("preferencia.idPessoa", idPessoa)
    .then((preferencias) => {
      if (preferencias.length == 0) {
        knex
          .select("pessoa.idPessoa")
          .from("pessoa")
          .whereNot("pessoa.idPessoa", idPessoa)
          .then((candidatos) => {
            console.log("todas as pessoas", candidatos);
            resolve(candidatos);
          })
          .catch((err) => {
            reject(`Ocorreu um erro ao procurar candidatos! Erro: ${err}`);
          });
      } else {
        knex
          .select("resposta.idPessoa")
          .from("resposta")
          .joinRaw(
            `INNER JOIN preferencia 
        ON (resposta.idPergunta = preferencia.idPergunta) 
        AND (resposta.idOpcao = preferencia.idOpcao)`
          )
          .whereNot("resposta.idPessoa", idPessoa)
          .andWhere("preferencia.idPessoa", idPessoa)
          .then((candidatos) => {
            console.log("candidatos encontrado", candidatos);
            resolve(candidatos);
          })
          .catch((err) => {
            reject(`Ocorreu um erro ao procurar candidatos! Erro: ${err}`);
          });
      }
    })
    .catch((err) => {
      reject(`Ocorreu um erro ao pesquisar preferencias! Erro: ${err}`);
    });
};
