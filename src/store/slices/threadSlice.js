import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getThreads, getThreadDetail, createThread, getUsers,
} from '../../utils/api';

// fetch users
export const fetchUsers = createAsyncThunk(
  'threads/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsers();
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchThreads = createAsyncThunk(
  'threads/fetchThreads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getThreads();
      return response.data.threads;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchThreadDetail = createAsyncThunk(
  'threads/fetchThreadDetail',
  async (threadId, { rejectWithValue }) => {
    try {
      const response = await getThreadDetail(threadId);
      return response.data.detailThread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addThread = createAsyncThunk(
  'threads/addThread',
  async ({ title, body, category }, { rejectWithValue }) => {
    try {
      const response = await createThread({ title, body, category });
      return response.data.thread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const threadSlice = createSlice({
  name: 'threads',
  initialState: {
    threads: [],
    currentThread: null,
    users: [],
    loading: false,
    error: null,
    filterCategory: '',
  },
  reducers: {
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    clearCurrentThread: (state) => {
      state.currentThread = null;
    },
    updateThreadVote: (state, action) => {
      const { threadId, userId, voteType } = action.payload;
      const thread = state.threads.find((item) => item.id === threadId);

      if (thread) {
        thread.upVotesBy = thread.upVotesBy.filter((id) => id !== userId);
        thread.downVotesBy = thread.downVotesBy.filter((id) => id !== userId);

        if (voteType === 1) {
          thread.upVotesBy.push(userId);
        } else if (voteType === -1) {
          thread.downVotesBy.push(userId);
        }
      }

      if (state.currentThread && state.currentThread.id === threadId) {
        const { upVotesBy, downVotesBy } = state.currentThread;
        state.currentThread.upVotesBy = upVotesBy.filter((id) => id !== userId);
        state.currentThread.downVotesBy = downVotesBy.filter((id) => id !== userId);

        if (voteType === 1) {
          state.currentThread.upVotesBy.push(userId);
        } else if (voteType === -1) {
          state.currentThread.downVotesBy.push(userId);
        }
      }
    },
    updateCommentVote: (state, action) => {
      const { commentId, userId, voteType } = action.payload;
      if (state.currentThread) {
        const comments = state.currentThread.comments || [];
        const comment = comments.find((item) => item.id === commentId);
        if (comment) {
          comment.upVotesBy = comment.upVotesBy.filter((id) => id !== userId);
          comment.downVotesBy = comment.downVotesBy.filter((id) => id !== userId);

          if (voteType === 1) {
            comment.upVotesBy.push(userId);
          } else if (voteType === -1) {
            comment.downVotesBy.push(userId);
          }
        }
      }
    },
    addCommentToThread: (state, action) => {
      if (state.currentThread) {
        state.currentThread.comments = state.currentThread.comments || [];
        state.currentThread.comments.unshift(action.payload);
      }
    },
    replaceTempComment: (state, action) => {
      const { threadId, tempCommentId, comment } = action.payload;
      if (state.currentThread?.id !== threadId) return;

      state.currentThread.comments = state.currentThread.comments || [];
      const tempIndex = state.currentThread.comments.findIndex((item) => item.id === tempCommentId);
      if (tempIndex === -1) {
        state.currentThread.comments.unshift(comment);
        return;
      }
      state.currentThread.comments[tempIndex] = comment;
    },
    removeTempComment: (state, action) => {
      const { threadId, tempCommentId } = action.payload;
      if (state.currentThread?.id !== threadId) return;

      state.currentThread.comments = state.currentThread.comments || [];
      state.currentThread.comments = state.currentThread.comments.filter(
        (comment) => comment.id !== tempCommentId,
      );
    },
    // user thread
    enrichThreadsWithUsers: (state, action) => {
      const users = action.payload;
      state.threads = state.threads.map((thread) => ({
        ...thread,
        owner: users.find((user) => user.id === thread.ownerId) || {
          id: thread.ownerId,
          name: 'Unknown User',
          avatar: 'https://ui-avatars.com/api/?name=User&background=007bff&color=fff',
        },
      }));
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch Threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Thread Detail
      .addCase(fetchThreadDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreadDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentThread = action.payload;
      })
      .addCase(fetchThreadDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Thread
      .addCase(addThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addThread.fulfilled, (state, action) => {
        state.loading = false;
        state.threads.unshift(action.payload);
      })
      .addCase(addThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      });
  },
});

export const {
  setFilterCategory,
  clearCurrentThread,
  updateThreadVote,
  updateCommentVote,
  addCommentToThread,
  replaceTempComment,
  removeTempComment,
  enrichThreadsWithUsers,
} = threadSlice.actions;

export const selectFilteredThreads = (state) => {
  const { threads, filterCategory } = state.threads;
  if (!filterCategory) return threads;
  return threads.filter((thread) => thread.category === filterCategory);
};

export default threadSlice.reducer;
