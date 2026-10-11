import React from 'react';
import { Link } from 'react-router-dom';

function Landing({ user }) {
  return (
    <div className="container">
      <div className="landing-hero">
        <h1 className="landing-title">Task Management System</h1>
        <p className="landing-desc">
          A simple and easy-to-use application to organize, assign, and track your daily tasks efficiently.
        </p>

        <div className="landing-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to My Tasks
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Landing;
