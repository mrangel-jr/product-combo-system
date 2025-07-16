import { createClient, RedisClientType } from "redis";
import { CacheService } from "../../domain/types";

export class RedisService implements CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    try {
      await this.client.setEx(key, ttlSeconds, value);
      return true;
    } catch (error) {
      console.error("Redis SET error:", error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("Redis DEL error:", error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
