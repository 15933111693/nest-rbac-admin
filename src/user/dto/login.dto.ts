import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export type LoginDtoType = Pick<User, 'username' | 'password'>;

export class LoginDto implements LoginDtoType {
  @ApiProperty({ description: '用户名' })
  username: string;
  @ApiProperty({ description: '密码' })
  password: string;
}
