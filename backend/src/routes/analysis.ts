import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AnalysisRequest, AnalysisResult, ApiResponse, DataPoint, LinearDataPoint, ResidualDataPoint } from '../types';
import { MetrologicalCalculator } from '../services/MetrologicalCalculator';

const router = Router();

// Validation schema for analysis request
const analysisSchema = Joi.object({
  xData: Joi.array().items(Joi.number().required()).min(3).required(),
  yData: Joi.array().items(Joi.number().required()).min(3).required(),
  uxData: Joi.array().items(Joi.number().positive()).optional(),
  uyData: Joi.array().items(Joi.number().positive()).optional(),
  adjustmentType: Joi.string().valid('lineal', 'potencial', 'exponencial').default('lineal'),
  motionType: Joi.string().valid('MRU', 'MRUA').optional(),
  kinematicVariable: Joi.string().valid('x-t', 'v-t', 'a-t').optional(),
}).custom((value, helpers) => {
  // Ensure X and Y have same length
  if (value.xData.length !== value.yData.length) {
    return helpers.error('array.length.mismatch');
  }
  
  // Validate uncertainty arrays if provided
  if (value.uxData && value.uxData.length !== value.xData.length) {
    return helpers.error('array.length.mismatch.ux');
  }
  
  if (value.uyData && value.uyData.length !== value.xData.length) {
    return helpers.error('array.length.mismatch.uy');
  }
  
  return value;
}).messages({
  'array.length.mismatch': 'X and Y data must have the same length',
  'array.length.mismatch.ux': 'UX uncertainties must have the same length as X data',
  'array.length.mismatch.uy': 'UY uncertainties must have the same length as Y data',
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = analysisSchema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation Error',
        message: error.details[0]?.message || 'Validation error',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const analysisRequest: AnalysisRequest = value;
    
    // Perform metrological analysis
    const calculator = new MetrologicalCalculator();
    const result = await calculator.performAnalysis(analysisRequest);

    const response: ApiResponse<AnalysisResult> = {
      success: true,
      data: result,
      message: 'Analysis completed successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
    
  } catch (error) {
    next(error);
  }
});

// Validate data endpoint
router.post('/validate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid data format',
        message: 'Data must be an array of points',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const calculator = new MetrologicalCalculator();
    const validation = calculator.validateData(data);

    const response: ApiResponse = {
      success: true,
      data: validation,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
    
  } catch (error) {
    next(error);
  }
});

// Get statistics endpoint
router.post('/statistics', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid data format',
        message: 'Data must be a non-empty array of numbers',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const calculator = new MetrologicalCalculator();
    const stats = calculator.calculateStatistics(data);

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
    
  } catch (error) {
    next(error);
  }
});

export default router;