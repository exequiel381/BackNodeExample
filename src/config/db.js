const { Sequelize } = require("sequelize");

const host = "181.239.140.216";
const user = "nortesdw";
const password = "nortesdw";
const database = "nortesdw";

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
