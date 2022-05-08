const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const lineaReserva = sequelize.define("lineasReserva", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  cantidad: { type: DataTypes.INTEGER },
  idProducto: { type: DataTypes.INTEGER },
  idPedido: { type: DataTypes.INTEGER },
});

module.exports = lineaReserva;
