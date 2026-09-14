import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import Button from './Button';

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <h2>ForumApp</h2>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
          >
            Threads
          </Link>

          <Link
            to="/leaderboard"
            className={`nav-link ${isActiveLink('/leaderboard') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>

          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-greeting">
                Hello,
                {user?.name}
              </span>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
