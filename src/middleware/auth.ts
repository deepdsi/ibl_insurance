import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthUser {
  id: string;
  role: 'admin' | 'reviewer' | 'provider';
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(allowedRoles: Array<'admin' | 'reviewer' | 'provider'> = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const authHeader = authReq.header('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub: string; role: string };
      const user = await User.findById(payload.sub);

      if (!user || !user.isActive) {
        res.status(401).json({ message: 'Account is inactive' });
        return;
      }

      authReq.user = { id: user._id.toString(), role: user.role, email: user.email };

      if (allowedRoles.length && !allowedRoles.includes(authReq.user.role)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
}
