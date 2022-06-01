const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login");
const registroController = require("../controllers/registro");

router.get("/", function (req, res) {
  if (req.session.user && req.session.user == "logado") {
    res.render("index_user");
  } else {
    res.render("index_guest");
  }
});

router.get("/registro", function (req, res) {
  res.render("pages/registro", {
    mensagem: "Preencha os campos para se registrar.",
  });
});

router.post("/registro", registroController.registrar);

router.get("/perfil", function (req, res) {
  res.render("pages/perfil");
});

router.post("/login", loginController.validar);

router.get("/login", (req, res) => {
  req.session.user = "";
  req.session.email = "";
  res.render("pages/login", {
    mensagem: "Entre com os dados para conexão",
  });
});

module.exports = router;
