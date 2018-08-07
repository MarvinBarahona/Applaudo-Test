const express = require("express");
const productController = require("../controllers/product");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.route("/")
  .post(authHelper.checkToken, productController.create)

router.route("/:productId")
  .delete(authHelper.checkToken, productController.remove)
  .patch(authHelper.checkToken, productController.update)

module.exports = router;
