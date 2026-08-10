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
  city: Joi.string().max(100).allow('', null).optional(),
  type: Joi.string()
    .valid('lead', 'inquiry', 'signup')
    .default('lead')
    .optional(),
  destination:         Joi.string().max(200).allow('', null).optional(),
  travelDate:          Joi.string().max(100).allow('', null).optional(),
  travellers:          Joi.string().max(100).allow('', null).optional(),
  // Enhanced lead-capture fields
  budget:              Joi.string().max(100).allow('', null).optional(),
  tripType:            Joi.string().max(100).allow('', null).optional(),
  travelMonth:         Joi.string().max(100).allow('', null).optional(),
  // `.empty('')` treats a blank form field as "not provided" instead of a bad number
  numAdults:           Joi.number().integer().min(0).max(99).empty('').allow(null).optional(),
  numChildren:         Joi.number().integer().min(0).max(99).empty('').allow(null).optional(),
  numInfants:          Joi.number().integer().min(0).max(99).empty('').allow(null).optional(),
  departureCity:       Joi.string().max(100).allow('', null).optional(),
  accommodation:       Joi.string().max(100).allow('', null).optional(),
  tripDuration:        Joi.string().max(100).allow('', null).optional(),
  howHeard:            Joi.string().max(200).allow('', null).optional(),
  preferredContact:    Joi.string().max(50).allow('', null).optional(),
  occasion:            Joi.string().max(100).allow('', null).optional(),
  specialRequirements: Joi.string().max(2000).allow('', null).optional(),
  status: Joi.string()
    .valid('new', 'contacted', 'qualified', 'converted', 'rejected', 'duplicate', 'not_interested')
    .default('new')
    .optional(),
  // file is handled by multer separately
});