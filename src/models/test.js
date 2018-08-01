// Test model
const mongoose = require("mongoose");

const TestDataSchema = new mongoose.Schema({
  name: String,
  obj: [{
    attr1: String,
    attr2: String
  }]
});

mongoose.model('testData', TestDataSchema, "test");
