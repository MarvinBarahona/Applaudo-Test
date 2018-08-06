const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const User = require("mongoose").model("users");
const Role = require("mongoose").model("roles");

// Route: /api/v1/login
// Login in the app.
function login(req, res, next){

  // Validate body.
  var errors = [];
  var username = req.body.username;
  var password = req.body.password;

  if(!username || username.length == 0) errors.push("mising 'username' parameter");
  else if(typeof username != 'string') errors.push("'username' mush be a string");

  if(!password || password.length == 0) errors.push("missing 'password' parameter");
  else if(typeof password != 'string') errors.push("'password' mush be a string");

  if(errors.length > 0) next({status: 400, errors: errors});
  // End body validation.


  // After body validation.
  else{


    var user;
    var role;

    // Search for the user, check is exists.
    User.findOne({username: username}).then(function(_user){
      if(!_user) return Promise.reject({name: 'UserNotFound'});

    // Validate password, check is valid.
      else{
        user = _user;
        return bcrypt.compare(password, user.password);
      }
    }).then(function(valid){
      if(!valid) return Promise.reject({name: 'InvalidPassword'});

    // Get the user's role. Make sure it exists.
      else return Role.findById(user.roleId);
    }).then(function(_role){
      if(!_role) return Promise.reject({name: 'RoleNotFound'});

    // Create JWT and return success response.
      else{
        role = _role;
        return jwt.getToken({role: role.name})
      }
    }).then(function(token){
      res.status(200).json({
        request: req.object,
        entity: {username: user.username, name: user.name, role: role.name, token: token},
        get: '/api/v1/me'
      })

    // Catch and return error response.
    }).catch(function(error){
      if(error.name == 'UserNotFound') next({status: 404, errors: ["Invalid username"]});
      if(error.name == 'InvalidPassword') next({status: 422, errors: ["Invalid password"]});
      else next({status: 500});
    });

  }
}


// Module exports.
module.exports = {login: login};
