//const cuentasDB = require("../data/cuentasDB");
//const caja_cuentas = require("../model/caja_cuentas");

exports.getData = async (req, res) => {
  try {
    res.json("accounts");
  } catch (error) {
    console.log(error);
  }
};

exports.postData = async (req, res) => {
  try {
    res.json("accounts");
  } catch (error) {
    console.log(error);
  }
};
