import React, { useState } from 'react';

function FieldPropertiesPanel({ field, onUpdate, onClose }) {
  const [fieldData, setFieldData] = useState({
    label: field.label,
    type: field.type,
    name: field.name,
    required: field.required,
    options: (field.options || []).map(opt => ({
      label: opt.label || '',
      value: opt.value || '',
      nestedFields: opt.nestedFields || []
    })),
    validation: field.validation || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(fieldData);
  };

  const addOption = () => {
    const updated = { ...fieldData };
    updated.options = [...fieldData.options, { label: '', value: '', nestedFields: [] }];
    setFieldData(updated);
  };

  const updateOption = (index, key, value) => {
    const newOptions = [...fieldData.options];
    if (!newOptions[index]) {
      newOptions[index] = { label: '', value: '', nestedFields: [] };
    }
    newOptions[index][key] = value;
    const updated = { ...fieldData };
    updated.options = newOptions;
    setFieldData(updated);
  };

  const removeOption = (index) => {
    const newOptions = fieldData.options.filter((_, i) => i !== index);
    const updated = { ...fieldData };
    updated.options = newOptions;
    setFieldData(updated);
  };

  const addNestedField = (optionIndex) => {
    const newOptions = [...fieldData.options];
    if (!newOptions[optionIndex].nestedFields) {
      newOptions[optionIndex].nestedFields = [];
    }
    newOptions[optionIndex].nestedFields.push({
      label: '',
      type: 'text',
      name: '',
      required: false,
      validation: {}
    });
    const updated = { ...fieldData };
    updated.options = newOptions;
    setFieldData(updated);
  };

  const updateNestedField = (optionIndex, nestedIndex, key, value) => {
    const newOptions = [...fieldData.options];
    if (!newOptions[optionIndex].nestedFields) {
      newOptions[optionIndex].nestedFields = [];
    }
    newOptions[optionIndex].nestedFields[nestedIndex][key] = value;
    const updated = { ...fieldData };
    updated.options = newOptions;
    setFieldData(updated);
  };

  const removeNestedField = (optionIndex, nestedIndex) => {
    const newOptions = [...fieldData.options];
    newOptions[optionIndex].nestedFields = newOptions[optionIndex].nestedFields.filter((_, i) => i !== nestedIndex);
    const updated = { ...fieldData };
    updated.options = newOptions;
    setFieldData(updated);
  };

  const needsOptions = ['radio', 'select', 'checkbox'].includes(fieldData.type);
  const supportsNestedFields = ['radio', 'select'].includes(fieldData.type);

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Field Properties</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <form onSubmit={handleSubmit} className="properties-form">
        <div className="property-group">
          <label>Label</label>
          <input
            type="text"
            value={fieldData.label}
            onChange={(e) => {
              const updated = { ...fieldData };
              updated.label = e.target.value;
              setFieldData(updated);
            }}
            required
          />
        </div>

        <div className="property-group">
          <label>Field Name</label>
          <input
            type="text"
            value={fieldData.name}
            onChange={(e) => {
              const updated = { ...fieldData };
              updated.name = e.target.value.toLowerCase().replace(/\s+/g, '_');
              setFieldData(updated);
            }}
            required
            pattern="[a-z0-9_]+"
          />
        </div>

        <div className="property-group">
          <label>
            <input
              type="checkbox"
              checked={fieldData.required}
              onChange={(e) => {
                const updated = { ...fieldData };
                updated.required = e.target.checked;
                setFieldData(updated);
              }}
            />
            Required
          </label>
        </div>

        {needsOptions && (
          <div className="property-group">
            <label>Options</label>
            {fieldData.options.map((option, index) => (
              <div key={index} className="option-container">
                <div className="option-input-row">
                  <input
                    type="text"
                    placeholder="Label"
                    value={option.label || ''}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={option.value || ''}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                  />
                  <button type="button" onClick={() => removeOption(index)}>Remove</button>
                </div>
                {supportsNestedFields && (
                  <div className="nested-fields-section">
                    <button
                      type="button"
                      onClick={() => addNestedField(index)}
                      className="add-nested-btn"
                    >
                      + Add Nested Fields
                    </button>
                    {(option.nestedFields || []).map((nestedField, nestedIndex) => (
                      <div key={nestedIndex} className="nested-field-row">
                        <input
                          type="text"
                          placeholder="Field Label"
                          value={nestedField.label || ''}
                          onChange={(e) => updateNestedField(index, nestedIndex, 'label', e.target.value)}
                        />
                        <select
                          value={nestedField.type || 'text'}
                          onChange={(e) => updateNestedField(index, nestedIndex, 'type', e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="date">Date</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Field Name"
                          value={nestedField.name || ''}
                          onChange={(e) => updateNestedField(index, nestedIndex, 'name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        />
                        <label>
                          <input
                            type="checkbox"
                            checked={nestedField.required || false}
                            onChange={(e) => updateNestedField(index, nestedIndex, 'required', e.target.checked)}
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => removeNestedField(index, nestedIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className="add-option-btn">
              Add Option
            </button>
          </div>
        )}

        {(fieldData.type === 'number' || fieldData.type === 'text' || fieldData.type === 'textarea') && (
          <div className="property-group">
            <label>Validation</label>
            {fieldData.type === 'number' && (
              <>
                <input
                  type="number"
                  placeholder="Min value"
                  value={fieldData.validation.min || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const updated = { ...fieldData };
                    if (!updated.validation) updated.validation = {};
                    updated.validation.min = val;
                    setFieldData(updated);
                  }}
                />
                <input
                  type="number"
                  placeholder="Max value"
                  value={fieldData.validation.max || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const updated = { ...fieldData };
                    if (!updated.validation) updated.validation = {};
                    updated.validation.max = val;
                    setFieldData(updated);
                  }}
                />
              </>
            )}
            {(fieldData.type === 'text' || fieldData.type === 'textarea') && (
              <>
                <input
                  type="number"
                  placeholder="Min length"
                  value={fieldData.validation.minLength || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const updated = { ...fieldData };
                    if (!updated.validation) updated.validation = {};
                    updated.validation.minLength = val;
                    setFieldData(updated);
                  }}
                />
                <input
                  type="number"
                  placeholder="Max length"
                  value={fieldData.validation.maxLength || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const updated = { ...fieldData };
                    if (!updated.validation) updated.validation = {};
                    updated.validation.maxLength = val;
                    setFieldData(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Pattern (regex)"
                  value={fieldData.validation.pattern || ''}
                  onChange={(e) => {
                    const val = e.target.value || undefined;
                    const updated = { ...fieldData };
                    if (!updated.validation) updated.validation = {};
                    updated.validation.pattern = val;
                    setFieldData(updated);
                  }}
                />
              </>
            )}
          </div>
        )}

        {fieldData.type === 'file' && (
          <div className="property-group">
            <label>Allowed File Types (comma separated)</label>
            <input
              type="text"
              placeholder="image/png,image/jpeg,application/pdf"
              value={fieldData.validation.allowedTypes ? fieldData.validation.allowedTypes.join(',') : ''}
              onChange={(e) => {
                const val = e.target.value ? e.target.value.split(',').map(t => t.trim()) : undefined;
                const updated = { ...fieldData };
                if (!updated.validation) updated.validation = {};
                updated.validation.allowedTypes = val;
                setFieldData(updated);
              }}
            />
            <label>Max Size (MB)</label>
            <input
              type="number"
              value={fieldData.validation.maxSize ? (fieldData.validation.maxSize / (1024 * 1024)).toFixed(0) : ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined;
                const updated = { ...fieldData };
                if (!updated.validation) updated.validation = {};
                updated.validation.maxSize = val;
                setFieldData(updated);
              }}
            />
          </div>
        )}

        <div className="property-actions">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default FieldPropertiesPanel;

