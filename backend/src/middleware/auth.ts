import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { AppDataSource } from '../database/config';
import { User } from '../entities';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

// Fixed authentication middleware - NO BYPASS
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.email);

    // Optionally: Fetch user from database to ensure they still exist
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    console.log('✅ Auth successful - User:', user.email, 'Role:', user.role);
    next();
  } catch (error: any) {
    console.error('❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role authorization middleware
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('🔍 Role check - User role:', req.user?.role, 'Allowed:', allowedRoles);
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log('❌ Insufficient permissions');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    console.log('✅ Role authorized');
    next();
  };
};

// Helper function to generate JWT tokens
export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};