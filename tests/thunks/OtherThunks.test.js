import {
  describe, expect, it, vi, beforeEach,
} from 'vitest';
import {
  addComment as addCommentThunk,
} from '../../src/store/slices/commentSlice';
import {
  fetchLeaderboards,
} from '../../src/store/slices/leaderboardSlice';
import {
  fetchOwnProfile,
  loginUser,
  registerUser,
  restoreAuthSession,
} from '../../src/store/slices/authSlice';
import {
  createComment,
  getLeaderboards,
  getOwnProfile,
  login,
  register,
} from '../../src/utils/api';

vi.mock('../../src/utils/api', () => ({
  createComment: vi.fn(),
  getLeaderboards: vi.fn(),
  getOwnProfile: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const dispatch = (action) => action;

describe('auth, comment, and leaderboard thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('stores the token and returns login data', async () => {
    const response = { data: { token: 'access-token', user: { id: 'user-1' } } };
    login.mockResolvedValue(response);
    const calls = [];

    await loginUser({ email: 'person@example.com', password: 'secret' })(
      (action) => {
        calls.push(action);
        return action;
      },
      () => ({}),
      {},
    );

    expect(login).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secret',
    });
    expect(calls[1].payload).toEqual(response.data);
    expect(localStorage.getItem('token')).toBe('access-token');
  });

  it('registers a user and returns the server payload', async () => {
    const response = { data: { user: { id: 'user-2', name: 'User Two' } } };
    register.mockResolvedValue(response);

    const result = await registerUser({
      name: 'User Two',
      email: 'two@example.com',
      password: 'secret',
    })(dispatch, () => ({}), {});

    expect(register).toHaveBeenCalledWith({
      name: 'User Two',
      email: 'two@example.com',
      password: 'secret',
    });
    expect(result.payload).toEqual(response.data);
  });

  it('loads the current user profile', async () => {
    const user = { id: 'user-1', name: 'User One' };
    getOwnProfile.mockResolvedValue({ data: { user } });

    const result = await fetchOwnProfile()(dispatch, () => ({}), {});

    expect(getOwnProfile).toHaveBeenCalledOnce();
    expect(result.payload).toEqual(user);
  });

  it('does not request a profile when no token is persisted', async () => {
    const result = await restoreAuthSession()(dispatch, () => ({}), {});

    expect(result.payload).toBeNull();
    expect(getOwnProfile).not.toHaveBeenCalled();
  });

  it('restores a valid persisted session', async () => {
    const user = { id: 'user-1', name: 'User One' };
    localStorage.setItem('token', 'persisted-token');
    getOwnProfile.mockResolvedValue({ data: { user } });

    const result = await restoreAuthSession()(dispatch, () => ({}), {});

    expect(getOwnProfile).toHaveBeenCalledOnce();
    expect(result.payload).toEqual(user);
    expect(localStorage.getItem('token')).toBe('persisted-token');
  });

  it('removes an invalid persisted token', async () => {
    localStorage.setItem('token', 'expired-token');
    getOwnProfile.mockRejectedValue(new Error('Unauthorized'));
    const calls = [];

    await restoreAuthSession()(
      (action) => {
        calls.push(action);
        return action;
      },
      () => ({}),
      {},
    );

    expect(calls[1].payload).toBe('Unauthorized');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('creates a comment with the thread id and content', async () => {
    const comment = { id: 'comment-1', content: 'Hello' };
    createComment.mockResolvedValue({ data: { comment } });

    const result = await addCommentThunk({ threadId: 'thread-1', content: 'Hello' })(
      dispatch,
      () => ({}),
      {},
    );

    expect(createComment).toHaveBeenCalledWith('thread-1', 'Hello');
    expect(result.payload).toEqual(comment);
  });

  it('loads leaderboard rows', async () => {
    const leaderboards = [{ score: 10, user: { id: 'user-1' } }];
    getLeaderboards.mockResolvedValue({ data: { leaderboards } });

    const result = await fetchLeaderboards()(dispatch, () => ({}), {});

    expect(getLeaderboards).toHaveBeenCalledOnce();
    expect(result.payload).toEqual(leaderboards);
  });

  it('returns a readable comment submission error', async () => {
    createComment.mockRejectedValue(new Error('Comment failed'));
    const calls = [];

    await addCommentThunk({ threadId: 'thread-1', content: 'Hello' })(
      (action) => {
        calls.push(action);
        return action;
      },
      () => ({}),
      {},
    );

    expect(calls[1].type).toBe('comments/addComment/rejected');
    expect(calls[1].payload).toBe('Comment failed');
  });
});
