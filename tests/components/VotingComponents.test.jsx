import { configureStore } from '@reduxjs/toolkit';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  describe, expect, it, vi, beforeEach,
} from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import authReducer from '../../src/store/slices/authSlice';
import commentReducer from '../../src/store/slices/commentSlice';
import leaderboardReducer from '../../src/store/slices/leaderboardSlice';
import threadReducer from '../../src/store/slices/threadSlice';
import CommentItem from '../../src/components/comment/CommentItem';
import ThreadDetail from '../../src/components/thread/ThreadDetail';
import ThreadItem from '../../src/components/thread/ThreadItem';
import {
  downVoteComment,
  downVoteThread,
  neutralizeVoteComment,
  neutralizeVoteThread,
  upVoteThread,
} from '../../src/utils/api';

vi.mock('../../src/utils/api', () => ({
  downVoteComment: vi.fn().mockResolvedValue({}),
  downVoteThread: vi.fn().mockResolvedValue({}),
  neutralizeVoteComment: vi.fn().mockResolvedValue({}),
  neutralizeVoteThread: vi.fn().mockResolvedValue({}),
  upVoteComment: vi.fn().mockResolvedValue({}),
  upVoteThread: vi.fn().mockResolvedValue({}),
}));

const currentUser = {
  id: 'user-current',
  name: 'Current User',
  avatar: '',
};

const thread = {
  id: 'thread-1',
  title: 'Thread title',
  body: 'Thread body',
  category: 'Technology',
  createdAt: '2026-09-14T00:00:00.000Z',
  totalComments: 0,
  upVotesBy: ['user-other'],
  downVotesBy: [],
  owner: {
    id: 'user-owner',
    name: 'Owner User',
    avatar: '',
  },
};

const detailThread = {
  ...thread,
  comments: [],
};

const comment = {
  id: 'comment-1',
  content: 'Comment body',
  createdAt: '2026-09-14T00:00:00.000Z',
  upVotesBy: [],
  downVotesBy: [],
  owner: {
    id: 'user-owner',
    name: 'Owner User',
    avatar: '',
  },
};

const createPreloadedState = (currentThread = null) => ({
  auth: {
    user: currentUser,
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  threads: {
    threads: [thread],
    currentThread,
    users: [],
    loading: false,
    error: null,
    filterCategory: '',
  },
  comments: {
    loading: false,
    error: null,
  },
  leaderboards: {
    leaderboards: [],
    loading: false,
    error: null,
  },
});

const renderWithStore = (component, currentThread = null) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      threads: threadReducer,
      comments: commentReducer,
      leaderboards: leaderboardReducer,
    },
    preloadedState: createPreloadedState(currentThread),
  });

  const rendered = render(
    <Provider store={store}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>,
  );

  return {
    store,
    ...rendered,
    rerenderWithState: (nextComponent) => rendered.rerender(
      <Provider store={store}>
        <MemoryRouter>
          {nextComponent}
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe('voting components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('neutralizes a thread vote when the opposite vote button is clicked', async () => {
    const user = userEvent.setup();
    const { store, rerenderWithState } = renderWithStore(<ThreadItem thread={thread} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Upvote thread' }));
    await waitFor(() => expect(upVoteThread).toHaveBeenCalledOnce());
    rerenderWithState(<ThreadItem thread={store.getState().threads.threads[0]} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Downvote thread' }));
    await waitFor(() => expect(neutralizeVoteThread).toHaveBeenCalledOnce());
    rerenderWithState(<ThreadItem thread={store.getState().threads.threads[0]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeEnabled();
    expect(downVoteThread).not.toHaveBeenCalled();
    expect(store.getState().threads.threads[0].upVotesBy).not.toContain(currentUser.id);
    expect(store.getState().threads.threads[0].downVotesBy).not.toContain(currentUser.id);
  });

  it('neutralizes a detail thread downvote before accepting an upvote', async () => {
    const user = userEvent.setup();
    const { store, rerenderWithState } = renderWithStore(
      <ThreadDetail thread={detailThread} />,
      detailThread,
    );

    await user.click(screen.getByRole('button', { name: 'Downvote thread' }));
    await waitFor(() => expect(downVoteThread).toHaveBeenCalledOnce());
    rerenderWithState(<ThreadDetail thread={store.getState().threads.currentThread} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Upvote thread' }));
    await waitFor(() => expect(neutralizeVoteThread).toHaveBeenCalledOnce());
    rerenderWithState(<ThreadDetail thread={store.getState().threads.currentThread} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeEnabled();
    expect(upVoteThread).not.toHaveBeenCalled();
  });

  it('neutralizes an active comment vote when the opposite button is clicked', async () => {
    const user = userEvent.setup();
    const activeComment = {
      ...comment,
      upVotesBy: [currentUser.id],
      downVotesBy: [],
    };
    const { store, rerenderWithState } = renderWithStore(
      <CommentItem comment={activeComment} threadId={thread.id} />,
      { ...detailThread, comments: [activeComment] },
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote comment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote comment' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Downvote comment' }));
    await waitFor(() => expect(neutralizeVoteComment).toHaveBeenCalledOnce());
    rerenderWithState(
      <CommentItem
        comment={store.getState().threads.currentThread.comments[0]}
        threadId={thread.id}
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote comment' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Downvote comment' })).toBeEnabled();
    expect(store.getState().threads.currentThread.comments[0].upVotesBy)
      .not.toContain(currentUser.id);
    expect(store.getState().threads.currentThread.comments[0].downVotesBy)
      .not.toContain(currentUser.id);

    await user.click(screen.getByRole('button', { name: 'Downvote comment' }));
    await waitFor(() => expect(downVoteComment).toHaveBeenCalledOnce());
    rerenderWithState(
      <CommentItem
        comment={store.getState().threads.currentThread.comments[0]}
        threadId={thread.id}
      />,
    );
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Downvote comment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upvote comment' })).toBeEnabled();
  });

  it('applies a comment downvote from the neutral state', async () => {
    const user = userEvent.setup();
    const { store, rerenderWithState } = renderWithStore(
      <CommentItem comment={comment} threadId={thread.id} />,
      { ...detailThread, comments: [comment] },
    );

    await user.click(screen.getByRole('button', { name: 'Downvote comment' }));
    await waitFor(() => expect(downVoteComment).toHaveBeenCalledOnce());
    rerenderWithState(
      <CommentItem
        comment={store.getState().threads.currentThread.comments[0]}
        threadId={thread.id}
      />,
    );
    expect(screen.getByText('-1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Downvote comment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upvote comment' })).toBeEnabled();
    expect(neutralizeVoteComment).not.toHaveBeenCalled();
    expect(store.getState().threads.currentThread.comments[0].downVotesBy)
      .toEqual([currentUser.id]);
  });

  it('blocks duplicate vote requests while a vote request is pending', async () => {
    const user = userEvent.setup();
    const neutralThread = {
      ...thread,
      upVotesBy: [],
      downVotesBy: [],
    };
    const { store, rerenderWithState } = renderWithStore(
      <ThreadItem thread={neutralThread} />,
    );
    let releaseVote;
    upVoteThread.mockImplementationOnce(() => new Promise((resolve) => {
      releaseVote = resolve;
    }));

    await user.click(screen.getByRole('button', { name: 'Upvote thread' }));
    await waitFor(() => expect(upVoteThread).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Upvote thread' }));
    await user.click(screen.getByRole('button', { name: 'Downvote thread' }));
    expect(upVoteThread).toHaveBeenCalledOnce();
    expect(downVoteThread).not.toHaveBeenCalled();

    releaseVote();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Downvote thread' }))
      .toBeEnabled());
    rerenderWithState(<ThreadItem thread={store.getState().threads.threads[0]} />);
    expect(screen.getByRole('button', { name: 'Upvote thread' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Downvote thread' })).toBeEnabled();
  });
});
