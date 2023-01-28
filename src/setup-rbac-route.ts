import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ResourceService } from './resource/resource.service';
import { _ResourceType, ActionType } from './resource/types/resource.type';

function replaceBrackets(str) {
  return str.replace(/{([^}]+)}/g, ':$1');
}

export async function setupRbacRoute(app: INestApplication): Promise<void> {
  const paths: PathsObject = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().build(),
  ).paths;

  const newResources: Omit<_ResourceType, 'roles'>[] = [];

  for (const [_api, actions] of Object.entries(paths)) {
    const api = replaceBrackets(_api);
    for (const [action, value] of Object.entries(actions)) {
      const label = value.summary;
      newResources.push({ api, action: <ActionType>action, label });
    }
  }
  console.log(`共有 ${newResources.length} 个后端资源`);

  const resouceService: ResourceService =
    app.get<ResourceService>(ResourceService);

  const oldResources = (
    await resouceService.findByPagination({
      isAll: true,
    })
  ).list;

  await resouceService.patchResource(newResources, oldResources);
}
