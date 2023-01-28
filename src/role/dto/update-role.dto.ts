import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../types/role.type';

type UpdateRoleDtoType = Partial<
  Omit<
    RoleType,
    'createdAt' | 'updatedAt' | 'users' | 'permissions' | 'menus' | 'resouces'
  > & { permissionIds?: string[]; menuIds?: string[] }
>;

export class UpdateRoleDto implements UpdateRoleDtoType {
  @ApiProperty({ description: 'id' })
  id: string;
  @ApiProperty({ description: '角色名', required: false })
  name?: string;
  @ApiProperty({ description: '描述', required: false })
  label?: string;
}
