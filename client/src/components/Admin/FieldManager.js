import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/FieldManager.css';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'select', label: 'Select' },
  { value: 'file', label: 'File Upload' }
];

function FieldManager({ form, token, onBack, onFormUpdate }) {
  const [fields, setFields] = useState([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldData, setFieldData] = useState({
    label: '',
    type: 'text',
    name: '',
    required: false,
    options: [],
    validation: {},
    order: 0
  });
  const [draggedField, setDraggedField] = useState(null);

  useEffect(() => {
    if (form) {
      const sortedFields = [...(form.fields || [])].sort((a, b) => a.order - b.order);
      setFields(sortedFields);
    }
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await adminAPI.updateField(form._id, editingField._id, fieldData, token);
      } else {
        await adminAPI.addField(form._id, fieldData, token);
      }
      await refreshForm();
      setShowFieldForm(false);
      setEditingField(null);
      resetFieldData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save field');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    const optionsWithNested = (field.options || []).map(opt => ({
      label: opt.label || '',
      value: opt.value || '',
      nestedFields: opt.nestedFields || []
    }));
    setFieldData({
      label: field.label,
      type: field.type,
      name: field.name,
      required: field.required,
      options: optionsWithNested,
      validation: field.validation || {},
      order: field.order
    });
    setShowFieldForm(true);
  };

  const handleDelete = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this field?')) {
      return;
    }
    try {
      await adminAPI.deleteField(form._id, fieldId, token);
      await refreshForm();
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  const refreshForm = async () => {
    try {
      const response = await adminAPI.getForm(form._id, token);
      onFormUpdate(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetFieldData = () => {
    setFieldData({
      label: '',
      type: 'text',
      name: '',
      required: false,
      options: [],
      validation: {},
      order: fields.length
    });
  };

  const addOption = () => {
    setFieldData({
      ...fieldData,
      options: [...fieldData.options, { label: '', value: '', nestedFields: [] }]
    });
  };

  const updateOption = (index, key, value) => {
    const newOptions = [...fieldData.options];
    if (!newOptions[index]) {
      newOptions[index] = { label: '', value: '', nestedFields: [] };
    }
    newOptions[index][key] = value;
    setFieldData({ ...fieldData, options: newOptions });
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
    setFieldData({ ...fieldData, options: newOptions });
  };

  const updateNestedField = (optionIndex, nestedIndex, key, value) => {
    const newOptions = [...fieldData.options];
    if (!newOptions[optionIndex].nestedFields) {
      newOptions[optionIndex].nestedFields = [];
    }
    newOptions[optionIndex].nestedFields[nestedIndex][key] = value;
    setFieldData({ ...fieldData, options: newOptions });
  };

  const removeNestedField = (optionIndex, nestedIndex) => {
    const newOptions = [...fieldData.options];
    newOptions[optionIndex].nestedFields = newOptions[optionIndex].nestedFields.filter((_, i) => i !== nestedIndex);
    setFieldData({ ...fieldData, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = fieldData.options.filter((_, i) => i !== index);
    setFieldData({ ...fieldData, options: newOptions });
  };

  const handleDragStart = (index) => {
    setDraggedField(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedField === null) return;

    const newFields = [...fields];
    const draggedItem = newFields[draggedField];
    newFields.splice(draggedField, 1);
    newFields.splice(dropIndex, 0, draggedItem);

    const fieldOrders = newFields.map((field, index) => ({
      fieldId: field._id,
      order: index
    }));

    try {
      await adminAPI.reorderFields(form._id, fieldOrders, token);
      await refreshForm();
    } catch (err) {
      alert('Failed to reorder fields');
    }

    setDraggedField(null);
  };

  const needsOptions = ['radio', 'select', 'checkbox'].includes(fieldData.type);
  const supportsNestedFields = ['radio', 'select'].includes(fieldData.type);

  return (
    <div className="field-manager">
      <div className="field-manager-header">
        <button onClick={onBack} className="button button-secondary">
          ← Back to Forms
        </button>
        <h2>{form.title} - Fields</h2>
      </div>

      <div className="card-header">
        <h3 className="card-title">Fields</h3>
        <button
          onClick={() => {
            setShowFieldForm(true);
            setEditingField(null);
            resetFieldData();
          }}
          className="button button-primary"
        >
          Add Field
        </button>
      </div>

      {showFieldForm && (
        <div className="card">
          <h3>{editingField ? 'Edit Field' : 'Add Field'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Label</label>
              <input
                type="text"
                className="input"
                value={fieldData.label}
                onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Type</label>
              <select
                className="select"
                value={fieldData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFieldData({
                    ...fieldData,
                    type: newType,
                    options: ['radio', 'select', 'checkbox'].includes(newType) 
                      ? fieldData.options.map(opt => ({
                          ...opt,
                          nestedFields: ['radio', 'select'].includes(newType) ? (opt.nestedFields || []) : []
                        }))
                      : []
                  });
                }}
                required
              >
                {FIELD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Name (unique identifier)</label>
              <input
                type="text"
                className="input"
                value={fieldData.name}
                onChange={(e) => setFieldData({ ...fieldData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                required
                pattern="[a-z0-9_]+"
                title="Lowercase letters, numbers, and underscores only"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                />
                Required
              </label>
            </div>

            {needsOptions && (
              <div className="form-group">
                <label className="label">Options</label>
                {fieldData.options.map((option, index) => (
                  <div key={index} className="option-container">
                    <div className="option-row">
                      <input
                        type="text"
                        className="input"
                        placeholder="Label"
                        value={option.label || ''}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="Value"
                        value={option.value || ''}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="button button-danger"
                      >
                        Remove
                      </button>
                    </div>
                    {supportsNestedFields && (
                      <div className="nested-fields-section">
                        <div className="nested-fields-header">
                          <strong>Nested Fields (shown when this option is selected)</strong>
                          <button
                            type="button"
                            onClick={() => addNestedField(index)}
                            className="button button-secondary"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Add Nested Field
                          </button>
                        </div>
                        {(option.nestedFields || []).map((nestedField, nestedIndex) => (
                          <div key={nestedIndex} className="nested-field-row">
                            <input
                              type="text"
                              className="input"
                              placeholder="Field Label"
                              value={nestedField.label || ''}
                              onChange={(e) => updateNestedField(index, nestedIndex, 'label', e.target.value)}
                            />
                            <select
                              className="select"
                              value={nestedField.type || 'text'}
                              onChange={(e) => updateNestedField(index, nestedIndex, 'type', e.target.value)}
                              style={{ width: '120px' }}
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="date">Date</option>
                            </select>
                            <input
                              type="text"
                              className="input"
                              placeholder="Field Name"
                              value={nestedField.name || ''}
                              onChange={(e) => updateNestedField(index, nestedIndex, 'name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            />
                            <label className="checkbox-label" style={{ margin: '0 10px' }}>
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
                              className="button button-danger"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="button button-secondary"
                >
                  Add Option
                </button>
              </div>
            )}

            {(fieldData.type === 'number' || fieldData.type === 'text' || fieldData.type === 'textarea') && (
              <div className="form-group">
                <label className="label">Validation</label>
                {fieldData.type === 'number' && (
                  <>
                    <input
                      type="number"
                      className="input"
                      placeholder="Min value"
                      value={fieldData.validation.min || ''}
                      onChange={(e) => setFieldData({
                        ...fieldData,
                        validation: { ...fieldData.validation, min: e.target.value ? Number(e.target.value) : undefined }
                      })}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Max value"
                      value={fieldData.validation.max || ''}
                      onChange={(e) => setFieldData({
                        ...fieldData,
                        validation: { ...fieldData.validation, max: e.target.value ? Number(e.target.value) : undefined }
                      })}
                    />
                  </>
                )}
                {(fieldData.type === 'text' || fieldData.type === 'textarea') && (
                  <>
                    <input
                      type="number"
                      className="input"
                      placeholder="Min length"
                      value={fieldData.validation.minLength || ''}
                      onChange={(e) => setFieldData({
                        ...fieldData,
                        validation: { ...fieldData.validation, minLength: e.target.value ? Number(e.target.value) : undefined }
                      })}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Max length"
                      value={fieldData.validation.maxLength || ''}
                      onChange={(e) => setFieldData({
                        ...fieldData,
                        validation: { ...fieldData.validation, maxLength: e.target.value ? Number(e.target.value) : undefined }
                      })}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Pattern (regex)"
                      value={fieldData.validation.pattern || ''}
                      onChange={(e) => setFieldData({
                        ...fieldData,
                        validation: { ...fieldData.validation, pattern: e.target.value || undefined }
                      })}
                    />
                  </>
                )}
              </div>
            )}

            {fieldData.type === 'file' && (
              <div className="form-group">
                <label className="label">File Validation</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Allowed types (comma separated, e.g., image/png,image/jpeg,application/pdf)"
                  value={fieldData.validation.allowedTypes ? fieldData.validation.allowedTypes.join(',') : ''}
                  onChange={(e) => setFieldData({
                    ...fieldData,
                    validation: {
                      ...fieldData.validation,
                      allowedTypes: e.target.value ? e.target.value.split(',').map(t => t.trim()) : undefined
                    }
                  })}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="Max size in MB"
                  value={fieldData.validation.maxSize ? (fieldData.validation.maxSize / (1024 * 1024)).toFixed(0) : ''}
                  onChange={(e) => setFieldData({
                    ...fieldData,
                    validation: {
                      ...fieldData.validation,
                      maxSize: e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined
                    }
                  })}
                />
                <small className="help-text">File will be stored as base64 in the database</small>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="button button-primary">
                {editingField ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFieldForm(false);
                  setEditingField(null);
                }}
                className="button button-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="fields-list">
        {fields.length === 0 ? (
          <div className="no-items">No fields added yet.</div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field._id}
              className="field-item"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="field-content">
                <div className="drag-handle">☰</div>
                <div className="field-info">
                  <strong>{field.label}</strong>
                  <span className="field-type">{field.type}</span>
                  {field.required && <span className="required-badge">Required</span>}
                  {field.options && field.options.length > 0 && (
                    <span className="options-count">{field.options.length} options</span>
                  )}
                  {field.options && field.options.some(opt => opt.nestedFields && opt.nestedFields.length > 0) && (
                    <span className="nested-fields-badge" style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      Has Nested Fields
                    </span>
                  )}
                </div>
                <div className="field-actions">
                  <button
                    onClick={() => handleEdit(field)}
                    className="button button-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(field._id)}
                    className="button button-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FieldManager;

