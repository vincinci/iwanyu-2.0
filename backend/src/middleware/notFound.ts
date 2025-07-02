import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found on this server`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
