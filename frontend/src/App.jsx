import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskDashboard from './pages/TaskDashboard';
import TaskManagement from './pages/TaskManagement';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const activeUser = user || (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  return (
    <BrowserRouter>
      <div>
        <Navbar user={activeUser} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Landing user={activeUser} />} />

          <Route
            path="/login"
            element={activeUser ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={activeUser ? <Navigate to="/dashboard" /> : <Register onRegister={handleLogin} />}
          />

          <Route
            path="/dashboard"
            element={activeUser ? <TaskDashboard user={activeUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/manage"
            element={activeUser ? <TaskManagement user={activeUser} /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
