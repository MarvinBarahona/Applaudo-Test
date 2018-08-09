const User = require("mongoose").model('users');
const Product = require("mongoose").model("products");
const ProductLog = require("mongoose").model("product_logs");

// Route: GET /api/v1/me
// Get profile data.
function get(req, res, next){

  // Get the current user.
  User.findById(req.auth.user).then(function(user){

    // Success response.
    res.status(200).json({
      request: req.object,
      data: {
        username: user.username,
        name: user.name,
        role: req.auth.role
      }
    });

  // Any error is a server error.
  }).catch(next);
}


// Route: GET /api/v1/me/purchases
// Get the user's purchases
function getPurchases(req, res, next){
  var logs = [];

  // Get all purchase log of the user.
  ProductLog.find({userId: req.auth.user, type: "purchase"}).then(function(_logs){

    // If no logs, pass to build the response.
    if(_logs.length == 0) return Promise.resolve();

    else{
      var promises = [];

      // Map each log and find the product data.
      _logs.forEach(function(_log){
        var log = {};
        log.purchase = _log.purchase;
        var promise = Product.findById(_log.productId, "name description price popularity");

        // Add the product data to the maped log object.
        promise.then(function(_product){
          log.product = _product;

          logs.push(log);
        })

        promises.push(promise);
      });

      // When all product's data were recovered.
      return Promise.all(promises);
    }
  }).then(function(){

    // Success response.
    res.status(200).json({
      request: req.object,
      data_size: logs.length,
      data: logs
    });

  // Any error is a server error.
  }).catch(function(error){
    next(error);
  });
}

// Route: GET /api/v1/me/likes
// Get the user's likes
function getLikes(req, res, next){
  var logs = [];

  // Get all liked products of the user.
  Product.find({usersLikingId: req.auth.user}, "name description price popularity").then(function(products){

    // Success response.
    res.status(200).json({
      request: req.object,
      data_size: products.length,
      data: products
    });

  // Any error is a server error.
  }).catch(function(error){
    next(error);
  });
}

// Module exports.
module.exports = {get: get, getPurchases: getPurchases, getLikes: getLikes};
