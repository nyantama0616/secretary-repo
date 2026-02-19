import type { NextConfig } from "next";

import { NEXT_DIST_DIR } from "./src/config";

const nextConfig: NextConfig = {
  // NOTE: E2E テスト用の dev サーバーを開発用と並行起動するため、distDir を切り替え可能にしている
  distDir: NEXT_DIST_DIR,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
