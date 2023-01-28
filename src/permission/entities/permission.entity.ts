import { BaseEntity } from 'src/common/entities/base-entity';
import { Role } from 'src/role/entities/role.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { PermissionType } from '../types/permission.type';

@Entity('permission')
export class Permission extends BaseEntity implements PermissionType {
  @Column()
  name: string;

  @Column()
  label: string;

  @ManyToMany((type) => Role, (role) => role.permissions)
  roles: Role[];
}
