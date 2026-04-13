import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstore_secret') as any;
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstore_secret') as any;
        req.user = decoded;
        next();
    } catch (e) {
        next();
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Require Admin role' });
        return;
    }
    next();
};
