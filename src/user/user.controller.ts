import {
  ParseIntPipe,
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";
import { RoleGuard } from "../guards/role.guard";
import { ARCJET, ArcjetNest, slidingWindow, detectBot, validateEmail } from "@arcjet/nest";
import type { Request } from "express";

const rateLimitRule = slidingWindow({
  mode: "DRY_RUN",
  interval: 60,
  max: 100,
});

const botRule = detectBot({
  mode: "DRY_RUN",
  allow: [],
});

const emailRule = validateEmail({
  mode: "DRY_RUN",
  deny: ["DISPOSABLE", "FREE"],
});

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  // GET /user
  @Get()
  async getUsers(@Req() req: Request, @Query("name") name: string) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule);
    const decision = await protect.protect(req, {});

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
      }
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      }
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.findAllUsers(name);
  }

  // GET /user/:id
  @Get(":id")
  async getUserById(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule);
    const decision = await protect.protect(req, {});

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
      }
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      }
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.findUserById(id);
  }

  // POST /user
  @Post()
  @UseGuards(RoleGuard)
  async createUser(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule).withRule(emailRule);
    const decision = await protect.protect(req, { email: createUserDto.email });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
      }
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      }
      if (decision.reason.isEmail()) {
        throw new HttpException("Invalid or disallowed email", HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.createUser(createUserDto);
  }

  // PUT /user/:id
  @Put(":id")
  @UseGuards(RoleGuard)
  async updateUser(
    @Req() req: Request,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule);
    const decision = await protect.protect(req, {});

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
      }
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      }
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.updateUser(id, updateUserDto);
  }

  // DELETE
  @Delete(":id")
  @UseGuards(RoleGuard)
  async deleteUser(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule);
    const decision = await protect.protect(req, {});

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
      }
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      }
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.deleteUser(id);
  }
}
