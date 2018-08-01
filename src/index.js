// Configure app to use .env file to set enviroment variables into process.env
require("dotenv").config();

// Load database configuration.
require("./config/database");

// Load express configuration.
require("./config/express");
