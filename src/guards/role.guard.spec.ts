import { RoleGuard } from "./role.guard.js";
import { PrismaService } from "../lib/database/prisma.service.js";

describe("RoleGuard", () => {
  it("should be defined", () => {
    const mockPrisma: Partial<PrismaService> = {};
    expect(new RoleGuard(mockPrisma as PrismaService)).toBeDefined();
  });
});
