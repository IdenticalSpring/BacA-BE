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
    console.log('--- WsAuthGuard is running ---');
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // Check both lowercase and uppercase Authorization header
    let authHeader = client.handshake.headers.authorization || client.handshake.headers['Authorization'];
    
    // Handle case where header might be an array
    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }
    
    const token = authHeader ? (typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined) : undefined;

    console.log('Token from client:', token);

    if (!token) {
      console.error('Guard Error: No token provided');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      });
      console.log('Guard Success: Token verified, payload:', payload);
      client.handshake.auth.user = {
        userId: payload.userId,
        role: payload.role,
      };
      return true;
    } catch (e) {
      console.error('Guard Error: Token verification failed.', e.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
