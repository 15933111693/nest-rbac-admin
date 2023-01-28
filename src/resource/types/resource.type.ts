import { BaseEntityType } from 'src/common/entities/types/base-entity.type';
import { RoleType } from 'src/role/types/role.type';

export type ActionType = 'get' | 'post' | 'patch' | 'romove';

export type _ResourceType = {
  api: string;
  action: ActionType;
  label: string;
};

export type _ResourceForeignKeyType = {
  roles: RoleType[];
};

export type ResourceType = _ResourceType &
  BaseEntityType &
  _ResourceForeignKeyType;
