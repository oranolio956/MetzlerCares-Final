import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const fields: Record<string, string> = {};
      errors.array().forEach((error) => {
        if ('path' in error) {
          fields[error.path as string] = error.msg;
        }
      });
      throw new ValidationError('Validation failed', fields);
    }

    next();
  };
};

// Common validation rules
export const emailRule = body('email')
  .optional()
  .isEmail()
  .withMessage('Must be a valid email address')
  .normalizeEmail();

export const nameRule = body('name')
  .optional()
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage('Name must be between 1 and 255 characters');

export const refreshTokenRule = body('refreshToken')
  .notEmpty()
  .withMessage('Refresh token is required')
  .isString()
  .withMessage('Refresh token must be a string');
