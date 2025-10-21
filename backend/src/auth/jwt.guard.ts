import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { IS_AUTHENTICATED_KEY } from './auth.decorator';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get metadata from the route handler or class to determine if auth is required.
    const requireAuthenticated =
      this.reflector.get<boolean>(IS_AUTHENTICATED_KEY, context.getHandler()) ??
      this.reflector.get<boolean>(IS_AUTHENTICATED_KEY, context.getClass());

    if (!requireAuthenticated) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.access_token as string;

    if (!token)
      throw new UnauthorizedException('Unauthorized. Please log in again.');

    try {
      const payload = this.authService.verifyAccessToken(token);

      const user = await this.userService.userExists(
        payload.sub as unknown as string,
      );

      if (!user) {
        throw new UnauthorizedException('User does not exist.');
      }

      request['user'] = user;

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      } else {
        throw new InternalServerErrorException(
          'Something went wrong. Try again later.',
        );
      }
    }
  }
}
