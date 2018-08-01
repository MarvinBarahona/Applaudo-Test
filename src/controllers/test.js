// Get mongoose model.
var TestData = require("mongoose").model("testData");

// Get dump data
function getTestData(req, res){

  TestData.find({}, (err, data) => {
    if(!err) res.status(200).json(data);
    else res.status(500).json({msg: "Something went wrong!"});
  });
  
}


module.exports = {get: getTestData};
