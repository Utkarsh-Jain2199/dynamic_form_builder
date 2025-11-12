import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/Admin/AdminDashboard';
import FormList from './components/Public/FormList';
import FormView from './components/Public/FormView';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="navbar-brand">Dynamic Form Builder</Link>
            <div className="navbar-links">
              <Link to="/">Home</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<FormList />} />
          <Route path="/form/:id" element={<FormView />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

