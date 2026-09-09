import { ArgumentsHost, HttpStatus, NotFoundException } from "@nestjs/common";
import { PrismaExceptionFilter } from "./prisma-exception.filter.js";

function createHost() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe("PrismaExceptionFilter", () => {
  it("passes an HttpException through using its own status and body", () => {
    const filter = new PrismaExceptionFilter();
    const { host, status, json } = createHost();
    const exception = new NotFoundException("User with id 5 not found");

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(exception.getResponse());
  });

  it("maps a Postgres unique violation to 409 Conflict", () => {
    const filter = new PrismaExceptionFilter();
    const { host, status, json } = createHost();
    const exception = Object.assign(new Error("duplicate key value"), { code: "23505" });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: HttpStatus.CONFLICT }));
  });

  it("falls back to 500 for an unrecognized error", () => {
    const filter = new PrismaExceptionFilter();
    const { host, status, json } = createHost();

    filter.catch(new Error("something exploded"), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR }),
    );
  });
});
