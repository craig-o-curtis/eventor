import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserLoggerService } from './user.logger.service.js';


@Module({
  controllers: [UserController],
  providers: [UserService,UserLoggerService]
})
export class UserModule {}
