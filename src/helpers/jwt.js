const jwt = require("jsonwebtoken");

function getToken(payload){
  // Wrap function in promise.
  return new Promise(function(resolve, reject){

    // Create a new JWT.
    jwt.sign(
      // Set the payload.
      payload,

      // Sign using the app secret.
      process.env.APP_SECRET,

      // Options. Usign default algorithm HS256 and expires in two hours.
      {
        expiresIn: "2h"
      },

      // Callback function.
      function(err, token){
        // If error, reject; else resolve.
        if(err) reject(err);
        else resolve(token);
      }

    );

  });
}

function verifyToken(token){
  // Wrap function in Promise.
  return new Promise(function(resolve, reject){

    if(token.startsWith("Bearer ")) token = token.replace("Bearer ", "");

    // Verify a JWT
    jwt.verify(
      token,

      // Verify using the app secret.
      process.env.APP_SECRET,

      // Callback function
      function(err, decoded){
        // If error reject, else revolse with the decoded object.
        if(err) reject(err);
        else resolve(decoded);
      }
    );

  });
}


module.exports = {getToken: getToken, verifyToken: verifyToken}
