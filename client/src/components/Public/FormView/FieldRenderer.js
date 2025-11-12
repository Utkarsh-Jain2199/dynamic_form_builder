import React from 'react';

export function renderNestedField(nestedField, parentFieldName, parentValue, optionValue, answers, errors, handleNestedChange) {
  const fieldName = `${parentFieldName}_${optionValue}_${nestedField.name}`;
  const value = answers[fieldName];
  const fieldErrors = errors[fieldName] || [];

  switch (nestedField.type) {
    case 'text':
    case 'email':
    case 'date':
      return (
        <div key={fieldName} className="form-group nested-field">
          <label className="label">
            {nestedField.label}
            {nestedField.required && <span className="required">*</span>}
          </label>
          <input
            type={nestedField.type}
            name={fieldName}
            value={value || ''}
            onChange={(e) => handleNestedChange(fieldName, e.target.value)}
            className="input"
            required={nestedField.required}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );
    case 'textarea':
      return (
        <div key={fieldName} className="form-group nested-field">
          <label className="label">
            {nestedField.label}
            {nestedField.required && <span className="required">*</span>}
          </label>
          <textarea
            name={fieldName}
            value={value || ''}
            onChange={(e) => handleNestedChange(fieldName, e.target.value)}
            className="textarea"
            required={nestedField.required}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );
    case 'number':
      return (
        <div key={fieldName} className="form-group nested-field">
          <label className="label">
            {nestedField.label}
            {nestedField.required && <span className="required">*</span>}
          </label>
          <input
            type="number"
            name={fieldName}
            value={value || ''}
            onChange={(e) => handleNestedChange(fieldName, e.target.value)}
            className="input"
            required={nestedField.required}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function renderField(field, answers, errors, setAnswers, setErrors, handleCheckboxChange) {
  const handleChange = (fieldName, value) => {
    if (fieldName === '') {
      setAnswers(value);
      return;
    }
    const newAnswers = { ...answers };
    newAnswers[fieldName] = value;
    setAnswers(newAnswers);
    
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };
  const value = answers[field.name];
  const fieldErrors = errors[field.name] || [];

  switch (field.type) {
    case 'text':
    case 'email':
    case 'date':
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            type={field.type}
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="input"
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );

    case 'textarea':
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <textarea
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="textarea"
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );

    case 'number':
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="input"
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );

    case 'select':
      const selectedOption = field.options?.find(opt => opt.value === value);
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <select
            name={field.name}
            value={value || ''}
            onChange={(e) => {
              const oldValue = value;
              handleChange(field.name, e.target.value);
              if (oldValue && field.options) {
                const oldOption = field.options.find(opt => opt.value === oldValue);
                if (oldOption && oldOption.nestedFields) {
                  const newAnswers = { ...answers };
                  newAnswers[field.name] = e.target.value;
                  oldOption.nestedFields.forEach(nestedField => {
                    delete newAnswers[`${field.name}_${oldValue}_${nestedField.name}`];
                  });
                  setAnswers(newAnswers);
                }
              }
            }}
            className="select"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
          {selectedOption?.nestedFields && selectedOption.nestedFields.map(nestedField => 
            renderNestedField(nestedField, field.name, value, selectedOption.value, answers, errors, (name, val) => {
              const newAnswers = { ...answers };
              newAnswers[name] = val;
              setAnswers(newAnswers);
              if (errors[name]) {
                const newErrors = { ...errors };
                delete newErrors[name];
                setErrors(newErrors);
              }
            })
          )}
        </div>
      );

    case 'radio':
      const selectedRadioOption = field.options?.find(opt => opt.value === value);
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <div className="radio-group">
            {field.options?.map((option, idx) => (
              <label key={idx} className="radio-label">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => {
                    const oldValue = value;
                    handleChange(field.name, e.target.value);
                    if (oldValue && field.options) {
                      const oldOption = field.options.find(opt => opt.value === oldValue);
                      if (oldOption && oldOption.nestedFields) {
                        const newAnswers = { ...answers };
                        newAnswers[field.name] = e.target.value;
                        oldOption.nestedFields.forEach(nestedField => {
                          delete newAnswers[`${field.name}_${oldValue}_${nestedField.name}`];
                        });
                        setAnswers(newAnswers);
                      }
                    }
                  }}
                  required={field.required}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
          {selectedRadioOption?.nestedFields && selectedRadioOption.nestedFields.map(nestedField => 
            renderNestedField(nestedField, field.name, value, selectedRadioOption.value, answers, errors, (name, val) => {
              const newAnswers = { ...answers };
              newAnswers[name] = val;
              setAnswers(newAnswers);
              if (errors[name]) {
                const newErrors = { ...errors };
                delete newErrors[name];
                setErrors(newErrors);
              }
            })
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <div className="checkbox-group">
            {field.options?.map((option, idx) => (
              <label key={idx} className="checkbox-label">
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
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );

    case 'file':
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            handleChange(field.name, reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          handleChange(field.name, '');
        }
      };

      return (
        <div key={field._id} className="form-group">
          <label className="label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            type="file"
            name={field.name}
            onChange={handleFileChange}
            className="input"
            required={field.required}
            accept={field.validation?.allowedTypes?.join(',')}
          />
          {value && (
            <div className="file-preview">
              File selected: {value.split(';')[0].split(':')[1] || 'Unknown'}
              {field.validation?.maxSize && (
                <span> (Max: {(field.validation.maxSize / (1024 * 1024)).toFixed(2)}MB)</span>
              )}
            </div>
          )}
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="error">{error}</div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

