import { Module } from '@nestjs/common';
import { MikrotikRouterService } from './router.service';
import { MikrotikRouterController } from './router.controller';

@Module({
  providers: [MikrotikRouterService],
  exports: [MikrotikRouterService],
  controllers: [MikrotikRouterController],
})
export class MikrotikRouterModule {}