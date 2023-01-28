import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base-entity';
import { Role } from 'src/role/entities/role.entity';
import { Entity, Column, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import { UserType } from '../types/user.type';

@Entity('user')
export class User extends BaseEntity implements UserType {
  @ApiProperty()
  @Column()
  username: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ nullable: true })
  nickname?: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty()
  @Column({ nullable: true })
  email?: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone?: string;

  @ManyToMany((type) => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @BeforeInsert()
  setNickname() {
    if (!this.nickname) this.nickname = this.username;
  }
}
