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
import { IsNull, Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { PatchMenuOldType } from './dto/patch-menu.dto,';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { MenuType } from './types/menu.type';

// route要唯一, 前端返回 a-a1-a11 式route并对应其相应的menu结构
@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private menuRepository: Repository<Menu>,
    @Inject(forwardRef(() => RoleService)) private roleService: RoleService,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<boolean>;
  async create(createMenuDtos: CreateMenuDto[]): Promise<boolean>;
  async create(
    createMenuDto: CreateMenuDto | CreateMenuDto[],
  ): Promise<boolean> {
    if (createMenuDto instanceof Array) {
      const menus: Menu[] = [];

      for (const dto of createMenuDto) {
        const { route, viewPath, name, roleIds, parentRoute, childrenRoutes } =
          dto;
        const existMenu: Menu = await this.validateMenu({ route });

        if (existMenu) {
          throw new HttpException(
            `菜单路径 ${route} 已存在`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const menu: Menu = this.menuRepository.create({
          route,
          viewPath,
          name,
        });

        if (roleIds) {
          menu.roles = await this.roleService.findById(roleIds);
        }

        if (parentRoute) {
          menu.parent = await this.findByRoute(parentRoute);
        }

        if (childrenRoutes) {
          menu.children = await this.findByRoute(childrenRoutes);
        }

        menus.push(menu);
      }

      const { length } = await this.menuRepository.save(menus);
      return length === menus.length;
    } else {
      const { route, viewPath, name, roleIds, parentRoute, childrenRoutes } =
        createMenuDto;
      const existMenu: Menu = await this.validateMenu({ route });

      if (existMenu) {
        throw new HttpException(
          `菜单路径 ${route} 已存在`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const menu: Menu = this.menuRepository.create({
        route,
        viewPath,
        name,
      });

      if (roleIds) {
        menu.roles = await this.roleService.findById(roleIds);
      }

      if (parentRoute) {
        menu.parent = await this.findByRoute(parentRoute);
      }

      if (childrenRoutes) {
        menu.children = await this.findByRoute(childrenRoutes);
      }

      return !!this.menuRepository.save(menu);
    }
  }

  async findAll() {
    return this.menuRepository.find();
  }

  async findTree(): Promise<Menu[]> {
    const root: Menu[] = await this.menuRepository.find({
      where: { parent: IsNull() },
      relations: ['parent', 'children', 'roles'],
    });

    const dfs = async (node: Menu): Promise<void> => {
      const { children } = node;

      if (children) {
        for (const child of children) {
          const menu: Menu = await this.menuRepository.findOne({
            where: { id: child.id },
            relations: ['parent', 'children', 'roles'],
          });
          child.parent = menu.parent;
          child.children = menu.children;

          dfs(child);
        }
      }
    };

    for (const menu of root) await dfs(menu);
    return root;
  }

  async findByRoles(roleIds: string[]): Promise<Menu[]>;
  async findByRoles(roles: Role[]): Promise<Menu[]>;
  async findByRoles(_roles: string[] | Role[]): Promise<Menu[]> {
    let roles: Role[];
    if (_roles[0] instanceof Role) roles = _roles as Role[];
    else roles = await this.roleService.findById(_roles as string[]);

    const allMenus: Menu[] = await this.menuRepository.find({
      relations: ['roles', 'parent', 'children'],
    });
    const menus: Menu[] = [];

    for (const menu of allMenus) {
      if (
        menu.roles.some((menuRole) =>
          roles.some((userRole) => menuRole.id === userRole.id),
        )
      ) {
        menus.push(menu);
      }
    }

    return menus;
  }

  async findById(id: string): Promise<Menu>;
  async findById(ids: string[]): Promise<Menu[]>;
  async findById(id: string | string[]): Promise<Menu | Menu[]> {
    if (id instanceof Array) {
      const existMenus: Menu[] = [];
      for (const menuId of id) {
        const existMenu: Menu = await this.menuRepository.findOne({
          where: { id: menuId },
        });
        if (!existMenu)
          throw new HttpException(
            `菜单项id: ${menuId} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        existMenus.push(existMenu);
      }
      return existMenus;
    } else {
      const existMenu: Menu = await this.menuRepository.findOne({
        where: { id },
      });
      if (!existMenu)
        throw new HttpException('该菜单项id不存在', HttpStatus.BAD_REQUEST);
      return existMenu;
    }
  }

  async findByRoute(route: string): Promise<Menu>;
  async findByRoute(routes: string[]): Promise<Menu[]>;
  async findByRoute(route: string | string[]): Promise<Menu | Menu[]> {
    if (route instanceof Array) {
      const existMenus: Menu[] = [];
      for (const menuRoute of route) {
        const existMenu: Menu = await this.menuRepository.findOne({
          where: { route: menuRoute },
        });
        if (!existMenu)
          throw new HttpException(
            `菜单项路由: ${menuRoute} 不存在`,
            HttpStatus.BAD_REQUEST,
          );
        existMenus.push(existMenu);
      }
      return existMenus;
    } else {
      const existMenu: Menu = await this.menuRepository.findOne({
        where: { route },
      });
      if (!existMenu)
        throw new HttpException('该菜单项路由不存在', HttpStatus.BAD_REQUEST);
      return existMenu;
    }
  }

  async update(updateMenuDto: UpdateMenuDto): Promise<boolean>;
  async update(updateMenuDtos: UpdateMenuDto[]): Promise<boolean>;
  async update(
    updateMenuDto: UpdateMenuDto | UpdateMenuDto[],
  ): Promise<boolean> {
    if (updateMenuDto instanceof Array) {
      await this.findById(updateMenuDto.map(({ id }) => id));

      const existMenus: Menu[] = [];

      for (const dto of updateMenuDto) {
        const { id, roleIds, parentRoute, childrenRoutes } = dto;

        const existMenu: Menu = await this.findById(id);

        if (roleIds) {
          delete dto.roleIds;
          existMenu.roles = await this.roleService.findById(roleIds);
        }

        if (parentRoute) {
          delete dto.parentRoute;
          existMenu.parent = await this.findByRoute(parentRoute);
        }

        if (childrenRoutes) {
          delete dto.childrenRoutes;
          existMenu.children = await this.findByRoute(childrenRoutes);
        }

        existMenus.push(Object.assign(existMenu, dto));
      }

      const { length } = await this.menuRepository.save(existMenus);
      return length === updateMenuDto.length;
    } else {
      const { id, roleIds, parentRoute, childrenRoutes } = updateMenuDto;
      const existMenu: Menu = await this.findById(id);

      if (roleIds) {
        delete updateMenuDto.roleIds;
        existMenu.roles = await this.roleService.findById(roleIds);
      }

      if (parentRoute) {
        delete updateMenuDto.parentRoute;
        existMenu.parent = await this.findByRoute(parentRoute);
      }

      if (childrenRoutes) {
        delete updateMenuDto.childrenRoutes;
        existMenu.children = await this.findByRoute(childrenRoutes);
      }

      return !!(await this.menuRepository.save(
        Object.assign(existMenu, updateMenuDto),
      ));
    }
  }

  async remove(id: string): Promise<boolean>;
  async remove(ids: string[]): Promise<boolean>;
  async remove(id: string | string[]): Promise<boolean> {
    if (id instanceof Array) {
      await this.findById(id);

      const { affected } = await this.menuRepository.delete(id);
      return affected === id.length;
    } else {
      await this.findById(id);

      const { affected } = await this.menuRepository.delete(id);
      return !!affected;
    }
  }

  async validateMenu(menu: Partial<MenuType>): Promise<Menu | null> {
    const existMenu: Menu = await this.menuRepository.findOne({
      where: menu,
    });

    return existMenu ? existMenu : null;
  }

  async patch(
    newMenus: PatchMenuOldType[],
    oldMenus: Menu[],
  ): Promise<boolean> {
    const newMenusMap = new Map<string, PatchMenuOldType>();
    const oldMenusMap = new Map<string, Menu>();

    for (const newMenu of newMenus) {
      newMenusMap.set(newMenu.route, newMenu);
    }

    for (const oldMenu of oldMenus) {
      oldMenusMap.set(oldMenu.route, oldMenu);
    }

    const createMenus: CreateMenuDto[] = [];
    const updateMenus: UpdateMenuDto[] = [];
    const deleteMenuIds: string[] = [];

    for (const oldMenu of oldMenus) {
      const { route, id } = oldMenu;

      const newMenu = newMenusMap.get(route);
      if (newMenu) {
        updateMenus.push({
          id,
          ...newMenu,
        });
      } else {
        deleteMenuIds.push(id);
      }
    }

    for (const newMenu of newMenus) {
      const { route } = newMenu;

      const oldMenu = oldMenusMap.get(route);
      if (!oldMenu) {
        createMenus.push(newMenu);
      }
    }

    if (deleteMenuIds.length) await this.remove(deleteMenuIds);
    if (createMenus.length) await this.create(createMenus);
    if (updateMenus.length) await this.update(updateMenus);

    return true;
  }
}
