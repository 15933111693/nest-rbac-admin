import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateResourceDto } from './dto/create-resource.dto';
import {
  ResourcePagination,
  ReturnResourcePagination,
} from './dto/resource-pagination.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource } from './entities/resource.entity';
import {
  ResourceType,
  _ResourceForeignKeyType,
  _ResourceType,
} from './types/resource.type';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<boolean>;
  async create(createResourceDtos: CreateResourceDto[]): Promise<boolean>;
  async create(
    createResourceDto: CreateResourceDto | CreateResourceDto[],
  ): Promise<boolean> {
    if (createResourceDto instanceof Array) {
      const resources: Resource[] = [];
      for (const dto of createResourceDto) {
        const { api, action, roleIds } = dto;
        const existResource: Resource = await this.validateResource({
          api,
          action,
        });

        if (existResource) {
          throw new HttpException(
            `资源 ${api} ${action} 已经存在`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const resource: Resource = this.resourceRepository.create(dto);

        if (roleIds) {
          resource.roles = await this.roleService.findById(roleIds);
        }

        resources.push(resource);
      }

      const { length } = await this.resourceRepository.save(resources);
      return length === createResourceDto.length;
    } else {
      const { api, roleIds } = createResourceDto;
      const existResource: Resource = await this.validateResource({ api });

      if (existResource) {
        throw new HttpException(`资源 ${api} 已经存在`, HttpStatus.BAD_REQUEST);
      }

      const resource: Resource =
        this.resourceRepository.create(createResourceDto);

      if (roleIds) {
        resource.roles = await this.roleService.findById(roleIds);
      }

      return !!(await this.resourceRepository.save(resource));
    }
  }

  async findByPagination(resourcePagination: ResourcePagination) {
    const { current = 1, size = 10, isAll, data, order } = resourcePagination;

    const queryBuilder: SelectQueryBuilder<Resource> = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.roles', 'roles');

    if (data) {
      const { roleIds } = data;
      delete data.roleIds;

      if (roleIds?.length) {
        queryBuilder.andWhere('roles.id IN (:...roleIds)', { roleIds });
      }

      for (const [key, value] of Object.entries(data)) {
        queryBuilder.andWhere(`resource.${key} like :${key}`, {
          [key]: '%' + value + '%',
        });
      }
    }

    if (order) {
      for (const [key, value] of Object.entries(order)) {
        queryBuilder.addOrderBy(`resource.${key}`, value);
      }
    }

    const total: number = await queryBuilder.getCount();

    if (!isAll) {
      const start: number = (current - 1) * size;
      queryBuilder.take(size).skip(start);
    }

    const list: Array<Resource> = await queryBuilder.getMany();

    return <ReturnResourcePagination>{ list, total };
  }

  async findById(id: string): Promise<Resource>;
  async findById(ids: string[]): Promise<Resource[]>;
  async findById(id: string | string[]): Promise<Resource | Resource[]> {
    if (id instanceof Array) {
      const existResources: Resource[] = [];
      for (const resourceId of id) {
        const existResource = await this.resourceRepository.findOne({
          where: { id: resourceId },
        });
        if (!existResource) {
          throw new HttpException(
            `资源id: ${resourceId} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        }

        existResources.push(existResource);
      }
      return existResources;
    } else {
      const existResource: Resource = await this.resourceRepository.findOne({
        where: { id: id },
      });
      if (!existResource) {
        throw new HttpException(`资源id: ${id} 不存在`, HttpStatus.BAD_REQUEST);
      }
      return existResource;
    }
  }

  async findOneByIdAndForeignKey(
    id: string,
    foreignKey: Array<keyof _ResourceForeignKeyType>,
  ): Promise<Resource> {
    const existResource: Resource = await this.resourceRepository.findOne({
      where: { id },
      relations: foreignKey,
    });

    if (!existResource)
      throw new HttpException(`资源id: ${id} 不存在`, HttpStatus.BAD_REQUEST);

    return existResource;
  }

  async update(updateResourceDto: UpdateResourceDto): Promise<boolean>;
  async update(updateResourceDtos: UpdateResourceDto[]): Promise<boolean>;
  async update(
    updateResourceDto: UpdateResourceDto | UpdateResourceDto[],
  ): Promise<boolean> {
    if (updateResourceDto instanceof Array) {
      const resouces: Resource[] = [];
      for (const dto of updateResourceDto) {
        const { id, roleIds } = dto;
        const existResource = await this.findById(id);

        if (roleIds) {
          delete dto.roleIds;

          existResource.roles = await this.roleService.findById(roleIds);
        }

        Object.assign(existResource, dto);
        resouces.push(existResource);
      }

      const { length } = await this.resourceRepository.save(resouces);
      return length === updateResourceDto.length;
    } else {
      const { id, roleIds } = updateResourceDto;

      const existResource = await this.findById(id);

      if (roleIds) {
        delete updateResourceDto.roleIds;

        existResource.roles = await this.roleService.findById(roleIds);
      }

      Object.assign(existResource, updateResourceDto);

      return !!(await this.resourceRepository.save(existResource));
    }
  }

  async remove(id: string): Promise<boolean>;
  async remove(id: string[]): Promise<boolean>;
  async remove(id: string | string[]): Promise<boolean> {
    if (id instanceof Array) {
      await this.findById(id);

      const { affected } = await this.resourceRepository.delete(id);
      return affected === id.length;
    } else {
      await this.findById(id);

      const { affected } = await this.resourceRepository.delete(id);
      return !!affected;
    }
  }

  async resouceHasRole(
    api: string,
    action: string,
    roles: Role[],
  ): Promise<boolean> {
    const resource: Resource = await this.resourceRepository
      .createQueryBuilder('resource')
      .andWhere('resource.api like :api', { api })
      .andWhere('resource.action like :action', { action })
      .leftJoinAndSelect('resource.roles', 'role')
      .getOne();

    if (!resource) return false;
    return roles.some((role) =>
      resource.roles.some((resourceRole) => resourceRole.id === role.id),
    );
  }

  async validateResource(
    resource: Partial<ResourceType>,
  ): Promise<Resource | null> {
    return await this.resourceRepository.findOne({ where: resource });
  }

  async patchResource(
    newResources: Omit<_ResourceType, 'roles'>[],
    oldResources: Resource[],
  ): Promise<void> {
    const newResourcesMap = new Map<string, Omit<_ResourceType, 'roles'>>();
    const oldResourcesMap = new Map<string, Resource>();

    const hash = (api: string, action: string): string => api + '$' + action;

    for (const { api, action, label } of newResources) {
      newResourcesMap.set(hash(api, action), { api, action, label });
    }

    for (const oldResource of oldResources) {
      oldResourcesMap.set(
        hash(oldResource.api, oldResource.action),
        oldResource,
      );
    }

    const createResouces: CreateResourceDto[] = [];
    const updateResouces: UpdateResourceDto[] = [];
    const deleteResouceIds: string[] = [];

    for (const oldResource of oldResources) {
      const { api, action, id } = oldResource;

      const newResource = newResourcesMap.get(hash(api, action));
      if (newResource) {
        updateResouces.push({ id, ...newResource });
      } else {
        deleteResouceIds.push(id);
      }
    }

    for (const newResource of newResources) {
      const { api, action } = newResource;

      const oldResource = oldResourcesMap.get(hash(api, action));
      if (!oldResource) {
        createResouces.push(newResource);
      }
    }

    if (deleteResouceIds.length) await this.remove(deleteResouceIds);
    if (updateResouces.length) await this.update(updateResouces);
    if (createResouces.length) await this.create(createResouces);
  }
}
