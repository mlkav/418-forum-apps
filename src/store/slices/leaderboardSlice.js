import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLeaderboards } from '../../utils/api';

export const fetchLeaderboards = createAsyncThunk(
  'leaderboards/fetchLeaderboards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLeaderboards();
      return response.data.leaderboards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const leaderboardSlice = createSlice({
  name: 'leaderboards',
  initialState: {
    leaderboards: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboards.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboards = action.payload;
      })
      .addCase(fetchLeaderboards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaderboardSlice.reducer;
