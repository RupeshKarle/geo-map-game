import pool from '../config/db.js';

export const getTopThree = async (req, res) => {
 try {
  const { page, limit } = req.query;
  const result = await pool.query(
   `SELECT u.id, u.name, COALESCE(l.points, 0) AS points
    FROM users u
    LEFT JOIN leaders l ON u.id = l.user_id AND l.group_id IS NULL
    ORDER BY points DESC
    LIMIT $1
    OFFSET $2
    `,
    [limit, (page - 1) * limit]
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