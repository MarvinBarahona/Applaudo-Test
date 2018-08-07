// Product Log model
const mongoose = require("mongoose");

const ProductLogSchema = new mongoose.Schema({
  type: String,
  date: Date,
  changes: [
    {
      field: String,
      value: mongoose.Schema.Types.Mixed,
      diff: mongoose.Schema.Types.Mixed
    }
  ],
  purchase:{
    price: Number,
    quantity: Number,
    total: Number
  },
  productId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId
});

mongoose.model('product_logs', ProductLogSchema);
