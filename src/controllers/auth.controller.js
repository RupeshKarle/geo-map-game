import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import crypto from 'crypto';
import { createRefreshToken, generateAccessToken, verifyRefreshToken } from '../services/token.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

import { getDeviceInfo } from '../utils/device.info.js';
import { NODE_ENV } from '../config/env.js';

export const register = async (req, res) => {
 try {
  const { name, email, password, token } = req.body || {};
  let invite_id = null, group_id = null;

  if(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const result = await pool.query(`
      SELECT * FROM invites
      WHERE hashed = $1 AND is_valid = TRUE
      `, [hashedToken]);
    if(!result.rows.length) {
      return res.status(401).json({"message": "Invalid or expired invitation token."});
    }
    invite_id = result.rows[0].id;
    group_id = result.rows[0].group_id;
  }

  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
   return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
     `INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    const user = result.rows?.[0] ?? {};
  
    if(token && invite_id) {
      await client.query(`
        UPDATE groups SET members = array_append(members, $1) WHERE id = $2 AND NOT ($1 = ANY(members))`,[user.id, group_id]);

      await client.query(`
        INSERT INTO invite_log (invite_id, user_id)
        VALUES ($1, $2)
        `, [invite_id, user.id]);
    }

    await client.query('COMMIT');
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
      sameSite: (NODE_ENV === 'production') ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: (NODE_ENV === 'production') ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Registration successful', token: accessToken, user});
  } catch (e) {
    await client.query("ROLLBACK");
  }
  res.status(500).json({message: 'Internal server error'});
 } catch (err) {
  res.status(500).json({ message: 'Registration failed', error: err.message });
 }
};

export const login = async (req, res) => {
 try {
  const {email, password } = req.body || {};

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
    sameSite: (NODE_ENV === 'production') ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: (NODE_ENV === 'production') ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ message: 'Login successful', token: accessToken, user});
 } catch (err) {
  res.status(500).json({ message: 'Login failed' });
 }
}

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if(!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const verify = await verifyRefreshToken(refreshToken);
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
      sameSite: (NODE_ENV === 'production') ? 'none' : 'lax',
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