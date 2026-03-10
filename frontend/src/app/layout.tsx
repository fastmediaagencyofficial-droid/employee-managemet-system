import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: 'Fast Group of Companies',
    description: 'Leading provider of innovative solutions and services',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={jakarta.className}>
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
