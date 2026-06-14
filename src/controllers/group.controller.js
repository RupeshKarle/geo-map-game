import pool from '../config/db.js';
import { ADMIN_ROLE, GROUP_ADMIN_ROLE } from '../config/env.js';

export const getGroups = async (req, res) => {
 try {
  const result = await pool.query(
   `SELECT id, name, is_open FROM groups
    WHERE user_id = $1`,
   [req.user.user_id]
  );
  return res.json(result.rows);
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const getPaginatedGroups = async (req, res) => {
 try {
  const { page, limit } = req.query;
  let query = `
    SELECT 
      g.id,
      g.name,
      g.is_open,
      u.name AS owner,
      COUNT(*) OVER() AS total_count
    FROM groups g
    JOIN users u ON g.user_id = u.id
    ORDER BY g.created_at DESC
    LIMIT $1
    OFFSET $2;
  `;
  const result = await pool.query(query, [limit, (page - 1) * limit]);

  const totalRecords = parseInt(result?.rows[0]?.total_count || 0);

  const totalPages = Math.ceil(totalRecords / limit);

  res.json({ groups: result.rows, totalPages, totalRecords });
 } catch (err) {
  res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
 }
}

export const groupInfo = async (req, res) => {
 const { groupId } = req.params;
 try {
  const result = await pool.query(
   `SELECT
    g.id,
    g.name,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          )
          ORDER BY array_position(g.members, u.id)
        )
        FROM users u
        WHERE u.id = ANY(g.members)
      ),
      '[]'::json
    ) AS members
   FROM groups g
   WHERE g.id = $1;
  `,
   [groupId]
  );
  return res.json(result.rows?.[0]);
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const saveGroup = async (req, res) => {
 const { name } = req.body;
 try {
  if (!name) {
   return res.status(400).json({message: 'Require parameters does not passed.'});
  }
  const result = await pool.query(
   `INSERT INTO groups (name, user_id)
    SELECT $1::varchar, $2::bigint
    WHERE NOT EXISTS (
      SELECT 1 FROM groups WHERE name = $1::varchar AND user_id = $2::bigint
    )
    AND (
      SELECT COUNT(*) FROM groups WHERE user_id = $2::bigint
    ) < 2
    RETURNING id, name
   `,
   [name, req.user.user_id]
  );
  if (result.rows.length === 0) {
    return res.status(409).json({ error: "Group could not be created. Either the name already exists or you have reached the limit of 2 groups." });
  }

  return res.json(result?.rows?.[0]);
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const updateGroup = async (req, res) => {
 const payload = req.body;
 const { groupId } = req.params;
 try {
  if (!payload?.name || !payload?.members) {
   return res.status(400).json({message: 'Require parameters does not passed.'});
  }
  const result = await pool.query(
   `UPDATE groups SET name = $1, members = $2, is_open = $3
    WHERE id = $4
   `,
   [payload.name, payload.members, true, groupId]
  );
  return res.json({message: 'Group has been updated successfully.'});
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const openCloseGroup = async (req, res) => {
 const { groupId, isOpen } = req.params;
 try {
  const result = await pool.query(
   `UPDATE groups SET is_open = $1
    WHERE id = $2
   `,
   [isOpen, groupId]
  );
  return res.json({message: 'Group has been updated successfully.'});
 } catch (err) {
  return res.status(400).json({message: err.message});
 }
};

export const getLocations = async (req, res) => {
  const { groupId } = req.params;
  try {
    let query = `
      SELECT *
      FROM locations
      WHERE group_id = $1;
    `;
    const result = await pool.query(query, [groupId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
  }
};