import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import threadReducer from './slices/threadSlice';
import commentReducer from './slices/commentSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadReducer,
    comments: commentReducer,
    leaderboards: leaderboardReducer,
  },
});

export default store;
