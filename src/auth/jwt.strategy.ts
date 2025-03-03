import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Lấy token từ header
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key', // ✅ Đảm bảo secret trùng với auth.module.ts
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT Payload:', payload); // Debug log
    return { userId: payload.userId, username: payload.username };
  }
}
