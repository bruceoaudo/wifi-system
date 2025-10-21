import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RouterOSAPI } from 'node-routeros';

@Injectable()
export class MikrotikRouterService {
  private client: RouterOSAPI;

  constructor() {
    this.client = new RouterOSAPI({
      host: process.env.ROUTER_HOST || '192.168.88.1',
      user: process.env.ROUTER_USER || 'admin',
      password: process.env.ROUTER_PASSWORD || '12345',
      port: Number(process.env.ROUTER_PORT) || 8728,
    });
  }

  private async ensureConnected() {
    if (!this.client.connected) {
      await this.client.connect();
    }
  }

  async whitelistUser(mac: string, ip: string) {
    try {
      await this.ensureConnected();

      // Remove existing entries for the IP
      await this.client.write('/ip/firewall/address-list/remove', [
        `?address=${ip}`,
      ]);

      // Add to whitelist
      await this.client.write('/ip/firewall/address-list/add', [
        '=list=whitelist',
        `=address=${ip}`,
        `=comment=MAC:${mac}`,
      ]);

      return { success: true, message: `Whitelisted ${ip}` };
    } catch (err) {
      console.error('Whitelist error:', err);
      throw new InternalServerErrorException('Failed to whitelist user');
    }
  }

  async blacklistUser(mac: string, ip: string) {
    try {
      await this.ensureConnected();

      // Remove from whitelist first
      await this.client.write('/ip/firewall/address-list/remove', [
        `?address=${ip}`,
      ]);

      // Add to blacklist
      await this.client.write('/ip/firewall/address-list/add', [
        '=list=blacklist',
        `=address=${ip}`,
        `=comment=MAC:${mac}`,
      ]);

      return { success: true, message: `Blacklisted ${ip}` };
    } catch (err) {
      console.error('Blacklist error:', err);
      throw new InternalServerErrorException('Failed to blacklist user');
    }
  }
}
