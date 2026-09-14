import { configureStore } from '@reduxjs/toolkit';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import {
  describe, expect, it, vi, beforeEach,
} from 'vitest';
import { Provider } from 'react-redux';
import App from '../../src/App';
import authReducer from '../../src/store/slices/authSlice';
import threadReducer from '../../src/store/slices/threadSlice';
import {
  getOwnProfile, getThreads, getUsers,
} from '../../src/utils/api';

vi.mock('../../src/utils/api', () => ({
  getOwnProfile: vi.fn(),
  getThreads: vi.fn(),
  getUsers: vi.fn(),
}));

const user = {
  id: 'user-1',
  name: 'Persisted User',
  avatar: '',
};

const createPreloadedState = () => ({
  auth: {
    user: null,
    isAuthenticated: false,
    isRestoringSession: false,
    hasCheckedSession: false,
    loading: false,
    error: null,
  },
  threads: {
    threads: [],
    currentThread: null,
    users: [],
    loading: false,
    error: null,
    filterCategory: '',
  },
});

const renderApp = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      threads: threadReducer,
    },
    preloadedState: createPreloadedState(),
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <App />
      </Provider>,
    ),
  };
};

describe('App session restoration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getThreads.mockResolvedValue({ data: { threads: [] } });
    getUsers.mockResolvedValue({ data: { users: [] } });
  });

  it('restores authentication from a persisted token after refresh', async () => {
    localStorage.setItem('token', 'persisted-token');
    getOwnProfile.mockResolvedValue({ data: { user } });

    const { store } = renderApp();

    expect(await screen.findByText(/Persisted User/)).toBeInTheDocument();
    expect(screen.getByText(/Hello,/)).toBeInTheDocument();
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(getOwnProfile).toHaveBeenCalledOnce();
    expect(localStorage.getItem('token')).toBe('persisted-token');
  });

  it('clears an invalid persisted token and shows the signed-out navigation', async () => {
    localStorage.setItem('token', 'expired-token');
    getOwnProfile.mockRejectedValue(new Error('Unauthorized'));

    renderApp();

    expect(await screen.findByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
