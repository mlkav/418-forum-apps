import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchThreads, setFilterCategory, fetchUsers, enrichThreadsWithUsers,
} from '../store/slices/threadSlice';
import ThreadList from '../components/thread/ThreadList';
import Button from '../components/common/Button';

const HomePage = () => {
  const dispatch = useDispatch();
  const {
    threads, filterCategory, users,
  } = useSelector((state) => state.threads);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [hasEnriched, setHasEnriched] = useState(false);

  useEffect(() => {
    dispatch(fetchThreads());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (threads.length > 0 && users.length > 0 && !hasEnriched) {
      dispatch(enrichThreadsWithUsers(users));
      setHasEnriched(true);
    }
  }, [threads, users, dispatch, hasEnriched]);

  useEffect(() => {
    if (threads.length > 0) {
      const uniqueCategories = [
        ...new Set(threads.map((thread) => thread.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [threads]);

  const handleCategoryFilter = (category) => {
    dispatch(setFilterCategory(category === filterCategory ? '' : category));
  };

  const clearFilter = () => {
    dispatch(setFilterCategory(''));
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Discussion Forum</h1>
        {isAuthenticated && (
          <Link to="/create-thread">
            <Button variant="primary">Create New Thread</Button>
          </Link>
        )}
      </div>

      <div className="category-filters">
        <Button
          variant={!filterCategory ? 'primary' : 'secondary'}
          onClick={clearFilter}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? 'primary' : 'secondary'}
            onClick={() => handleCategoryFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <ThreadList />
    </div>
  );
};

export default HomePage;
