const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const productos = sequelize.define("productos", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  descripcion: { type: DataTypes.STRING },
  precio: { type: DataTypes.DECIMAL },
  stock: { type: DataTypes.DECIMAL },
});

module.exports = productos;
