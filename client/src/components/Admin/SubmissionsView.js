import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/SubmissionsView.css';

function SubmissionsView({ token, selectedForm }) {
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(selectedForm?._id || 'all');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await adminAPI.getForms(token);
        setForms(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchForms();
  }, [token]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        let response;
        const params = {
          page,
          limit,
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate })
        };
        if (selectedFormId === 'all') {
          response = await adminAPI.getSubmissions(token, params);
        } else {
          response = await adminAPI.getFormSubmissions(selectedFormId, token, params);
        }
        if (response.data.submissions) {
          setSubmissions(response.data.submissions);
          setPagination(response.data.pagination);
        } else {
          setSubmissions(response.data);
          setPagination({ page: 1, limit: 10, total: response.data.length, pages: 1 });
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedFormId, page, filters, token]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="submissions-view">
      <div className="card-header">
        <h2 className="card-title">Submissions</h2>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label className="label">Filter by Form:</label>
          <select
            className="select"
            value={selectedFormId}
            onChange={(e) => {
              setSelectedFormId(e.target.value);
              setPage(1);
            }}
            style={{ width: '200px' }}
          >
            <option value="all">All Forms</option>
            {forms.map(form => (
              <option key={form._id} value={form._id}>
                {form.title}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="label">Start Date:</label>
          <input
            type="date"
            className="input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ width: '150px' }}
          />
        </div>
        <div className="filter-group">
          <label className="label">End Date:</label>
          <input
            type="date"
            className="input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ width: '150px' }}
          />
        </div>
        <button
          onClick={() => {
            setFilters({ startDate: '', endDate: '' });
            setPage(1);
          }}
          className="button button-secondary"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="no-items">No submissions found.</div>
      ) : (
        <>
          <div className="submissions-list">
            {submissions.map(submission => {
              const formData = submission.formSnapshot || submission.formId;
              const formTitle = formData?.title || 'Unknown Form';
              
              return (
                <div key={submission._id} className="card submission-card">
                  <div className="submission-header">
                    <div>
                      <h3>{formTitle}</h3>
                      {submission.formVersion && <small>Form Version: {submission.formVersion}</small>}
                      <small>Submitted: {formatDate(submission.submittedAt)}</small>
                      {submission.ip && <small>IP: {submission.ip}</small>}
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(selectedSubmission?._id === submission._id ? null : submission)}
                      className="button button-secondary"
                    >
                      {selectedSubmission?._id === submission._id ? 'Hide' : 'View'}
                    </button>
                  </div>
                  {selectedSubmission?._id === submission._id && (
                    <div className="submission-details">
                      <h4>Answers:</h4>
                      <div className="answers-list">
                        {submission.answers && Object.entries(submission.answers instanceof Map ? Object.fromEntries(submission.answers) : submission.answers).map(([key, value]) => {
                          const isFile = typeof value === 'string' && value.startsWith('data:');
                          let displayValue = value;
                          
                          if (isFile) {
                            const fileType = value.split(';')[0].split(':')[1] || 'unknown';
                            const fileName = `${key}.${fileType.split('/')[1] || 'file'}`;
                            displayValue = `[File: ${fileType}]`;
                            return (
                              <div key={key} className="answer-item">
                                <strong>{key}:</strong>{' '}
                                <span>{displayValue}</span>
                                <a
                                  href={value}
                                  download={fileName}
                                  className="button button-secondary"
                                  style={{ marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
                                >
                                  Download
                                </a>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={key} className="answer-item">
                              <strong>{key}:</strong>{' '}
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="button button-secondary"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="button button-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SubmissionsView;

