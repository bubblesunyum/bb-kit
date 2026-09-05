import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev otherwise writes a version-matched Next docs block into AGENTS.md,
  // which every session then pays for on load. AGENTS.md is the harness contract here.
  agentRules: false,
};

export default nextConfig;
