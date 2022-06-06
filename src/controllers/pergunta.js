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

exports.getPerguntas = async (req, res) => {
  knex
    .select("idPergunta", "ordem", "descricao", "tipo")
    .from("pergunta")
    .orderBy("ordem", "asc")
    .then((perguntas) => {
      res.render("admin", {
        user: req.session.user,
        apelido: req.session.apelido,
        tipo: req.session.tipo,
        perguntas: perguntas,
      });
    })
    .catch((err) => {
      res.redirect("/");
      console.log(`Ocorreu um erro ao buscar as perguntas: ${err}`);
    });
};

exports.getPergunta = async (req, res) => {
  if (!req.query.id || req.query.id == "") {
    res.render("pages/novaPergunta", {
      user: req.session.user,
      apelido: req.session.apelido,
      tipo: req.session.tipo,
      pergunta: false,
      mensagem: "Cadastre uma nova pergunta.",
    });
    return;
  }

  knex
    .select("idPergunta", "ordem", "descricao", "tipo")
    .from("pergunta")
    .where("idPergunta", req.query.id)
    .orderBy("ordem", "asc")
    .then((pergunta) => {
      res.render("pages/novaPergunta", {
        user: req.session.user,
        apelido: req.session.apelido,
        tipo: req.session.tipo,
        pergunta: pergunta[0],
        mensagem: "Altere e salve para editar a pergunta.",
      });
    })
    .catch((err) => {
      res.redirect("/admin");
      console.log(`Ocorreu um erro ao buscar a pergunta: ${err}`);
    });
};

exports.salvarPergunta = async (req, res) => {
  if (req.query.id && req.query.id != "") {
    updatePergunta(req, res);
    return;
  }

  knex("pergunta")
    .insert({
      ordem: req.body.ordem,
      descricao: req.body.descricao,
      tipo: req.body.tipo,
    })
    .then((idsPergunta) => {
      knex("opcao")
        .insert({
          idPergunta: idsPergunta[0],
          descricao: req.body.opcaoDescricao,
        })
        .then(() => {
          res.redirect("/novaPergunta");
        })
        .catch((err) => {
          console.log(
            `Ocorreu um erro ao tentar salvar as opções! Erro: ${err}`
          );
        });
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao tentar salvar a pergunta! Erro: ${err}`);
    });
};

exports.deletePergunta = async (req, res) => {
  if (req.query.id && req.query.id != "") {
    knex("pergunta")
      .where("idPergunta", req.query.id)
      .del()
      .then(() => {
        res.redirect("/admin");
      })
      .catch((err) => {
        res.redirect("/admin");
        console.log(
          `Ocorreu um erro ao tentar excluir a pergunta! Erro: ${err}`
        );
      });
  }
};

const updatePergunta = async (req, res) => {
  knex("pergunta")
    .update({
      ordem: req.body.ordem,
      descricao: req.body.descricao,
      tipo: req.body.tipo,
    })
    .where("idPergunta", req.query.id)
    .then(() => {
      // res.redirect(`/novaPergunta?id=${req.query.id}`);
      res.redirect("/admin");
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao tentar alterar a pergunta! Erro: ${err}`);
    });
};
