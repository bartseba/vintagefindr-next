import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb, too small for vendor product CSVs (importCSV in
      // src/app/vendor/import/actions.ts receives the file as a Server
      // Action FormData payload).
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
