import React from 'react';
import { useSelector } from 'react-redux';
import Loading from '../common/Loading';

const LeaderboardList = () => {
  const { leaderboards, loading, error } = useSelector((state) => state.leaderboards);

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
    <div className="leaderboard-list">
      <h2>Top Users</h2>

      {leaderboards.length === 0 ? (
        <div className="no-content">No leaderboard data available</div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>User</span>
            <span>Score</span>
          </div>

          {leaderboards.map((item, index) => {
            const userName = item.user?.name || 'Unknown User';
            const userAvatar = item.user?.avatar
              || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`
              + '&background=007bff&color=fff';

            return (
              <div key={item.user?.id || index} className="leaderboard-item">
                <span className="rank">
                  #
                  {index + 1}
                </span>

                <div className="user-info">
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="user-avatar"
                    onError={(e) => {
                      // eslint-disable-next-line no-param-reassign
                      e.target.src = `https://ui-avatars.com/api/?name=${
                        encodeURIComponent(userName)
                      }&background=007bff&color=fff`;
                    }}
                  />
                  <span className="user-name">{userName}</span>
                </div>

                <span className="user-score">
                  {item.score}
                  {' '}
                  points
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardList;
