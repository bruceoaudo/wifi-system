import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { CustomerInfoService } from './customer-info.service';
import type { MpesaCallbackBody } from './types';
import { PaymentConfirmationService } from 'src/payments/payment-confirmation.service';
import { MikrotikRouterService } from 'src/router/router.service';
import { TasksService } from 'src/tasks/tasks.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import type { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Controller('mpesa')
export class MpesaController {
  constructor(
    private customerInfo: CustomerInfoService,
    private readonly paymentConfirmationService: PaymentConfirmationService,
    private routerService: MikrotikRouterService,
    private tasksService: TasksService,
    private userService: UsersService,
  ) {}

  @Post('callback')
  async mpesaCallback(
    @Body() body: MpesaCallbackBody,
    @Req() req: Request,
  ): Promise<void> {
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      throw new BadRequestException('Invalid callback payload');
    }

    const { ResultCode, CheckoutRequestID, CallbackMetadata } = callback;

    // If payment failed, publish failure and return
    if (ResultCode !== 0) {
      await this.paymentConfirmationService.failPayment(
        CheckoutRequestID,
        new Error(ResultCode.toString()),
      );
    }

    // Payment success: flatten metadata into a key-value map
    const metadata: Record<string, string | number> =
      CallbackMetadata?.Item?.reduce(
        (acc, item) => ({ ...acc, [item.Name]: item.Value }),
        {},
      ) || {};

    const amount = metadata['Amount'] as number | undefined;
    const receiptNumber = metadata['MpesaReceiptNumber'] as string | undefined;
    const phoneNumber = metadata['PhoneNumber'] as string | undefined;

    if (amount === undefined || !receiptNumber || !phoneNumber) {
      throw new BadRequestException(
        'Callback metadata is missing required fields',
      );
    }

    const customerInfo = this.customerInfo.get(CheckoutRequestID);

    if (!customerInfo) {
      throw new BadRequestException('Customer info is not available');
    }

    // Resolve payment across distributed instances
    await this.paymentConfirmationService.completePayment(CheckoutRequestID, {
      amount,
      receiptNumber,
      phoneNumber,
    });

    const user = (await this.userService.userExists(
      customerInfo.userId.toString(),
    )) as User;

    // Whitelist user after successful payment
    await this.routerService.whitelistUser(user.mac!, user.ip!); 

    // Schedule automatic blacklist when the plan expires
    this.tasksService.scheduleBlacklistJob(
      user.id as unknown as string,
      user.mac!,
      user.ip!,
      parseInt(customerInfo.duration),
    );

    // Cleanup contributor info from cache
    this.customerInfo.delete(CheckoutRequestID);
  }
}
