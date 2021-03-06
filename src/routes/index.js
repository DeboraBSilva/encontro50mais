const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login");
const perfilController = require("../controllers/perfil");
const preferenciaController = require("../controllers/preferencia");
const registroController = require("../controllers/registro");
const perguntaController = require("../controllers/pergunta");
const candidatoController = require("../controllers/candidato");

router.get("/", (req, res) => {
  res.render("index", {
    user: req.session.user,
    apelido: req.session.apelido,
    tipo: req.session.tipo,
  });
});

router.get("/registro", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    registroController.getRegistro(req, res);
  } else {
    res.render("pages/registro", {
      user: req.session.user,
      apelido: "",
      tipo: "",
      pessoa: false,
      mensagem: "Preencha os campos para se registrar.",
    });
  }
});
router.post("/registro", registroController.registrar);

router.get("/perfil", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    perfilController.getPergunta(req, res);
  } else {
    res.redirect("/login");
  }
});
router.post("/perfil", perfilController.salvarResposta);

router.get("/preferencia", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    preferenciaController.getPergunta(req, res);
  } else {
    res.redirect("/login");
  }
});
router.post("/preferencia", preferenciaController.salvarPreferencia);

router.get("/candidatos", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    candidatoController.showCandidatos(req,res)
  } else {
    res.redirect("/login");
  }
});

router.get("/candidato", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    candidatoController.getCandidato(req,res)
  } else {
    res.redirect("/login");
  }
});

router.get("/login", (req, res) => {
  req.session.user = "";
  req.session.email = "";
  res.render("pages/login", {
    user: req.session.user,
    mensagem: `Fa??a o login.`,
  });
});
router.post("/login", loginController.validar);

router.get("/admin", (req, res) => {
  if (
    req.session.user &&
    req.session.user == "logado" &&
    req.session.tipo == "Admin"
  ) {
    perguntaController.getPerguntas(req, res);
  } else {
    res.redirect("/");
  }
});

router.get("/pergunta", (req, res) => {
  if (
    req.session.user &&
    req.session.user == "logado" &&
    req.session.tipo == "Admin"
  ) {
    perguntaController.getPergunta(req, res);
  } else {
    res.redirect("/login");
  }
});
router.post("/pergunta", perguntaController.salvarPergunta);
router.get("/excluirPergunta", perguntaController.deletePergunta);

module.exports = router;
