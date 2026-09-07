import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateInput, DefaultModelRow } from "@prisma/orm-postgres/orm-client";
import type { Contract } from "../prisma/contract.js";
import { PrismaService } from "../lib/database/prisma.service.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

type User = DefaultModelRow<Contract, "User", "public">;
type CreateUserInput = CreateInput<Contract, "User", "public">;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers(name: string = ""): Promise<User[]> {
    if (name) {
      return this.prisma.db.orm.public.User.where({ name })
        .orderBy((user) => user.createdAt.asc())
        .all();
    }
    return this.prisma.db.orm.public.User.orderBy((user) => user.createdAt.asc()).all();
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.prisma.db.orm.public.User.where({ id }).first();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.prisma.db.orm.public.User.create(data);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    await this.findUserById(id); // throws if not found
    const updated = await this.prisma.db.orm.public.User.where({ id }).update(data);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await this.findUserById(id); // throws if not found
    await this.prisma.db.orm.public.User.where({ id }).delete();
  }
}
