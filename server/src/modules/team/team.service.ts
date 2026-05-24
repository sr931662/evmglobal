import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TeamService {
  constructor(@InjectModel('TeamMember') private teamModel: Model<any>) {}

  async findAll(query: { status?: string; department?: string } = {}) {
    const filter: any = {};
    if (query.status)     filter.status     = query.status;
    if (query.department) filter.department = query.department;
    return this.teamModel.find(filter).sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const member = await this.teamModel.findById(id).lean().exec();
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async create(data: any) {
    const member = await new this.teamModel(data).save();
    return member.toJSON();
  }

  async update(id: string, data: any) {
    const member = await this.teamModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async remove(id: string) {
    const member = await this.teamModel.findByIdAndDelete(id).lean().exec();
    if (!member) throw new NotFoundException('Team member not found');
    return { success: true };
  }
}
