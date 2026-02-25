import pool from '../config/db.js';

export const getTopThree = async (req, res) => {
 try {
  const result = await pool.query(
   `SELECT id, name, points
    FROM users
    ORDER BY points DESC
    LIMIT 3`
  );

  res.json({ leaderboard: result.rows });
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Failed to fetch leaderboard' });
 }
};