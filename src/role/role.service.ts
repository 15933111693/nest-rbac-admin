import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ReturnRolePagination,
  RolePagination,
} from './dto/role-pagination.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleType, _RoleForeignKeyType } from './types/role.type';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<boolean>;
  async create(createRoleDto: CreateRoleDto[]): Promise<boolean>;
  async create(
    createRoleDto: CreateRoleDto | CreateRoleDto[],
  ): Promise<boolean> {
    if (createRoleDto instanceof Array) {
      const roleEntitys: Role[] = createRoleDto.map((dto) =>
        this.roleRepository.create(dto),
      );

      for (const role of roleEntitys) {
        if (await this.validateRole({ name: role.name }))
          throw new HttpException(
            `角色名为 ${role.name} 已注册`,
            HttpStatus.BAD_REQUEST,
          );
      }
      const { length } = await this.roleRepository.save(roleEntitys);
      return length === createRoleDto.length;
    } else {
      const roleEntity: Role = this.roleRepository.create(createRoleDto);

      if (await this.validateRole({ name: roleEntity.name }))
        throw new HttpException('该角色名已注册', HttpStatus.BAD_REQUEST);

      return !!(await this.roleRepository.save(roleEntity));
    }
  }

  async findById(id: string): Promise<Role>;
  async findById(ids: string[]): Promise<Role[]>;
  async findById(id: string | string[]): Promise<Role | Role[]> {
    if (id instanceof Array) {
      const existRoles: Role[] = [];
      for (const roleId of id) {
        const existRole: Role = await this.roleRepository.findOne({
          where: { id: roleId },
        });
        if (!existRole)
          throw new HttpException(
            `角色id: ${roleId} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        existRoles.push(existRole);
      }
      return existRoles;
    } else {
      const existRole: Role = await this.roleRepository.findOne({
        where: { id },
      });
      if (!existRole)
        throw new HttpException(`角色id: ${id} 不存在`, HttpStatus.BAD_REQUEST);
      return existRole;
    }
  }

  async findOneByIdAndForeignKey(
    id: string,
    foreignKey: Array<keyof _RoleForeignKeyType>,
  ): Promise<Role> {
    const existRole: Role = await this.roleRepository.findOne({
      where: { id },
      relations: foreignKey,
    });

    if (!existRole)
      throw new HttpException(`角色id: ${id} 不存在`, HttpStatus.BAD_REQUEST);

    return existRole;
  }

  async findByPagination(
    rolePagination: RolePagination,
  ): Promise<ReturnRolePagination> {
    const { current = 1, size = 10, isAll, data, order } = rolePagination;

    const queryBuilder: SelectQueryBuilder<Role> =
      this.roleRepository.createQueryBuilder('role');

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        queryBuilder.andWhere(`role.${key} like :${key}`, {
          [key]: '%' + value + '%',
        });
      }
    }

    if (order) {
      for (const [key, value] of Object.entries(order)) {
        queryBuilder.addOrderBy(`role.${key}`, value);
      }
    }

    const total: number = await queryBuilder.getCount();

    if (!isAll) {
      const start: number = (current - 1) * size;
      queryBuilder.take(size).skip(start);
    }

    const list: Array<Role> = await queryBuilder.getMany();

    return <ReturnRolePagination>{ list, total };
  }

  async update(updateRoleDto: UpdateRoleDto): Promise<boolean>;
  async update(updateRoleDto: UpdateRoleDto[]): Promise<boolean>;
  async update(
    updateRoleDto: UpdateRoleDto | UpdateRoleDto[],
  ): Promise<boolean> {
    if (updateRoleDto instanceof Array) {
      const existRoles: Role[] = [];
      for (const dto of updateRoleDto) {
        const existRole = await this.findById(dto.id);

        existRoles.push(Object.assign(existRole, dto));
      }

      const { length } = await this.roleRepository.save(existRoles);
      return length === updateRoleDto.length;
    } else {
      const existRole = await this.findById(updateRoleDto.id);

      Object.assign(existRole, updateRoleDto);
      return !!(await this.roleRepository.save(existRole));
    }
  }

  async remove(id: string): Promise<boolean>;
  async remove(ids: string[]): Promise<boolean>;
  async remove(id: string | string[]): Promise<boolean> {
    if (id instanceof Array) {
      await this.findById(id);

      const { affected } = await this.roleRepository.delete(id);
      return affected === id.length;
    } else {
      await this.findById(id);

      const { affected } = await this.roleRepository.delete(id);
      return !!affected;
    }
  }

  async validateRole(role: Partial<RoleType>): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: role,
    });
  }
}
