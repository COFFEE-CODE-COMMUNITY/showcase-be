import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

async function userAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token is required' });
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.USER_TOKEN_SECRET || '');
    req.userId = (decoded as { userId: string }).userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
    return
  }
}

export default userAuthMiddleware;