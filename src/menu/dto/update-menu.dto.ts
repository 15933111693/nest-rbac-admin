import { ApiProperty } from '@nestjs/swagger';
import { MenuType } from '../types/menu.type';

type UpdateMenuDtoType = Partial<
  Omit<
    MenuType,
    'createdAt' | 'updatedAt' | 'parent' | 'children' | 'roles'
  > & {
    parentRoute?: string;
    childrenRoutes?: string[];
    roleIds?: string[];
  }
>;

export class UpdateMenuDto implements UpdateMenuDtoType {
  @ApiProperty({ description: 'id' })
  id: string;
  @ApiProperty({ description: '路由', required: false })
  route?: string;
  @ApiProperty({ description: '页面', required: false })
  viewPath?: string;
  @ApiProperty({ description: '名称', required: false })
  name?: string;
  @ApiProperty({ description: '角色id', isArray: true, required: false })
  roleIds?: string[];
  @ApiProperty({ description: '父节点路由', required: false })
  parentRoute?: string;
  @ApiProperty({
    description: '子节点路由',
    isArray: true,
    required: false,
  })
  childrenRoutes?: string[];
}
