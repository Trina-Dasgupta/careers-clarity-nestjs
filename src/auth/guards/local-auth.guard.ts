import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err:string , user:any, info:any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
