import { Injectable } from '@nestjs/common';

@Injectable()
export class UserLoggerService {
    log(message: string) {
        console.log(`[UserLogger] ${message}`);
    }

    error(message: string) {
        console.error(`[UserLogger] ${message}`);
    }
}   