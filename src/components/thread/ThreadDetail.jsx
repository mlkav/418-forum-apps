import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { upVoteThread, downVoteThread, neutralizeVoteThread } from '../../utils/api';
import { updateThreadVote } from '../../store/slices/threadSlice';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatter';

const ThreadDetail = ({ thread }) => {
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
  const owner = thread.owner || {};
  const ownerName = owner.name || 'Unknown User';
  const ownerAvatar = owner.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}`
    + '&background=007bff&color=fff';
  const commentCount = thread.comments?.length || 0;

  return (
    <article className="thread-detail">
      <div className="thread-header">
        <h1 className="thread-title">{thread.title}</h1>

        <div className="thread-meta">
          <span className="thread-category">{thread.category}</span>
          <span className="thread-date">{formatDate(thread.createdAt)}</span>
          <span className="thread-owner">
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="owner-avatar"
              onError={(e) => {
                const { target } = e;
                target.src = `https://ui-avatars.com/api/?name=${
                  encodeURIComponent(ownerName)
                }&background=007bff&color=fff`;
              }}
            />
            by
            {' '}
            {ownerName}
          </span>
        </div>
      </div>

      <div className="thread-content">
        <div className="thread-voting">
          <Button
            variant={isUpvoted ? 'primary' : 'secondary'}
            onClick={() => handleVote(1)}
            aria-label="Upvote thread"
            disabled={!user || isUpvoted || isSubmitting}
            className="vote-btn"
          >
            ▲ Upvote
          </Button>

          <div className="vote-stats">
            <span className="vote-count">{voteCount}</span>
            <span className="vote-label">votes</span>
          </div>

          <Button
            variant={isDownvoted ? 'danger' : 'secondary'}
            onClick={() => handleVote(-1)}
            aria-label="Downvote thread"
            disabled={!user || isDownvoted || isSubmitting}
            className="vote-btn"
          >
            ▼ Downvote
          </Button>
        </div>

        <div className="thread-body">
          <p>{thread.body}</p>

          <div className="thread-footer">
            <span className="comment-count">
              💬
              {' '}
              {commentCount}
              {' '}
              comments
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

ThreadDetail.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string),
    downVotesBy: PropTypes.arrayOf(PropTypes.string),
    comments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      createdAt: PropTypes.string,
      owner: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    })),
    owner: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default ThreadDetail;
