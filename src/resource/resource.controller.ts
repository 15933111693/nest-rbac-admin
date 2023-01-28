import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResourcePagination } from './dto/resource-pagination.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

@ApiTags('资源')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @ApiOperation({ summary: '增加资源' })
  @Post()
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto);
  }

  @ApiOperation({ summary: '分页查询资源' })
  @Post('pagination')
  findByPagination(@Body() resourcePagination: ResourcePagination) {
    return this.resourceService.findByPagination(resourcePagination);
  }

  @ApiOperation({ summary: '修改资源' })
  @Patch()
  update(@Body() updateResourceDto: UpdateResourceDto) {
    return this.resourceService.update(updateResourceDto);
  }

  @ApiOperation({ summary: '移除资源' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }

  @ApiOperation({ summary: '批量移除资源' })
  @ApiParam({ name: 'ids', type: 'array' })
  @Delete('batch/:ids')
  batchRemove(@Param('ids') ids: string) {
    return this.resourceService.remove(ids.split(','));
  }
}
