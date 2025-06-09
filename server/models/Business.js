// server/models/Business.js
const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  businessType: { type: String, required: true },
  address: { type: String, required: true },
  postcode: { type: String, required: true },
  state: { type: String, required: true },
  ownerFirstName: { type: String, required: true },
  ownerLastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema, 'Businesses');
