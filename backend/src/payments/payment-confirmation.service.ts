import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { PaymentMessage, PaymentResult } from 'src/mpesa/types';

function isPaymentMessage(obj: unknown): obj is PaymentMessage {
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;
  return typeof record.status === 'string';
}

const MPESA_ERROR_MESSAGES: Record<string, string> = {
  '1037': 'Could not reach your phone. Try again.',
  '1025': 'System error. Please try again.',
  '9999': 'Unknown error. Try again.',
  '1032': 'You cancelled the request.',
  '1': 'Insufficient balance. Top up or use Fuliza.',
  '2001': 'Invalid PIN. Try again.',
  '1019': 'Transaction expired. Try again.',
  '1001': 'Another transaction is in progress. Please wait.',
};

@Injectable()
export class PaymentConfirmationService implements OnModuleDestroy {
  private subscriber: Redis;

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    this.subscriber = this.redis.duplicate();
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.quit();
  }

  async waitForPayment(checkoutRequestId: string): Promise<PaymentResult> {
    // Mark the payment as pending in Redis
    await this.redis.set(checkoutRequestId, 'PENDING', 'EX', 300);
    const channel = `payment:${checkoutRequestId}`;

    // Wait until subscription to the channel is complete
    await this.subscriber.subscribe(channel);

    return new Promise<PaymentResult>((resolve, reject) => {
      const handler = (_ch: string, message: string) => {
        if (_ch !== channel) return;

        void (async () => {
          try {
            const parsed: unknown = JSON.parse(message);

            if (!isPaymentMessage(parsed)) {
              throw new Error('Invalid payment message');
            }

            // Clean up Redis and unsubscribe
            await this.redis.del(checkoutRequestId);
            await this.subscriber.unsubscribe(channel);
            this.subscriber.removeListener('message', handler);

            if (parsed.status === 'success' && parsed.result) {
              resolve(parsed.result);
            } else {
              reject(new Error(parsed.error ?? 'Payment failed'));
            }
          } catch (err) {
            reject(err as Error);
          }
        })();
      };

      this.subscriber.on('message', handler);
    });
  }

  async completePayment(
    checkoutRequestId: string,
    result: PaymentResult,
  ): Promise<void> {
    const message: PaymentMessage = { status: 'success', result };
    await this.redis.publish(
      `payment:${checkoutRequestId}`,
      JSON.stringify(message),
    );
  }

  async failPayment(checkoutRequestId: string, err: Error): Promise<void> {
    const code = err.message.trim();
    const customMessage = MPESA_ERROR_MESSAGES[code] ?? `Payment failed`;
    console.log({ error: err.message });

    const message: PaymentMessage = { status: 'failed', error: customMessage };
    await this.redis.publish(
      `payment:${checkoutRequestId}`,
      JSON.stringify(message),
    );
  }
}
