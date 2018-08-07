const Product = require("mongoose").model("products");

function create(req, res, next){
  // Body validation
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var stock = req.body.stock;

  var errors = [];

  if(!name || name.length == 0) errors.push("missing 'name' parameter");
  else if(typeof name != 'string') errors.push("'name' mush be a string");

  if(!description || description.length == 0) errors.push("missing 'description' parameter");
  else if(typeof description != 'string') errors.push("'description' mush be a string");

  if(!price) errors.push("missing 'price' parameter");
  else if(!Number.isInteger(price) || price < 1) errors.push("'price' must be a positive integer");

  if(!stock) errors.push("missing 'stock' parameter");
  else if(!Number.isInteger(stock) || stock < 1) errors.push("'stock' must be a positive integer");

  if(errors.length > 0) next({status: 400, errors: errors});
  // End body validation.

  else{
    // Create new product object.
    var product = new Product();
    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.active = true;
    product.usersLikingId = [];

    // Save the product.
    product.save().then(function(_product){

      // Success response. 
      res.status(201).json({
        request: req.object,
        entity: {
          id: _product._id,
          name: _product.name,
          description: _product.description,
          price: _product.price,
          stock: _product.stock
        }
      });

    // Any error is a server error.
    }).catch(next);
  }
}


// module exports.
module.exports = {create: create};
