/**
 * @fileoverview Berkas Pengujian Reducer Redux (Redux Slice Reducers Unit Tests)
 *
 * Skenario Pengujian Utama:
 * 1. Auth Reducer:
 *    - Memastikan pembersihan pesan kesalahan autentikasi (`clearError`).
 *    - Memastikan proses logout menghapus token dari `localStorage` serta mengosongkan status pengguna terautentikasi.
 *    - Memastikan penyimpan data pengguna setelah aksi login berhasil (`auth/login/fulfilled`).
 *    - Memastikan pemantauan alur pemulihan sesi (`restoreAuthSession` pending -> fulfilled) berjalan sesuai ekspektasi.
 *    - Memastikan pembersihan status pengguna jika pemulihan sesi gagal (`restoreAuthSession` rejected).
 * 2. Comment Reducer:
 *    - Memastikan pembersihan pesan kesalahan komentar (`clearCommentError`).
 *    - Memastikan pelacakan status loading dan penanganan kegagalan pembuatan komentar (`addComment` pending -> rejected).
 * 3. Leaderboard Reducer:
 *    - Memastikan pemrosesan alur pengambilan leaderboard (`fetchLeaderboards` pending -> fulfilled -> rejected) memperbarui state loading, data leaderboard, dan error.
 */

import { describe, expect, it } from 'vitest';
import authReducer, {
  clearError, logout, restoreAuthSession,
} from '../../src/store/slices/authSlice';
import commentReducer, {
  clearError as clearCommentError,
} from '../../src/store/slices/commentSlice';
import leaderboardReducer, {
  fetchLeaderboards,
} from '../../src/store/slices/leaderboardSlice';

const authState = {
  user: null,
  isAuthenticated: false,
  isRestoringSession: false,
  hasCheckedSession: false,
  loading: false,
  error: null,
};

const commentState = {
  loading: false,
  error: null,
};

const leaderboardState = {
  leaderboards: [],
  loading: false,
  error: null,
};

describe('auth reducer', () => {
  it('clears authentication errors', () => {
    const state = {
      ...authState,
      error: 'Login failed',
    };

    const result = authReducer(state, clearError());

    expect(result.error).toBeNull();
  });

  it('clears the token and signed-in user on logout', () => {
    localStorage.setItem('token', 'signed-in-token');
    const state = {
      ...authState,
      user: { id: 'user-1', name: 'User One' },
      isAuthenticated: true,
    };

    const result = authReducer(state, logout());

    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('stores the authenticated user after login fulfills', () => {
    const user = { id: 'user-1', name: 'User One' };
    const result = authReducer(authState, { type: '@@init' });
    const loggedIn = authReducer(result, {
      type: 'auth/login/fulfilled',
      payload: { user },
    });

    expect(loggedIn.user).toEqual(user);
    expect(loggedIn.isAuthenticated).toBe(true);
  });

  it('tracks session restoration and accepts a restored user', () => {
    const user = { id: 'user-1', name: 'User One' };
    const restoring = authReducer(authState, restoreAuthSession.pending('request-id'));
    expect(restoring.isRestoringSession).toBe(true);
    expect(restoring.hasCheckedSession).toBe(false);

    const restored = authReducer(restoring, restoreAuthSession.fulfilled(user, 'request-id'));
    expect(restored.user).toEqual(user);
    expect(restored.isAuthenticated).toBe(true);
    expect(restored.isRestoringSession).toBe(false);
    expect(restored.hasCheckedSession).toBe(true);
  });

  it('clears unauthenticated state when session restoration fails', () => {
    const state = {
      ...authState,
      user: { id: 'user-1', name: 'User One' },
      isAuthenticated: false,
    };
    const result = authReducer(state, {
      type: 'auth/restoreAuthSession/rejected',
      payload: 'Unauthorized',
    });

    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});

describe('comment reducer', () => {
  it('clears comment errors', () => {
    const result = commentReducer(
      { ...commentState, error: 'Post failed' },
      clearCommentError(),
    );

    expect(result.error).toBeNull();
  });

  it('tracks comment submission loading and failure', () => {
    const pending = commentReducer(commentState, {
      type: 'comments/addComment/pending',
    });
    expect(pending.loading).toBe(true);
    expect(pending.error).toBeNull();

    const rejected = commentReducer(pending, {
      type: 'comments/addComment/rejected',
      payload: 'Network error',
    });
    expect(rejected.loading).toBe(false);
    expect(rejected.error).toBe('Network error');
  });
});

describe('leaderboard reducer', () => {
  it('loads, replaces, and reports leaderboard requests', () => {
    const leaderboards = [
      { user: { id: 'user-1', name: 'User One' }, score: 10 },
    ];
    const pending = leaderboardReducer(
      leaderboardState,
      fetchLeaderboards.pending('id'),
    );
    expect(pending.loading).toBe(true);

    const fulfilled = leaderboardReducer(
      pending,
      fetchLeaderboards.fulfilled(leaderboards, 'id'),
    );
    expect(fulfilled.loading).toBe(false);
    expect(fulfilled.leaderboards).toEqual(leaderboards);

    const rejected = leaderboardReducer(fulfilled, {
      type: 'leaderboards/fetchLeaderboards/rejected',
      payload: 'Network error',
    });
    expect(rejected.loading).toBe(false);
    expect(rejected.error).toBe('Network error');
  });
});
