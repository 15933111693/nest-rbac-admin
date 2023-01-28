import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserPagination } from './dto/user-pagination.dto';
import { AuthGuard, IsPublic } from 'src/common/guard/auth.guard';
import { LoginDto } from './dto/login.dto';
import { RoleGuard } from 'src/common/guard/role.guard';

@ApiTags('用户')
@Controller('user')
@UseGuards(AuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '用户登录' })
  @IsPublic()
  @Post('login')
  login(@Body() user: LoginDto) {
    return this.userService.login(user);
  }

  @ApiOperation({ summary: '注册用户' })
  @ApiBearerAuth()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '返回用户信息' })
  @ApiBearerAuth()
  @Get('userinfo')
  getUserInfo(@Req() request) {
    return request.user;
  }

  @ApiOperation({ summary: '批量注册用户' })
  @ApiBearerAuth()
  @ApiBody({ isArray: true, type: CreateUserDto })
  @Post('batch')
  batchCreate(@Body() createUserDto: CreateUserDto[]) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '分页查询用户' })
  @ApiBearerAuth()
  @Post('pagination')
  pagination(@Body() userPagination: UserPagination) {
    return this.userService.findByPagination(userPagination);
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiBearerAuth()
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @ApiOperation({ summary: '批量更新用户' })
  @ApiBearerAuth()
  @ApiBody({ isArray: true, type: UpdateUserDto })
  @Patch('batch')
  batchUpdate(@Body() updateUserDto: UpdateUserDto[]) {
    return this.userService.update(updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: '批量删除用户' })
  @ApiBearerAuth()
  @ApiParam({ name: 'ids', type: 'array' })
  @Delete('batch/:ids')
  batchRemove(@Param('ids') ids: string) {
    return this.userService.remove(ids.split(','));
  }
}
