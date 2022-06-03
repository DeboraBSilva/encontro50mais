const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login");
const perfilController = require("../controllers/perfil");
const preferenciaController = require("../controllers/preferencia");
const registroController = require("../controllers/registro");

router.get("/", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    res.render("index_user", {
      apelido: req.session.apelido,
    });
  } else {
    res.render("index_guest");
  }
});

router.get("/registro", (req, res) => {
  res.render("pages/registro", {
    mensagem: "Preencha os campos para se registrar.",
  });
});

router.post("/registro", registroController.registrar);

router.get("/perfil", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    perfilController.getPergunta(req, res);
  } else {
    res.render("pages/login", {
      mensagem: "Entre com os dados para conexão",
    });
  }
});
router.post("/perfil", perfilController.salvarResposta);

router.get("/preferencia", (req, res) => {
  if (req.session.user && req.session.user == "logado") {
    preferenciaController.getPergunta(req, res);
  } else {
    res.render("pages/login", {
      mensagem: "Entre com os dados para conexão",
    });
  }
});
router.post("/preferencia", preferenciaController.salvarPreferencia);

router.get("/login", (req, res) => {
  req.session.user = "";
  req.session.email = "";
  res.render("pages/login", {
    mensagem: "Entre com os dados para conexão",
  });
});
router.post("/login", loginController.validar);

module.exports = router;
