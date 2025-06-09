// server/models/Claim.js
const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  claimerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  claimerType: { type: String, enum: ['user', 'business'], required: true },
  foodItemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FoodItem' },
  claimDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'collected', 'rejected'], default: 'pending' }
});

module.exports = mongoose.model('Claim', ClaimSchema, 'Claims');
