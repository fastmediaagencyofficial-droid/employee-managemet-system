'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const avatars = [
    {
        src: 'https://randomuser.me/api/portraits/men/32.jpg',
        alt: 'Team member',
        position: 'top-0 left-1/2 -translate-x-1/2',
        delay: 0.2,
        border: '#3B82F6',
    },
    {
        src: 'https://randomuser.me/api/portraits/men/45.jpg',
        alt: 'Team member',
        position: 'bottom-0 left-0',
        delay: 0.35,
        border: '#F59E0B',
    },
    {
        src: 'https://randomuser.me/api/portraits/women/68.jpg',
        alt: 'Team member',
        position: 'bottom-0 right-0',
        delay: 0.5,
        border: '#22C55E',
    },
];

function Sparkle({ size = 24, color = '#FBBF24', className = '' }: { size?: number; color?: string; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" fill={color} />
        </svg>
    );
}

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
            {/* Background blobs */}
            <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-yellow-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-16 py-16 relative z-10">

                {/* ─── LEFT: Avatar Cluster ─── */}
                <div className="relative flex-shrink-0 w-[460px] h-[480px] hidden md:block">
                    {avatars.map((avatar, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: avatar.delay, ease: 'backOut' }}
                            className={`absolute ${avatar.position}`}
                            style={{
                                width: 185,
                                height: 185,
                                borderRadius: '50%',
                                border: `5px solid ${avatar.border}`,
                                overflow: 'hidden',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.13)',
                                background: '#f3f4f6',
                            }}
                        >
                            <Image
                                src={avatar.src}
                                alt={avatar.alt}
                                width={185}
                                height={185}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        </motion.div>
                    ))}

                    {/* Sparkles */}
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-14 left-[-14px] z-10"
                    >
                        <Sparkle size={28} color="#FBBF24" />
                    </motion.div>
                    <motion.div
                        animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute top-[185px] right-[-8px] z-10"
                    >
                        <Sparkle size={20} color="#FBBF24" />
                    </motion.div>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute bottom-6 left-[48%] z-10"
                    >
                        <Sparkle size={22} color="#FBBF24" />
                    </motion.div>
                </div>

                {/* ─── RIGHT: Text Content ─── */}
                <div className="flex flex-col items-start max-w-xl">

                    {/* Badge */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-block border border-gray-300 text-gray-500 text-xs font-medium rounded-full px-4 py-1.5 mb-6 tracking-wide uppercase"
                        style={{ letterSpacing: '0.08em' }}
                    >
                        Smart Management
                    </motion.span>

                    {/* Heading — matches reference: extra-bold, dark navy, tight line-height */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        style={{
                            fontWeight: 800,
                            lineHeight: 1.12,
                            letterSpacing: '-0.02em',
                            color: '#1a1a3e',
                        }}
                        className="text-5xl md:text-[3.6rem] mb-5"
                    >
                        Fuel Your<br />
                        Growth With<br />
                        <span style={{ color: '#3B82F6' }}>Fast Media Management</span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.22 }}
                        className="text-gray-500 text-base mb-8 leading-relaxed max-w-sm"
                        style={{ fontWeight: 400 }}
                    >
                        Manage your employees with data-driven insights
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.34 }}
                    >
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(59,130,246,0.38)' }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-colors duration-200 shadow-lg"
                            >
                                Get Started Free
                                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                                    <ArrowRight size={12} />
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
