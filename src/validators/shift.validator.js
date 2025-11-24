import { body, param, query } from 'express-validator';

export const createShiftValidation = [
  body('trainNumber')
    .trim()
    .notEmpty()
    .withMessage('Train number is required')
    .isString()
    .withMessage('Train number must be a string'),
  
  body('trainName')
    .optional()
    .trim()
    .isString()
    .withMessage('Train name must be a string'),
  
  body('locomotiveNo')
    .trim()
    .notEmpty()
    .withMessage('Locomotive number is required')
    .isString()
    .withMessage('Locomotive number must be a string'),
  
  body('locoPilot.employeeId')
    .trim()
    .notEmpty()
    .withMessage('Loco pilot employee ID is required'),
  
  body('locoPilot.name')
    .trim()
    .notEmpty()
    .withMessage('Loco pilot name is required'),
  
  body('trainManager.employeeId')
    .trim()
    .notEmpty()
    .withMessage('Train manager employee ID is required'),
  
  body('trainManager.name')
    .trim()
    .notEmpty()
    .withMessage('Train manager name is required'),
  
  body('trainArrivalDate')
    .notEmpty()
    .withMessage('Train arrival date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('trainArrivalTime')
    .notEmpty()
    .withMessage('Train arrival time is required')
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('signOnTime')
    .notEmpty()
    .withMessage('Sign on time is required')
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('timeOfTO')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('departureTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('signOnStation')
    .trim()
    .notEmpty()
    .withMessage('Sign on station is required')
    .isString()
    .withMessage('Sign on station must be a string'),
  
  body('signOffStation')
    .optional()
    .trim()
    .isString()
    .withMessage('Sign off station must be a string'),
  
  body('section')
    .trim()
    .notEmpty()
    .withMessage('Section is required')
    .isString()
    .withMessage('Section must be a string'),
  
  body('dutyType')
    .notEmpty()
    .withMessage('Duty type is required')
    .isIn(['SP', 'WR', 'LR'])
    .withMessage('Duty type must be SP, WR, or LR'),
  
  body('signOffDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('signOffTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('lobbySignOn')
    .optional()
    .isBoolean()
    .withMessage('Lobby sign on must be a boolean'),
  
  body('lobbySignOff')
    .optional()
    .isBoolean()
    .withMessage('Lobby sign off must be a boolean'),
];

export const updateShiftValidation = [
  param('id')
    .notEmpty()
    .withMessage('Shift ID is required')
    .isUUID()
    .withMessage('Invalid shift ID format'),
  
  body('timeOfTO')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('departureTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('signOffDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('signOffTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid time format'),
  
  body('signOffStation')
    .optional()
    .trim()
    .isString()
    .withMessage('Sign off station must be a string'),
  
  body('section')
    .optional()
    .trim()
    .isString()
    .withMessage('Section must be a string'),
  
  body('dutyType')
    .optional()
    .isIn(['SP', 'WR', 'LR'])
    .withMessage('Duty type must be SP, WR, or LR'),
  
  body('lobbySignOn')
    .optional()
    .isBoolean()
    .withMessage('Lobby sign on must be a boolean'),
  
  body('lobbySignOff')
    .optional()
    .isBoolean()
    .withMessage('Lobby sign off must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RELIEF_PLANNED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  body('reliefPlanned')
    .optional()
    .isBoolean()
    .withMessage('Relief planned must be a boolean'),
  
  body('reliefReason')
    .optional()
    .trim()
    .isString()
    .withMessage('Relief reason must be a string'),
];


export const getShiftByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Shift ID is required')
    .isUUID()
    .withMessage('Invalid shift ID format'),
];

export const listShiftsValidation = [
  query('status')
    .optional()
    .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RELIEF_PLANNED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  query('trainNumber')
    .optional()
    .trim()
    .isString()
    .withMessage('Train number must be a string'),
  
  query('locoPilotId')
    .optional()
    .isUUID()
    .withMessage('Invalid loco pilot ID format'),
  
  query('trainManagerId')
    .optional()
    .isUUID()
    .withMessage('Invalid train manager ID format'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
