const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const pedido = sequelize.define("pedidos", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  direccion: { type: DataTypes.STRING },
  estado: { type: DataTypes.STRING },
  dniCliente: { type: DataTypes.INTEGER },
});

module.exports = pedido;
