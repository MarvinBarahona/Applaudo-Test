const mongoose = require("mongoose");

// Get enviroment variables.
const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

// If any variable is missing, close the app.
if(!DB_URI || !DB_NAME){
  console.log("unable to get DB_URI or DB_NAME from enviroment variables!");
  console.log("did you set them on the .env file?");
  process.exit(1);
}

// Connection options.
const options = {
  dbName: process.env.DB_NAME,
  // Avoid deprecation warning
  useNewUrlParser: true
};

// Try to connect.
mongoose.connect(DB_URI, options, (err) => {
  // If error, close the app.
  if(err){
    console.log("can't connect to database!")
    console.log(err);
    process.exit(1);
  }
  else{
    console.log("success connection to database", DB_NAME);
  }
});

module.exports = mongoose;
