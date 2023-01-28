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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PatchMenuDto } from './dto/patch-menu.dto,';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@ApiTags('菜单')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '创建菜单' })
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({ summary: '获取树形结构菜单' })
  @Get('tree')
  findTree() {
    return this.menuService.findTree();
  }

  @ApiOperation({ summary: '返回用户所拥有的菜单' })
  @Get('findByRoles')
  findByRoles(@Req() req) {
    return this.menuService.findByRoles(req.user.roles);
  }

  @ApiOperation({ summary: '更新菜单' })
  @Patch()
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({ summary: '批量更新菜单' })
  @ApiBody({ isArray: true, type: UpdateMenuDto })
  @Patch('batch')
  batchUpdate(@Body() updateMenuDto: UpdateMenuDto[]) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({ summary: '删除菜单' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id as any);
  }

  @ApiOperation({ summary: '批量删除菜单' })
  @ApiParam({ name: 'ids', type: 'array' })
  @Delete('batch/:ids')
  batchRemove(@Param('ids') ids: string) {
    return this.menuService.remove(ids.split(','));
  }

  @ApiOperation({ summary: '保持与前端菜单对齐' })
  @Patch('patch')
  async patchMenu(@Body() data: PatchMenuDto) {
    return await this.menuService.patch(
      data.list,
      await this.menuService.findAll(),
    );
  }
}
