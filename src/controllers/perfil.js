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
  knex
    .select("idPergunta", "descricao", "tipo")
    .from("pergunta")
    .orderBy("ordem", "asc")
    .limit(1)
    .offset(req.session.posicaoPergunta)
    .then((pergunta) => {
      knex
        .select("idOpcao", "descricao")
        .from("opcao")
        .where("idPergunta", pergunta[0].idPergunta)
        .then((opcoes) => {
          req.session.posicaoPergunta = req.session.posicaoPergunta + 1;
          res.render("pages/perfil", {
            pergunta: pergunta[0],
            opcoes,
          });
        })
        .catch((err) => {
          console.log(`Ocorreu um erro ao buscar as opções: ${err}`);
        });
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao buscar a pergunta: ${err}`);
    });
};

exports.salvarResposta = async (req, res) => {
  knex("resposta")
    .insert({
      idPessoa: req.body.idPessoa,
      idPergunta: req.body.idPergunta,
      idOpcao: req.body.idOpcao,
      respostaTexto: req.body.respostaTexto,
      respostaNumero: req.body.respostaNumero,
      respostaIntervalo1: req.body.respostaIntervalo1,
      respostaIntervalo2: req.body.respostaIntervalo2,
    })
    .then(() => {
      res.redirect("/perfil");
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao tentar salvar a resposta! Erro: ${err}`);
    });
};
