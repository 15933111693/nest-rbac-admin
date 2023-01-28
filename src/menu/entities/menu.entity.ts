import { BaseEntity } from 'src/common/entities/base-entity';
import { Role } from 'src/role/entities/role.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { MenuType } from '../types/menu.type';

@Entity('menu')
export class Menu extends BaseEntity implements MenuType {
  @Column()
  route: string;

  @Column({ name: 'view_path' })
  viewPath: string;

  @Column()
  name: string;

  @ManyToMany((type) => Role, (role) => role.menus)
  roles: Role[];

  @ManyToOne((type) => Menu, (menu) => menu.children, { onDelete: 'CASCADE' })
  parent: Menu;

  @OneToMany((type) => Menu, (menu) => menu.parent)
  children: Menu[];
}
