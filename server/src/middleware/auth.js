import jwt from 'jsonwebtoken';
import { getQuery } from '../config/database.js';

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await getQuery(
      'SELECT id, login_id, email, full_name, role, contact_id, active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const authenticatePortal = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await getQuery(
      `SELECT u.*, c.name as contact_name, c.email as contact_email 
       FROM users u
       JOIN contacts c ON u.contact_id = c.id 
       WHERE u.id = ? AND u.role = 'portal' AND u.active = 1`,
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid portal access' });
    }

    req.portalUser = user;
    req.user = user; // Also set req.user for consistency
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export { authenticate, authenticatePortal, requireAdmin };