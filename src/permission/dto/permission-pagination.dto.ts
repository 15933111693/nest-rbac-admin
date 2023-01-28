import { ApiProperty } from '@nestjs/swagger';
import {
  Order,
  PaginationType,
  ReturnPaginationType,
} from 'src/common/types/pagination.type';
import { Permission } from '../entities/permission.entity';
import { _PermissionType } from '../types/permission.type';

type FindPermissionDtoType = Partial<
  Omit<_PermissionType, 'roles'> & { roleIds: string[] }
>;
type OrderPermissionDtoType = Partial<
  Record<keyof FindPermissionDtoType, Order>
>;
type PermissionPaginationType = PaginationType<
  FindPermissionDto,
  OrderPermissionDto
>;
type ReturnPermissionPaginationType = ReturnPaginationType<Permission>;

class FindPermissionDto implements FindPermissionDtoType {
  @ApiProperty({ description: '权限名称', required: false })
  name?: string;
  @ApiProperty({ description: '权限描述', required: false })
  label?: string;
  @ApiProperty({
    description: '权限所拥有的角色id',
    required: false,
    isArray: true,
  })
  roleIds?: string[];
}

class OrderPermissionDto implements OrderPermissionDtoType {
  @ApiProperty({ description: '权限名称顺序', required: false, enum: Order })
  name?: Order;
  @ApiProperty({ description: '权限描述顺序', required: false, enum: Order })
  label?: Order;
  @ApiProperty({
    description: '权限所拥有的角色id顺序',
    required: false,
    enum: Order,
  })
  roleIds?: Order;
}

export class PermissionPagination implements PermissionPaginationType {
  @ApiProperty({
    description: '数据',
    type: FindPermissionDto,
    required: false,
  })
  data?: FindPermissionDto;

  @ApiProperty({
    description: '排序方式',
    type: OrderPermissionDto,
    required: false,
  })
  order?: OrderPermissionDto;

  @ApiProperty({ description: '当前页数', required: false })
  current?: number;

  @ApiProperty({ description: '每页多少条', required: false })
  size?: number;

  @ApiProperty({ description: '是否返回全部', required: false })
  isAll?: boolean;
}

export class ReturnPermissionPagination
  implements ReturnPermissionPaginationType
{
  @ApiProperty({ description: '用户数据' })
  list: Permission[];

  @ApiProperty({ description: '总条数' })
  total: number;
}
