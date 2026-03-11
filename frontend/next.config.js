/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['randomuser.me'],
        formats: ['image/webp', 'image/avif'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://employee-managemet-system-production.up.railway.app',
    },
    async rewrites() {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Validation: Check if the API URL is valid (starts with http/https)
        if (!apiUrl || !apiUrl.startsWith('http')) {
            console.warn('WARNING: INVALID NEXT_PUBLIC_API_URL DETECTED:', apiUrl);
            console.warn('Fallback to https://employee-managemet-system-production.up.railway.app to prevent build failure.');
            apiUrl = 'https://employee-managemet-system-production.up.railway.app';
        }

        return [
            {
                source: '/api/:path*',
                destination: apiUrl + '/api/:path*',
            },
        ];
    },
}

module.exports = nextConfig
