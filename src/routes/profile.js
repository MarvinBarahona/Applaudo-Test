const express = require("express");
const profileController = require("../controllers/profile");
const router = express.Router();

const authHelper = require("../helpers/auth");

router.get("/", authHelper.checkToken, profileController.get);

module.exports = router;
