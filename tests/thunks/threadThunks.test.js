/**
 * @fileoverview Berkas Pengujian Async Thunks Redux Thread (Thread Slice Thunk Unit Tests)
 *
 * Skenario Pengujian Utama:
 * 1. Memuat Daftar Thread (fetchThreads): Memastikan alur aksi `pending` dan `fulfilled` berjalan dengan baik serta mengembalikan array thread dari API.
 * 2. Memuat Detail Thread (fetchThreadDetail): Memastikan ID thread diteruskan dengan tepat ke fungsi API `getThreadDetail`.
 * 3. Menambahkan Thread Baru (addThread): Memastikan bidang formulir (title, body, category) terkirim secara akurat ke API `createThread`.
 * 4. Memuat Daftar Pengguna (fetchUsers): Memastikan pemanggilan API `getUsers` dilakukan satu kali untuk keperluan pengayaan data pemilik thread (enrichment).
 * 5. Penanganan Error (fetchThreads Rejected): Memastikan kesalahan jaringan/API ditangkap dan dikembalikan dalam bentuk pesan yang mudah dibaca pada payload `rejected`.
 */

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  getThreads,
  getThreadDetail,
  createThread,
  getUsers,
} from '../../src/utils/api';
import {
  addThread,
  fetchThreadDetail,
  fetchThreads,
  fetchUsers,
} from '../../src/store/slices/threadSlice';

vi.mock('../../src/utils/api', () => ({
  getThreads: vi.fn(),
  getThreadDetail: vi.fn(),
  createThread: vi.fn(),
  getUsers: vi.fn(),
  createComment: vi.fn(),
}));

const dispatch = (action) => action;

describe('thread async thunks', () => {
  it('dispatches fetchThreads pending and fulfilled actions', async () => {
    const threads = [{ id: 'thread-1' }];
    getThreads.mockResolvedValue({ data: { threads } });
    const calls = [];

    await fetchThreads()(
      (action) => {
        calls.push(action);
        return action;
      },
      () => ({}),
      {},
    );

    expect(calls).toHaveLength(2);
    expect(calls[0].type).toBe('threads/fetchThreads/pending');
    expect(calls[1].type).toBe('threads/fetchThreads/fulfilled');
    expect(calls[1].payload).toEqual(threads);
  });

  it('passes a thread id to fetchThreadDetail', async () => {
    getThreadDetail.mockResolvedValue({
      data: { detailThread: { id: 'thread-1', title: 'Detail' } },
    });

    await fetchThreadDetail('thread-1')(dispatch, () => ({}), {});

    expect(getThreadDetail).toHaveBeenCalledWith('thread-1');
  });

  it('creates a thread with the submitted fields', async () => {
    const createdThread = { id: 'thread-2', title: 'New thread' };
    createThread.mockResolvedValue({ data: { thread: createdThread } });

    await addThread({ title: 'New thread', body: 'Body', category: 'General' })(
      dispatch,
      () => ({}),
      {},
    );

    expect(createThread).toHaveBeenCalledWith({
      title: 'New thread',
      body: 'Body',
      category: 'General',
    });
  });

  it('loads users for thread owner enrichment', async () => {
    const users = [{ id: 'user-1', name: 'User One' }];
    getUsers.mockResolvedValue({ data: { users } });

    await fetchUsers()(dispatch, () => ({}), {});

    expect(getUsers).toHaveBeenCalledOnce();
  });

  it('returns a readable rejection value when fetching threads fails', async () => {
    getThreads.mockRejectedValue(new Error('Network unavailable'));
    const calls = [];

    await fetchThreads()(
      (action) => {
        calls.push(action);
        return action;
      },
      () => ({}),
      {},
    );

    expect(calls[1].type).toBe('threads/fetchThreads/rejected');
    expect(calls[1].payload).toBe('Network unavailable');
  });
});
