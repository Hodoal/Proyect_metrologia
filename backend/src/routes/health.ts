import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Metrologia API is healthy',
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;