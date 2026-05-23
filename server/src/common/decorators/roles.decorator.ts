import { SetMetadata } from '@nestjs/common';

/**
 * Attaches required roles to a route.
 * @param  {...string} roles - List of role names (e.g., 'admin', 'user')
 */
export const Roles = (...roles) => SetMetadata('roles', roles);