import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../store/slices/authSlice';
import threadReducer from '../../store/slices/threadSlice';
import CommentItem from './CommentItem';

const user = {
  id: 'user-story',
  name: 'Story User',
  avatar: '',
};

const comment = {
  id: 'comment-story',
  content: 'A comment used to demonstrate voting states.',
  createdAt: '2026-09-14T00:00:00.000Z',
  upVotesBy: [],
  downVotesBy: ['user-story'],
  owner: {
    id: 'user-owner',
    name: 'Owner User',
    avatar: '',
  },
};

const currentThread = {
  id: 'thread-story',
  title: 'Story thread',
  body: 'Story thread body',
  category: 'General',
  createdAt: '2026-09-14T00:00:00.000Z',
  upVotesBy: [],
  downVotesBy: [],
  owner: {
    id: 'user-owner',
    name: 'Owner User',
    avatar: '',
  },
  comments: [comment],
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadReducer,
  },
  preloadedState: {
    auth: {
      user,
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    threads: {
      threads: [],
      currentThread,
      users: [],
      loading: false,
      error: null,
      filterCategory: '',
    },
  },
});

const withRedux = (Story) => (
  <Provider store={store}>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </Provider>
);

export default {
  title: 'Comment/CommentItem',
  component: CommentItem,
  decorators: [withRedux],
  tags: ['autodocs'],
};

export const Downvoted = {
  args: {
    comment,
    threadId: currentThread.id,
  },
};

export const Neutral = {
  args: {
    comment: {
      ...comment,
      downVotesBy: [],
    },
    threadId: currentThread.id,
  },
};
