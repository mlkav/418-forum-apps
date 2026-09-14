/**
 * @fileoverview Berkas Pengujian Reducer Thread (Thread Slice Reducer Unit Tests)
 *
 * Skenario Pengujian Utama:
 * 1. Filter Kategori: Memastikan pengaturan dan pembersihan kriteria filter kategori thread (`setFilterCategory`).
 * 2. Voting Thread: Memastikan pembaruan status upvote, downvote, dan netralisasi vote pada daftar thread (`updateThreadVote`).
 * 3. Voting Thread Detail: Memastikan array vote pada thread detail yang sedang dibuka tetap independen saat diperbarui.
 * 4. Voting Komentar: Memastikan status vote (downvote & netralisasi) pada komentar di thread detail diperbarui dengan benar (`updateCommentVote`).
 * 5. Pengelolaan Komentar Optimis (Optimistic UI): Memastikan alur penambahan sementara (`addCommentToThread`), penggantian dengan data asli dari server (`replaceTempComment`), dan penghapusan komentar temp jika gagal (`removeTempComment`).
 * 6. Pengayaan Data Pengguna (Enrichment): Memastikan data pemilik thread diisi berdasarkan daftar pengguna, serta memiliki fallback 'Unknown User' jika ID pengguna tidak ditemukan (`enrichThreadsWithUsers`).
 */

import { describe, expect, it } from 'vitest';
import threadReducer, {
  addCommentToThread,
  enrichThreadsWithUsers,
  removeTempComment,
  replaceTempComment,
  setFilterCategory,
  updateCommentVote,
  updateThreadVote,
} from '../../src/store/slices/threadSlice';

const thread = {
  id: 'thread-1',
  title: 'First thread',
  body: 'Thread body',
  category: 'Technology',
  ownerId: 'user-1',
  upVotesBy: ['user-1'],
  downVotesBy: ['user-2'],
};

const detailThread = {
  ...thread,
  comments: [
    {
      id: 'comment-1',
      content: 'A comment',
      createdAt: '2026-01-01T00:00:00.000Z',
      owner: { id: 'user-2', name: 'Second User' },
      upVotesBy: ['user-1'],
      downVotesBy: [],
    },
  ],
};

describe('thread reducer', () => {
  it('sets and clears the category filter', () => {
    const withFilter = threadReducer(undefined, setFilterCategory('Technology'));
    expect(withFilter.filterCategory).toBe('Technology');

    const cleared = threadReducer(withFilter, setFilterCategory(''));
    expect(cleared.filterCategory).toBe('');
  });

  it('updates upvote, downvote, and neutral thread state', () => {
    const state = {
      threads: [thread],
      currentThread: null,
      users: [],
      loading: false,
      error: null,
      filterCategory: '',
    };

    const upvoted = threadReducer(state, updateThreadVote({
      threadId: thread.id,
      userId: 'user-2',
      voteType: 1,
    }));
    expect(upvoted.threads[0].upVotesBy).toEqual(['user-1', 'user-2']);
    expect(upvoted.threads[0].downVotesBy).toEqual([]);

    const downvoted = threadReducer(upvoted, updateThreadVote({
      threadId: thread.id,
      userId: 'user-2',
      voteType: -1,
    }));
    expect(downvoted.threads[0].upVotesBy).toEqual(['user-1']);
    expect(downvoted.threads[0].downVotesBy).toEqual(['user-2']);

    const neutral = threadReducer(downvoted, updateThreadVote({
      threadId: thread.id,
      userId: 'user-2',
      voteType: 0,
    }));
    expect(neutral.threads[0].upVotesBy).toEqual(['user-1']);
    expect(neutral.threads[0].downVotesBy).toEqual([]);
  });

  it('keeps a missing detail thread vote arrays independent', () => {
    const state = {
      threads: [],
      currentThread: { ...detailThread, upVotesBy: ['user-1'], downVotesBy: [] },
      users: [],
      loading: false,
      error: null,
      filterCategory: '',
    };

    const result = threadReducer(state, updateThreadVote({
      threadId: detailThread.id,
      userId: 'user-1',
      voteType: -1,
    }));

    expect(result.currentThread.upVotesBy).toEqual([]);
    expect(result.currentThread.downVotesBy).toEqual(['user-1']);
  });

  it('updates and neutralizes a comment vote', () => {
    const state = {
      threads: [],
      currentThread: detailThread,
      users: [],
      loading: false,
      error: null,
      filterCategory: '',
    };

    const downvoted = threadReducer(state, updateCommentVote({
      commentId: 'comment-1',
      userId: 'user-1',
      voteType: -1,
    }));
    expect(downvoted.currentThread.comments[0].upVotesBy).toEqual([]);
    expect(downvoted.currentThread.comments[0].downVotesBy).toEqual(['user-1']);

    const neutral = threadReducer(downvoted, updateCommentVote({
      commentId: 'comment-1',
      userId: 'user-1',
      voteType: 0,
    }));
    expect(neutral.currentThread.comments[0].upVotesBy).toEqual([]);
    expect(neutral.currentThread.comments[0].downVotesBy).toEqual([]);
  });

  it('adds, replaces, and removes an optimistic comment', () => {
    const state = {
      threads: [],
      currentThread: { ...detailThread, comments: [] },
      users: [],
      loading: false,
      error: null,
      filterCategory: '',
    };
    const tempComment = { id: 'temp-1', content: 'Draft' };
    const savedComment = { id: 'comment-2', content: 'Draft' };

    const added = threadReducer(state, addCommentToThread(tempComment));
    expect(added.currentThread.comments).toEqual([tempComment]);

    const replaced = threadReducer(added, replaceTempComment({
      threadId: detailThread.id,
      tempCommentId: tempComment.id,
      comment: savedComment,
    }));
    expect(replaced.currentThread.comments).toEqual([savedComment]);

    const removed = threadReducer(replaced, removeTempComment({
      threadId: detailThread.id,
      tempCommentId: savedComment.id,
    }));
    expect(removed.currentThread.comments).toEqual([]);
  });

  it('enriches threads with matching users and an unknown fallback', () => {
    const state = {
      threads: [thread, { ...thread, id: 'thread-2', ownerId: 'missing-user' }],
      currentThread: null,
      users: [{ id: 'user-1', name: 'First User', avatar: 'avatar.png' }],
      loading: false,
      error: null,
      filterCategory: '',
    };

    const result = threadReducer(state, enrichThreadsWithUsers(state.users));
    expect(result.threads[0].owner.name).toBe('First User');
    expect(result.threads[1].owner.name).toBe('Unknown User');
  });
});
