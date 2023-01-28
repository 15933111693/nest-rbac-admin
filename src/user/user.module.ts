import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RoleModule } from 'src/role/role.module';
import { JWTMODULE } from 'src/app.module';
import { forwardRef } from '@nestjs/common/utils';
import { ResourceModule } from 'src/resource/resource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => JWTMODULE),
    forwardRef(() => RoleModule),
    forwardRef(() => ResourceModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
