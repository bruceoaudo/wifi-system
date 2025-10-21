import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { Request, Response } from 'express';
import { JwtGuard } from 'src/auth/jwt.guard';
import { IsAuthenticated } from 'src/auth/auth.decorator';

@Controller('payments')
@UseGuards(JwtGuard)
@IsAuthenticated()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}
  @Post('buy')
  @HttpCode(200)
  async purchasePlan(
    @Body() body: { slug: string; phone: string },
    @Req() req: Request,
  ) {
    const user = req['user'];
    const result = await this.paymentsService.purchasePlan(
      body.slug,
      body.phone,
      user,
    );

    if (!result.success) {
      throw new BadRequestException(result);
    }

    return result;
  }
}
