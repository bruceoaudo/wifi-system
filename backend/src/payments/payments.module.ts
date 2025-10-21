import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../plans/plans.entity';
import { MpesaModule } from 'src/mpesa/mpesa.module';
import { PaymentConfirmationService } from './payment-confirmation.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Payment } from './payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Payment]),
    forwardRef(() => MpesaModule),
    AuthModule,
    UsersModule,
  ],
  providers: [PaymentsService, PaymentConfirmationService],
  controllers: [PaymentsController],
  exports: [PaymentConfirmationService],
})
export class PaymentsModule {}
