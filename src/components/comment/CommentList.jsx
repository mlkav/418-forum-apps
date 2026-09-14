import React from 'react';
import PropTypes from 'prop-types';
import CommentItem from './CommentItem';

const CommentList = ({ comments, threadId }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="no-content">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          threadId={threadId}
        />
      ))}
    </div>
  );
};

CommentList.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      createdAt: PropTypes.string,
      owner: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
  ),
  threadId: PropTypes.string.isRequired,
};

CommentList.defaultProps = {
  comments: [],
};

export default CommentList;
