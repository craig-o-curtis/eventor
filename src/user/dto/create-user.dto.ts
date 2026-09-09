import { IsEmail, IsOptional, IsString } from "class-validator";
import { ROLE, type Role } from "../../common/constants/roles.js";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  role?: Role = ROLE.USER;
}
