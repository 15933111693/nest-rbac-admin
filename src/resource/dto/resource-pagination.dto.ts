import { ApiProperty } from '@nestjs/swagger';
import {
  Order,
  PaginationType,
  ReturnPaginationType,
} from 'src/common/types/pagination.type';
import { Resource } from '../entities/resource.entity';
import { ActionType, _ResourceType } from '../types/resource.type';

type FindResourceDtoType = Partial<
  Omit<_ResourceType, 'roles'> & { roleIds: string[] }
>;
type OrderResourceDtoType = Partial<Record<keyof FindResourceDtoType, Order>>;
type ResourcePaginationType = PaginationType<FindResourceDto, OrderResourceDto>;
type ReturnResourcePaginationType = ReturnPaginationType<Resource>;

class FindResourceDto implements FindResourceDtoType {
  @ApiProperty({ description: '资源名称', required: false })
  api?: string;
  @ApiProperty({ description: '资源提交方法', required: false })
  action?: ActionType;
  @ApiProperty({ description: '资源描述', required: false })
  label?: string;
  @ApiProperty({
    description: '资源所拥有的角色id',
    required: false,
    isArray: true,
  })
  roleIds?: string[];
}

class OrderResourceDto implements OrderResourceDtoType {
  @ApiProperty({ description: '资源名称顺序', required: false, enum: Order })
  api?: Order;
  @ApiProperty({
    description: '资源提交方法顺序',
    required: false,
    enum: Order,
  })
  action?: Order;
  @ApiProperty({ description: '资源描述顺序', required: false, enum: Order })
  label?: Order;
  @ApiProperty({
    description: '资源所拥有的角色id顺序',
    required: false,
    enum: Order,
  })
  roleIds?: Order;
}

export class ResourcePagination implements ResourcePaginationType {
  @ApiProperty({ description: '数据', type: FindResourceDto, required: false })
  data?: FindResourceDto;

  @ApiProperty({
    description: '排序方式',
    type: OrderResourceDto,
    required: false,
  })
  order?: OrderResourceDto;

  @ApiProperty({ description: '当前页数', required: false })
  current?: number;

  @ApiProperty({ description: '每页多少条', required: false })
  size?: number;

  @ApiProperty({ description: '是否返回全部', required: false })
  isAll?: boolean;
}

export class ReturnResourcePagination implements ReturnResourcePaginationType {
  @ApiProperty({ description: '用户数据' })
  list: Resource[];

  @ApiProperty({ description: '总条数' })
  total: number;
}
