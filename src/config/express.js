var express = require("express");
// body-parser is a dependency of express. 
var bodyParser = require("body-parser");

const app = express();
var port = 4000;

// Parse json request into req.body
app.use(bodyParser.json());

app.listen(port, () => {
  console.log("server started in port", port);
});

module.exports = app;
