import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');
  private saltRounds = 10;

  constructor(@InjectModel('User') private userModel: Model<any>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).lean().exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).lean().exec();
  }

  async create(userData: { email: string; password: string; role?: string }) {
    const { email, password, role = 'admin' } = userData;

    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    try {
      const user = await new this.userModel({
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      }).save();
      this.logger.log(`User created: ${user.email}`);
      const { password: _p, ...result } = user.toJSON();
      return result;
    } catch (error) {
      this.logger.error(`Failed to create user ${email}: ${error.message}`);
      throw new InternalServerErrorException('Could not create user');
    }
  }

  async findAll() {
    return this.userModel
      .find()
      .select('-password')
      .sort({ created_at: -1 })
      .lean()
      .exec();
  }

  async updateRole(id: string, role: string) {
    const validRoles = ['admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    return this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select('-password')
      .lean()
      .exec();
  }

  async updatePassword(id: string, newPlainPassword: string) {
    const hashed = await bcrypt.hash(newPlainPassword, this.saltRounds);
    await this.userModel.findByIdAndUpdate(id, { password: hashed }).lean().exec();
    this.logger.log(`Password updated for user ID: ${id}`);
  }
}
