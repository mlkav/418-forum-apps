import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { addComment } from '../../store/slices/commentSlice';
import {
  addCommentToThread, replaceTempComment, removeTempComment,
} from '../../store/slices/threadSlice';
import Button from '../common/Button';
import Input from '../common/Input';

const CommentForm = ({ threadId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);

  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    const tempComment = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      owner: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      upVotesBy: [],
      downVotesBy: [],
    };

    dispatch(addCommentToThread(tempComment));
    setContent('');

    try {
      const comment = await dispatch(addComment({ threadId, content })).unwrap();
      dispatch(replaceTempComment({
        threadId,
        tempCommentId: tempComment.id,
        comment,
      }));
    } catch (err) {
      dispatch(removeTempComment({
        threadId,
        tempCommentId: tempComment.id,
      }));
    }
  };

  return (
    <div className="comment-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Add a Comment
          </label>
          <Input
            as="textarea"
            id="comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            rows="4"
            required
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            Failed to post comment:
            {' '}
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  threadId: PropTypes.string.isRequired,
};

export default CommentForm;
