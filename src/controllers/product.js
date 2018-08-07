const Product = require("mongoose").model("products");
const ProductLog = require("mongoose").model("product_logs");

// Route: POST /api/v1/products
// Create a product
function create(req, res, next){
  // Body validation
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var stock = req.body.stock;

  var errors = [];

  if(name == null || name.length == 0) errors.push("missing 'name' parameter");
  else if(typeof name != 'string') errors.push("'name' mush be a string");

  if(description == null || description.length == 0) errors.push("missing 'description' parameter");
  else if(typeof description != 'string') errors.push("'description' mush be a string");

  if(price == null) errors.push("missing 'price' parameter");
  else if(!Number.isInteger(price) || price < 1) errors.push("'price' must be a positive integer");

  if(stock == null) errors.push("missing 'stock' parameter");
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
    product.popularity = 0;
    product.usersLikingId = [];

    // Save the product.
    product.save().then(function(_product){

      // Success response.
      res.status(201).json({
        request: req.object,
        entity: {
          _id: _product._id,
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

      // Save log
      var log = new ProductLog();
      log.productId = product.id;
      log.userId = req.auth.user;
      log.type = 'delete';
      log.date = Date.now();

      log.changes.push({field: 'active', value: false, diff: 'change from true to false'});

      log.save();

      // Set value and save
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

  if(price == null && stock == null) errors.push("Send 'price' and / or 'stock' parameter");
  else{
    if(price != null && (!Number.isInteger(price) || price < 1)) errors.push("'price' must be a positive integer");

    if(stock != null && (!Number.isInteger(stock) || stock < 0)) errors.push("'stock' must be a positive integer or zero");
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

      // Update the product.
      else{
        // Save product log.
        var log = new ProductLog();
        log.productId = product.id;
        log.userId = req.auth.user;
        log.type = 'update';
        log.date = Date.now();

        if(price != null) log.changes.push({field: 'price', value: price, diff: price - product.price});
        if(stock != null) log.changes.push({field: 'stock', value: stock, diff: stock - product.stock});

        log.save();

        // Set values.
        product.price = price != null ? price : product.price;
        product.stock = stock != null? stock : product.stock;
        return product.save();
      }
    }).then(function(_product){

      // Success response.
      res.status(201).json({
        request: req.object,
        entity: {
          _id: _product._id,
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
