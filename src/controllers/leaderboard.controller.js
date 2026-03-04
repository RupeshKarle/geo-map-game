import pool from '../config/db.js';

export const getTopThree = async (req, res) => {
 try {
  const { page, limit } = req.query;
  const result = await pool.query(
   `SELECT id, name, points
    FROM users
    ORDER BY points DESC
    LIMIT 10
    OFFSET $1
    `,
    [(page - 1) * 10]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users`
  );

  const totalRecords = parseInt(countResult.rows[0].count);

  const totalPages = Math.ceil(totalRecords / limit);

  res.json({ leaderboard: result.rows, totalPages });
 } catch (err) {
  res.status(500).json({ message: 'Failed to fetch leaderboard' });
 }
};