const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const reserva = sequelize.define("reserva", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  codigo: { type: DataTypes.STRING },
  estado: { type: DataTypes.STRING },
  dniCliente: { type: DataTypes.INTEGER },
});

module.exports = reserva;
