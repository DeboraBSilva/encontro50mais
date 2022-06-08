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

exports.showCandidatos = async (req, res) => {
  knex
    .select("preferencia.idPessoa")
    .from("preferencia")
    .andWhere("preferencia.idPessoa", req.session.idPessoa)
    .then((preferencias) => {
      if (preferencias.length == 0) {
        knex
          .select("pessoa.idPessoa", "pessoa.nome")
          .from("pessoa")
          .whereNot("pessoa.idPessoa", req.session.idPessoa)
          .then((candidatos) => {
            res.render("pages/candidatos", {
              user: req.session.user,
              apelido: req.session.apelido,
              tipo: req.session.tipo,
              candidatos,
            });
          })
          .catch((err) => {
            console.log(`Ocorreu um erro ao procurar candidatos! Erro: ${err}`);
            res.redirect("/");
          });
      } else {
        knex
          .select("resposta.idPessoa", "pessoa.nome")
          .from("resposta")
          .joinRaw(
            `INNER JOIN preferencia 
      ON (resposta.idPergunta = preferencia.idPergunta) 
      AND (resposta.idOpcao = preferencia.idOpcao)`
          )
          .join("pessoa","pessoa.idPessoa","resposta.idPessoa")
          .whereNot("resposta.idPessoa", req.session.idPessoa)
          .andWhere("preferencia.idPessoa", req.session.idPessoa)
          .then((candidatos) => {
            res.render("pages/candidatos", {
              user: req.session.user,
              apelido: req.session.apelido,
              tipo: req.session.tipo,
              candidatos,
            });
          })
          .catch((err) => {
            console.log(`Ocorreu um erro ao procurar candidatos! Erro: ${err}`);
            res.redirect("/");
          });
      }
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao pesquisar preferencias! Erro: ${err}`);
      res.redirect("/");
    });
};
