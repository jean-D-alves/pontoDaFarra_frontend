import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// O next.config é avaliado antes do carregamento automático do .env,
// então carregamos as variáveis aqui para montar os remotePatterns.
loadEnvConfig(process.cwd());

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
};

/**
 * As imagens de produto vêm do backend (armazenamento local ou Cloudflare R2
 * quando configurado). Liberamos apenas os hosts definidos por env, sem
 * fixar domínio de R2 no código.
 */
function buildImageRemotePatterns(): RemotePattern[] {
  const sources = [
    process.env.NEXT_PUBLIC_IMAGE_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  const patterns: RemotePattern[] = [];

  for (const source of sources) {
    if (!source) continue;

    try {
      const url = new URL(source);

      if (url.protocol !== "http:" && url.protocol !== "https:") continue;

      patterns.push({
        protocol: url.protocol === "https:" ? "https" : "http",
        hostname: url.hostname,
        port: url.port,
        pathname: "/**",
      });
    } catch {
      // Ignora variáveis que não são URLs válidas.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: buildImageRemotePatterns(),
    // O backend local roda em localhost (fora do Next), e o Next 16 bloqueia
    // IPs privados por padrão (proteção contra SSRF).
    dangerouslyAllowLocalIP: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
