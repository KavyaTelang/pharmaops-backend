import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/config';
import { User } from '../entities';

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
  companyId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId, isActive: true } });

    if (!user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.companyId = user.companyId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const generateToken = (userId: string, role: string, companyId: string): string => {
  return jwt.sign({ userId, role, companyId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
};