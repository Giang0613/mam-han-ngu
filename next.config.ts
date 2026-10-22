import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.SUPERWEB_DIST_DIR || '.next',
  serverExternalPackages: ['better-sqlite3'],
  // Local speech runtime and learner DB stay beside the checkout, never in a bundle.
  outputFileTracingExcludes: {'/*': ['./.cache/**/*', './local.db*', './storage/**/*']},
};

export default nextConfig;
