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
  return p.length > 0 ? p[0].dataValues : null;
};

const findOrder = async (dniCliente) => {
  let pedido = await pedidoDB.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });

  return pedido.length > 0 ? pedido[0].dataValues : null;
};

const findReservation = async (dniCliente) => {
  let r = await reservaDB.findAll({
    where: {
      dniCliente: dniCliente,
      estado: "pendiente",
    },
  });
  return r.length > 0 ? r[0].dataValues : null;
};

const getTotalPedido = async (idPedido) => {
  let lineasP = await lineaPedidoDB.findAll({
    where: {
      idPedido: idPedido,
    },
  });

  if (lineasP.length > 0) {
    const sumall = lineasP
      .map((item) => item.subTotal)
      .reduce((prev, curr) => prev + curr, 0);
    return sumall;
  } else return 0;
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
      case "crear_pedido_reserva": // si quiere hacer pedido, con el dni creamos un pedido
        try {
          const pedido = await pedidoDB.create({
            dniCliente,
            estado: "pendiente",
          });

          reservaDB.create({
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
        try {
          idProducto = req.body.idProducto;
          cantidad = req.body.cantidad;
          productoPromise = findProduct(idProducto);
          productoPromise.then((prod) => {
            //comprobar si hay producto -- FALTA
            let reservationPromise = findReservation(dniCliente);
            reservationPromise.then((reservation) => {
              if (reservation) {
                let idReserva = reservation.id;
                console.log(idReserva);
                lineaReservaDB.create({
                  idReserva: reservation.id,
                  idProducto,
                  cantidad,
                });

                return res.json(true);
              } else {
                return res.json(false);
              }

              res.json(true);
            });
          });
        } catch (error) {
          res.json(error.message);
        }

        break;
      case "verificar_reserva": //ingresa un codigo de reserva y vemos si el producto asociado tiene stock
        break;
      case "finalizar_pedido_reserva": //finalizamos el pedido y la reserva pendiente si esq las hay.
        let codeReservation;
        let totalOrder;
        let orderId;
        let response;

        orderId = await findOrder(dniCliente)
          .then((order) => {
            if (order !== null) {
              pedidoDB.update(
                { estado: "finalizado" }, //poner pendiente para PROBAR
                {
                  where: {
                    id: order.id,
                  },
                }
              );
              return order.id;
            }
          })
          .catch((error) => {
            return res.json("No se pudo finalizar en Order");
          });

        codeReservation = await findReservation(dniCliente)
          .then((reservation) => {
            if (reservation !== null) {
              reservaDB.update(
                { estado: "finalizado" }, //poner pendiente para PROBAR
                {
                  where: {
                    id: reservation.id,
                  },
                }
              );
              return reservation.id + "_" + reservation.dniCliente;
            }
          })
          .catch((error) => {
            return res.json("No se pudo finalizar en Reservation");
          });

        totalOrder = await getTotalPedido(orderId) //NO TENGO UN ORDER ID AUN , debo meterlo en la promesa
          .then((total) => {
            totalOrder = total;
            return total;
          })
          .catch((error) => {
            return res.status(400).json({
              status_code: 0,
              error_msg: "Require Params Missing",
            });
          });

        return res.json({
          codigoReserva: codeReservation,
          total: parseInt(totalOrder),
        });
      default: {
        return res.status(200).json("No hubo coincidencias");
      }
    }
  }

  // const productosDB = await producto.findAll();
  // res.send(productosDB);
});

// app.use("/api/dialogFlow", dialogFlow);

module.exports = app;
