import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import { renderField } from './FormView/FieldRenderer';
import '../../styles/FormView.css';

function FormView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchForm = async () => { // Moved fetchForm outside useEffect
    try {
      setLoading(true);
      const { data } = await publicAPI.getForm(id);
      setForm(data);
      setAnswers(
        Object.fromEntries(
          data.fields.filter((f) => f.type === 'checkbox').map((f) => [f.name, []])
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm(); // Call the function directly
  }, [id]);

  const handleCheckboxChange = (fieldName, value, checked) => {
    setAnswers((prev) => {
      const current = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: checked ? [...current, value] : current.filter((v) => v !== value)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await publicAPI.submitForm({
        formId: id,
        answers
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          submit: err.response?.data?.error || 'Failed to submit form'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading form...</div></div>;
  }

  if (!form) {
    return <div className="container"><div className="error">Form not found</div></div>;
  }

  if (!form.fields || form.fields.length === 0) {
    return (
      <div className="container">
        <div className="error">
          This form has no fields yet. Please contact the administrator.
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>Form submitted successfully!</h2>
          <p>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h1>{form.title}</h1>
        {form.description && <p className="form-description">{form.description}</p>}

        {errors.submit && <div className="error">{errors.submit}</div>}

        <form onSubmit={handleSubmit}>
          {form.fields.map((field) =>
            renderField(field, answers, errors, setAnswers, setErrors, handleCheckboxChange)
          )}
          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormView;
