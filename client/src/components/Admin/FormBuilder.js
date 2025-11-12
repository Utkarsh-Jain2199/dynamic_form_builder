import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import FieldPropertiesPanel from './FormBuilder/FieldPropertiesPanel';
import PreviewForm from './FormBuilder/PreviewForm';
import { FIELD_ELEMENTS } from './FormBuilder/constants';
import '../../styles/FormBuilder.css';
import '../../styles/FormBuilderHeader.css';
import '../../styles/FormBuilderSidebar.css';
import '../../styles/FormBuilderCanvas.css';
import '../../styles/FieldPropertiesPanel.css';
import '../../styles/FormBuilderPreview.css';

function FormBuilder({ form, token, onBack, onFormUpdate, onFormSaved }) {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedElement, setDraggedElement] = useState(null);
  const [isEditingFormInfo, setIsEditingFormInfo] = useState(false);
  const [formInfo, setFormInfo] = useState({ title: '', description: '' });
  const dropHandled = useRef(false);

  useEffect(() => {
    if (form) {
      const sortedFields = [...(form.fields || [])].sort((a, b) => a.order - b.order);
      setFields(sortedFields);
      setFormInfo({
        title: form.title || '',
        description: form.description || ''
      });
    }
  }, [form]);

  const filteredElements = FIELD_ELEMENTS.filter(el =>
    el.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (e, element) => {
    setDraggedElement(element);
    dropHandled.current = false; // allow next drop
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (!draggedElement) return;
    if (dropHandled.current) return;
    dropHandled.current = true;

    const newField = {
      label: draggedElement.label,
      type: draggedElement.type,
      name: draggedElement.type + '_' + Date.now(),
      required: false,
      options: ['radio', 'select', 'checkbox'].includes(draggedElement.type) ? [] : undefined,
      validation: {},
      order: dropIndex !== undefined ? dropIndex : fields.length
    };

    try {
      await adminAPI.addField(form._id, newField, token);
      await refreshForm();
    } catch (err) {
      alert('Failed to add field');
    }
    setDraggedElement(null);
  };

  const handleFieldDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleFieldDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newFields = [...fields];
    const [draggedItem] = newFields.splice(dragIndex, 1);
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
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this field?')) {
      return;
    }
    try {
      await adminAPI.deleteField(form._id, fieldId, token);
      await refreshForm();
      setSelectedField(null);
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  const handleFieldClick = (field) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = async (updatedField) => {
    try {
      await adminAPI.updateField(form._id, selectedField._id, updatedField, token);
      await refreshForm();
      setSelectedField(null);
    } catch (err) {
      alert('Failed to update field');
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

  const handleSaveFormInfo = async () => {
    try {
      await adminAPI.updateForm(form._id, formInfo, token);
      await refreshForm();
      setIsEditingFormInfo(false);
    } catch (err) {
      alert('Failed to update form information');
    }
  };

  const handleSaveForm = async () => {
    if (!fields || fields.length === 0) {
      alert('Please add at least one field to the form before saving.');
      return;
    }

    if (!formInfo.title || !formInfo.title.trim()) {
      alert('Please set a form title before saving.');
      setIsEditingFormInfo(true);
      return;
    }

    try {
      if (isEditingFormInfo) {
        await handleSaveFormInfo();
      }
      
      await adminAPI.updateForm(form._id, {
        title: formInfo.title,
        description: formInfo.description,
        requireFields: true
      }, token);
      
      await refreshForm();
      if (onFormSaved) {
        onFormSaved();
      }
      alert('Form saved successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save form';
      alert(errorMessage);
    }
  };

  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return <input type={field.type} className="preview-input" placeholder={field.label} disabled />;
      case 'textarea':
        return <textarea className="preview-textarea" placeholder={field.label} disabled></textarea>;
      case 'number':
        return <input type="number" className="preview-input" placeholder={field.label} disabled />;
      case 'date':
        return <input type="date" className="preview-input" disabled />;
      case 'checkbox':
        return (
          <div className="preview-checkbox-group">
            {field.options?.map((opt, idx) => (
              <label key={idx} className="preview-checkbox">
                <input type="checkbox" disabled />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="preview-radio-group">
            {field.options?.map((opt, idx) => (
              <label key={idx} className="preview-radio">
                <input type="radio" name={`preview_${field._id}`} disabled />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select className="preview-select" disabled>
            <option>Select an option</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'file':
        return <input type="file" className="preview-input" disabled />;
      default:
        return null;
    }
  };

  if (!form) {
    return <div>Loading form...</div>;
  }

  return (
    <div className="form-builder-container">
      <div className="builder-header">
        <button onClick={onBack} className="back-button">← Back to Forms</button>
        <h2>{form.title || 'Untitled Form'}</h2>
        <div className="header-actions">
          <div className="mode-toggle">
            <button
              className={!previewMode ? 'toggle-active' : ''}
              onClick={() => setPreviewMode(false)}
            >
              Builder
            </button>
            <button
              className={previewMode ? 'toggle-active' : ''}
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </button>
          </div>
          <button
            onClick={handleSaveForm}
            className="save-form-button"
            disabled={!fields || fields.length === 0}
            title={fields && fields.length === 0 ? 'Add at least one field to create' : 'Save form'}
          >
            Create Form
          </button>
        </div>
      </div>

      <div className="builder-content">
        {!previewMode ? (
          <>
            <div className="elements-sidebar">
              <h3>Form Elements</h3>
              <p className="sidebar-hint">Drag elements to the form</p>
              
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search elements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="elements-list">
                {filteredElements.map((element, index) => (
                  <div
                    key={index}
                    className="element-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, element)}
                  >
                    <span className="element-icon">{element.icon}</span>
                    <span className="element-label">{element.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="builder-canvas"
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(e, fields.length);
              }}
            >
              <div className="canvas-header">
                {isEditingFormInfo ? (
                  <div className="form-info-editor">
                    <input
                      type="text"
                      className="form-title-input-edit"
                      value={formInfo.title}
                      onChange={(e) => setFormInfo({ ...formInfo, title: e.target.value })}
                      placeholder="Form Title"
                    />
                    <textarea
                      className="form-description-input-edit"
                      value={formInfo.description}
                      onChange={(e) => setFormInfo({ ...formInfo, description: e.target.value })}
                      placeholder="Form Description (optional)"
                    />
                    <div className="form-info-actions">
                      <button
                        onClick={handleSaveFormInfo}
                        className="save-form-info-btn"
                        disabled={!formInfo.title.trim()}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingFormInfo(false);
                          setFormInfo({
                            title: form.title || '',
                            description: form.description || ''
                          });
                        }}
                        className="cancel-form-info-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="form-info-display">
                    <div className="form-title-display">
                      {form.title || 'Untitled Form'}
                      <button
                        onClick={() => setIsEditingFormInfo(true)}
                        className="edit-form-info-btn"
                        title="Edit form title and description"
                      >
                        ✏️
                      </button>
                    </div>
                    {form.description && (
                      <p className="form-description">{form.description}</p>
                    )}
                    {!form.description && (
                      <p className="form-description-placeholder" onClick={() => setIsEditingFormInfo(true)}>
                        Click to add description
                      </p>
                    )}
                  </div>
                )}
              </div>

              {fields.length === 0 ? (
                <div 
                  className="empty-canvas"
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(e, 0);
                  }}
                >
                  <p>Drag form elements here to start building</p>
                </div>
              ) : (
                <>
                  {fields.map((field, index) => (
                    <React.Fragment key={field._id}>
                      <div
                        className="drop-zone"
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          if (!isNaN(dragIndex) && dragIndex !== index) {
                            handleFieldDrop(e, index);
                          }
                        }}
                      />
                      <div
                        className={`field-box ${selectedField?._id === field._id ? 'selected' : ''}`}
                        draggable
                        onDragStart={(e) => handleFieldDragStart(e, index)}
                        onClick={() => handleFieldClick(field)}
                      >
                        <div className="field-handle">☰</div>
                        <div className="field-content">
                          <div className="field-label">
                            {field.label}
                            {field.required && <span className="required-star">*</span>}
                          </div>
                          <div className="field-type-badge">{field.type}</div>
                          {renderFieldPreview(field)}
                        </div>
                        <button
                          className="field-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field._id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                  <div
                    key="drop-end"
                    className="drop-zone"
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      if (!isNaN(dragIndex)) {
                        handleFieldDrop(e, fields.length);
                      }
                    }}
                  />
                </>
              )}
            </div>

            {selectedField && (
              <div className="field-properties-panel">
                <FieldPropertiesPanel
                  field={selectedField}
                  onUpdate={handleFieldUpdate}
                  onClose={() => setSelectedField(null)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="preview-mode">
            <div className="preview-form">
              <h1>{form.title}</h1>
              {form.description && <p className="preview-description">{form.description}</p>}
              <PreviewForm fields={fields} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default FormBuilder;
