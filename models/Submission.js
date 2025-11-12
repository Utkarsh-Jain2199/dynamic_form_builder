const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  formVersion: {
    type: Number,
    required: true
  },
  formSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  }
});

module.exports = mongoose.model('Submission', submissionSchema);

