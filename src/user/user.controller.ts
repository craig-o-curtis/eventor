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
} from "@nestjs/common";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { UserService } from "./user.service.js";
import { slidingWindow, detectBot, validateEmail, WithArcjetRules } from "@arcjet/nest";
import { ROLE } from "../common/constants/roles.js";

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
  constructor(private readonly userService: UserService) {}

  // GET /user
  @Get()
  @AllowAnonymous()
  getUsers(@Query("name") name: string) {
    return this.userService.findAllUsers(name);
  }

  // GET /user/:id
  @Get(":id")
  @AllowAnonymous()
  getUserById(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  // POST /user
  @Post()
  @Roles([ROLE.ADMIN])
  @WithArcjetRules([rateLimitRule, botRule, emailRule])
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // PUT /user/:id
  @Put(":id")
  @Roles([ROLE.ADMIN])
  updateUser(
    @Param("id", ParseIntPipe)
    id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  // DELETE
  @Delete(":id")
  @Roles([ROLE.ADMIN])
  deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
