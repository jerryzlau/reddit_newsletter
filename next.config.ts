import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@trigger.dev/sdk"],
  images: {
    remotePatterns: [
      { hostname: "styles.redditmedia.com" },
      { hostname: "a.thumbs.redditmedia.com" },
      { hostname: "b.thumbs.redditmedia.com" },
      { hostname: "external-preview.redd.it" },
      { hostname: "preview.redd.it" },
    ],
  },
};

export default nextConfig;
