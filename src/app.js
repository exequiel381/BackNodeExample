const express = require("express");
const app = express();
const mercadopago = require("mercadopago");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const productos = require("./model/productos");

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
// const dialogFlow = require("./routes/dialogFlow");

// Rutas
app.get("/", (req, res) => {
  res.send("<h1>Bienvenido a la API IA</h1>");
});

const sequelize = require("./config/db");

app.get("/productos", async (req, res) => {
  const productosDB = await productos.findAll({
    attributes: ["id", "descripcion", "precio", "stock"], // puedo traer todo lo que quiera aunque no las defina en el modelo
  });
  res.send(productos);
});

// app.use("/api/dialogFlow", dialogFlow);

module.exports = app;
