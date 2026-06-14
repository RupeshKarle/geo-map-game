import pool from '../config/db.js';
import { ADMIN_ROLE, GROUP_ADMIN_ROLE } from '../config/env.js';
import { io } from '../server.js';
/**
 * Admin: Add new location
 */

export const addLocation = async (req, res) => {
 try {
  const { title, latitude, longitude, group_id = null } = req.body;

  const result = await pool.query(
   `INSERT INTO locations (title, latitude, longitude, is_active, group_id)
    SELECT $1, $2, $3, $4, $5::integer
    WHERE 
      $5::integer IS NULL 
      OR 
      EXISTS (
        SELECT 1 FROM groups WHERE id = $5::integer AND is_open = true
      )
    RETURNING *`,
   [title, latitude, longitude, true, group_id]
  );
  const newLoc = result.rows[0];

  /* Broadcast to all Users */
  io.emit('new-location', {
    id: newLoc.id,
    title: newLoc.title,
    group_id,
    user_id: (req?.user?.user_id)
  });

  res.status(201).json(newLoc);
 } catch (err) {
  res.status(500).send({ message: 'Failed to add location', error: err.message })
 }
}

export const disableLocation = async (req, res) => {
 try {
  const { id } = req.params;
  const { group_id = null } = req.body || {};

  const result = await pool.query(
   `UPDATE locations
    SET is_active = false
    WHERE id = $1
    AND (
      $2::integer IS NULL 
      OR 
      EXISTS (
        SELECT 1 FROM groups WHERE id = $2::integer AND is_open = true
      )
    )
    RETURNING *`,
    [id, group_id]
  );

  if (result.rows.length === 0) {
   return res.status(404).json({ message: 'Location not found' });
  }

  res.json(result.rows[0]);
 } catch (err) {
  res.status(500).json({ message: 'Failed to disable location' });
 }
}

export const enableLocation = async (req, res) => {
  const { id } = req.params;
  const { group_id = null } = req.body || {};
  
  try {
    const result = await pool.query(
      `UPDATE locations
       SET is_active = true
       WHERE id = $1
        AND (
          $2::integer IS NULL 
          OR 
          EXISTS (
            SELECT 1 FROM groups WHERE id = $2::integer AND is_open = true
          )
        )
       RETURNING *`,
      [id, group_id]
    );
  
    if (!result.rows.length) {
      return res.status(403).json({ message: 'Location not found' });
    }
  
    res.send(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to enable location' });
  }
}

export const getAvailableLocations = async (req, res) => {
 try {
  let query = `
    SELECT 
      l.group_id,
      u.name AS winner,
      g.name AS groupname,
      json_agg(
        json_build_object(
          'id', l.id,
          'title', l.title,
          'is_active', l.is_active
        ) ORDER BY l.created_at DESC
      ) AS locations
    FROM locations l
    LEFT JOIN groups g ON l.group_id = g.id
    LEFT JOIN users u ON l.found_by_user_id = u.id
    WHERE l.is_active = true
      AND (l.group_id IS NULL OR (
          g.is_open = true
          AND g.user_id = $1 OR $1::INTEGER = ANY(g.members)
        )
      )
    GROUP BY l.group_id, g.name, u.name
    ORDER BY l.group_id IS NOT NULL, l.group_id DESC;
  `;

  const result = await pool.query(query, [req.user.user_id]);

   res.json(result.rows);
 } catch (err) {
  res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
 }
}

export const getPaginatedLocations = async (req, res) => {
 try {
  const { page, limit } = req.query;
  const { group_id = null } = req.body || {};
  let query = `
    SELECT l.*, g.name AS group_name,
    u.name AS winner,
    COUNT(*) OVER() AS total_count
    FROM locations l
    LEFT JOIN groups g ON l.group_id = g.id
    LEFT JOIN users u ON l.found_by_user_id = u.id
    ${(req.user.role == GROUP_ADMIN_ROLE)
      ? `WHERE g.user_id = ${req.user.user_id} AND g.id = ${group_id} AND g.is_open = true`
      : ''
    }
    ORDER BY l.created_at DESC
    LIMIT $1
    OFFSET $2;
  `;
  const result = await pool.query(query, [limit, (page - 1) * limit]);

  const totalRecords = parseInt(result?.rows[0]?.total_count || 0);

  const totalPages = Math.ceil(totalRecords / limit);

  res.json({ locations: result.rows, totalPages, totalRecords });
 } catch (err) {
  res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
 }
}