'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
        >
            {/* Logo */}
            <div className="flex items-center gap-3">
                <Image
                    src="/fast-managemet.jpeg"
                    alt="Fast Management System"
                    width={52}
                    height={52}
                    className="rounded-lg object-contain"
                    priority
                />
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                    Fast<span className="text-blue-600">Management</span>
                </span>
            </div>

            {/* Login Button */}
            <Link href="/login">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors duration-200 shadow-md"
                >
                    Login
                </motion.button>
            </Link>
        </motion.nav>
    );
}
