import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { PaymentsModule } from './payments/payments.module';
import { MpesaModule } from './mpesa/mpesa.module';
import { MikrotikRouterModule } from './router/router.module';
import { Plan } from './plans/plans.entity';
import { RedisModule } from './redis/redis.module';
import { PlansModule } from './plans/plans.module';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGO_URI'),
        useUnifiedTopology: true,
        synchronize: true,
        entities: [User, Plan, Payment],
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PaymentsModule,
    MpesaModule,
    MikrotikRouterModule,
    RedisModule,
    PlansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
