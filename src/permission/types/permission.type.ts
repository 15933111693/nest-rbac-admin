import { BaseEntityType } from 'src/common/entities/types/base-entity.type';
import { RoleType } from 'src/role/types/role.type';

export type _PermissionType = {
  name: string;
  label: string;
};

export type _PermissionForeignKey = {
  roles: RoleType[];
};

export type PermissionType = _PermissionType &
  BaseEntityType &
  _PermissionForeignKey;
