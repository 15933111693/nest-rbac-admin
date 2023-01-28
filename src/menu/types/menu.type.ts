import { BaseEntityType } from 'src/common/entities/types/base-entity.type';
import { RoleType } from '../../role/types/role.type';

export type _MenuType = {
  route: string;
  viewPath: string;
  name: string;
};

export type _MenuForeignKey = {
  roles: RoleType[];
};

export type MenuType = _MenuType &
  BaseEntityType &
  _MenuForeignKey & { parent: MenuType; children: MenuType[] };
