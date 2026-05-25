import Joi from 'joi';

export const updateLeadStatusSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'contacted', 'qualified', 'converted', 'rejected', 'duplicate', 'not_interested')
    .required()
    .messages({
      'any.only': 'Status must be one of: new, contacted, qualified, converted, rejected, duplicate, not_interested',
      'any.required': 'Status is required',
    }),
});