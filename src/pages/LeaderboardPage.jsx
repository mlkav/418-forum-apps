import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchLeaderboards } from '../store/slices/leaderboardSlice';
import LeaderboardList from '../components/leaderboard/LeaderboardList';

const LeaderboardPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLeaderboards());
  }, [dispatch]);

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top contributors based on their activity scores</p>
      </div>

      <LeaderboardList />
    </div>
  );
};

export default LeaderboardPage;
