import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';


@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL')!;
        return new Redis(redisUrl);
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
