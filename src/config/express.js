const express = require("express");
// body-parser is a dependency of express.
const bodyParser = require("body-parser");
// morgan is a logger.
const morgan = require("morgan");

const app = express();
const routes = require("../routes/");

// Using .env
var port = process.env.PORT || 4000;

// Parse json request into req.body
app.use(bodyParser.json());

// Log request and response status in console.
app.use(morgan('tiny'));

// Set app routes.
app.use("/api/v1/", routes);

// Start app.
app.listen(port, () => {
  console.log("server started in port", port);
});

module.exports = app;
