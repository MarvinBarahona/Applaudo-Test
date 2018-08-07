const express = require("express");
const productController = require("../controllers/product");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.post("/", authHelper.checkToken, productController.create);

module.exports = router;
