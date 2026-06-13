import { group } from 'console';
import pool from '../config/db.js';
import crypto from 'crypto';

import { ADMIN_ROLE, GROUP_ADMIN_ROLE } from '../config/env.js';

export const index = async (req, res) => {
 try {
  const result = await pool.query(
   `
   SELECT 
    'reg' AS i_type,
    'Registration Link' AS type,
     NULL AS group_name,
     NULL AS g_id,
     i.token,
     i.is_valid
   FROM (SELECT NULL::integer) d
   LEFT JOIN invites i ON i.invited_by = $1 AND i.group_id IS NULL

   UNION ALL

   SELECT 
       'group' AS i_type,
       CONCAT('Group ', g.name) AS type,
       g.name AS group_name,
       g.id AS g_id,
       i.token,
       i.is_valid
   FROM groups g
   LEFT JOIN invites i ON i.group_id = g.id AND i.invited_by = $1
   WHERE g.user_id = $1`,
   [req.user.user_id]
  );
  return res.json(result.rows);
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const create = async (req, res) => {
 try {
  const { group_id = null } = req.body || {};

  const plainToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  const result = await pool.query(
   `INSERT INTO invites (invited_by, token, hashed, group_id)
    VALUES ($1, $2, $3, $4)`,
   [req.user.user_id, plainToken, tokenHash, group_id]
  );
  return res.json({status: 'ok'});
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const destroy = () => {

};

export const validateToken = async (req, res) => {
 try {
  const { token } = req.body || {};
  let invite_id = null, groupName = null, groupId = null;
  if(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const result = await pool.query(`
      SELECT i.id, g.name, i.group_id FROM invites i
      JOIN groups g ON i.group_id = g.id
      WHERE i.token = $1 AND i.hashed = $2 AND i.is_valid = true
      `, [token, hashedToken]);
    
    if(!result.rows.length) {
      return res.status(401).json({"message": "Invalid or expired invitation token."});
    }
    invite_id = result.rows[0].id;
    groupName = result.rows[0].name;
    groupId = result.rows[0].group_id;
    if(token && invite_id) {
     const client = await pool.connect();
     try {
      await client.query(`
        UPDATE groups SET members = array_append(members, $1) WHERE id = $2 AND NOT ($1 = ANY(members))`,[req.user.user_id, groupId]);

      await client.query(`
        INSERT INTO invite_log (invite_id, user_id)
        VALUES ($1, $2)
        `, [invite_id, req.user.user_id]);
      await client.query('COMMIT');
      return res.status(200).json({message: `Your have been successfully joined to group "${groupName}"`})
     } catch (e) {
      await client.query("ROLLBACK");
     }
    }
  }
  return res.status(304).json({message: 'Invalid token'})
 } catch (err) {
  res.status(500).json({message: err.message});
 }
};
