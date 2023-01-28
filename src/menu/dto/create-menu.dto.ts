import { ApiProperty } from '@nestjs/swagger';
import { _MenuType } from '../types/menu.type';

type CreateMenuDtoType = _MenuType & {
  parentRoute?: string;
  childrenRoutes?: string[];
  roleIds?: string[];
};

export class CreateMenuDto implements CreateMenuDtoType {
  @ApiProperty({ description: '路由' })
  route: string;
  @ApiProperty({ description: '页面' })
  viewPath: string;
  @ApiProperty({ description: '名称' })
  name: string;
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
