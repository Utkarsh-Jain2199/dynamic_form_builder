function validateEmail(value, label) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    errors.push(`${label} must be a valid email`);
  }
  return errors;
}

function validateNumber(value, label, validation) {
  const errors = [];
  const numValue = Number(value);
  if (isNaN(numValue)) {
    errors.push(`${label} must be a number`);
  } else {
    if (validation?.min !== undefined && numValue < validation.min) {
      errors.push(`${label} must be at least ${validation.min}`);
    }
    if (validation?.max !== undefined && numValue > validation.max) {
      errors.push(`${label} must be at most ${validation.max}`);
    }
  }
  return errors;
}

function validateText(value, label, validation) {
  const errors = [];
  const strValue = String(value);
  if (validation?.minLength && strValue.length < validation.minLength) {
    errors.push(`${label} must be at least ${validation.minLength} characters`);
  }
  if (validation?.maxLength && strValue.length > validation.maxLength) {
    errors.push(`${label} must be at most ${validation.maxLength} characters`);
  }
  if (validation?.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(strValue)) {
      errors.push(`${label} format is invalid`);
    }
  }
  return errors;
}

function validateCheckbox(value, label, field) {
  const errors = [];
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
  } else if (field.options && field.options.length > 0) {
    const validValues = field.options.map(opt => opt.value);
    const invalidValues = value.filter(v => !validValues.includes(v));
    if (invalidValues.length > 0) {
      errors.push(`${label} contains invalid options`);
    }
  }
  return errors;
}

function validateFile(value, label, validation) {
  const errors = [];
  if (!value) return errors;

  let fileData, base64Data;
  
  if (typeof value === 'string' && value.startsWith('data:')) {
    fileData = value;
    base64Data = fileData.split(',')[1] || '';
  } else if (typeof value === 'object' && value.data) {
    fileData = value.data;
    base64Data = fileData.split(',')[1] || '';
  } else {
    errors.push(`${label} must be a valid file`);
    return errors;
  }

  try {
    const fileSize = Buffer.from(base64Data, 'base64').length;
    
    if (validation?.allowedTypes && validation.allowedTypes.length > 0) {
      const fileType = fileData.split(';')[0].split(':')[1];
      if (!validation.allowedTypes.includes(fileType)) {
        errors.push(`${label} must be one of the allowed file types: ${validation.allowedTypes.join(', ')}`);
      }
    }
    
    if (validation?.maxSize && fileSize > validation.maxSize) {
      const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(2);
      errors.push(`${label} must be smaller than ${maxSizeMB}MB`);
    }
  } catch (err) {
    errors.push(`${label} must be a valid file`);
  }

  return errors;
}

function validateNestedFields(nestedFields, fieldName, value, answers) {
  const errors = {};
  
  for (const nestedField of nestedFields) {
    const nestedFieldName = `${fieldName}_${value}_${nestedField.name}`;
    const nestedValue = answers[nestedFieldName];
    const nestedErrors = [];

    if (nestedField.required && (nestedValue === undefined || nestedValue === null || nestedValue === '')) {
      nestedErrors.push(`${nestedField.label} is required`);
    }

    if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
      switch (nestedField.type) {
        case 'email':
          nestedErrors.push(...validateEmail(nestedValue, nestedField.label));
          break;
        case 'number':
          nestedErrors.push(...validateNumber(nestedValue, nestedField.label, nestedField.validation));
          break;
        case 'text':
        case 'textarea':
          nestedErrors.push(...validateText(nestedValue, nestedField.label, nestedField.validation));
          break;
      }
    }

    if (nestedErrors.length > 0) {
      errors[nestedFieldName] = nestedErrors;
    }
  }

  return errors;
}

module.exports = {
  validateEmail,
  validateNumber,
  validateText,
  validateCheckbox,
  validateFile,
  validateNestedFields
};

