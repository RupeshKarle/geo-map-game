import pool from '../config/db.js';
import { calculateDistance } from '../utils/distance.js';

const WIN_DISTANCE_KM = 5;
const WIN_POINTS = 100;

export const startGame = async (req, res) => {
 try {
  const userId = req.user.user_id;
  const { locationId } = req.params;

  const locationResult = await pool.query(
   `SELECT * FROM locations
    WHERE id = $1 AND is_active = true
   `, [locationId]
  );

  if(locationResult.rows.length === 0) {
   return res.status(404).json({ message: 'Location not available' });
  }

  const  activeSessionCheck = await pool.query(
    `SELECT gs.id, l.title 
      FROM game_sessions gs
      JOIN locations l ON gs.location_id = l.id
      WHERE gs.location_id = $1
      AND gs.user_id = $2
      AND gs.is_completed = false`,
    [locationId, userId]
  );

  if (activeSessionCheck.rows.length > 0) {
    return res.json({
      id: activeSessionCheck.rows[0]?.id,
      title: activeSessionCheck.rows[0]?.title,
      message: 'Location already in active play'
    });
  }

  const sessionResult = await pool.query(
   `INSERT INTO game_sessions(user_id, location_id)
    VALUES ($1, $2)
    RETURNING *
   `,
   [userId, locationId]
  );

  res.json({ id: sessionResult.rows[0]?.id });
 } catch (err) {
  res.status(500).json({ message: 'Failed to start game' });
 }
}

export const submitGuess = async (req, res) => {
 const client = await pool.connect();

 try {
  await client.query('BEGIN');

  const userId = req.user.user_id;
  const { sessionId, guessedLat, guessedLng } = req.body;

  if (
    guessedLat < -90 || guessedLat > 90 ||
    guessedLng < -180 || guessedLng > 180
  ) {
    await client.query('ROLLBACK');
    return res.status(400).json({
      message: 'Invalid coordinates'
    });
  }

  const sessionResult = await client.query(
   `SELECT gs.*, l.latitude, l.longitude, l.is_active
    FROM game_sessions gs
    JOIN locations l ON gs.location_id = l.id
    WHERE gs.id = $1
   `, [sessionId]
  );

  if (sessionResult.rows.length === 0) {
   await pool.query('ROLLBACK');
   return res.status(404).json({ message: 'Session not found' });
  }

  const session = sessionResult.rows[0];

  if (session.user_id !== userId) {
    await client.query('ROLLBACK');
    return res.status(403).json({
      message: 'Unauthorized session access'
    });
  }

  if (session.is_completed) {
   await client.query('ROLLBACK');
   return res.status(404).json({ message: 'Session already completed' });
  }

  if (!session.is_active) {
   await client.query('ROLLBACK');
   return res.status(400).json({ message: 'Location already found' });
  }

  const distance = calculateDistance(
   guessedLat,
   guessedLng,
   session.latitude,
   session.longitude
  );

  // Save attempt
  // await client.query(
  //  `INSERT INTO attempts (session_id, guessed_lat, guessed_lng, distance)
  //   VALUES ($1, $2, $3, $4)`,
  //  [sessionId, guessedLat, guessedLng, distance]
  // );

  let isWinner = false;

  // Check win condition
  if (distance <= WIN_DISTANCE_KM) {
   isWinner = true;

   // Mark session complete
   await client.query(
    `UPDATE game_sessions
     SET is_completed = true
     WHERE id = $1`,
    [sessionId]
   );

   // Disable location
   await client.query(
    `UPDATE locations
     SET is_active = false,
      found_by_user_id = $1,
      found_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [userId, session.location_id]
   );

   // Add points
   await client.query(
    `UPDATE users
     SET points = points + $1
     WHERE id = $2`,
    [WIN_POINTS, userId]
   );
  }

  await client.query('COMMIT');

  res.json({
    distance: Number(distance.toFixed(2)),
    isWinner
  });
 } catch (err) {
  await client.query('ROLLBACK');
  res.status(500).json({ message: 'Guess failed' });
 } finally {
  client.release();
 }
};