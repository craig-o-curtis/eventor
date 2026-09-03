import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from './user.interface';
import { UserLoggerService } from './user.logger.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly logger: UserLoggerService) {
        this.logger.log('UserService initialized');
    }
    private users: User[] = [
        { id: 1, name: 'Guy Dudeman' },
        { id: 2, name: 'Lady Bird' },
    ]

    findAllUsers(name: string = ''): User[] {
        this.logger.log(`Finding users${name ? `with name ${name}`:''}`);
        if (name) {
            return this.users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
        }
        return this.users;
    }

    findUserById(id: number): User | undefined {
        this.logger.log(`Finding user with id ${id}`);

        const user = this.users.find(user => user.id === id);
        if (!user) {
            this.logger.error(`User with id ${id} not found`);
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return user;
    }

    createUser(name: string): User {
        const newUser = { id: this.users.length + 1, name };
        this.users = [
            ...this.users,
            newUser
        ]
        return newUser;
    }

    updateUser(id: number, user: UpdateUserDto): UpdateUserDto | undefined {
        const existingUser = this.findUserById(id);

        if (!existingUser) {
            this.logger.error(`User with id ${id} not found`);
            throw new NotFoundException(`User with id ${id} not found`);
        }

        this.users = this.users.map(u => u.id === id ? { ...u, ...user } : u);
        this.logger.log(`Updated user with id ${id}`);
        
        return { ...existingUser, ...user };
    }

    deleteUser(id: number): boolean {
        const existingUser = this.findUserById(id);
        if (!existingUser) {
            this.logger.error(`User with id ${id} not found`);
            throw new NotFoundException(`User with id ${id} not found`);
        }

        this.users = this.users.filter(user => user.id !== id);
        this.logger.log(`Deleted user with id ${id}`);
        return true;        
    }

}
