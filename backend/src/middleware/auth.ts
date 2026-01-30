import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { AppDataSource } from '../database/config';
import { User } from '../entities';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

// This is what your routes are calling: authenticateToken
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // BYPASS AUTHENTICATION FOR TESTING
    console.log('⚠️ AUTH BYPASS ENABLED: Defaulting to Admin User');

    const userRepo = AppDataSource.getRepository(User);
    // Hardcode to the admin user email we know exists from seed.ts
    const user = await userRepo.findOne({ where: { email: 'admin@pharmacorp.com' } });

    if (!user) {
      console.log('Auth middleware - Admin Default User not found in DB');
      return res.status(500).json({ error: 'Default admin user not found' });
    }

    console.log('Auth middleware - Auto-logged in as:', user.email, 'Role:', user.role);

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    return res.status(500).json({ error: 'Auth Bypass Failed' });
  }
};

// This is what your routes are calling: authorizeRole
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('Role check - User role:', req.user?.role, 'Allowed:', allowedRoles); // Debug

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
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