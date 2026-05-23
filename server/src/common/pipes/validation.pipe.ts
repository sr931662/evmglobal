import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class JoiValidationPipe {
  /**
   * @param {import('joi').ObjectSchema} schema - Joi validation schema
   */
  constructor(schema) {
    this.schema = schema;
  }

  transform(value, metadata) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      stripUnknown: true, // Remove unknown properties for security
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return validatedValue; // return sanitized value
  }
}