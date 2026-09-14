import { configureStore } from '@reduxjs/toolkit';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter, Routes, Route,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import {
  describe, expect, it, vi,
} from 'vitest';
import authReducer from '../../src/store/slices/authSlice';
import LoginForm from '../../src/components/auth/LoginForm';
import { login } from '../../src/utils/api';

vi.mock('../../src/utils/api', () => ({
  login: vi.fn(),
}));

const renderLoginForm = (preloadedAuth = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...preloadedAuth,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<div>Discussion Forum</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe('LoginForm', () => {
  it('renders email and password fields with a submit button', () => {
    renderLoginForm();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates field values while the user types', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'person@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');

    expect(screen.getByLabelText('Email')).toHaveValue('person@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('secret123');
  });

  it('shows an API error for invalid credentials', async () => {
    login.mockRejectedValueOnce(new Error('Invalid credentials'));
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('stores the token and navigates home after a valid login', async () => {
    login.mockResolvedValueOnce({
      data: { token: 'test-token', user: { id: 'user-1', name: 'Test User' } },
    });
    const user = userEvent.setup();
    const { store } = renderLoginForm();

    await user.type(screen.getByLabelText('Email'), 'person@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(screen.getByText('Discussion Forum')).toBeInTheDocument();
  });
});
