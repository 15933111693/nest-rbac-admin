import { forwardRef, Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { RoleModule } from 'src/role/role.module';
import { JWTMODULE } from 'src/app.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => JWTMODULE),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
