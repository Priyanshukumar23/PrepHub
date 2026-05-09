import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Practice from './pages/Practice';
import Solve from './pages/Solve';
import Network from './pages/Network';
import AdminDashboard from './pages/AdminDashboard';

// A simple layout for pages that need navbar, or we can include it in the Dashboard
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/solve/:id" element={<Solve />} />
        <Route path="/network" element={<Network />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
