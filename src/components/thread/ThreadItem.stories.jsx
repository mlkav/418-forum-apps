import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../store/slices/authSlice';
import threadReducer from '../../store/slices/threadSlice';
import ThreadItem from './ThreadItem';

const user = {
  id: 'user-story',
  name: 'Story User',
  avatar: '',
};

const thread = {
  id: 'thread-story',
  title: 'How should this feature behave?',
  body: 'A thread used to demonstrate voting states in Storybook.',
  category: 'General',
  createdAt: '2026-09-14T00:00:00.000Z',
  totalComments: 3,
  upVotesBy: ['user-story'],
  downVotesBy: [],
  ownerId: 'user-owner',
  owner: {
    id: 'user-owner',
    name: 'Owner User',
    avatar: '',
  },
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
      threads: [thread],
      currentThread: null,
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
  title: 'Thread/ThreadItem',
  component: ThreadItem,
  decorators: [withRedux],
  tags: ['autodocs'],
};

export const Upvoted = {
  args: { thread },
};

export const Neutral = {
  args: {
    thread: {
      ...thread,
      upVotesBy: [],
    },
  },
};
