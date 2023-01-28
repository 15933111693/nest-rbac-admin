import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../types/user.type';

type UpdateUserDtoType = Partial<
  Omit<UserType, 'password' | 'createdAt' | 'updatedAt' | 'roles'>
>;

export class UpdateUserDto implements UpdateUserDtoType {
  @ApiProperty({ description: 'id' })
  id: string;
  @ApiProperty({ description: '用户名', required: false })
  username?: string;
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
