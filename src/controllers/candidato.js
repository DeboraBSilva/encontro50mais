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
  let idsPessoas = [];
  let pessoas = [];
  knex
    .select("pessoa.idPessoa", "pessoa.nome")
    .from("pessoa")
    .whereNot("pessoa.idPessoa", req.session.idPessoa)
    .then((candidatos) => {
      idsPessoas = candidatos.map((item) => item.idPessoa);
      pessoas = candidatos;
      knex
        .select("preferencia.idPessoa")
        .from("preferencia")
        .andWhere("preferencia.idPessoa", req.session.idPessoa)
        .then((preferencias) => {
          if (preferencias.length == 0) {
            res.render("pages/candidatos", {
              user: req.session.user,
              apelido: req.session.apelido,
              tipo: req.session.tipo,
              pessoas,
            });
          } else {
            // Filtra pessoas de acordo com a preferencia
            knex
              .select("pergunta.idPergunta")
              .from("pergunta")
              .join(
                "preferencia",
                "preferencia.idPergunta",
                "pergunta.idPergunta"
              )
              .where("preferencia.idPessoa", req.session.idPessoa)
              .then((perguntas) => {
                new Promise((resolve, reject) => {
                  perguntas.forEach((pergunta, index) => {
                    knex
                      .select("resposta.idPessoa", "pessoa.nome")
                      .from("resposta")
                      .joinRaw(
                        `INNER JOIN preferencia 
            ON (resposta.idPergunta = preferencia.idPergunta) 
            AND (resposta.idOpcao = preferencia.idOpcao)`
                      )
                      .join("pessoa", "pessoa.idPessoa", "resposta.idPessoa")
                      .whereNot("resposta.idPessoa", req.session.idPessoa)
                      .andWhere("preferencia.idPessoa", req.session.idPessoa)
                      .andWhere("preferencia.idPergunta", pergunta.idPergunta)
                      .andWhereRaw(`resposta.idPessoa IN (${idsPessoas})`)
                      .then((candidatos) => {
                        idsPessoas = candidatos.map((item) => item.idPessoa);
                        pessoas = candidatos;
                        if (index === perguntas.length - 1) resolve(pessoas);
                      })
                      .catch((err) => {
                        reject(
                          `Ocorreu um erro ao procurar candidatos! Erro: ${err}`
                        );
                      });
                  });
                })
                  .then((pessoas) => {
                    res.render("pages/candidatos", {
                      user: req.session.user,
                      apelido: req.session.apelido,
                      tipo: req.session.tipo,
                      pessoas,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      `Ocorreu um erro ao procurar candidatos! Erro: ${err}`
                    );
                    res.redirect("/");
                  });
              })
              .catch((err) => {
                console.log(
                  `Ocorreu um erro ao buscar as perguntas! Erro: ${err}`
                );
                res.redirect("/");
              });
          }
        })
        .catch((err) => {
          console.log(
            `Ocorreu um erro ao pesquisar preferencias! Erro: ${err}`
          );
          res.redirect("/");
        });
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao procurar candidatos! Erro: ${err}`);
      res.redirect("/");
    });
};

exports.getCandidato = async (req, res) => {
  knex
    .select(
      "resposta.idPessoa",
      "pessoa.nome",
      "pessoa.apelido",
      "pergunta.descricao as perguntaDescricao",
      "opcao.descricao as opcaoDescricao",
      "resposta.respostaTexto",
      "resposta.respostaNumero"
    )
    .from("resposta")
    .join("pergunta", "pergunta.idPergunta", "resposta.idPergunta")
    .join("pessoa", "pessoa.idPessoa", "resposta.idPessoa")
    .joinRaw(
      `LEFT JOIN encontro_50.opcao
      ON (opcao.idPergunta = pergunta.idPergunta)
      AND (resposta.idOpcao = opcao.idOpcao)`
    )
    .where("resposta.idPessoa", req.query.id)
    .then((perfilRespostas) => {
      const perfil = {
        idPessoa: perfilRespostas[0].idPessoa,
        nome: perfilRespostas[0].nome,
        apelido: perfilRespostas[0].apelido,
        questoes: [
          ...new Map( // devolve array com objetos unicos
            perfilRespostas
              .map((perfilResposta) => {
                // passa por todos os resultados para construir o objeto
                return {
                  pergunta: perfilResposta.perguntaDescricao,
                  respostas: perfilRespostas
                    .filter(
                      // Filtra respostas dessa pergunta
                      (el) =>
                        el.perguntaDescricao == perfilResposta.perguntaDescricao
                    )
                    .map((resposta) => {
                      // Devolve o objeto com a estrutura certa
                      return {
                        opcao: resposta.opcaoDescricao,
                        respostaTexto: resposta.respostaTexto,
                        respostaNumero: resposta.respostaNumero,
                      };
                    }),
                };
              })
              .map((item) => [item["pergunta"], item])
          ).values(),
        ],
      };
      res.render("pages/candidato", {
        user: req.session.user,
        apelido: req.session.apelido,
        tipo: req.session.tipo,
        perfil: perfil,
      });
    })
    .catch((err) => {
      console.log(`Ocorreu um erro ao procurar candidato! Erro: ${err}`);
      res.redirect("/candidatos");
    });
};
