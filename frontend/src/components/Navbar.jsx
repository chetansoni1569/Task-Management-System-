import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Task Manager
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <span className="user-badge">
              {user.name || user.email} ({user.role || 'User'})
            </span>

            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            {user && (user.role === 'Admin' || user.role === 'admin') && (
              <Link to="/manage" className="nav-link">
                Manage Tasks
              </Link>
            )}

            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
