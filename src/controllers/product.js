const Product = require("mongoose").model("products");

// Route: POST /api/v1/products
// Create a product
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
        },
        delete: '/api/v1/products/' + _product._id,
        patch: '/api/v1/products/' + _product._id
      });

    // Any error is a server error.
    }).catch(next);
  }
}


// Route: DELETE /api/v1/products/:productId
// Delete a product.
function remove(req, res, next){
  var id = req.params.productId;

  // Find the product.
  Product.findById(id).then(function(product){
    // If not found.
    if(!product) return Promise.reject({name: "NotFound"});

    // If already deleted.
    else if(product.active == false) return Promise.reject({name: "AlreadyDeleted"});

    // Can't delete a product with stock.
    else if(product.stock > 0) return Promise.reject({name: "HasStock"});

    // Soft delete.
    else{
      product.active = false;
      return product.save();
    }
  }).then(function(_product){

    // Success response.
    res.status(204).json();

  // Error responses.
  }).catch(function(error){
    if(error.name == "NotFound" || error.name == "CastError" || error.name == 'AlreadyDeleted')
      next({status: 404, errors: ["product not found"]});
    else if(error.name == "HasStock") next({status: 422, errors: ["can't delete product with stock"]});
    else next(error);
  });
}


// Route: PATCH /api/v1/products/:productId
// Create a product
function update(req, res, next){
  var id = req.params.productId;

  // Body validation
  var price = req.body.price;
  var stock = req.body.stock;

  var errors = [];

  if(!price && !stock) errors.push("Send 'price' and / or 'stock' parameter");
  else{
    if(price && (!Number.isInteger(price) || price < 1)) errors.push("'price' must be a positive integer");

    if(stock && (!Number.isInteger(stock) || stock < 1)) errors.push("'stock' must be a positive integer");
  }

  if(errors.length > 0) next({status: 400, errors: errors});
  // End body validation.

  else{
    // Find the product.
    Product.findById(id).then(function(product){
      // If not found.
      if(!product) return Promise.reject({name: "NotFound"});

      // If already deleted.
      else if(product.active == false) return Promise.reject({name: "AlreadyDeleted"});

      // Set values.
      else{
        product.price = price || product.price;
        product.stock = stock || product.stock;
        return product.save();
      }
    }).then(function(_product){

      // Success response.
      res.status(201).json({
        request: req.object,
        entity: {
          id: _product._id,
          name: _product.name,
          description: _product.description,
          price: _product.price,
          stock: _product.stock
        },
        delete: '/api/v1/products/' + _product._id
      });

    // Error responses.
    }).catch(function(error){
      if(error.name == "NotFound" || error.name == "CastError" || error.name == 'AlreadyDeleted')
        next({status: 404, errors: ["product not found"]});
      else next(error);
    });
  }
}

// module exports.
module.exports = {create: create, remove: remove, update: update};
