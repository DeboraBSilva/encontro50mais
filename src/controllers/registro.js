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
        mensagem: `Ocorreu um erro ao tentar registrar! Erro: ${err}`,
      });
      console.log(`Ocorreu um erro ao tentar registrar! Erro: ${err}`);
    });
};
