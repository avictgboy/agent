import { pool } from "./server/db";

async function createSessionsTable() {
  try {
    console.log("Creating sessions table...");
    
    // SQL for creating the sessions table (compatible with connect-pg-simple)
    const sql = `
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON "sessions" ("expire");
    `;
    
    await pool.query(sql);
    console.log("Sessions table created successfully!");
  } catch (error) {
    console.error("Error creating sessions table:", error);
  } finally {
    // Close the connection
    await pool.end();
  }
}

createSessionsTable();