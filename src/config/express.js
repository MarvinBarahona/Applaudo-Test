const express = require("express");
// body-parser is a dependency of express.
const bodyParser = require("body-parser");

const app = express();
const routes = require("./routes/");

// Using .env
var port = process.env.PORT || 4000;

// Parse json request into req.body
app.use(bodyParser.json());

// Set app routes.
app.use("/", routes);

// Start app.
app.listen(port, () => {
  console.log("server started in port", port);
});

module.exports = app;
