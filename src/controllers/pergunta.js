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
    res.render("pages/pergunta", {
      user: req.session.user,
      apelido: req.session.apelido,
      tipo: req.session.tipo,
      pergunta: false,
      opcoes: false,
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
      knex
        .select("idOpcao", "descricao")
        .from("opcao")
        .where("idPergunta", pergunta[0].idPergunta)
        .then((opcoes) => {
          res.render("pages/pergunta", {
            user: req.session.user,
            apelido: req.session.apelido,
            tipo: req.session.tipo,
            pergunta: pergunta[0],
            opcoes,
            mensagem: "Altere e salve para editar a pergunta.",
          });
        })
        .catch((err) => {
          console.log(`Ocorreu um erro ao buscar as opções: ${err}`);
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
      if (req.body.tipo == "Texto" || req.body.tipo == "Numero") {
        res.redirect("/pergunta");
      } else {
        const idPergunta = idsPergunta[0];
        const opcoes = req.body.opcoes;
        new Promise((resolve, reject) => {
          insertOpcoes(idPergunta, opcoes, resolve, reject);
        })
          .then(() => {
            // res.redirect(`/pergunta?id=${req.query.id}`);
            res.redirect("/pergunta");
          })
          .catch((err) => {
            res.redirect("/pergunta");
            console.log(
              `Ocorreu um erro ao tentar salvar as opções! Erro: ${err}`
            );
          });
      }
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
      if (req.body.tipo == "Texto" || req.body.tipo == "Numero") {
        knex("opcao")
          .where("idPergunta", req.query.id)
          .del()
          .then(() => {
            // res.redirect(`/pergunta?id=${req.query.id}`);
            res.redirect("/admin");
          })
          .catch((err) => {
            console.log(
              `Ocorreu um erro ao tentar alterar as opções! Erro: ${err}`
            );
          });
      } else {
        knex("opcao")
          .where("idPergunta", req.query.id)
          .del()
          .then(() => {
            const idPergunta = req.query.id;
            const opcoes = req.body.opcoes;
            new Promise((resolve, reject) => {
              insertOpcoes(idPergunta, opcoes, resolve, reject);
            })
              .then(() => {
                // res.redirect(`/pergunta?id=${req.query.id}`);
                res.redirect("/admin");
              })
              .catch((err) => {
                res.redirect(`/pergunta?id=${req.query.id}`);
                console.log(
                  `Ocorreu um erro ao tentar alterar as opções! Erro: ${err}`
                );
              });
          })
          .catch((err) => {
            res.redirect(`/pergunta?id=${req.query.id}`);
            console.log(
              `Ocorreu um erro ao tentar alterar as opções! Erro: ${err}`
            );
          });
      }
    })
    .catch((err) => {
      res.redirect(`/pergunta?id=${req.query.id}`);
      console.log(`Ocorreu um erro ao tentar alterar a pergunta! Erro: ${err}`);
    });
};

const insertOpcoes = async (idPergunta, opcoes, resolve, reject) => {
  let opcoesList = [];
  if (Array.isArray(opcoes)) {
    opcoesList = opcoes;
  } else {
    opcoesList = [opcoes];
  }
  opcoesList.forEach((opcao, index) => {
    if (!opcao) {
      resolve();
    }
    knex("opcao")
      .insert({
        idPergunta: idPergunta,
        descricao: opcao,
      })
      .then(() => {
        if (index === opcoesList.length - 1) resolve();
      })
      .catch((err) => {
        reject(`Ocorreu um erro ao tentar salvar as opções! Erro: ${err}`);
      });
  });
};
