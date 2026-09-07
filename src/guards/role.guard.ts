import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../lib/database/prisma.service.js";
import type { RequestUser } from "../common/interfaces/request-user.interface.js";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { user?: RequestUser } = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException("Authentication required");
    }

    const user = await this.prisma.db.orm.public.User.where({ id: userId }).first();

    if (!user || user.role !== "ADMIN") {
      throw new UnauthorizedException("You are not authorized to access this resource");
    }

    return true;
  }
}
