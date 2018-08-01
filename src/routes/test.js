// Test routes

const express = require("express");
const testController = require("../controllers/test");

const router = express.Router();

router.get("/", testController.get);

module.exports = router;
