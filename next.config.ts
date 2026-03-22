import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Division flat URL redirects — Canon v1.1
      // These allow /publishing, /financial etc. in addition to /divisions/publishing
      { source: "/publishing",  destination: "/divisions/publishing",  permanent: false },
      { source: "/financial",   destination: "/divisions/financial",   permanent: false },
      { source: "/foundation",  destination: "/divisions/foundation",  permanent: false },
      { source: "/productions", destination: "/divisions/productions", permanent: false },
    ];
  },
};

export default nextConfig;
