import React, { useState } from 'react';

function PreviewForm({ fields }) {
  const [previewAnswers, setPreviewAnswers] = useState({});

  const handleChange = (fieldName, value) => {
    const newAnswers = { ...previewAnswers };
    newAnswers[fieldName] = value;
    setPreviewAnswers(newAnswers);
  };

  const handleCheckboxChange = (fieldName, value, checked) => {
    const current = previewAnswers[fieldName] || [];
    const newAnswers = { ...previewAnswers };
    if (checked) {
      newAnswers[fieldName] = [...current, value];
    } else {
      newAnswers[fieldName] = current.filter(v => v !== value);
    }
    setPreviewAnswers(newAnswers);
  };

  const renderNestedField = (nestedField, fieldName, value) => {
    const nestedFieldName = `${fieldName}_${value}_${nestedField.name}`;
    const nestedValue = previewAnswers[nestedFieldName];

    return (
      <div key={nestedField.name} className="preview-nested-field">
        <label className="preview-label preview-nested-label">
          {nestedField.label}
          {nestedField.required && <span className="required-star">*</span>}
        </label>
        {nestedField.type === 'text' && (
          <input
            type="text"
            className="preview-input"
            value={nestedValue || ''}
            onChange={(e) => handleChange(nestedFieldName, e.target.value)}
            placeholder={nestedField.label}
          />
        )}
        {nestedField.type === 'textarea' && (
          <textarea
            className="preview-textarea"
            value={nestedValue || ''}
            onChange={(e) => handleChange(nestedFieldName, e.target.value)}
            placeholder={nestedField.label}
          />
        )}
        {nestedField.type === 'number' && (
          <input
            type="number"
            className="preview-input"
            value={nestedValue || ''}
            onChange={(e) => handleChange(nestedFieldName, e.target.value)}
            placeholder={nestedField.label}
          />
        )}
        {nestedField.type === 'email' && (
          <input
            type="email"
            className="preview-input"
            value={nestedValue || ''}
            onChange={(e) => handleChange(nestedFieldName, e.target.value)}
            placeholder={nestedField.label}
          />
        )}
        {nestedField.type === 'date' && (
          <input
            type="date"
            className="preview-input"
            value={nestedValue || ''}
            onChange={(e) => handleChange(nestedFieldName, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderPreviewField = (field) => {
    const value = previewAnswers[field.name];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'date':
        return (
          <input
            type={field.type}
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="preview-input"
            placeholder={field.label}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="preview-textarea"
            placeholder={field.label}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="preview-input"
            placeholder={field.label}
          />
        );
      case 'checkbox':
        return (
          <div className="preview-checkbox-group">
            {field.options?.map((option, idx) => (
              <label key={idx} className="preview-checkbox">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => handleCheckboxChange(field.name, option.value, e.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        const selectedRadioOption = field.options?.find(opt => opt.value === value);
        return (
          <div>
            <div className="preview-radio-group">
              {field.options?.map((option, idx) => (
                <label key={idx} className="preview-radio">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {selectedRadioOption?.nestedFields && selectedRadioOption.nestedFields.map(nestedField => 
              renderNestedField(nestedField, field.name, value)
            )}
          </div>
        );
      case 'select':
        const selectedOption = field.options?.find(opt => opt.value === value);
        return (
          <div>
            <select
              name={field.name}
              value={value || ''}
              onChange={(e) => {
                const oldValue = value;
                handleChange(field.name, e.target.value);
                if (oldValue && field.options) {
                  const oldOption = field.options.find(opt => opt.value === oldValue);
                  if (oldOption && oldOption.nestedFields) {
                    const newAnswers = { ...previewAnswers };
                    oldOption.nestedFields.forEach(nestedField => {
                      delete newAnswers[`${field.name}_${oldValue}_${nestedField.name}`];
                    });
                    setPreviewAnswers(newAnswers);
                  }
                }
              }}
              className="preview-select"
            >
              <option value="">Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedOption?.nestedFields && selectedOption.nestedFields.map(nestedField => 
              renderNestedField(nestedField, field.name, value)
            )}
          </div>
        );
      case 'file':
        return (
          <input
            type="file"
            name={field.name}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  handleChange(field.name, reader.result);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="preview-input"
            accept={field.validation?.allowedTypes?.join(',')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {fields.map(field => (
        <div key={field._id} className="preview-field">
          <label className="preview-label">
            {field.label}
            {field.required && <span className="required-star">*</span>}
          </label>
          {renderPreviewField(field)}
        </div>
      ))}
    </>
  );
}

export default PreviewForm;

