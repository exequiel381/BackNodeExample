const sequelize = require("../config/db");

const productos = sequelize.define("productos", {});

module.exports = productos;
