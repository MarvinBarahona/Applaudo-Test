// User model
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String
});

mongoose.model('users', UserSchema);
