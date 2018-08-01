// Configure app to use .env file to set environment variables into process.env
require("dotenv").config();

// Load database configuration.
require("./config/database");

// Load express configuration.
require("./config/express");
