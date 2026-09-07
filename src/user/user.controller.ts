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
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { UserService } from "./user.service.js";
import { RoleGuard } from "../guards/role.guard.js";
import { slidingWindow, detectBot, validateEmail, WithArcjetRules } from "@arcjet/nest";

const _rateLimitRule = slidingWindow({
  mode: "DRY_RUN",
  interval: 60,
  max: 100,
});

const _botRule = detectBot({
  mode: "DRY_RUN",
  allow: [],
});

const emailRule = validateEmail({
  mode: "DRY_RUN",
  deny: ["DISPOSABLE", "FREE"],
});

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user
  @Get()
  getUsers(@Query("name") name: string) {
    return this.userService.findAllUsers(name);
  }

  // GET /user/:id
  @Get(":id")
  getUserById(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  // POST /user
  @Post()
  @UseGuards(RoleGuard)
  @WithArcjetRules([emailRule])
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // PUT /user/:id
  @Put(":id")
  @UseGuards(RoleGuard)
  updateUser(
    @Param("id", ParseIntPipe)
    id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  // DELETE
  @Delete(":id")
  @UseGuards(RoleGuard)
  deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
