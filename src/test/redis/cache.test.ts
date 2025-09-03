/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { getOrSetCache } from "../../lib/redis/cache";

const redisMock = vi.hoisted(() => ({
  get: vi.fn(),
  setex: vi.fn(),
}));

vi.mock("../../lib/redis/redis", () => ({
  default: redisMock,
  spy: true,
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CACHE_TTL = "60";
});

afterEach(() => {
  process.env.CACHE_TTL = "60";
});

describe("getOrSetCache() function - Unit Tests", () => {
  const key = "test:key";
  const data = { product: "propylamine" };
  const fetcher = vi.fn().mockResolvedValue(data);

  test("returns cached value when cache hit", async () => {
    redisMock.get.mockResolvedValueOnce(JSON.stringify(data));

    const result = await getOrSetCache(key, fetcher);

    expect(result).toEqual(data);
    expect(redisMock.get).toHaveBeenCalledWith(key);
    expect(fetcher).not.toHaveBeenCalled();
    expect(redisMock.setex).not.toHaveBeenCalled();
  });

  test("fetches and caches value when cache miss", async () => {
    redisMock.get.mockResolvedValueOnce(null);

    const result = await getOrSetCache(key, fetcher, 120);

    expect(result).toEqual(data);
    expect(redisMock.get).toHaveBeenCalledWith(key);
    expect(fetcher).toHaveBeenCalled();
    expect(redisMock.setex).toHaveBeenCalledWith(
      key,
      120,
      JSON.stringify(data)
    );
  });

  test("uses default TTL from env when not specified", async () => {
    redisMock.get.mockResolvedValueOnce(null);

    const result = await getOrSetCache(key, fetcher);

    expect(result).toEqual(data);
    expect(redisMock.setex).toHaveBeenCalledWith(key, 60, JSON.stringify(data));
  });

  test("propagates error if fetcher fails", async () => {
    const fetcherError = new Error("DB failure");
    const failingFetcher = vi.fn().mockRejectedValue(fetcherError);
    redisMock.get.mockResolvedValueOnce(null);

    await expect(getOrSetCache(key, failingFetcher)).rejects.toThrow(
      "DB failure"
    );
    expect(redisMock.setex).not.toHaveBeenCalled();
  });

  test("logs cache hit and miss correctly", async () => {
    redisMock.get.mockResolvedValueOnce(JSON.stringify(data));
    const logSpy = vi.spyOn(console, "log");

    await getOrSetCache(key, fetcher);
    expect(logSpy).toHaveBeenCalledWith(`🟢 Cache hit: ${key}`);

    redisMock.get.mockResolvedValueOnce(null);
    await getOrSetCache(key, fetcher, 30);
    expect(logSpy).toHaveBeenCalledWith(
      `🟡 Cache miss: ${key}. Fetching from DB...`
    );

    logSpy.mockRestore();
  });

  test("handles zero or negative TTL", async () => {
    redisMock.get.mockResolvedValueOnce(null);

    await getOrSetCache(key, fetcher, 0);
    expect(redisMock.setex).toHaveBeenCalledWith(key, 0, JSON.stringify(data));

    await getOrSetCache(key, fetcher, -5);
    expect(redisMock.setex).toHaveBeenCalledWith(key, -5, JSON.stringify(data));
  });
});
