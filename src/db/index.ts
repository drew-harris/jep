import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from './schema';

// Define the path to the SQLite database file
const SQLITE_DB_PATH = './sqlite.db';

// Create the SQLite database instance
// The `create: true` option will create the database file if it doesn't exist.
const sqlite = new Database(SQLITE_DB_PATH, { create: true });

// Create the Drizzle ORM instance
export const db = drizzle(sqlite, { schema });

// Function to apply pending migrations
export async function applyMigrations() {
  console.log('Applying database migrations...');
  try {
    // The 'migrationsFolder' should match the 'out' directory in drizzle.config.ts
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied successfully.');
  } catch (error) {
    console.error('Error applying migrations:', error);
    // Depending on the application's needs, you might want to throw the error
    // or handle it in a way that doesn't prevent the app from starting if possible.
    // For now, we'll exit if migrations fail, as it's a critical step.
    process.exit(1);
  }
}
