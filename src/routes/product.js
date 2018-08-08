const express = require("express");
const productController = require("../controllers/product");
const operationsController = require("../controllers/operations");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.route("/")
  .post(authHelper.checkToken, productController.create)
  .get(authHelper.checkToken, productController.list)

router.route("/:productId")
  .delete(authHelper.checkToken, productController.remove)
  .patch(authHelper.checkToken, productController.update)

router.route("/:productId/purchases").post(authHelper.checkToken, operationsController.purchase);

module.exports = router;
