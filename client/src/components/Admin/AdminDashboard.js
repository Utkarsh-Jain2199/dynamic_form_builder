import React, { useState, useEffect } from 'react';
import FormManager from './FormManager';
import FieldManager from './FieldManager';
import SubmissionsView from './SubmissionsView';
import '../../styles/AdminDashboard.css';
import { adminAPI } from '../../services/api';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [authenticated, setAuthenticated] = useState(!!token);
  const [activeTab, setActiveTab] = useState('forms');
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token);
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminAPI.login(e.target.username.value, e.target.password.value);
      if (data?.token) {
        setToken(data.token);
        setAuthenticated(true);
        localStorage.setItem('adminToken', data.token);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setAuthenticated(false);
    localStorage.removeItem('adminToken');
    setSelectedForm(null);
    setActiveTab('forms');
  };

  if (!authenticated) {
    return (
      <div className="container">
        <div className="login-container">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label">Username</label>
              <input
                type="text"
                name="username"
                className="input"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input"
                placeholder="Enter password"
                required
              />
              <small className="help-text">
                Default credentials — Username: <strong>admin</strong>, Password: <strong>admin123</strong>
              </small>
            </div>
            <button type="submit" className="button button-primary">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isBuilderMode = activeTab === 'forms' && selectedForm;

  return (
    <div className={isBuilderMode ? '' : 'container'}>
      {!isBuilderMode && (
        <>
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <button onClick={handleLogout} className="button button-secondary">
              Logout
            </button>
          </div>

          <div className="admin-tabs">
            <button
              className={activeTab === 'forms' ? 'tab active' : 'tab'}
              onClick={() => {
                setActiveTab('forms');
                setSelectedForm(null);
              }}
            >
              Forms
            </button>
            <button
              className={activeTab === 'submissions' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
          </div>
        </>
      )}

      {activeTab === 'forms' && (
        <FormManager 
          token={token} 
          onSelectForm={setSelectedForm}
          selectedForm={selectedForm}
        />
      )}

      {activeTab === 'submissions' && !isBuilderMode && (
        <SubmissionsView token={token} selectedForm={selectedForm} />
      )}
    </div>
  );
}

export default AdminDashboard;

