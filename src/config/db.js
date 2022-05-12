const { Sequelize } = require("sequelize");

const host = "localhost";
const user = "root";
const password = "bgnyvxpg";
const database = "practico_ia";

const sequelize = new Sequelize(database, user, password, {
  host: host,
  dialect: "mysql",
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado");
  })
  .catch((err) => {
    console.log("No se conecto");
  });

module.exports = sequelize;
