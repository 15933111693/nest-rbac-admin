import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PatchPermissionDto } from './dto/patch-permission.dto';
import { PermissionPagination } from './dto/permission-pagination.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@ApiTags('权限')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: '创建权限' })
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @ApiOperation({ summary: '分页返回权限' })
  @Post('pagination')
  findAll(@Body() permissionPagination: PermissionPagination) {
    return this.permissionService.findByPagination(permissionPagination);
  }

  @ApiOperation({ summary: '返回用户所有权限' })
  @Get('findByRoles')
  findByRoles(@Req() req) {
    return this.permissionService.findByRoles(req.user.roles);
  }

  @ApiOperation({ summary: '更新权限' })
  @Patch()
  update(@Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(updatePermissionDto);
  }

  @ApiOperation({ summary: '删除权限' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @ApiOperation({ summary: '批量删除权限' })
  @ApiParam({ name: 'ids', type: 'array' })
  @Delete('batch/:ids')
  batchRemove(@Param('ids') ids: string) {
    return this.permissionService.remove(ids.split(','));
  }

  @ApiOperation({ summary: '保持与前端权限对齐' })
  @Patch('patch')
  async patch(@Body() data: PatchPermissionDto) {
    return await this.permissionService.patch(
      data.list,
      await this.permissionService.findAll(),
    );
  }
}
