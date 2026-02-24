import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
   await pool.query('SELECT 1');
   res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
   res.status(500).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

export default router;