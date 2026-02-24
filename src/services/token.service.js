import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import pool from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } from '../config/env.js';

export const generateAccessToken = (tokenData) => {
 return jwt.sign(
  tokenData,
  JWT_SECRET, 
  { expiresIn: JWT_EXPIRES_IN }
 );
};

export const createRefreshToken = async (tokenData, deviceInfo) => {
 const refreshToken = jwt.sign(
  tokenData,
  JWT_REFRESH_SECRET,
  { expiresIn: JWT_REFRESH_EXPIRES_IN }
 );

 const tokenHash = await argon2.hash(refreshToken);

 pool.query(
  `INSERT INTO refresh_tokens(token_hash, user_id, device_info, expires_at) VALUES($1, $2, $3, NOW() + INTERVAL '7 days')`,
  [tokenHash, tokenData.user_id, deviceInfo]
 );

 return refreshToken;
}

export const verifyAccessToken = (token) => {
 return jwt.verify(token, JWT_SECRET);
}

export const verifyRefreshToken = async (token) => {
 const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

 if (!decoded || !decoded.user_id) return null;

 const result = pool.query(
  `SELECT * FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW() AND revoked = false`,
  [decoded.user_id]
 );

 if (result.rows.length === 0) return null;

 for (const row of result.rows) {
  const match = await argon2.verify(row.token_hash, token);
  if (match) return decoded;
 }
 return null;
}