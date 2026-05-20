import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing route handlers so the mock is applied first
vi.mock("@/lib/db", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

// Import route handlers after the mock is set up
import { GET as healthGET } from "../app/api/health/route";
import { GET as statusGET } from "../app/api/status/route";
import prisma from "../lib/db";

describe("API /health Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 200 with healthy status when database is reachable", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const response = await healthGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(typeof data.timestamp).toBe("string");
    expect(typeof data.version).toBe("string");
  });

  it("includes the NODE_ENV in the healthy response", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const response = await healthGET();
    const data = await response.json();

    expect(data.environment).toBeDefined();
  });

  it("returns 503 with unhealthy status when database throws", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection refused"));

    const response = await healthGET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.database).toBe("disconnected");
    expect(data.error).toBe("Connection refused");
    expect(typeof data.timestamp).toBe("string");
  });

  it("returns 503 with unknown error message for non-Error exceptions", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue("raw string error");

    const response = await healthGET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe("Unknown error");
  });

  it("sets Cache-Control: no-store on both success and failure responses", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    const successResponse = await healthGET();
    expect(successResponse.headers.get("Cache-Control")).toBe("no-store, max-age=0");

    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("fail"));
    const failResponse = await healthGET();
    expect(failResponse.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  });
});

describe("API /status Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 200 with operational status and full system info", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const response = await statusGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("operational");
    expect(data.database.status).toBe("connected");
    expect(typeof data.database.latencyMs).toBe("number");
    expect(data.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("includes system memory and version information", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    const response = await statusGET();
    const data = await response.json();

    expect(data.system.nodeVersion).toBeDefined();
    expect(data.system.platform).toBeDefined();
    expect(typeof data.system.memoryUsage.rssMb).toBe("number");
    expect(typeof data.system.memoryUsage.heapTotalMb).toBe("number");
    expect(typeof data.system.memoryUsage.heapUsedMb).toBe("number");
  });

  it("includes uptime and timestamp fields", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    const response = await statusGET();
    const data = await response.json();

    expect(typeof data.uptimeSeconds).toBe("number");
    expect(typeof data.timestamp).toBe("string");
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
  });

  it("returns 500 with degraded status when database throws", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("DB timeout"));

    const response = await statusGET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe("degraded");
    expect(data.error).toBe("DB timeout");
    expect(typeof data.timestamp).toBe("string");
  });

  it("returns 500 with unknown error for non-Error thrown values", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(42);

    const response = await statusGET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Unknown error");
  });

  it("sets Cache-Control: no-store on both success and failure responses", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    const successResponse = await statusGET();
    expect(successResponse.headers.get("Cache-Control")).toBe("no-store, max-age=0");

    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("fail"));
    const failResponse = await statusGET();
    expect(failResponse.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  });
});
