import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const res = await api.get('/leaderboard/top-3');
    setLeaders(res.data.leaderboard);
  };

  return (
    <div>
      <h2>🏆 Top 3 Players</h2>
      {leaders.map((user, index) => (
        <div key={user.id}>
          {index + 1}. {user.name} - {user.points} pts
        </div>
      ))}
    </div>
  );
}