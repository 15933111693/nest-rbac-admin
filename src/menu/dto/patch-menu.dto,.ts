import { ApiProperty } from '@nestjs/swagger';
import { Menu } from '../entities/menu.entity';
import { _MenuType } from '../types/menu.type';

export type PatchMenuOldType = _MenuType & {
  parentRoute?: string;
  childrenRoutes?: string[];
};

export type PatchMenuDtoType = {
  list: PatchMenuOldType[];
};

export class PatchMenuDto implements PatchMenuDtoType {
  @ApiProperty({
    description: '前端对比更新菜单列表',
    isArray: true,
    type: Menu,
  })
  list: PatchMenuOldType[];
}
