// Product model
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  active: Boolean,
  popularity: Number,
  usersLikingId: [mongoose.Schema.Types.ObjectId]
});

mongoose.model('products', ProductSchema);
