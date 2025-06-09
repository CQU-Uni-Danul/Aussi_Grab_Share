const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reporterType'  // dynamic reference
  },
  reporterType: {
    type: String,
    required: true,
    enum: ['user', 'business']  // depending on your roles
  },
  reportedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reportedEntityType' // dynamic reference
  },
  reportedEntityType: {
    type: String,
    required: true,
    enum: ['fooditem', 'claim', 'notification'] // extend as needed
  },
  reportType: {
    type: String,
    required: true,
    enum: ['spoiled', 'expired', 'misleading', 'other'] // example types
  },
  description: {
    type: String,
    required: false,
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Report', reportSchema, 'reports');
