// server/models/FoodItem.js
const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  location: { type: String, required: true },
  collectStatus: { type: String, default: "pending" },
  postedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ['user', 'business'], required: true }
  },
  claimed: { type: Boolean, default: false },
  claimedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, default: null },
    role: { type: String, enum: ['user', 'business'], default: null }
  },
  postedAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }
});

FoodItemSchema.index({ location: 1}); // For efficient location

module.exports = mongoose.model('FoodItem', FoodItemSchema, 'FoodItems');
