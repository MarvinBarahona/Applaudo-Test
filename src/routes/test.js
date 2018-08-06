const express = require("express");
const testController = require("../controllers/test");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.get("/", testController.get);
router.get("/admin", authHelper.checkToken, testController.get);
router.get("/client", authHelper.checkToken, testController.get);

module.exports = router;
