import type { NextConfig } from "next";

function supabaseHostname(): string {
  const fallback = "hdhoeflihiddawlbsncz.supabase.co";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return fallback;
  try {
    const host = new URL(url).hostname;
    return host || fallback;
  } catch {
    return fallback;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
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
