import { BaseEntityType } from 'src/common/entities/types/base-entity.type';
import { MenuType } from 'src/menu/types/menu.type';
import { PermissionType } from 'src/permission/types/permission.type';
import { ResourceType } from 'src/resource/types/resource.type';
import { UserType } from 'src/user/types/user.type';

export type _RoleType = {
  name: string;
  label: string;
};

export type _RoleForeignKeyType = {
  users: UserType[];
  permissions: PermissionType[];
  menus: MenuType[];
  resources: ResourceType[];
};

export type RoleType = _RoleType & BaseEntityType & _RoleForeignKeyType;
