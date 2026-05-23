"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
const common_1 = require("@nestjs/common");
/**
 * Attaches required roles to a route.
 * @param  {...string} roles - List of role names (e.g., 'admin', 'user')
 */
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;
