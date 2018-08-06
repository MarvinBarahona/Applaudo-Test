// Get mongoose model.
const TestData = require("mongoose").model("testData");

// Get dump data
function getTestData(req, res, next){

  TestData.find({}).then(function(data){
    res.status(200).json({request: req.object, data: data});
  }).catch(function(error){
    next({status: 500});
  });

}


module.exports = {get: getTestData};
