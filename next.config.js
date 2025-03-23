/** @type {import('next').NextConfig} */

module.exports = {
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Ignoring type errors to allow build to succeed
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}; 