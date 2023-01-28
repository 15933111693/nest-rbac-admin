import { ApiProperty } from '@nestjs/swagger';
import { ActionType, ResourceType } from '../types/resource.type';

type UpdateResourceDtoType = Partial<
  Omit<ResourceType, 'createdAt' | 'updatedAt' | 'roles'> & {
    roleIds: string[];
  }
>;

export class UpdateResourceDto implements UpdateResourceDtoType {
  @ApiProperty({ description: 'id' })
  id: string;
  @ApiProperty({ description: 'id', required: false })
  api?: string;
  @ApiProperty({ description: 'id', required: false })
  action?: ActionType;
  @ApiProperty({ description: 'id', required: false })
  label?: string;
  @ApiProperty({ description: 'id', isArray: true, required: false })
  roleIds?: string[];
}
