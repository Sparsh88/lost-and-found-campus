const fs = require('fs')
try {
  const gracefulFs = require('graceful-fs')
  gracefulFs.gracefulify(fs)
} catch {}

const nextConfig = {
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
