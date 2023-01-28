import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

export const IsPublic = () => SetMetadata('IsPublic', true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const IsPublic = this.reflector.get('IsPublic', context.getHandler());
    if (IsPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization']?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('您没有权限');

    const { id: userId } = await this.jwtService.verify(token);
    const user: User = await this.userService.findOneByIdAndForeignKey(userId, [
      'roles',
    ]);

    // 扔到req上
    const req = context.switchToHttp().getRequest();
    req.user = user;

    return true;
  }
}
