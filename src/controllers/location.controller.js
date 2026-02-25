import pool from '../config/db.js';

/**
 * Admin: Add new location
 */

export const addLocation = async (req, res) => {
 try {
  const { title, latitude, longitude, is_active } = req.body;

  console.log("req recieved");

  const result = await pool.query(
   `INSERT INTO locations (title, latitude, longitude, is_active)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
   [title, latitude, longitude, (is_active ?? false)]
  );
  console.log("db called");
  res.status(201).json(result.rows[0]);
 } catch (err) {
  console.error(err);
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
  console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Failed to enable location' });
  }
}

export const getAvailableLocations = async (req, res) => {
 try {
  const result = await pool.query(`
   SELECT id, title, created_at
   FROM locations
   WHERE is_active = true
   ORDER BY created_at DESC
   `);

   res.json({ data: result.rows });
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Failed to getch locations' });
 }
}