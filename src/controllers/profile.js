const User = require("mongoose").model('users');

function getProfile(req, res, next){

  // Get the current user.
  User.findOne({username: req.auth.user}).then(function(user){

    // Success response.
    res.status(200).json({
      request: req.object,
      data: {
        username: req.auth.user,
        name: user.name,
        role: req.auth.role
      }
    });

  // Any error is a server error. 
  }).catch(next);
}


// Module exports.
module.exports = {getProfile: getProfile};
