import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header' });
  }

  req.userId = userId;
  next();
};
