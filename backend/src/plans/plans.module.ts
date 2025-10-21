import { Module } from '@nestjs/common';
import { PlanService } from './plans.service';
import { Plan } from './plans.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([Plan]),
  ],
  providers: [PlanService]
})
export class PlansModule {}
