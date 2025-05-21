import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle', // Output directory for migrations
  dialect: 'sqlite', // Specify the dialect as sqlite
  dbCredentials: {
    url: 'file:./sqlite.db', // Path to the SQLite database file
  },
  // Print schema changes to console
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config;
