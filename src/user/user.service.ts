import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleService } from 'src/role/role.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ReturnUserPagination,
  UserPagination,
} from './dto/user-pagination.dto';
import { User } from './entities/user.entity';
import { UserType, _UserForeignKeyType } from './types/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(RoleService) private roleService: RoleService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    // const { username, password } = user;

    const existUser = await this.validateUser(loginDto);

    if (!existUser)
      throw new HttpException('账号或密码错误', HttpStatus.BAD_REQUEST);

    const user: User = await this.findById(existUser.id);

    const token = this.jwtService.sign({ id: user.id });

    return { token };
  }

  async create(createUserDto: CreateUserDto): Promise<boolean>;
  async create(createUserDto: CreateUserDto[]): Promise<boolean>;
  async create(
    createUserDto: CreateUserDto | CreateUserDto[],
  ): Promise<boolean> {
    if (createUserDto instanceof Array) {
      const userEntitys: User[] = [];

      for (const dto of createUserDto) {
        const userEntity: User = this.userRepository.create(dto);
        userEntity.roles = await this.roleService.findById(dto.roleIds);
        userEntitys.push(userEntity);
      }

      for (const user of userEntitys) {
        if (await this.validateUser({ username: user.username }))
          throw new HttpException(
            `用户名为 ${user.username} 已注册`,
            HttpStatus.BAD_REQUEST,
          );
      }

      const { length } = await this.userRepository.save(userEntitys);
      return length === createUserDto.length;
    } else {
      const userEntity: User = this.userRepository.create(createUserDto);

      if (await this.validateUser({ username: userEntity.username }))
        throw new HttpException('该用户名已注册', HttpStatus.BAD_REQUEST);

      userEntity.roles = await this.roleService.findById(createUserDto.roleIds);

      return !!(await this.userRepository.save(userEntity));
    }
  }

  async findById(id: string): Promise<User>;
  async findById(ids: string[]): Promise<User[]>;
  async findById(id: string | string[]): Promise<User | User[]> {
    if (id instanceof Array) {
      const existUsers: User[] = [];
      for (const userId of id) {
        const existUser: User = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (!existUser)
          throw new HttpException(
            `用户id: ${userId} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        existUsers.push(existUser);
      }
      return existUsers;
    } else {
      const existUser: User = await this.userRepository.findOne({
        where: { id },
      });
      if (!existUser)
        throw new HttpException('该用户id不存在', HttpStatus.BAD_REQUEST);
      return existUser;
    }
  }

  async findOneByIdAndForeignKey(
    id: string,
    foreignKey: Array<keyof _UserForeignKeyType>,
  ): Promise<User> {
    const existUser: User = await this.userRepository.findOne({
      where: { id },
      relations: foreignKey,
    });

    if (!existUser)
      throw new HttpException(`用户id: ${id} 不存在`, HttpStatus.BAD_REQUEST);

    return existUser;
  }

  async findByPagination(
    userPagination: UserPagination,
  ): Promise<ReturnUserPagination> {
    const { current = 1, size = 10, isAll, data, order } = userPagination;

    const queryBuilder: SelectQueryBuilder<User> = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    if (data) {
      const { roleIds } = data;
      delete data.roleIds;

      if (roleIds?.length) {
        queryBuilder.andWhere('roles.id IN (:...roleIds)', { roleIds });
      }

      for (const [key, value] of Object.entries(data)) {
        queryBuilder.andWhere(`user.${key} like :${key}`, {
          [key]: '%' + value + '%',
        });
      }
    }

    if (order) {
      for (const [key, value] of Object.entries(order)) {
        queryBuilder.addOrderBy(`user.${key}`, value);
      }
    }

    const total: number = await queryBuilder.getCount();

    if (!isAll) {
      const start: number = (current - 1) * size;
      queryBuilder.take(size).skip(start);
    }

    const list: Array<User> = await queryBuilder.getMany();

    return <ReturnUserPagination>{ list, total };
  }

  async update(updateUserDto: UpdateUserDto): Promise<boolean>;
  async update(updateUserDto: UpdateUserDto[]): Promise<boolean>;
  async update(
    updateUserDto: UpdateUserDto | UpdateUserDto[],
  ): Promise<boolean> {
    if (updateUserDto instanceof Array) {
      const existUsers: User[] = [];
      for (const dto of updateUserDto) {
        const { roleIds, id } = dto;

        const existUser = await this.findById(id);

        if (roleIds) {
          delete dto.roleIds;
          existUser.roles = await this.roleService.findById(roleIds);
        }

        existUsers.push(Object.assign(existUser, dto));
      }

      const { length } = await this.userRepository.save(existUsers);
      return length === updateUserDto.length;
    } else {
      const { id, roleIds } = updateUserDto;

      const existUser = await this.findById(id);

      if (roleIds) {
        delete updateUserDto.roleIds;
        existUser.roles = await this.roleService.findById(roleIds);
      }

      Object.assign(existUser, updateUserDto);
      return !!(await this.userRepository.save(existUser));
    }
  }

  async remove(id: string): Promise<boolean>;
  async remove(ids: string[]): Promise<boolean>;
  async remove(id: string | string[]): Promise<boolean> {
    if (id instanceof Array) {
      await this.findById(id);

      const { affected } = await this.userRepository.delete(id);
      return affected === id.length;
    } else {
      await this.findById(id);

      const { affected } = await this.userRepository.delete(id);
      return !!affected;
    }
  }

  async validateUser(user: Partial<UserType>): Promise<User | null> {
    return await this.userRepository.findOne({
      where: user,
    });
  }
}
