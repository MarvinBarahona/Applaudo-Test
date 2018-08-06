// Role model
const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: [String]
});

mongoose.model('roles', RoleSchema);
