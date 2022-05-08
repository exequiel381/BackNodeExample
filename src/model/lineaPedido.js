const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const lineaPedido = sequelize.define("lineasPedido", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  cantidad: { type: DataTypes.INTEGER },
  subTotal: { type: DataTypes.DECIMAL },
  idProducto: { type: DataTypes.INTEGER },
  idPedido: { type: DataTypes.INTEGER },
});

module.exports = lineaPedido;
