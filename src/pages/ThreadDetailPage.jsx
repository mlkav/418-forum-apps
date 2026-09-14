import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThreadDetail, clearCurrentThread } from '../store/slices/threadSlice';
import ThreadDetail from '../components/thread/ThreadDetail';
import CommentList from '../components/comment/CommentList';
import CommentForm from '../components/thread/CommentForm';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const ThreadDetailPage = () => {
  const { threadId } = useParams();
  const dispatch = useDispatch();
  const { currentThread, loading, error } = useSelector((state) => state.threads);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchThreadDetail(threadId));

    return () => {
      dispatch(clearCurrentThread());
    };
  }, [dispatch, threadId]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="error-message" role="alert">
        Error:
        {error}
      </div>
    );
  }
  if (!currentThread) return <div className="no-content">Thread not found</div>;

  return (
    <div className="thread-detail-page">
      <Link to="/">
        <Button variant="secondary">← Back to Threads</Button>
      </Link>

      <ThreadDetail thread={currentThread} />

      <div className="comments-section">
        <h3>
          Comments (
          {currentThread.comments?.length || 0}
          )
        </h3>

        {isAuthenticated ? (
          <CommentForm threadId={threadId} />
        ) : (
          <div className="login-prompt">
            <Link to="/login">Login</Link>
            {' '}
            to post a comment
          </div>
        )}

        <CommentList
          comments={currentThread.comments || []}
          threadId={threadId}
        />
      </div>
    </div>
  );
};

export default ThreadDetailPage;
