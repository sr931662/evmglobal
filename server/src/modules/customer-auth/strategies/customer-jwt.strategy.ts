import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from '../../customers/customers.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private customersService: CustomersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }
    const customer = await this.customersService.findById(payload.sub);
    if (!customer) {
      throw new UnauthorizedException('Customer no longer exists');
    }
    return { id: customer._id?.toString() || customer.id, email: customer.email, type: 'customer' };
  }
}
