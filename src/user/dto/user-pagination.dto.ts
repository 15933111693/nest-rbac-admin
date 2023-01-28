import { ApiProperty } from '@nestjs/swagger';
import {
  Order,
  PaginationType,
  ReturnPaginationType,
} from 'src/common/types/pagination.type';
import { User } from '../entities/user.entity';
import { _UserType } from '../types/user.type';

type FindUserDtoType = Partial<
  Omit<_UserType, 'password' | 'avatar' | 'roles'>
>;
type OrderUserDtoType = Partial<Record<keyof FindUserDtoType, Order>>;
type UserPaginationType = PaginationType<FindUserDto, OrderUserDto>;
type ReturnUserPaginationType = ReturnPaginationType<User>;

class FindUserDto implements FindUserDtoType {
  @ApiProperty({ description: '用户名', required: false })
  username?: string;
  @ApiProperty({ description: '昵称', required: false })
  nickname?: string;
  @ApiProperty({ description: '邮箱', required: false })
  email?: string;
  @ApiProperty({ description: '手机号', required: false })
  phone?: string;
  @ApiProperty({ description: '角色', required: false, isArray: true })
  roleIds?: string[];
}

class OrderUserDto implements OrderUserDtoType {
  @ApiProperty({ description: '用户名顺序', required: false, enum: Order })
  username?: Order;
  @ApiProperty({ description: '昵称顺序', required: false, enum: Order })
  nickname?: Order;
  @ApiProperty({ description: '邮箱顺序', required: false, enum: Order })
  email?: Order;
  @ApiProperty({ description: '手机号顺序', required: false, enum: Order })
  phone?: Order;
  @ApiProperty({ description: '角色顺序', required: false, enum: Order })
  roles?: Order;
}

export class UserPagination implements UserPaginationType {
  @ApiProperty({ description: '数据', type: FindUserDto, required: false })
  data?: FindUserDto;

  @ApiProperty({ description: '排序方式', type: OrderUserDto, required: false })
  order?: OrderUserDto;

  @ApiProperty({ description: '当前页数', required: false })
  current?: number;

  @ApiProperty({ description: '每页多少条', required: false })
  size?: number;

  @ApiProperty({ description: '是否返回全部', required: false })
  isAll?: boolean;
}

export class ReturnUserPagination implements ReturnUserPaginationType {
  @ApiProperty({ description: '用户数据' })
  list: User[];

  @ApiProperty({ description: '总条数' })
  total: number;
}
