import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service.js";
import { PrismaService } from "../lib/database/prisma.service.js";

const mockPrismaService = {
  db: {
    orm: {
      public: {
        User: {
          where: () => ({
            orderBy: () => [],
            first: () => null,
            create: async () => ({}),
            update: async () => ({}),
            delete: async () => ({}),
          }),
        },
      },
    },
  },
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
