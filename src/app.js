const express = require("express");
const app = express();
const mercadopago = require("mercadopago");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

//server
require("./config/db");
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto: http://localhost:${port}`);
});

// Habilitamos cors
app.use(cors());
app.use(helmet());

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(morgan("dev"));

// importamos las rutas
const dialogFlow = require("./routes/dialogFlow");

// Rutas
app.get("/", (req, res) => {
  res.send("<h1>Bienvenido a la API IA</h1>");
});

// app.use("/api/dialogFlow", dialogFlow);

module.exports = app;
