import { Controller, Get, Query, Param, Body, Post, Patch } from '@nestjs/common';

@Controller('user')
export class UserController {
    // GET /user
    @Get()
    getUsers(@Query('name') name: string) {
        const users = [
            {id: 1, name: 'Guy Dudeman'},
            {id: 2, name: 'Lady Bird'},
        ]

        if (name) {
            return users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
        }

        return users;
    }

    // GET /user/:id
    @Get(':id')
    getUserById(@Param('id') id: string) {
        const users = [
            {id: 1, name: 'Guy Dudeman'},
            {id: 2, name: 'Lady Bird'},
        ]
        
        return users.find(user => user.id === parseInt(id));
    }

    // POST /user
    @Post()
    createUser(@Body() user: { name: string }) {
        const newUser = {
            id: Math.floor(Math.random() * 1000), // Random ID for demonstration
            name: user.name,
        };

        // In a real application, you would save the new user to a database here
        return newUser;
    }

    // PATCH /user/:id
    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() user: { name: string }) {
        const users = [
            {id: 1, name: 'Guy Dudeman'},
            {id: 2, name: 'Lady Bird'},
        ];

        const existingUser = users.find(user => user.id === parseInt(id));
        if (existingUser) {
            existingUser.name = user.name;
            return existingUser;
        }

        return { message: 'User not found' };
    }

}
