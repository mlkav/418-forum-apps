import React, { useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Navigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/common/Navbar';
import Loading from './components/common/Loading';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CreateThreadPage from './pages/CreateThreadPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { fetchOwnProfile, restoreAuthSession } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const {
    isAuthenticated, user, isRestoringSession, hasCheckedSession,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!hasCheckedSession && !isRestoringSession) {
      dispatch(restoreAuthSession());
    }
  }, [dispatch, hasCheckedSession, isRestoringSession]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchOwnProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  if (isRestoringSession) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
            />
            <Route path="/thread/:threadId" element={<ThreadDetailPage />} />
            <Route
              path="/create-thread"
              element={isAuthenticated ? <CreateThreadPage /> : <Navigate to="/login" replace />}
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
