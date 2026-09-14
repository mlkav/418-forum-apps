import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { upVoteComment, downVoteComment, neutralizeVoteComment } from '../../utils/api';
import { updateCommentVote } from '../../store/slices/threadSlice';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatter';

const CommentItem = ({ comment, threadId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upVotesBy = comment.upVotesBy || [];
  const downVotesBy = comment.downVotesBy || [];
  const handleVote = async (voteType) => {
    if (!user || isSubmitting) return;

    let currentVote = 0;
    if (upVotesBy.includes(user.id)) {
      currentVote = 1;
    } else if (downVotesBy.includes(user.id)) {
      currentVote = -1;
    }

    const newVoteType = currentVote === 0 ? voteType : 0;

    dispatch(updateCommentVote({
      commentId: comment.id,
      userId: user.id,
      voteType: newVoteType,
    }));

    try {
      setIsSubmitting(true);
      if (newVoteType === 1) {
        await upVoteComment(threadId, comment.id);
      } else if (newVoteType === -1) {
        await downVoteComment(threadId, comment.id);
      } else if (newVoteType === 0) {
        await neutralizeVoteComment(threadId, comment.id);
      }
    } catch (error) {
      dispatch(updateCommentVote({
        commentId: comment.id,
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
  const ownerName = comment.owner?.name || 'Unknown User';

  return (
    <div className="comment-item">
      <div className="comment-votes">
        <Button
          variant={isUpvoted ? 'primary' : 'secondary'}
          onClick={() => handleVote(1)}
          aria-label="Upvote comment"
          disabled={!user || isUpvoted || isSubmitting}
        >
          ▲
        </Button>
        <span className="vote-count">{voteCount}</span>
        <Button
          variant={isDownvoted ? 'danger' : 'secondary'}
          onClick={() => handleVote(-1)}
          aria-label="Downvote comment"
          disabled={!user || isDownvoted || isSubmitting}
        >
          ▼
        </Button>
      </div>

      <div className="comment-content">
        <div className="comment-body">{comment.content}</div>
        <div className="comment-meta">
          <span className="comment-owner">
            by
            {' '}
            {ownerName}
          </span>
          <span className="comment-date">
            {formatDate(comment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string),
    downVotesBy: PropTypes.arrayOf(PropTypes.string),
    owner: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
  }).isRequired,
  threadId: PropTypes.string.isRequired,
};

export default CommentItem;
