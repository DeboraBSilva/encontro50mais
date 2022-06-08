const moment = require("moment");
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

exports.registrar = async (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    knex("pessoa")
      .update({
        nome: req.body.nome,
        apelido: req.body.apelido,
        nascimento: req.body.nascimento,
        cidade: req.body.cidade,
        email: req.body.email,
        password: req.body.password,
      })
      .where("idPessoa", req.session.idPessoa)
      .then(() => {
        res.redirect("/registro");
      })
      .catch((err) => {
        res.redirect("/");
        console.log(`Ocorreu um erro ao buscar registro! Erro: ${err}`);
      });
  } else {
    req.session.user = "";
    knex("pessoa")
      .insert({
        nome: req.body.nome,
        apelido: req.body.apelido,
        nascimento: req.body.nascimento,
        cidade: req.body.cidade,
        email: req.body.email,
        password: req.body.password,
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        res.render("pages/registro", {
          user: req.session.user,
          apelido: "",
          tipo: "",
          moment: moment,
          pessoa: false,
          mensagem: `Ocorreu um erro ao tentar registrar! Erro: ${err}`,
        });
        console.log(`Ocorreu um erro ao tentar registrar! Erro: ${err}`);
      });
  }
};

exports.getRegistro = async (req, res) => {
  knex
    .select(
      "idPessoa",
      "nome",
      "email",
      "nascimento",
      "cidade",
      "apelido",
      "password"
    )
    .from("pessoa")
    .where("idPessoa", req.session.idPessoa)
    .then((pessoa) => {
      req.session.apelido = pessoa[0].apelido;
      res.render("pages/registro", {
        user: req.session.user,
        apelido: req.session.apelido,
        tipo: req.session.tipo,
        moment: moment,
        pessoa: pessoa[0],
        mensagem: "Altere e salve para editar seu registro.",
      });
    });
};
