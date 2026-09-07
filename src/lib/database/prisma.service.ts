import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { db } from "../../prisma/db.js";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  async onModuleDestroy() {
    // Tear down the façade-owned pg.Pool on shutdown
    await db.close();
  }

  get db() {
    return db;
  }
}
