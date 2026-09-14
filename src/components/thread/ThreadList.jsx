import React from 'react';
import { useSelector } from 'react-redux';
import ThreadItem from './ThreadItem';
import Loading from '../common/Loading';
import { selectFilteredThreads } from '../../store/slices/threadSlice';

const ThreadList = () => {
  const { loading, error, filterCategory } = useSelector((state) => state.threads);
  const threads = useSelector(selectFilteredThreads);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="error-message" role="alert">
        Error:
        {error}
      </div>
    );
  }

  return (
    <div className="thread-list">
      {filterCategory && (
        <div className="filter-info">
          Showing threads in category:
          {' '}
          <strong>{filterCategory}</strong>
        </div>
      )}
      {threads.length === 0 ? (
        <div className="no-content">No threads found</div>
      ) : (
        threads.map((thread) => (
          <ThreadItem key={thread.id} thread={thread} />
        ))
      )}
    </div>
  );
};

export default ThreadList;
