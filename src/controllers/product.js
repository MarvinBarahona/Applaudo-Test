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

      // Save log
      var log = new ProductLog();
      log.productId = product.id;
      log.userId = req.auth.user;
      log.type = 'create';
      log.date = Date.now();

      log.changes.push(
        {field: 'active', value: product.active, diff: 'set to ' + product.active},
        {field: 'price', value: product.price, diff: 'set to ' + product.price},
        {field: 'stock', value: product.stock, diff: 'set to ' + product.stock}
      );

      log.save();

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
        patch: '/api/v1/products/' + _product._id,
        list: '/api/v1/products'
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

      var prev_active = product.active;

      // Set value and save
      product.active = false;

      // Save log
      var log = new ProductLog();
      log.productId = product.id;
      log.userId = req.auth.user;
      log.type = 'delete';
      log.date = Date.now();

      log.changes.push({field: 'active', value: product.active, diff: 'change from ' + prev_active + ' to ' + product.active});

      log.save();

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
        delete: '/api/v1/products/' + _product._id,
        list: '/api/v1/products'
      });

    // Error responses.
    }).catch(function(error){
      if(error.name == "NotFound" || error.name == "CastError" || error.name == 'AlreadyDeleted')
        next({status: 404, errors: ["product not found"]});
      else next(error);
    });
  }
}


// Route: GET /api/v1/products
// Get all the products
function list(req, res, next){
  // Validate params.
  var errors = [];

  // Pagination
  const PAGE_SIZE_DEFAULT = 5;
  var page = req.query.page != null ? parseInt(req.query.page) : 1;
  var page_size = req.query.page_size != null ? parseInt(req.query.page_size) : PAGE_SIZE_DEFAULT;

  if(!Number.isInteger(page) || page < 1) errors.push("'page' must be a positive integer");

  if(!Number.isInteger(page_size) || page_size < 5 || page_size > 20) errors.push("'page_size' must be a integer between 5 and 20");

  // Filtering
  var filters_params = [];
  var filters_fields = req.query.filter == null ? [] : req.query.filter.split(';');
  var filters_values = req.query.filter_value == null ? [] : req.query.filter_value.split(';');
  var filters_types = req.query.filter_type == null ? [] : req.query.filter_type.split(';');

  // Error if filters parameters doesn't match size.
  if(filters_fields.length != filters_types.length || filters_types.length != filters_values.length)
    errors.push("filtering parameters' size mismatch");

  else{
    // Filtering options.
    var allow_filters = [
      {field: 'name', type: 'contains', value: 'string'},
      {field: 'active', type: 'equal', value: 'boolean', admin: true}
    ];

    // Check if filter paramenters are valid.
    for(var i = 0, len_params = filters_types.length; i < len_params; i++){
      var inArray = false;

      var filter_param = {
        field: filters_fields[i].trim().toLowerCase(),
        value: filters_values[i].trim(),
        type: filters_types[i].trim().toLowerCase()
      }

      for(var j = 0, len_allow = allow_filters.length; j < len_allow; j++){
        var allow_filter = allow_filters[j];
        if(filter_param.field == allow_filter.field && filter_param.type == allow_filter.type){
          inArray = true;
          j = len_allow;

          // Check if filter is only for admins.
          if(allow_filter.admin != null && req.auth.role != "admin") errors.push("You are not allow to use filter '" + filter_param.field + " " + filter_param.type + "'");

          // Check boolean value.
          if(allow_filter.value == "boolean"){
            var value = filter_param.value.toLowerCase();

            if(value != "true" && value != "false") errors.push("Invalid filter value for '" + filter_param.field + " "+ filter_param.type + "': must be true or false.");
            else{
              filter_param.value = value == "true" ? true : false;
            }
          }
        }
      }

      // If not valid, error.
      if(!inArray) errors.push("Invalid filter: '" + filter_param.field + " "+ filter_param.type + "'");

      // Else, put it on the filters_params.
      else filters_params.push(filter_param);
    }
  }

  // Field selection.
  var field_selection = [];

  // Include
  var includes = req.query.include == null ? [] : req.query.include.split(";");

  var allow_includes = [
    {field: "stock", admin: true}
  ];

  // Check if include paramenters are valid.
  for(var i = 0, len_params = includes.length; i < len_params; i++){
    var inArray = false;
    var include = includes[i];

    for(var j = 0, len_allow = allow_includes.length; j < len_allow; j++){
      var allow_include = allow_includes[j];
      if(include == allow_include.field){
        inArray = true;
        j = len_allow;

        // Check if include is only for admins.
        if(allow_include.admin != null && req.auth.role != "admin") errors.push("You are not allow to use include '" + include + "'");
      }
    }

    // If not valid, error.
    if(!inArray) errors.push("Invalid include: '" + include + "'");
    else field_selection.push({field: include, type: 'include'});
  }

  // Exclude
  var excludes = req.query.exclude == null ? [] : req.query.exclude.split(";");

  var allow_excludes = [
    {field: "popularity"}
  ];

  // Check if exclude paramenters are valid.
  for(var i = 0, len_params = excludes.length; i < len_params; i++){
    var inArray = false;
    var exclude = excludes[i];

    for(var j = 0, len_allow = allow_excludes.length; j < len_allow; j++){
      var allow_exclude = allow_excludes[j];
      if(exclude == allow_exclude.field){
        inArray = true;
        j = len_allow;

        // Check if exclude is only for admins.
        if(allow_exclude.admin != null && req.auth.role != "admin") errors.push("You are not allow to use exclude '" + exclude + "'");
      }
    }

    // If not valid, error.
    if(!inArray) errors.push("Invalid exclude: '" + exclude + "'");
    else field_selection.push({field: exclude, type: 'exclude'});
  }

  // Sorting
  var sorting_params = [];
  var sort_fields = req.query.sort == null ? [] : req.query.sort.split(';');
  var sort_order = req.query.sort_order == null ? [] : req.query.sort_order.split(';');

  // Error if sorts parameters doesn't match size.
  if(sort_fields.length != sort_order.length)
    errors.push("sorting parameters' size mismatch");

  else{
    // Sorting options.
    var allow_sorts = [
      {by: 'name', order: 'ASC'},
      {by: 'name', order: 'DESC'},
      {by: 'popularity', order: 'ASC'},
      {by: 'popularity', order: 'DESC'}
    ];

    // Check if sort paramenters are valid.
    for(var i = 0, len_params = sort_fields.length; i < len_params; i++){
      var inArray = false;

      var sort_param = {
        by: sort_fields[i].trim().toLowerCase(),
        order: sort_order[i].trim().toUpperCase()
      }

      for(var j = 0, len_allow = allow_sorts.length; j < len_allow; j++){
        var allow_sort = allow_sorts[j];
        if(sort_param.by == allow_sort.by && sort_param.order == allow_sort.order){
          inArray = true;
          j = len_allow;
        }
      }

      // If not valid, error.
      if(!inArray) errors.push("Invalid sort: '" + sort_param.by + " "+ sort_param.order + "'");

      // Else, put it on the sorting_params.
      else sorting_params.push(sort_param);
    }
  }

  if(errors.length > 0) next({status: 400, errors: errors});
  // End of params validation.


  else{
    var pages;

    // Filtering.
    var filters = {};

    // Only active products.
    filters["active"] = true;

    // Add filters of the filtets_params array.
    for(var i = 0, len = filters_params.length; i < len; i++){
      var filter = filters_params[i];

      if(filter.type == 'contains') filters[filter.field] = new RegExp(filter.value, 'i');
      if(filter.type == "equal") filters[filter.field] = filter.value;
    }


    // Count all documents that match.
    Product.countDocuments(filters).then(function(count){

      // Get page size.
      pages = Math.ceil(count / page_size);

      // If no product, pages = 1.
      if(pages == 0) pages = 1;

      // Validate page value.
      if(page > pages) return Promise.reject({name: 'InvalidPage'});


    // Get the products.
      else{
        var default_fields = ["name", "description", "price", "popularity"];

        for(var i = 0, len = field_selection.length; i < len; i++){
          if(field_selection[i].type == "include") default_fields.push(field_selection[i].field);
          else default_fields = default_fields.filter(function(_field){ return _field != this}, field_selection[i].field)
        }

        // Field selection.
        var fields = {};

        for(var i = 0, len = default_fields.length; i < len; i++){
          fields[default_fields[i]] = 1
        }

        // Pagination.
        var options = {
          sort: {},
          skip: (page - 1) * page_size,
          limit: page_size
        }

        for(var i = 0, len = sorting_params.length; i < len; i++){
          options.sort[sorting_params[i].by] = sorting_params[i].order == "ASC" ? 1 : -1;
        }

        if(options.sort.name != -1) options.sort.name = 1;

        return Product.find(filters, fields, options);
      }
    }).then(function(products){

      // Success response.
      var options = [];

      // Sorting
      if(sorting_params.length > 0){
        var sort = [], sort_order = [];

        for(var i = 0, len = sorting_params.length; i < len; i++){
          var sorting_param = sorting_params[i];
          sort.push(sorting_param.by);
          sort_order.push(sorting_param.order);
        }

        options.push("sort=" + sort.join(";"));
        options.push("sort_order=" + sort_order.join(";"));
      }

      // Filtering
      if(filters_params.length > 0){
        var filter = [], filter_value = [], filter_type = [];

        for(var i = 0, len = filters_params.length; i < len; i++){
          var filter_param = filters_params[i];
          filter.push(filter_param.field);
          filter_value.push(filter_param.value);
          filter_type.push(filter_param.type);
        }

        options.push("filter=" + filter.join(";"));
        options.push("filter_value=" + filter_value.join(";"));
        options.push("filter_type=" + filter_type.join(";"));
      }

      // Field selection
      var includes = [], excludes = [];

      for(var i = 0, len = field_selection.length; i < len; i++){
        if(field_selection[i].type == "include") includes.push(field_selection[i].field);
        else excludes.push(field_selection[i].field);
      }

      if(includes.length > 0) options.push("include=" + includes.join(";"));
      if(excludes.length > 0) options.push("exclude=" + excludes.join(";"));

      var next_page = "";

      if(page < pages){
        next_page = "/api/v1/products?page=" + (page + 1);
        if(page_size != PAGE_SIZE_DEFAULT) next_page += '&page_size=' + page_size;
        if(options.length > 0) next_page += "&" + options.join("&");
      }

      var previous_page = "";

      if(page > 1){
        previous_page = "/api/v1/products?page=" + (page - 1);
        if(page_size != PAGE_SIZE_DEFAULT) previous_page += '&page_size=' + page_size;
        if(options.length > 0) previous_page += "&" + options.join("&");
      }


      res.status(200).json({
        request: req.object,
        pagination: {
          current: page,
          pages: pages,
          size: page_size,
          next: next_page,
          previous_page: previous_page
        },
        sorting: sorting_params,
        filters: filters_params,
        select: field_selection,
        data_size: products.length,
        data: products
      });

    // Catch errors.
    }).catch(function(error){
      if(error.name == 'InvalidPage') next({status:422, errors: ["page not found"]});
      else next({status: 500});
    });
  }
}

// module exports.
module.exports = {create: create, remove: remove, update: update, list: list};
