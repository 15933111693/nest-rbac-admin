import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolePagination } from './dto/role-pagination.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@ApiTags('角色')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '添加角色' })
  @Post()
  create(@Body() createUserDto: CreateRoleDto) {
    return this.roleService.create(createUserDto);
  }

  @ApiOperation({ summary: '分页查询角色' })
  @Post('pagination')
  pagination(@Body() rolePagination: RolePagination) {
    return this.roleService.findByPagination(rolePagination);
  }

  @ApiOperation({ summary: '更新角色' })
  @Patch()
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @ApiOperation({ summary: '删除角色' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: '批量删除角色' })
  @ApiParam({ name: 'ids', type: 'array' })
  @Delete('batch/:ids')
  batchRemove(@Param('ids') ids: string) {
    return this.roleService.remove(ids.split(','));
  }
}
