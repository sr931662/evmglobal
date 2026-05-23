import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('JwtStrategy');

  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validates the JWT payload and returns the user.
   * @param {Object} payload - Decoded JWT payload { sub, email, role }
   * @returns {Promise<Object>} user object attached to request
   */
  async validate(payload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      this.logger.warn(`JWT validation failed: user ${payload.sub} not found`);
      throw new UnauthorizedException('User no longer exists');
    }
    // Optionally verify that the role hasn't changed
    return {
      id: user._id?.toString() || user.id,
      email: user.email,
      role: user.role,
    };
  }
}