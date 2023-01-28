import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from './menu/menu.module';
import { PermissionModule } from './permission/permission.module';
import { ResourceModule } from './resource/resource.module';
import { AuthGuard } from './common/guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

export const JWTMODULE = JwtModule.registerAsync({
  useFactory: async () => {
    console.log(process.env.JWT_EXPIRES_IN);
    return {
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    };
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        autoLoadEntities: true,
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.PORT),
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    RoleModule,
    MenuModule,
    PermissionModule,
    ResourceModule,
  ],
  // providers: [
  //   {
  //     useClass: AuthGuard,
  //     provide: APP_GUARD,
  //   },
  // ],
})
export class AppModule {}
