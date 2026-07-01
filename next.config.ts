import type { NextConfig } from "next";

/**
 * Supabase Storage hostname is derived from the project URL so that
 * `next/image` accepts remote cover/logo images once they exist.
 * When no Supabase project is configured the app renders generated
 * placeholders instead, so the empty remotePatterns list is harmless.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push({ protocol: "https", hostname, pathname: "/storage/v1/object/public/**" });
  } catch {
    // Ignore malformed URL — images simply fall back to placeholders.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    // Keeps server bundles lean for the Supabase client.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
