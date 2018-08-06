// User model
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  roleId: mongoose.Schema.Types.ObjectId
});

mongoose.model('users', UserSchema);
