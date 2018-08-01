var express = require("express");
// body-parser is a dependency of express.
var bodyParser = require("body-parser");

const app = express();

// Using .env
var port = process.env.PORT || 4000;

// Parse json request into req.body
app.use(bodyParser.json());

// Start app. 
app.listen(port, () => {
  console.log("server started in port", port);
});

module.exports = app;
