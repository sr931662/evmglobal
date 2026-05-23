import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
  private logger = new Logger('SettingsService');

  constructor(@InjectModel('Settings') private settingsModel: Model<any>) {}

  async get() {
    let settings = await this.settingsModel.findOne().lean().exec();
    if (!settings) {
      const doc = await new this.settingsModel({}).save();
      settings = doc.toObject();
    }
    return settings;
  }

  async update(data: any) {
    const settings = await this.settingsModel
      .findOneAndUpdate({}, { $set: data }, { new: true, upsert: true })
      .lean()
      .exec();
    this.logger.log('Settings updated');
    return settings;
  }
}
