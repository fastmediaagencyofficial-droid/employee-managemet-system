/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['localhost', 'randomuser.me'],
        formats: ['image/webp', 'image/avif'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    },
    async rewrites() {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Validation: Check if the API URL is valid (starts with http/https)
        if (!apiUrl || !apiUrl.startsWith('http')) {
            console.warn('WARNING: INVALID NEXT_PUBLIC_API_URL DETECTED:', apiUrl);
            console.warn('Fallback to http://localhost:5000 to prevent build failure.');
            apiUrl = 'http://localhost:5000';
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
