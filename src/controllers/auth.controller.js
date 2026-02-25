import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { createRefreshToken, generateAccessToken, verifyRefreshToken } from '../services/token.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

import { getDeviceInfo } from '../utils/device.info.js';
import { NODE_ENV } from '../config/env.js';

export const register = async (req, res) => {
 try {
  const { name, email, password } = req.body;

  console.log('Registering user:', { name, email });

  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
   return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query(
   `INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role`,
    [name, email, hashedPassword]
  );
  
  res.status(201).json(result.rows[0]);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Registration failed' });
 }
};

export const login = async (req, res) => {
 try {
  const {email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
   return res.status(400).json({ message: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const isMatch = await verifyPassword(user.password, password);

  if (!isMatch) {
   return res.status(400).json({ message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken({
    user_id: user.id,
    role: user.role
   });

  const deviceInfo = getDeviceInfo(req);

  const refreshToken = await createRefreshToken({
    user_id: user.id,
    type: 'refresh'
  }, deviceInfo);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ message: 'Login successful' });
 } catch (err) {
  console.error("🔥 LOGIN ERROR:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  if (err.code) {
    console.error("Code:", err.code);
  }

  if (err.detail) {
    console.error("Detail:", err.detail);
  }

  if (err.constraint) {
    console.error("Constraint:", err.constraint);
  }
  res.status(500).json({ message: 'Login failed' });
 }
}

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if(!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const verify = verifyRefreshToken(refreshToken);
    if (!verify) return res.status(401).json({ message: 'Invalid refresh token' });

    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [verify.user_id]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const accessToken = generateAccessToken({
      user_id: user.rows[0].id,
      role: user.rows[0].role
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.json({ message: 'Token refreshed successfully' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [req.user.user_id]);
  res.json({ message: 'Logged out successfully' });
};