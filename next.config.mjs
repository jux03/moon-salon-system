/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Add internationalization config here
  i18n: {
    locales: ['fr'],      // French only, add 'en' or others if needed later
    defaultLocale: 'fr',  // Set French as default
  },
}

export default nextConfig
