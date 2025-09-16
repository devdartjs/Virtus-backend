/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimiter } from "../../lib/redis/rate-limit";

const redisMock = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn()
}));

vi.mock("../../lib/redis/redis", () => ({ default: redisMock, spy: true }));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RATE_LIMIT_WINDOW = "60";
  process.env.RATE_LIMIT_MAX = "10";
});

afterEach(() => {
  process.env.RATE_LIMIT_WINDOW = "60";
  process.env.RATE_LIMIT_MAX = "10";
});

describe("rateLimiter() - Unit Tests", () => {
  const ip = "192.168.0.10";
  const key = `rate:${ip}`;
  const window = Number(process.env.RATE_LIMIT_WINDOW) || 60;
  const errorMessage = `Too many requests. Try again in ${window} seconds.`;

  test("allows first access", async () => {
    redisMock.incr.mockResolvedValueOnce(1);
    redisMock.expire.mockResolvedValueOnce(1);

    await expect(rateLimiter(ip)).resolves.toBeUndefined();
    expect(redisMock.incr).toHaveBeenCalledWith(key);
    expect(redisMock.expire).toHaveBeenCalledWith(key, window);
  });

  test("allows access below max limit without resetting TTL", async () => {
    redisMock.incr.mockResolvedValueOnce(2);
    redisMock.expire.mockResolvedValueOnce(60);

    await expect(rateLimiter(ip)).resolves.toBeUndefined();
    expect(redisMock.incr).toHaveBeenCalledWith(key);
    expect(redisMock.expire).not.toHaveBeenCalled();
  });

  test("throws generic error above max limit", async () => {
    redisMock.incr.mockResolvedValueOnce(11);
    redisMock.ttl.mockResolvedValueOnce(60);

    await expect(rateLimiter(ip)).rejects.toThrowError(errorMessage);
    expect(redisMock.incr).toHaveBeenCalledWith(key);
    expect(redisMock.expire).not.toHaveBeenCalled();
  });

  test("throws structured error above max limit", async () => {
    redisMock.incr.mockResolvedValueOnce(11);
    redisMock.ttl.mockResolvedValueOnce(60);

    await expect(rateLimiter(ip)).rejects.toMatchObject({
      status: 429,
      message: errorMessage
    });
    expect(redisMock.ttl).toHaveBeenCalledWith(key);
  });

  test("resets rate limit window on first access after expiration", async () => {
    redisMock.incr.mockResolvedValueOnce(1);
    redisMock.expire.mockResolvedValueOnce(1);

    await expect(rateLimiter(ip)).resolves.toBeUndefined();
    expect(redisMock.expire).toHaveBeenCalledWith(key, window);
  });

  test("handles Redis errors gracefully", async () => {
    redisMock.incr.mockRejectedValueOnce(new Error("Redis unavailable"));

    await expect(rateLimiter(ip)).rejects.toThrow("Redis unavailable");
  });

  test("uses default env values when missing", async () => {
    process.env.RATE_LIMIT_WINDOW = undefined;
    process.env.RATE_LIMIT_MAX = undefined;

    redisMock.incr.mockResolvedValueOnce(1);
    redisMock.expire.mockResolvedValueOnce(1);

    await expect(rateLimiter(ip)).resolves.toBeUndefined();
    expect(redisMock.expire).toHaveBeenCalledWith(key, window);
  });

  test("calls ttl when above max limit", async () => {
    redisMock.incr.mockResolvedValueOnce(15);
    redisMock.ttl.mockResolvedValueOnce(60);

    await expect(rateLimiter(ip)).rejects.toThrow(errorMessage);
    expect(redisMock.ttl).toHaveBeenCalledWith(key);
  });

  test("does not call expire when key already exists", async () => {
    redisMock.incr.mockResolvedValueOnce(2);

    await expect(rateLimiter(ip)).resolves.toBeUndefined();
    expect(redisMock.expire).not.toHaveBeenCalled();
  });

  test("falls back to window when ttl <= 0", async () => {
    redisMock.incr.mockResolvedValueOnce(12);
    redisMock.ttl.mockResolvedValueOnce(-1);

    await expect(rateLimiter(ip)).rejects.toThrowError(
      expect.objectContaining({
        status: 429,
        message: errorMessage
      })
    );
    expect(redisMock.ttl).toHaveBeenCalledWith(key);
  });
});
