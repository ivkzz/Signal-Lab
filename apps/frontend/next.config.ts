import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

/** Корень монорепозитория — те же правила, что у Next для `.env*` (development / production). */
const monorepoRoot = path.resolve(__dirname, "..", "..");
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {};

export default nextConfig;
