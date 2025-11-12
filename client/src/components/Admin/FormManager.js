import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import FormBuilder from './FormBuilder';
import '../../styles/FormManager.css';

function FormManager({ token, onSelectForm, selectedForm }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getForms(token);
      setForms(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }
    try {
      await adminAPI.deleteForm(id, token);
      fetchForms();
    } catch (err) {
      alert('Failed to delete form');
    }
  };

  const handleCreateForm = async () => {
    try {
      const { data } = await adminAPI.createForm({ 
        title: `New Form ${new Date().toLocaleDateString()}`, 
        description: '' 
      }, token);
      const { data: form } = await adminAPI.getForm(data._id, token);
      onSelectForm(form);
      fetchForms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create form');
    }
  };

  const handleManageFields = async (form) => {
    try {
      const { data } = await adminAPI.getForm(form._id, token);
      onSelectForm(data);
    } catch (err) {
      alert('Failed to load form');
    }
  };

  if (selectedForm) {
    return (
      <FormBuilder
        form={selectedForm}
        token={token}
        onBack={() => onSelectForm(null)}
        onFormUpdate={(updatedForm) => {
          onSelectForm(updatedForm);
          fetchForms();
        }}
        onFormSaved={fetchForms}
      />
    );
  }

  if (loading) {
    return <div className="loading">Loading forms...</div>;
  }

  return (
    <div className="form-manager">
      <div className="card-header">
        <h2 className="card-title">Forms</h2>
        <button
          onClick={handleCreateForm}
          className="button button-primary"
        >
          New Form
        </button>
      </div>

      <div className="forms-list">
        {forms.length === 0 ? (
          <div className="no-items">No forms created yet.</div>
        ) : (
          forms.map(form => (
            <div key={form._id} className="card">
              <div className="card-header">
                <div>
                  <h3>{form.title}</h3>
                  {form.description && <p>{form.description}</p>}
                  <small>{form.fields?.length || 0} fields</small>
                  {form.version && <small style={{ display: 'block', color: '#666' }}>Version: {form.version}</small>}
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleManageFields(form)}
                    className="button button-primary"
                  >
                    Manage Fields
                  </button>
                  <button
                    onClick={() => handleDelete(form._id)}
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

export default FormManager;

