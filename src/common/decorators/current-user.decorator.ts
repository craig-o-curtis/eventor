import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestUser } from "../interfaces/request-user.interface.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as RequestUser;
  },
);
