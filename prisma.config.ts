import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});
