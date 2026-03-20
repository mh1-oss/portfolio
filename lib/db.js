import { neon } from "@neondatabase/serverless";

let isInitialized = false;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    return null;
  }

  return neon(connectionString);
}

/**
 * Initializes the database schema if it doesn't exist.
 */
export async function initDb() {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Neon database:", error.message);
    return false;
  }
}

/**
 * Ensures the database is ready.
 */
async function ensureDb() {
  if (isInitialized) return true;
  return await initDb();
}

/**
 * Reads a setting from the database.
 */
export async function getSetting(key) {
  const sql = getDb();
  if (!sql) return null;

  // Proactively try to initialize if not done yet
  await ensureDb();

  try {
    const rows = await sql`
      SELECT value FROM portfolio_settings WHERE key = ${key}
    `;
    return rows[0]?.value || null;
  } catch (error) {
    // If the table still doesn't exist, ignore the error and return null to trigger fallback
    if (error.message?.includes('relation "portfolio_settings" does not exist')) {
      return null;
    }
    console.error(`Failed to read setting '${key}' from Neon:`, error.message);
    return null;
  }
}

/**
 * Writes a setting to the database.
 */
export async function setSetting(key, value) {
  const sql = getDb();
  if (!sql) return false;

  await ensureDb();

  try {
    await sql`
      INSERT INTO portfolio_settings (key, value, updated_at)
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;
    return true;
  } catch (error) {
    console.error(`Failed to write setting '${key}' to Neon:`, error.message);
    return false;
  }
}
