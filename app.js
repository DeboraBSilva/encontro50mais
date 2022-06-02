const express = require("express");
const app = express();
const session = require("express-session");
const routes = require("./src/routes");
require("dotenv").config();

const port = 3000;

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use("/", routes);

app.listen(port, (err) => {
  if (err) {
    console.log("Erro");
  } else {
    console.log(`Server running in http://localhost:${port}/`);
  }
});
