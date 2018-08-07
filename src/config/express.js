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

// Set the request object in all request.
app.use(function(req, res, next){
  var token = req.headers.authorization || "";
  var uri = req.path;
  var method = req.method;

  var body = {};

  if(method == 'POST' || method == 'PATCH' || method == 'PUT') body = req.body;
  else if(method == 'GET') body = req.query;

  req.object = {
    uri: uri,
    method: method,
    body: body,
    auth: token
  }

  next();
});

// Set app routes.
app.use("/api/v1/", routes);

// Error handler.
app.use(function(err, req, res, next){
  var status = err.status || 500;
  var errors = err.errors;

  if(status == 500){
    errors = ["Server error, please report!"];
    console.log(err);
  }

  res.status(status).json({errors: errors});
});

// Start app.
app.listen(port, () => {
  console.log("server started in port", port);
});

module.exports = app;
