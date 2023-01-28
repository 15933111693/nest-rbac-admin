import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/permission/entities/permission.entity';
import { _PermissionType } from 'src/permission/types/permission.type';

export type PatchPermissionOldType = _PermissionType;

export type PatchPermissionDtoType = {
  list: PatchPermissionOldType[];
};

export class PatchPermissionDto implements PatchPermissionDtoType {
  @ApiProperty({
    description: '前端对比更新权限列表',
    isArray: true,
    type: Permission,
  })
  list: PatchPermissionOldType[];
}
