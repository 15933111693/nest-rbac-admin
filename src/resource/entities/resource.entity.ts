import { BaseEntity } from 'src/common/entities/base-entity';
import { Role } from 'src/role/entities/role.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { ActionType, ResourceType } from '../types/resource.type';

@Entity('resource')
export class Resource extends BaseEntity implements ResourceType {
  @Column()
  api: string;
  @Column()
  label: string;
  @Column()
  action: ActionType;
  @ManyToMany((type) => Role, (role) => role.resources)
  roles: Role[];
}
