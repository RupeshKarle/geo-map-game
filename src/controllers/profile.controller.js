import pool from '../config/db.js';

export const usersProfile = async (req, res) => {
 try {
  const userId = req.user.user_id;
  const user = await pool.query(
   `SELECT 
      u.id,
      u.name,
      u.email,
      u.points,
      u.role,
      (
        SELECT COUNT(*) + 1
        FROM users
        WHERE points > u.points
      ) AS rank,
      (
        SELECT COUNT(*)
        FROM game_sessions gs
        WHERE gs.user_id = u.id
      ) AS games_played
    FROM users u
    WHERE u.id = $1
   `, [userId]
  );

  if(user.rows.length === 0) {
   return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user: user.rows[0] });
 } catch (err) {
  res.status(500).json({ message: 'Failed to get info' });
 }
}

export const belongsToGroup = async (req, res) => {
 try {
  const { groupId } = req.query;
  const group = await pool.query(
   `SELECT 
      1
    FROM groups
    WHERE id = $1::integer AND $2::integer = ANY(members)
   `, [groupId, req.user.user_id]
  );

  if(group.rows.length === 0) {
   return res.status(402).json({ error: 'User not found' });
  }

  res.json(group.rows[0]);
 } catch (err) {
  res.status(500).json({ message: 'Failed to get info', error: err.message });
 }
}

export const userDetailsByEmail = async (req, res) => {
 try {
  const { email } = req.query;
  const user = await pool.query(
   `SELECT 
      u.id,
      u.name,
      u.email
    FROM users u
    WHERE u.email = $1
   `, [email]
  );

  if(user.rows.length === 0) {
   return res.status(404).json({ message: 'User not found' });
  }

  res.json(user.rows[0]);
 } catch (err) {
  res.status(500).json({ message: 'Failed to get info' });
 }
}

export const requestGroupAdmin = async (req, res) => {
 const client = await pool.connect();

 try {
  await client.query('BEGIN');

  const userId = req.user.user_id;
  
  await client.query(
   `UPDATE users
    SET role = $1
    WHERE id = $2`,
   ['group_admin_pending', userId]
  );

  await client.query('COMMIT');

  res.json({
    message: 'Request has been submitted successfully'
  });
 } catch (err) {
  await client.query('ROLLBACK');
  res.status(500).json({ message: 'Request for group admin failed' });
 } finally {
  client.release();
 }
};