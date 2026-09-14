import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createComment } from '../../utils/api';

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ threadId, content }, { rejectWithValue }) => {
    try {
      const response = await createComment(threadId, content);
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;
