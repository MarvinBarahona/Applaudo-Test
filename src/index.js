// Configure app to use .env file to set enviroment variables into process.env
require("dotenv").config();

// Load database configuration.
var database = require("./config/database");

// Load express configuration.
var app = require("./config/express");
