const express = require("express");
const router = express.Router();

const DfController = require("../controllers/DialogFlowController");

router.get("/getdata", DfController.getData);
router.post("/postdata", DfController.postData);

module.exports = router;
