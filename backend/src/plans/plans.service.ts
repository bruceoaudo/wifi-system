import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './plans.entity';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async ensureDefaultPlans() {
    const plans = [
      {
        name: 'Basic Plan',
        slug: 'basic-plan',
        price: 50,
        duration: '1 Day',
        description: 'Perfect for beginners.',
      },
      {
        name: 'Standard Plan',
        slug: 'standard-plan',
        price: 500,
        duration: '1 Week',
        description: 'Best value plan.',
      },
      {
        name: 'Premium Plan',
        slug: 'premium-plan',
        price: 1500,
        duration: '1 Month',
        description: 'Full access plan.',
      },
    ];

    for (const plan of plans) {
      const exists = await this.planRepository.findOne({
        where: { slug: plan.slug },
      });
      if (!exists) {
        await this.planRepository.save(plan);
        this.logger.log(`Inserted plan: ${plan.name}`);
      } else {
        this.logger.log(`Plan already exists: ${plan.name}`);
      }
    }

    this.logger.log('Default plans check completed');
  }
}
