const Product = require("mongoose").model("products");
const ProductLog = require("mongoose").model("product_logs");
const User = require("mongoose").model("users");

// Route: POST /api/v1/:productId/purchases
// Purchase a product.
function purchase(req, res, next){
  var id = req.params.productId;
  // Validate body
  var errors = [];

  var quantity = req.body.quantity;

  if(quantity == null) errors.push("missing 'quantity' parameter");
  else if(!Number.isInteger(quantity) || quantity < 1) errors.push("'quantity' must be a positive integer");

  if(errors.length > 0) next({status: 400, errors: errors});
  // End of body validation.

  else{
    var product;

    // Find product.
    Product.findById(id).then(function(_product){
      product = _product;

      // If not found.
      if(!product) return Promise.reject({name: "NotFound"});

      // If not enough.
      else if(product.stock < quantity) return Promise.reject({name: "NotEnough", left: product.stock});

      // Save log
      else{

        var log = new ProductLog();
        log.productId = product.id;
        log.userId = req.auth.user;
        log.type = 'purchase';
        log.date = Date.now();

        log.changes.push(
          {field: 'stock', value: product.stock - quantity, diff: -quantity}
        );

        log.purchase = {
          price: product.price,
          quantity: quantity,
          total: product.price * quantity
        }

        return log.save();
      }
    }).then(function(log){

      // Reduce product stock.
      product.stock -= log.purchase.quantity;
      product.save();

      // Success response.
      res.status(201).json({
        request: req.object,
        entity: {
          purchase: log.purchase,
          product: {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            popularity: product.popularity
          }
        },
        list: "api/v1/me/purchases"
      });

    }).catch(function(error){
      if(error.name == "NotFound" || error.name == "CastError") next({status: 404, errors: ["product not found"]});
      else if(error.name == "NotEnough") next({status: 422, errors: ["not enough stock to purchase, only " + error.left + " items left."]});
      else next({status: 500});
    });
  }
}

// Route: POST /api/v1/:productId/likes
// Like a product.
function like(req, res, next){
  var id = req.params.productId;

  // Find product.
  Product.findById(id).then(function(product){

    // If not found.
    if(!product) return Promise.reject({name: "NotFound"});

    // Check if already liked
    else{
      var liked = false;

      for(var i = 0, len = product.usersLikingId.length; i < len; i++){
        if(product.usersLikingId[i] = req.auth.user){
          liked = true;
          i = len;
        }
      }

      if(liked) return Promise.reject({name: "AlreadyLiked"});

      // Else, increase popularity and add to array.
      else{
        product.usersLikingId.push(req.auth.user);
        product.popularity++;

        return product.save();
      }
    }
  }).then(function(product){

    // Success response.
    res.status(201).json({
      request: req.object,
      entity: {
        product: {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          popularity: product.popularity
        }
      }
    });

  }).catch(function(error){
    if(error.name == "NotFound" || error.name == "CastError") next({status: 404, errors: ["product not found"]});
    else if(error.name == "AlreadyLiked") next({status: 422, errors: ["You already liked this product"]});
    else next({status: 500});
  });
}


// Module exports
module.exports = {purchase: purchase, like: like};
