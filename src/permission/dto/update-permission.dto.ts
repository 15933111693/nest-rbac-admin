import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../types/permission.type';

type UpdatePermissionDtoType = Partial<
  Omit<PermissionType, 'createdAt' | 'updatedAt' | 'roles'> & {
    roleIds?: string[];
  }
>;

export class UpdatePermissionDto implements UpdatePermissionDtoType {
  @ApiProperty()
  id: string;
  @ApiProperty({ description: '名字', required: false })
  name?: string;
  @ApiProperty({ description: '描述', required: false })
  label?: string;
  @ApiProperty({ description: '对应角色的id', isArray: true, required: false })
  roleIds?: string[];
}
