// Get mongoose model.
const TestData = require("mongoose").model("testData");

// Route: /api/v1/test
// Get dump data
function get(req, res, next){

  TestData.find({}).then(function(data){
    res.status(200).json({request: req.object, data_size: data.length, data: data});
  }).catch(function(error){
    next({status: 500});
  });

}


// Module exports.
module.exports = {get: get};
