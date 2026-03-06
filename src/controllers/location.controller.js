import pool from '../config/db.js';
import { io } from '../server.js';
/**
 * Admin: Add new location
 */

export const addLocation = async (req, res) => {
 try {
  const { title, latitude, longitude } = req.body;

  console.log("req recieved");

  const result = await pool.query(
   `INSERT INTO locations (title, latitude, longitude, is_active)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
   [title, latitude, longitude, true]
  );
  const newLoc = result.rows[0];

  /* Broadcast to all Users */
  io.emit('new-location', {
    id: newLoc.id,
    title: newLoc.title
  });

  res.status(201).json(newLoc);
 } catch (err) {
  res.status(500).send({ message: 'Failed to add location' })
 }
}

export const disableLocation = async (req, res) => {
 try {
  const { id } = req.params;

  const result = await pool.query(
   `UPDATE locations
    SET is_active = false
    WHERE id = $1
    RETURNING *`,
    [id]
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
  
  try {
    const result = await pool.query(
      `UPDATE locations
       SET is_active = true
       WHERE id = $1
       RETURNING *`,
      [id]
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
  let query = `SELECT id, title, created_at, is_active
   FROM locations
   ${ (req?.user?.role != 'admin')
    ? 'WHERE is_active = true' : ''
   }
   ORDER BY created_at DESC
  `;
  const result = await pool.query(query);

   res.json(result.rows);
 } catch (err) {
  res.status(500).json({ message: 'Failed to getch locations' });
 }
}