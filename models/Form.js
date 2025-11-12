const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'number', 'email', 'date', 'checkbox', 'radio', 'select', 'file'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    label: String,
    value: String,
    nestedFields: [{
      label: String,
      type: String,
      name: String,
      required: Boolean,
      validation: {
        min: Number,
        max: Number,
        pattern: String,
        minLength: Number,
        maxLength: Number
      }
    }]
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    minLength: Number,
    maxLength: Number,
    allowedTypes: [String],
    maxSize: Number
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  fields: [fieldSchema],
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isModified('fields') && !this.isNew) {
    this.version = (this.version || 0) + 1;
  }
  
  next();
});

formSchema.methods.validateFieldNames = function() {
  const names = this.fields.map(f => f.name);
  const uniqueNames = new Set(names);
  return names.length === uniqueNames.size;
};

module.exports = mongoose.model('Form', formSchema);

