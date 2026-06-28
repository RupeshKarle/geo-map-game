import pool from "../config/db.js";
import { io } from "../server.js";
import { calculateDistance } from "../utils/distance.js";

const WIN_DISTANCE_KM = 3;

export const startGame = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { locationId } = req.params;

    const locationResult = await pool.query(
      `SELECT * FROM locations
    WHERE id = $1 AND is_active = true
   `,
      [locationId],
    );

    if (locationResult.rows.length === 0) {
      return res.status(404).json({ message: "Location not available" });
    }

    const activeSessionCheck = await pool.query(
      `SELECT gs.id, l.title 
      FROM game_sessions gs
      JOIN locations l ON gs.location_id = l.id
      WHERE gs.location_id = $1
      AND gs.user_id = $2
      AND gs.is_completed = false`,
      [locationId, userId],
    );

    if (activeSessionCheck.rows.length > 0) {
      return res.json({
        id: activeSessionCheck.rows[0]?.id,
        user_id: userId,
        title: activeSessionCheck.rows[0]?.title,
        message: "Location already in active play",
      });
    }

    const sessionResult = await pool.query(
      `INSERT INTO game_sessions(user_id, location_id)
    VALUES ($1, $2)
    RETURNING *
   `,
      [userId, locationId],
    );

    res.json({
      id: sessionResult.rows[0]?.id,
      user_id: userId,
      title: locationResult.rows[0]?.title,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to start game" });
  }
};

export const submitGuess = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = req.user.user_id;
    const { sessionId, guessedLat, guessedLng } = req.body;

    if (
      guessedLat < -90 ||
      guessedLat > 90 ||
      guessedLng < -180 ||
      guessedLng > 180
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Invalid coordinates",
      });
    }

    const sessionResult = await client.query(
      `SELECT gs.*, l.latitude, l.longitude, l.is_active, l.group_id, l.point, u.name
    FROM game_sessions gs
    JOIN locations l ON gs.location_id = l.id
    JOIN users u ON gs.user_id = u.id
    WHERE gs.id = $1
   `,
      [sessionId],
    );

    if (sessionResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Session not found" });
    }

    const session = sessionResult.rows[0];
    const {
      user_id,
      is_completed,
      is_active,
      latitude,
      longitude,
      location_id,
      point,
      group_id,
      name,
    } = session;

    if (user_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Unauthorized session access",
      });
    }

    if (is_completed) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Session already completed" });
    }

    if (!is_active) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Location already found" });
    }

    const distance = calculateDistance(
      guessedLat,
      guessedLng,
      latitude,
      longitude,
    );

    // Save attempt
    await client.query(
      `INSERT INTO attempts (location_id, user_id, guessed_lat, guessed_lng, distance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, location_id)
      DO UPDATE SET guessed_lat = EXCLUDED.guessed_lat, guessed_lng = EXCLUDED.guessed_lng, distance = EXCLUDED.distance`,
      [location_id, userId, guessedLat, guessedLng, distance],
    );

    let isWinner = false;

    // Check win condition
    if (distance <= WIN_DISTANCE_KM) {
      isWinner = true;

      // Mark session complete
      await client.query(
        `UPDATE game_sessions
     SET is_completed = true
     WHERE id = $1`,
        [sessionId],
      );

      // Disable location
      await client.query(
        `UPDATE locations
     SET is_active = false,
      found_by_user_id = $1,
      found_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
        [userId, location_id],
      );

      const WIN_POINTS = session?.point ?? 10;
      // Add points
      if (group_id) {
        await client.query(
          `INSERT INTO leaders (user_id, group_id, points)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, group_id) WHERE group_id IS NOT NULL
        DO UPDATE SET points = leaders.points + EXCLUDED.points;
        `,
          [userId, group_id, WIN_POINTS],
        );
      } else {
        await client.query(
          `INSERT INTO leaders (user_id, group_id, points)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) WHERE group_id IS NULL
        DO UPDATE SET points = leaders.points + EXCLUDED.points;
        `,
          [userId, null, WIN_POINTS],
        );
      }
    } else if (
      distance - WIN_DISTANCE_KM < 50 &&
      distance - WIN_DISTANCE_KM > 20
    ) {
      io.to(`location_${location_id}`).emit("guessed", {
        name: name,
        user_id: req?.user?.user_id,
        lat: guessedLat,
        lng: guessedLng,
      });
    }

    await client.query("COMMIT");

    res.json({
      distance: Number(distance.toFixed(2)),
      isWinner,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Guess failed", error: err.message });
  } finally {
    client.release();
  }
};
