import { forwardRef, Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { RoleModule } from 'src/role/role.module';
import { JWTMODULE } from 'src/app.module';
import { ResourceModule } from 'src/resource/resource.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => ResourceModule),
    forwardRef(() => JWTMODULE),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
