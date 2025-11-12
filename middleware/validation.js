const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const {
  validateEmail,
  validateNumber,
  validateText,
  validateCheckbox,
  validateFile,
  validateNestedFields
} = require('./validators/fieldValidators');

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim().replace(/[<>]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  next();
};

const validateSubmission = async (req, res, next) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ error: 'formId and answers are required' });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.fields || form.fields.length === 0) {
      return res.status(400).json({ error: 'This form has no fields and cannot be submitted' });
    }

    const errors = {};
    const fieldMap = {};
    form.fields.forEach(field => {
      fieldMap[field.name] = field;
    });

    for (const field of form.fields) {
      const value = answers[field.name];
      const fieldErrors = [];

      if (field.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field.label} is required`);
      }

      if (value !== undefined && value !== null && value !== '') {
        switch (field.type) {
          case 'email':
            fieldErrors.push(...validateEmail(value, field.label));
            break;
          case 'number':
            fieldErrors.push(...validateNumber(value, field.label, field.validation));
            break;
          case 'text':
          case 'textarea':
            fieldErrors.push(...validateText(value, field.label, field.validation));
            break;
          case 'checkbox':
            fieldErrors.push(...validateCheckbox(value, field.label, field));
            break;
          case 'radio':
          case 'select':
            if (field.options && field.options.length > 0) {
              const validValues = field.options.map(opt => opt.value);
              if (!validValues.includes(value)) {
                fieldErrors.push(`${field.label} must be one of the provided options`);
              } else {
                const selectedOption = field.options.find(opt => opt.value === value);
                if (selectedOption && selectedOption.nestedFields) {
                  const nestedErrors = validateNestedFields(selectedOption.nestedFields, field.name, value, answers);
                  Object.assign(errors, nestedErrors);
                }
              }
            }
            break;
          case 'file':
            fieldErrors.push(...validateFile(value, field.label, field.validation));
            break;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    req.form = form;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sanitizeInput, validateSubmission };

