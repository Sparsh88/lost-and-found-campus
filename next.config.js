const fs = require('fs')
try {
  const gracefulFs = require('graceful-fs')
  gracefulFs.gracefulify(fs)
} catch {}

const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
