import { Controller, Get, Query, Param, Body, Post,  Put, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // GET /user
    @Get()
    getUsers(@Query('name') name: string) {
        return this.userService.findAllUsers(name);
    }

    // GET /user/:id
    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.userService.findUserById(parseInt(id));
    }

    // POST /user
    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto.name);
    }

    // PUT /user/:id
    @Put(':id')
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(parseInt(id), updateUserDto);
    }

    // DELETE
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(parseInt(id));
    }

}
