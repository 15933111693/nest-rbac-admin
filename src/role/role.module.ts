import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionModule } from 'src/permission/permission.module';
import { MenuModule } from 'src/menu/menu.module';
import { JWTMODULE } from 'src/app.module';
import { ResourceModule } from 'src/resource/resource.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => UserModule),
    forwardRef(() => PermissionModule),
    forwardRef(() => MenuModule),
    forwardRef(() => ResourceModule),
    forwardRef(() => JWTMODULE),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
