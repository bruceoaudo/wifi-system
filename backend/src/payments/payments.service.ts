// src/payments/payments.service.ts
import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../plans/plans.entity';
import { MpesaService } from 'src/mpesa/mpesa.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/users/user.entity';
import { Payment } from './payment.entity';
import { PaymentConfirmationService } from './payment-confirmation.service';

@Injectable()
@UseGuards(JwtGuard)
export class PaymentsService {
  constructor(
    @InjectRepository(Plan) private plansRepo: Repository<Plan>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    private mpesaService: MpesaService,
    private paymentConfirmationService: PaymentConfirmationService,
  ) {}

  async purchasePlan(slug: string, phone: string, user: User) {
    const existingPlan = await this.plansRepo.findOne({ where: { slug } });
    if (!existingPlan) throw new NotFoundException('Plan does not exist');

    // Step 1: Initiate M-Pesa STK Push
    const { CheckoutRequestID } = await this.mpesaService.stkPush(
      user.id as unknown as number,
      phone,
      existingPlan.price,
      existingPlan.name,
      existingPlan.duration,
      `Payment for ${existingPlan.name} plan – ${existingPlan.duration} subscription`,
    );

    // Step 2: Save initial pending payment
    const payment = this.paymentsRepo.create({
      userId: user.id.toString(),
      planSlug: existingPlan.slug,
      planName: existingPlan.name,
      amount: existingPlan.price,
      phone,
      status: 'pending',
      checkoutRequestId: CheckoutRequestID,
    });
    await this.paymentsRepo.save(payment);

    try {
      // Step 3: Wait for confirmation
      const result =
        await this.paymentConfirmationService.waitForPayment(CheckoutRequestID);

      // Step 4: Update status on success
      payment.status = 'success';
      payment.transactionId = result.receiptNumber ?? 'N/A';
      await this.paymentsRepo.save(payment);

      return {
        success: true,
        message: 'Payment successful',
        metadata: result,
      };
    } catch (err) {
      const error = err as Error;

      // Update status on failure
      payment.status = 'failed';
      await this.paymentsRepo.save(payment);

      return { success: false, message: error.message ?? 'Payment failed' };
    }
  }
}
