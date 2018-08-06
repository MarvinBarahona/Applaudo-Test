const jwt = require("../helpers/jwt");
const Role = require("mongoose").model("roles");

// Middleware to check the token before getting to the route.
// Return error if the token has no access or is invalid.
function checkToken(req, res, next){

  //  Get user from the token.
  getUser(req.object.auth).then(function(auth){
    //  Set the auth info in the request.
    req.auth = auth;

  // Check permission.
    return checkPermission(req.object.method + " " + req.object.uri, auth.role);
  }).then(function(allowed){

    // If allowed, continue.
    if(allowed) next();

    // If response is false, not allowed.
    else return Promise.reject({name: 'NotAllowed'});

  // Return failure response.
  }).catch(function(error){
    // Anonymous user fail: token needed.
    if(error.name == 'NotAllowed' && req.object.auth == "") res.status(401).json({errors: ["Need a token to access"]});

    // Logged user fail: not allowed.
    else if(error.name == 'NotAllowed' && req.object.auth != "") res.status(403).json({errors: ["Token not allowed to access"]});

    // Token expired.
    else if(error.name == 'TokenExpiredError') res.status(401).json({errors: ["Expired token"]});

    // Invalid token.
    else if(error.name == 'JsonWebTokenError') res.status(401).json({errors: ["Invalid token"]});

    // Else: server error.
    else res.status(500).json({errors: ["Server error, please report!"]})
  });
};


// Get the user from the token or the anonymous user object.
function getUser(token){
  return new Promise(function(resolve, reject){

    // Anonymous user.
    if(token == "") resolve({user: "", role: "anonymous"});

    // Decode the token.
    else{
      jwt.verifyToken(token).then(function(decoded){
        resolve(decoded);

      // Reject is token is expired or invalid.
      }).catch(reject);
    }

  });
}


// Check if the user has permission to access the route.
function checkPermission(uri, role_name){

  return new Promise(function(resolve, reject){
    var allowed = false;

    // Split the requested uri into pieces.
    var uri_parts = uri.split('/');

    // Get the role from the database.
    Role.findOne({name: role_name}).then(function(role){

      // For every route the role has access.
      for (var i = 0, len = role.permissions.length; i < len; i++) {

        // Split the route in pieces.
        var permission_parts = role.permissions[i].split('/');

        // If lengths don't match, is not allowed.
        var match = uri_parts.length == permission_parts.length;
        if(match){

          // For every piece in the routes.
          for(var j = 0, parts_len = uri_parts.length; j < parts_len; j++){

            // if parts don't match, not allowed (Ignore uri parameters)
            if(permission_parts[j] != uri_parts[j] && !permission_parts[j].startsWith(":")){
              match = false;
              j = parts_len;
            }
          }
        }

        // If any match, allowed is true and exit the for loop.
        if(match){
          allowed = true;
          i = len;
        }
      }

      // Resolve with the result.
      resolve(allowed);

    // Any error is a server error.
    }).catch(reject);

  });
}

module.exports = {checkToken: checkToken};
