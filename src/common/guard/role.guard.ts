import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ResourceService } from 'src/resource/resource.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private resourceService: ResourceService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const IsPublic = this.reflector.get('IsPublic', context.getHandler());
    if (IsPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) throw new UnauthorizedException('请先登录');

    // 管理员直接放行
    if (user.roles.some((role) => role.name === 'root')) return true;

    const expressRequest = context.switchToHttp().getRequest<Request>();

    const api = expressRequest.route.path;
    const action = Object.entries(expressRequest.route.methods)[0][0];

    if (!(await this.resourceService.resouceHasRole(api, action, user.roles)))
      throw new UnauthorizedException('该资源您没有访问权限');

    return true;
  }
}
