import { ApiProperty } from '@nestjs/swagger';
import { ActionType, _ResourceType } from '../types/resource.type';

type CreateResourceDtoType = Omit<_ResourceType, 'roles'> & {
  roleIds?: string[];
};
export class CreateResourceDto implements CreateResourceDtoType {
  @ApiProperty({ description: 'api' })
  api: string;
  @ApiProperty({ description: '方法' })
  action: ActionType;
  @ApiProperty({ description: 'api描述' })
  label: string;
  @ApiProperty({ description: '角色id', required: false, isArray: true })
  roleIds?: string[];
}
