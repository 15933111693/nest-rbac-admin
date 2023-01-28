import { ApiProperty } from '@nestjs/swagger';
import {
  Order,
  PaginationType,
  ReturnPaginationType,
} from 'src/common/types/pagination.type';
import { Role } from '../entities/role.entity';
import { _RoleType } from '../types/role.type';

type FindRoleDtoType = Partial<
  Omit<_RoleType, 'users' | 'menus' | 'permissions'>
>;
type OrderRoleDtoType = Partial<Record<keyof FindRoleDtoType, Order>>;
type RolePaginationType = PaginationType<FindRoleDto, OrderRoleDto>;
type ReturnRolePaginationType = ReturnPaginationType<Role>;

class FindRoleDto implements FindRoleDtoType {
  @ApiProperty({ description: '角色名', required: false })
  name?: string;
  @ApiProperty({ description: '角色描述', required: false })
  label?: string;
}

class OrderRoleDto implements OrderRoleDtoType {
  @ApiProperty({ description: '角色名顺序', required: false, enum: Order })
  name?: Order;
  @ApiProperty({ description: '角色描述顺序', required: false, enum: Order })
  label?: Order;
}

export class RolePagination implements RolePaginationType {
  @ApiProperty({ description: '数据', type: FindRoleDto, required: false })
  data?: FindRoleDto;

  @ApiProperty({ description: '排序方式', type: OrderRoleDto, required: false })
  order?: OrderRoleDto;

  @ApiProperty({ description: '当前页数', required: false })
  current?: number;

  @ApiProperty({ description: '每页多少条', required: false })
  size?: number;

  @ApiProperty({ description: '是否返回全部', required: false })
  isAll?: boolean;
}

export class ReturnRolePagination implements ReturnRolePaginationType {
  @ApiProperty({ description: '用户数据' })
  list: Role[];

  @ApiProperty({ description: '总条数' })
  total: number;
}
