#!/usr/bin/env node
/**
 * Apply supabase/schema.sql via direct Postgres connection.
 * Get password: Supabase Dashboard → Project Settings → Database → Database password
 *
 *   export SUPABASE_DB_PASSWORD='your-password'
 *   node scripts/apply-schema.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ref = "dnatorlebioxmkwcnruy";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
    console.error("Set SUPABASE_DB_PASSWORD (Dashboard → Settings → Database → Database password)");
    process.exit(1);
}

const sql = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8");

const client = new pg.Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
});

try {
    await client.connect();
    await client.query(sql);
    console.log("Schema applied successfully.");
} catch (err) {
    console.error("Failed to apply schema:", err.message);
    process.exit(1);
} finally {
    await client.end();
}
