import Joi from 'joi';

export const updateLeadStatusSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'contacted', 'qualified', 'converted', 'rejected')
    .required()
    .messages({
      'any.only': 'Status must be one of: new, contacted, qualified, converted, rejected',
      'any.required': 'Status is required',
    }),
});