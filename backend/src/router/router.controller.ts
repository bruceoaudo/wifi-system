import { Controller, Get, Query } from '@nestjs/common';
import { MikrotikRouterService } from './router.service';

@Controller('mikrotik')
export class MikrotikRouterController {
  constructor(private readonly mikrotikService: MikrotikRouterService) {}

  @Get('whitelist')
  async whitelist(@Query('mac') mac: string, @Query('ip') ip: string) {
    return await this.mikrotikService.whitelistUser(mac, ip);
  }

  @Get('blacklist')
  async blacklist(@Query('mac') mac: string, @Query('ip') ip: string) {
    return await this.mikrotikService.blacklistUser(mac, ip);
  }
}
