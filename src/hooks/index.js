import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

// Custom hook for authentication
export const useAuth = () => useSelector((state) => state.auth);

// Custom hook for threads
export const useThreads = () => useSelector((state) => state.threads);

// Custom hook for comments
export const useComments = () => useSelector((state) => state.comments);

// Custom hook for leaderboards
export const useLeaderboards = () => useSelector((state) => state.leaderboards);

// Custom hook for combined dispatch and selector
export const useAppDispatch = () => useDispatch();

// Custom hook for debouncing
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for authentication check
export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      // console.log('Token found, user might be authenticated');
    }
  }, [dispatch, isAuthenticated]);

  return isAuthenticated;
};
