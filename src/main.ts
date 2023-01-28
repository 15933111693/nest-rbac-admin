import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { setupInitAdmin } from './setup-initAdmin';
import { setupRbacRoute } from './setup-rbac-route';
import { setupSwagger } from './setup-swagger';

const SERVER_PORT = process.env.SERVER_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.PREFIX);

  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new ApiTransformInterceptor());

  setupSwagger(app);
  setupInitAdmin(app);
  await app.listen(SERVER_PORT);

  setupRbacRoute(app);

  const serverUrl = await app.getUrl();
  console.log(`api服务已经启动,请访问: ${serverUrl}${process.env.PREFIX}`);
  console.log(
    `API文档已生成,请访问: ${serverUrl}/${process.env.SWAGGER_PATH}/`,
  );
}
bootstrap();
