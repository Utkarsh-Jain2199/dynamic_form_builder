import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import '../../styles/FormList.css';

function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const { data } = await publicAPI.getForms();
      setForms(data);
      setError(null);
    } catch (err) {
      setError('Failed to load forms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading forms...</div></div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="container">
      <h1>Available Forms</h1>
      {forms.length === 0 ? (
        <div className="no-forms">No forms available at the moment.</div>
      ) : (
        <div className="forms-grid">
          {forms.map(form => (
            <div key={form._id} className="form-card">
              <h2>{form.title}</h2>
              {form.description && <p>{form.description}</p>}
              <Link to={`/form/${form._id}`} className="button button-primary">
                Fill Form
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormList;

