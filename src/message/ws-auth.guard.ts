// src/message/ws-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('--- WsAuthGuard is running ---'); // Log 1
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.headers.authorization?.split(' ')[1];

    console.log('Token from client:', token); // Log 2

    if (!token) {
      console.error('Guard Error: No token provided'); // Log lỗi
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secretKey', // Đảm bảo secret key khớp
      });
      console.log('Guard Success: Token verified, payload:', payload); // Log 3
      client.handshake.auth.user = {
        userId: payload.userId,
        role: payload.role,
      };
      return true;
    } catch (e) {
      console.error('Guard Error: Token verification failed.', e.message); // Log lỗi chi tiết
      throw new UnauthorizedException('Invalid token');
    }
  }
}
