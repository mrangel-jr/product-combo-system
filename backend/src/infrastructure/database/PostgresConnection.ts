import { Pool, QueryResult } from "pg";
import { DatabaseConnection, DatabaseRow } from "../../domain/types";

export class PostgresConnection implements DatabaseConnection {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "product_system",
      user: process.env.DB_USER || "admin",
      password: process.env.DB_PASSWORD || "admin123",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(text: string, params?: any[]): Promise<{ rows: DatabaseRow[] }> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(text, params);
      return { rows: result.rows };
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
