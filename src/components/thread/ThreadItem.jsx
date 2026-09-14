import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { upVoteThread, downVoteThread, neutralizeVoteThread } from '../../utils/api';
import { updateThreadVote } from '../../store/slices/threadSlice';
import Button from '../common/Button';
import { formatDate, truncateText } from '../../utils/formatter';

const ThreadItem = ({ thread }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upVotesBy = thread.upVotesBy || [];
  const downVotesBy = thread.downVotesBy || [];
  const handleVote = async (voteType) => {
    if (!user || isSubmitting) return;

    let currentVote = 0;
    if (upVotesBy.includes(user.id)) {
      currentVote = 1;
    } else if (downVotesBy.includes(user.id)) {
      currentVote = -1;
    }

    const newVoteType = currentVote === 0 ? voteType : 0;

    dispatch(updateThreadVote({
      threadId: thread.id,
      userId: user.id,
      voteType: newVoteType,
    }));

    try {
      setIsSubmitting(true);
      if (newVoteType === 1) {
        await upVoteThread(thread.id);
      } else if (newVoteType === -1) {
        await downVoteThread(thread.id);
      } else if (newVoteType === 0) {
        await neutralizeVoteThread(thread.id);
      }
    } catch (error) {
      dispatch(updateThreadVote({
        threadId: thread.id,
        userId: user.id,
        voteType: currentVote,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpvoted = user && upVotesBy.includes(user.id);
  const isDownvoted = user && downVotesBy.includes(user.id);
  const voteCount = upVotesBy.length - downVotesBy.length;

  // owner info
  const ownerName = thread.owner?.name
  || `User ${thread.ownerId?.replace('users-', '') || 'Unknown'}`;
  const ownerAvatar = thread.owner?.avatar
  || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}`
  + '&background=007bff&color=fff';

  return (
    <article className="thread-item">
      <div className="thread-votes">
        <Button
          variant={isUpvoted ? 'primary' : 'secondary'}
          onClick={() => handleVote(1)}
          aria-label="Upvote thread"
          disabled={!user || isUpvoted || isSubmitting}
        >
          ▲
        </Button>
        <span className="vote-count">{voteCount}</span>
        <Button
          variant={isDownvoted ? 'danger' : 'secondary'}
          onClick={() => handleVote(-1)}
          aria-label="Downvote thread"
          disabled={!user || isDownvoted || isSubmitting}
        >
          ▼
        </Button>
      </div>

      <div className="thread-content-list">
        <Link to={`/thread/${thread.id}`} className="thread-link">
          <h3 className="thread-title">{thread.title}</h3>
        </Link>
        <p className="thread-body">
          {truncateText(thread.body, 200)}
        </p>

        <div className="thread-meta">
          <span className="thread-category">{thread.category}</span>
          <span className="thread-comments">
            💬
            {' '}
            {thread.totalComments}
            {' '}
            comments
          </span>
          <span className="thread-date">
            {formatDate(thread.createdAt)}
          </span>
          <span className="thread-owner">
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="owner-avatar"
            />
            by
            {' '}
            {ownerName}
          </span>
        </div>
      </div>
    </article>
  );
};

ThreadItem.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    totalComments: PropTypes.number.isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string),
    downVotesBy: PropTypes.arrayOf(PropTypes.string),
    ownerId: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }).isRequired,
};

export default ThreadItem;
