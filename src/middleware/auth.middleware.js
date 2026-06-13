import { verifyAccessToken } from '../services/token.service.js';
import pool from '../config/db.js';
import { ADMIN_ROLE, GROUP_ADMIN_ROLE } from '../config/env.js';

export function authenticate(req, res, next) {
 const accessToken = req.cookies.access_token;

 if(!accessToken) return res.status(401).json({ message: 'Access token is missing' });

 try {
  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return res.status(401).json({ message: 'Invalid access token' });

  req.user = decoded;
  next();
 } catch (error) {
  return res.status(401).json({ message: 'Invalid access token' });
 }
};

export const requireAdmin = async (req, res, next) => {
 if (req.user.role !== 'admin') {
  if(req.body.group_id) {
   let userId = req.user.user_id;
   let groupId = req.body.group_id;
   const result = await pool.query(`
    SELECT * FROM groups WHERE user_id = $1 AND id = $2;
    `, [userId, groupId]);
    if(!result.rows.length) {
     return res.status(403).json({ message: 'Admin only' });
    } else {
     return next();
    }
  }
  return res.status(403).json({ message: 'Admin only' });
 }
 next();
};

export const adminAccess = async (req, res, next) => {
  if (req.user.role != GROUP_ADMIN_ROLE && req.user.role != ADMIN_ROLE) {
  return res.status(403).json({message: "Admin only."})
 }
 next();
}