const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login");
const registroController = require("../controllers/registro");

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/registro", function (req, res) {
  res.render("registro");
});

router.post("/registro", registroController.registrar);

router.get("/perfil", function (req, res) {
  res.render("perfil");
});

router.post("/login", loginController.validar);

router.get("/login", (req, res) => {
  req.session.user = "";
  res.render("login", {
    mensagem: "Entre com os dados para conexão",
  });
});

module.exports = router;
