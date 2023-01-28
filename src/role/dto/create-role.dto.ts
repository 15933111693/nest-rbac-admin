import { ApiProperty } from '@nestjs/swagger';
import { _RoleType } from '../types/role.type';

type CreateRoleDtoType = Omit<
  _RoleType,
  'users' | 'permissions' | 'menus' | 'resources'
>;

export class CreateRoleDto implements CreateRoleDtoType {
  @ApiProperty({ description: '角色名' })
  name: string;
  @ApiProperty({ description: '描述' })
  label: string;
}
