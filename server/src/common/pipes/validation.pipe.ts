import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class JoiValidationPipe {
  private schema: any;

  constructor(schema: any) {
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