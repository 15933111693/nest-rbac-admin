import { INestApplication } from '@nestjs/common';
import { Role } from './role/entities/role.entity';
import { RoleService } from './role/role.service';
import { User } from './user/entities/user.entity';
import { UserService } from './user/user.service';

export async function setupInitAdmin(app: INestApplication): Promise<void> {
  const roleService: RoleService = app.get<RoleService>(RoleService);

  const existRootRole: Role = await roleService.validateRole({ name: 'root' });

  if (!existRootRole) {
    await roleService.create({ name: 'root', label: '超级管理员' });
  }

  const userService: UserService = app.get<UserService>(UserService);

  const existAdminUser: User = await userService.validateUser({
    username: 'admin',
  });

  if (!existAdminUser) {
    await userService.create({
      username: 'admin',
      password: '123456',
      roleIds: [(await roleService.validateRole({ name: 'root' })).id],
    });
  }
}
