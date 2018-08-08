const Product = require("mongoose").model("products");
const ProductLog = require("mongoose").model("product_logs");

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
            price: product.price
          },
        }
      });

    }).catch(function(error){
      if(error.name == "NotFound" || error.name == "CastError") next({status: 404, errors: ["product not found"]});
      else if(error.name == "NotEnough") next({status: 422, errors: ["not enough stock to purchase, only " + error.left + " items left."]});
      else next({status: 500});
    });
  }
}


// Module exports
module.exports = {purchase: purchase};
