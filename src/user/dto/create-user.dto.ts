import { ApiProperty } from '@nestjs/swagger';
import { _UserType } from '../types/user.type';

type CreateUserDtoType = Omit<_UserType, 'roles'>;

export class CreateUserDto implements CreateUserDtoType {
  @ApiProperty({ description: '用户名' })
  username: string;
  @ApiProperty({ description: '密码' })
  password: string;
  @ApiProperty({ description: '昵称', required: false })
  nickname?: string;
  @ApiProperty({ description: '头像', required: false })
  avatar?: string;
  @ApiProperty({ description: '邮箱', required: false })
  email?: string;
  @ApiProperty({ description: '手机号', required: false })
  phone?: string;
  @ApiProperty({ description: '角色', required: false, isArray: true })
  roleIds?: string[];
}
