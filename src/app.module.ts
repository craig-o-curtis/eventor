import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { ArcjetGuard, ArcjetModule, shield, fixedWindow } from "@arcjet/nest";


// Example test rate limiting:
// repeat 60 curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    ArcjetModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        key: config.get<string>("ARCJET_KEY")!,
        rules: [
          shield({ mode: "LIVE" }), // protection against common attacks
          fixedWindow({ mode: "LIVE", window: "60s", max: 100 }), // rate limiting rule: max 100 requests per 60 seconds
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
