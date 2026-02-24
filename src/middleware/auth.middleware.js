import { verifyAccessToken } from '../services/token.service.js';

export function authenticate(req, res, next) {
 const accessToken = req.cookies.access_token;

 if(!accessToken) return res.status(401).json({ message: 'Access token is missing' });

 try {
  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return res.status(401).json({ message: 'Invalid access token' });

  req.user = decoded;
  next();
 } catch (error) {
  return res.status(401).json({ message: 'Invalid access token' });
 }
};

export const requireAdmin = (req, res, next) => {
 if (req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Admin only' });
 }
 next();
};