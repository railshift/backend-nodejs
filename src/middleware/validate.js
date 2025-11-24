import { validationResult } from 'express-validator';
import ApiError from './errorHandler.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    
    throw new ApiError(400, 'Validation failed', true, JSON.stringify(errorMessages));
  }
  
  next();
};
