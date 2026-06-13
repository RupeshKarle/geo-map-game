import pool from '../config/db.js';
import { GROUP_ADMIN_PENDING, GROUP_ADMIN_ROLE, USER_ROLE } from '../config/env.js';

export const groupAdminReq = async (req, res) => {
 try {
  let query = `SELECT id, name, email, points
   FROM users
   WHERE role = $1
  `;
  const result = await pool.query(query, [GROUP_ADMIN_PENDING]);
  res.json({users: result.rows});
 } catch (err) {
  res.status(500).json({ message: 'Failed to fetch group admin request.', error: err.message });
 }
}

export const approveReq = async (req, res) => {
 const { userId } = req.params;
 try {
  let query = `UPDATE users
   SET role = $1
   WHERE id = $2
  `;
  const result = await pool.query(query, [GROUP_ADMIN_ROLE, userId]);
  res.json({users: result.rows});
 } catch (err) {
  res.status(500).json({ message: 'Failed to approve group admin request.', error: err.message });
 }
}

export const rejectReq = async (req, res) => {
 const { userId } = req.params;
 try {
  let query = `UPDATE users
   SET role = $1
   WHERE id = $2
  `;
  const result = await pool.query(query, [USER_ROLE, userId]);
  res.json({users: result.rows});
 } catch (err) {
  res.status(500).json({ message: 'Failed to reject group admin request.', error: err.message });
 }
}