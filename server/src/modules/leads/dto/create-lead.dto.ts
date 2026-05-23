import Joi from 'joi';

export const createLeadSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be in E.164 format (e.g., +1234567890)',
      'any.required': 'Phone is required',
    }),
  email: Joi.string()
    .email()
    .allow('', null)
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  message: Joi.string()
    .max(1000)
    .allow('', null)
    .optional(),
  // file is handled by multer separately
});