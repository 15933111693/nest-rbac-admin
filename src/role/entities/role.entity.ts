import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base-entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Resource } from 'src/resource/entities/resource.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { RoleType } from '../types/role.type';

@Entity('role')
export class Role extends BaseEntity implements RoleType {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  label: string;

  @ApiProperty()
  @ManyToMany((type) => User, (user) => user.roles)
  users: User[];

  @ApiProperty()
  @ManyToMany((type) => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Permission[];

  @ApiProperty()
  @ManyToMany((type) => Menu, (menu) => menu.roles)
  @JoinTable()
  menus: Menu[];

  @ApiProperty()
  @ManyToMany((type) => Resource, (resource) => resource.roles)
  @JoinTable()
  resources: Resource[];
}
