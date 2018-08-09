const express = require("express");
const profileController = require("../controllers/profile");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.get("/", authHelper.checkToken, profileController.get);
router.get("/purchases", authHelper.checkToken, profileController.getPurchases);

module.exports = router;
