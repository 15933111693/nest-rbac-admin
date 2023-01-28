import { BaseEntityType } from 'src/common/entities/types/base-entity.type';
import { RoleType } from '../../role/types/role.type';

export type _UserType = {
  username: string;
  password: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
};

export type _UserForeignKeyType = {
  roles?: RoleType[];
};

export type UserType = _UserType & BaseEntityType & _UserForeignKeyType;
