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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PatchPermissionOldType } from './dto/patch-permission.dto';
import {
  PermissionPagination,
  ReturnPermissionPagination,
} from './dto/permission-pagination.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionType } from './types/permission.type';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @Inject(forwardRef(() => RoleService)) private roleService: RoleService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<boolean>;
  async create(createPermissionDto: CreatePermissionDto[]): Promise<boolean>;
  async create(
    createPermissionDto: CreatePermissionDto | CreatePermissionDto[],
  ): Promise<boolean> {
    if (createPermissionDto instanceof Array) {
      const permissions: Permission[] = [];

      for (const dto of createPermissionDto) {
        const { name, roleIds } = dto;

        if (await this.validatePermission({ name })) {
          throw new HttpException('该权限已存在', HttpStatus.BAD_REQUEST);
        }

        const permission: Permission = this.permissionRepository.create(dto);

        if (roleIds) {
          permission.roles = await this.roleService.findById(roleIds);
        }

        permissions.push(permission);
      }

      const { length } = await this.permissionRepository.save(permissions);
      return length === createPermissionDto.length;
    } else {
      const { name, roleIds } = createPermissionDto;

      if (await this.validatePermission({ name })) {
        throw new HttpException('该权限已存在', HttpStatus.BAD_REQUEST);
      }

      const permission: Permission =
        this.permissionRepository.create(createPermissionDto);

      if (roleIds) {
        permission.roles = await this.roleService.findById(roleIds);
      }

      return !!(await this.permissionRepository.save(permission));
    }
  }

  async findAll() {
    return await this.permissionRepository.find();
  }

  async findByPagination(resourcePagination: PermissionPagination) {
    const { current = 1, size = 10, isAll, data, order } = resourcePagination;

    const queryBuilder: SelectQueryBuilder<Permission> =
      this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.roles', 'roles');

    if (data) {
      const { roleIds } = data;
      delete data.roleIds;

      if (roleIds?.length) {
        queryBuilder.andWhere('roles.id IN (:...roleIds)', { roleIds });
      }

      for (const [key, value] of Object.entries(data)) {
        queryBuilder.andWhere(`permission.${key} like :${key}`, {
          [key]: '%' + value + '%',
        });
      }
    }

    if (order) {
      for (const [key, value] of Object.entries(order)) {
        queryBuilder.addOrderBy(`permission.${key}`, value);
      }
    }

    const total: number = await queryBuilder.getCount();

    if (!isAll) {
      const start: number = (current - 1) * size;
      queryBuilder.take(size).skip(start);
    }

    const list: Array<Permission> = await queryBuilder.getMany();

    return <ReturnPermissionPagination>{ list, total };
  }

  async findByRoles(roleIds: string[]): Promise<string[]>;
  async findByRoles(roles: Role[]): Promise<string[]>;
  async findByRoles(_roles: string[] | Role[]): Promise<string[]> {
    let roles: Role[];
    if (_roles[0] instanceof Role) roles = _roles as Role[];
    else roles = await this.roleService.findById(_roles as string[]);

    const permissionSet: Set<string> = new Set();

    for (const role of roles) {
      role.permissions.forEach(({ name }) => permissionSet.add(name));
    }

    return [...permissionSet];
  }

  async findById(id: string): Promise<Permission>;
  async findById(ids: string[]): Promise<Permission[]>;
  async findById(id: string | string[]): Promise<Permission | Permission[]> {
    if (id instanceof Array) {
      const existPermissions: Permission[] = [];
      for (const permissionId of id) {
        const existPermission: Permission =
          await this.permissionRepository.findOne({
            where: { id: permissionId },
          });
        if (!existPermission)
          throw new HttpException(
            `权限id: ${permissionId} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        existPermissions.push(existPermission);
      }
      return existPermissions;
    } else {
      const existPermission: Permission =
        await this.permissionRepository.findOne({
          where: { id },
        });
      if (!existPermission)
        throw new HttpException('该权限id不存在', HttpStatus.BAD_REQUEST);
      return existPermission;
    }
  }

  async update(updatePermissionDto: UpdatePermissionDto): Promise<boolean>;
  async update(updatePermissionDtos: UpdatePermissionDto[]): Promise<boolean>;
  async update(
    updatePermissionDto: UpdatePermissionDto | UpdatePermissionDto[],
  ): Promise<boolean> {
    if (updatePermissionDto instanceof Array) {
      const existPermissions: Permission[] = [];

      for (const dto of updatePermissionDto) {
        const { id, roleIds } = dto;
        const existPermission: Permission = await this.findById(id);

        if (roleIds) {
          delete dto.roleIds;

          existPermission.roles = await this.roleService.findById(roleIds);
        }

        Object.assign(existPermission, dto);
        existPermissions.push(existPermission);
      }

      const { length } = await this.permissionRepository.save(existPermissions);
      return length === updatePermissionDto.length;
    } else {
      const { id, roleIds } = updatePermissionDto;
      const existPermission: Permission = await this.findById(id);

      if (roleIds) {
        delete updatePermissionDto.roleIds;

        existPermission.roles = await this.roleService.findById(roleIds);
      }

      Object.assign(existPermission, updatePermissionDto);
      return !!(await this.permissionRepository.save(existPermission));
    }
  }

  async remove(id: string): Promise<boolean>;
  async remove(ids: string[]): Promise<boolean>;
  async remove(id: string | string[]): Promise<boolean> {
    if (id instanceof Array) {
      await this.findById(id);

      const { affected } = await this.permissionRepository.delete(id);
      return affected === id.length;
    } else {
      await this.findById(id);

      const { affected } = await this.permissionRepository.delete(id);
      return !!affected;
    }
  }

  async validatePermission(
    permission: Partial<PermissionType>,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: permission });
  }

  async patch(
    newPermissions: PatchPermissionOldType[],
    oldPermissions: Permission[],
  ): Promise<boolean> {
    const newPermissionsMap = new Map<string, PatchPermissionOldType>();
    const oldPermissionsMap = new Map<string, Permission>();

    for (const { name, label } of newPermissions) {
      newPermissionsMap.set(name, { name, label });
    }

    for (const oldPermission of oldPermissions) {
      oldPermissionsMap.set(oldPermission.name, oldPermission);
    }

    const createPermissions: CreatePermissionDto[] = [];
    const updatePermissions: UpdatePermissionDto[] = [];
    const deletePermissionIds: string[] = [];

    for (const oldPermission of oldPermissions) {
      const { name, id } = oldPermission;

      const newPermission = newPermissionsMap.get(name);
      if (newPermission) {
        updatePermissions.push({ id, ...newPermission });
      } else {
        deletePermissionIds.push(id);
      }
    }

    for (const newPermission of newPermissions) {
      const { name } = newPermission;

      const oldPermission = oldPermissionsMap.get(name);
      if (!oldPermission) {
        createPermissions.push(newPermission);
      }
    }

    if (deletePermissionIds.length) await this.remove(deletePermissionIds);
    if (updatePermissions.length) await this.update(updatePermissions);
    if (createPermissions.length) await this.create(createPermissions);

    return true;
  }
}
