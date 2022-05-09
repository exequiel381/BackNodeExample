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
// const dialogFlow = require("./routes/dialogFlow");

// Rutas
app.get("/", (req, res) => {
  res.send("<h1>Bienvenido a la API IA</h1>");
});

const sequelize = require("./config/db");
const productoDB = require("./model/producto");
const lineaPedidoDB = require("./model/lineaPedido");
const lineaReservaDB = require("./model/lineaReserva");
const pedidoDB = require("./model/pedido");
const reservaDB = require("./model/reserva");

const findProduct = async (idProducto) => {
  let p = await productoDB.findAll({
    //ver si no me trae una lista
    where: {
      id: idProducto,
    },
  });
  return p[0].dataValues;
};

const findOrder = async (dniCliente) => {
  let pedido = await pedidoDB.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });

  return pedido[0].dataValues;
};

const findReservation = async (dniCliente) => {
  let r = await reservaDB.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });

  return r;
};

const getTotalPedido = (idPedido) => {
  let lineasP = lineaPedidoDB.findAll({
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
  const tag = req.body.tag;

  if (!!tag) {
    let dniCliente = req.body.dniCliente;
    let idProducto;
    let cantidad;
    let producto;

    switch (tag) {
      case "crear_pedido": // si quiere hacer pedido, con el dni creamos un pedido
        try {
          const pedido = await pedidoDB.create({
            dniCliente,
            estado: "pendiente",
          });
          res.json(true);
        } catch (error) {
          res.json(error);
        }
        break;
      case "agregar_producto": //verificamos stock, si hay lo agregamos al pedido que se encuentra "abierto" con el dni del cliente
        try {
          idProducto = req.body.idProducto;
          cantidad = req.body.cantidad;
          productoPromise = findProduct(idProducto);
          productoPromise.then((producto) => {
            console.log(producto);
            let stock = producto.stock;
            if (stock >= cantidad) {
              let pedidoPromise = findOrder(dniCliente);
              pedidoPromise.then((pedido) => {
                lineaPedidoDB.create({
                  idProducto,
                  cantidad,
                  idPedido: pedido.id,
                  subTotal: producto.precio * cantidad,
                });
              });

              res.json(true);
            } else {
              res.json(false);
            }
          });
        } catch (error) {
          res.json(error);
        }

        break;
      case "agregar_reserva": //Agregamos una reserva si no tenemos stock, la dejamos abierta con el dni del cliente.
        //tomamos producto cantidad y creamos una  reserva(un producto a muchas reservas , una reserva a un producto) [id,codigo(armar string con fecha pj),idProducto,cantidadSolicitada]
        idProducto = req.body.idProducto;
        cantidad = req.body.cantidad;
        producto = findProduct();
        let reservation = findReservation(dniCliente);

        if (reservation) {
          lineaReservaDB.create({
            idProducto,
            cantidad,
            idReserva: reservation.id,
          });

          res.json(true);
        } else {
          reservation = await reservaDB.create({
            dniCliente,
            estado: "pendiente",
          });
          lineaReservaDB.create({
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
          await reservaDB.update(
            { estado: "finalizado" },
            {
              where: {
                id: reservationToFinish.id,
              },
            }
          );
        }

        if (orderToFinish) {
          await pedidoDB.update(
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
      default: {
        res.json("No hubo coincidencias");
      }
    }
  }

  // const productosDB = await producto.findAll();
  // res.send(productosDB);
});

// app.use("/api/dialogFlow", dialogFlow);

module.exports = app;
