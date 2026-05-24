import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMemberSchema } from './schemas/team-member.schema';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'TeamMember', schema: TeamMemberSchema }])],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
