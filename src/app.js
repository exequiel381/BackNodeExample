const express = require("express");
const app = express();
const mercadopago = require("mercadopago");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const producto = require("./model/producto");
const lineaPedido = require("./model/lineaPedido");
const lineaReserva = require("./model/lineaReserva");
const pedido = require("./model/pedido");
const reserva = require("./model/reserva");

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
const pedido = require("./model/pedido");
const lineaPedido = require("./model/lineaPedido");

const findProduct = (idProducto) => {
  let p = producto.findAll({
    //ver si no me trae una lista
    where: {
      id: idProducto,
    },
  });

  return p;
};

const findOrder = (dniCliente) => {
  let pedido = pedido.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });

  return pedido;
};

const findReservation = (id) => {
  let r = reserva.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });

  return r;
};

const getTotalPedido = (idPedido) => {
  let lineasP = lineaPedido.findAll({
    where: {
      idPedido: idPedido,
    },
  });

  const sumall = lineasP
    .map((item) => item.subTotal)
    .reduce((prev, curr) => prev + curr, 0);
  return sumall;
};

app.post("/productos", async (req, res) => {
  console.log(req.body);
  const tag = req.body.fulfillmentInfo.tag;

  if (!!tag) {
    let dniCliente = req.body.dniCliente;
    let idProducto;
    let cantidad;
    let producto;

    switch (tag) {
      case "crear_pedido": // si quiere hacer pedido, con el dni creamos un pedido
        try {
          const pedido = await pedido.create({
            dniCliente,
            estado: "pendiente",
          });
          res.json(true);
        } catch (error) {
          res.json(false);
        }
        break;
      case "agregar_producto": //verificamos stock, si hay lo agregamos al pedido que se encuentra "abierto" con el dni del cliente
        idProducto = req.body.idProducto;
        cantidad = req.body.cantidad;
        producto = findProduct(idProducto);
        if (producto.stock >= cantidad) {
          let pedido = findOrder(dniCliente);
          lineaPedido.create({
            idProducto,
            cantidad,
            idPedido: pedido.id,
            subTotal: producto.precio * cantidad,
          });

          res.json(true);
        } else {
          res.json(false);
        }
        break;
      case "agregar_reserva": //Agregamos una reserva si no tenemos stock, la dejamos abierta con el dni del cliente.
        //tomamos producto cantidad y creamos una  reserva(un producto a muchas reservas , una reserva a un producto) [id,codigo(armar string con fecha pj),idProducto,cantidadSolicitada]
        idProducto = req.body.idProducto;
        cantidad = req.body.cantidad;
        producto = findProduct();
        let reservation = findReservation(dniCliente);

        if (reservation) {
          lineaReserva.create({
            idProducto,
            cantidad,
            idReserva: reservation.id,
          });

          res.json(true);
        } else {
          reservation = await reserva.create({
            dniCliente,
            estado: "pendiente",
          });
          lineaReserva.create({
            idProducto,
            cantidad,
            idReserva: reservation.id,
          });

          res.json(true);
        }

        break;
      case "verificar_reserva": //ingresa un codigo de reserva y vemos si el producto asociado tiene stock
        break;
      case "crear_pedido_reserva": //finalizamos el pedido y la reserva pendiente si esq las hay.
        let reservationToFinish = findReservation(dniCliente);
        let orderToFinish = findOrder(dniCliente);

        if (reservationToFinish) {
          await reserva.update(
            { estado: "finalizado" },
            {
              where: {
                id: reservationToFinish.id,
              },
            }
          );
        }

        if (orderToFinish) {
          await pedido.update(
            { estado: "finalizado" },
            {
              where: {
                id: orderToFinish.id,
              },
            }
          );
        }

        let response = {
          codigoReserva: reservationToFinish
            ? reservationToFinish.id + "_" + reservationToFinish.dniCliente
            : "",
          totalPedido: orderToFinish ? getTotalPedido(orderToFinish.id) : "0",
        };

        res.json(response);

        break;
    }
  }

  // const productosDB = await producto.findAll();
  // res.send(productosDB);
});

// app.use("/api/dialogFlow", dialogFlow);

module.exports = app;
