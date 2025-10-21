import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  MpesaAuthResponse,
  MpesaErrorResponse,
  StkPushResponse,
} from './types';
import { Buffer } from 'node:buffer';
import { ConfigService } from '@nestjs/config';
import { CustomerInfoService } from './customer-info.service';
import axios, { AxiosError } from 'axios';

@Injectable()
export class MpesaService {
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortcode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;

  constructor(
    private configService: ConfigService,
    private customerInfo: CustomerInfoService,
  ) {
    this.consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY')!;
    this.consumerSecret = this.configService.get<string>(
      'MPESA_CONSUMER_SECRET',
    )!;
    this.shortcode = this.configService.get<string>('MPESA_SHORTCODE')!;
    this.passkey = this.configService.get<string>('MPESA_PASSKEY')!;
    this.callbackUrl = this.configService.get<string>('MPESA_CALLBACK_URL')!;
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove spaces, dashes, and other non-digit characters
    let normalized = phoneNumber.replace(/[^0-9]/g, '');

    if (normalized.startsWith('0')) {
      // 07XXXXXXXX → 2547XXXXXXXX
      normalized = '254' + normalized.substring(1);
    } else if (normalized.startsWith('254')) {
      // Already in correct format
      return normalized;
    }

    return normalized;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString('base64');
    try {
      const res = await axios.get<MpesaAuthResponse>(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );
      return res.data.access_token;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error('Error getting MPESA access token', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new InternalServerErrorException();
    }
  }

  private handleStkPushError(error: MpesaErrorResponse) {
    const errorCode = error?.response?.data?.errorCode;
    const errorMessage = error?.response?.data?.errorMessage;

    switch (errorCode) {
      case '1032': // User cancelled / Invalid PIN
        if (errorMessage?.toLowerCase().includes('cancel')) {
          throw new BadRequestException('Transaction cancelled by user');
        } else {
          throw new UnauthorizedException('Invalid Mpesa PIN');
        }

      case '1': // Insufficient funds
        throw new BadRequestException('Insufficient funds in MPesa account');

      case '1037': // Timeout
        throw new RequestTimeoutException(
          'User did not respond to MPesa prompt',
        );

      case '400.002.02': // Invalid MSISDN
        if (errorMessage?.includes('not on')) {
          throw new BadRequestException('Phone number not registered on MPesa');
        }

        throw new BadRequestException(errorMessage);

      case '2001': // Transaction limit exceeded
        throw new BadRequestException('Transaction limit exceeded');

      case '500':
      default:
        throw new ServiceUnavailableException(
          'MPesa service is unavailable, try again later',
        );
    }
  }

  async stkPush(
    userId: number,
    phone: string,
    amount: number,
    duration: string,
    accountReference: string,
    transactionDesc: string,
  ): Promise<StkPushResponse> {
    const token = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`,
    ).toString('base64');

    const normalizedPhone = this.normalizePhoneNumber(phone);

    let amnt = 1

    try {
      const result = await axios.post<StkPushResponse>(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: parseFloat(amnt.toString()).toString(),
          PartyA: normalizedPhone,
          PartyB: this.shortcode,
          PhoneNumber: normalizedPhone,
          CallBackURL: this.callbackUrl,
          AccountReference: accountReference,
          TransactionDesc: transactionDesc,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Store info linked to the unique transaction ID for the callback.
      this.customerInfo.set(
        result.data.CheckoutRequestID,
        userId,
        accountReference,
        duration,
      );
      return result.data;
    } catch (error) {
      this.handleStkPushError(error);
      throw error;
    }
  }
}
