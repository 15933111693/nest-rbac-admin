import { ApiProperty } from '@nestjs/swagger';
import { _PermissionType } from 'src/permission/types/permission.type';

type CreatePermissionDtoType = Omit<
  _PermissionType & { roleIds?: string[] },
  'roles'
>;

export class CreatePermissionDto implements CreatePermissionDtoType {
  @ApiProperty({ description: '名字' })
  name: string;
  @ApiProperty({ description: '描述' })
  label: string;
  @ApiProperty({ description: '对应角色的id', isArray: true, required: false })
  roleIds?: string[];
}
