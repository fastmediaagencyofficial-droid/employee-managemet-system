'use client';

import { motion } from 'framer-motion';
import { Code, Globe, Database, Smartphone, Cloud, Shield } from 'lucide-react';

const features = [
    {
        icon: <Globe className="h-8 w-8" />,
        title: 'Web Development',
        description: 'Custom websites and web applications tailored to your business needs.',
    },
    {
        icon: <Smartphone className="h-8 w-8" />,
        title: 'Mobile Solutions',
        description: 'Native and cross-platform mobile apps for iOS and Android devices.',
    },
    {
        icon: <Cloud className="h-8 w-8" />,
        title: 'Cloud Services',
        description: 'Scalable cloud infrastructure setup, migration, and management.',
    },
    {
        icon: <Database className="h-8 w-8" />,
        title: 'Data Analytics',
        description: 'Transform your raw data into actionable insights for better decision making.',
    },
    {
        icon: <Shield className="h-8 w-8" />,
        title: 'Cyber Security',
        description: 'Protect your digital assets with our advanced security protocols.',
    },
    {
        icon: <Code className="h-8 w-8" />,
        title: 'Software Consulting',
        description: 'Expert guidance on technology stack selection and architecture.',
    },
];

export default function Features() {
    return (
        <section id="services" className="py-24 bg-white">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
                        Our Services
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We offer a comprehensive suite of digital solutions to help your business thrive in the modern economy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group p-8 rounded-2xl border border-gray-100 bg-white hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300"
                        >
                            <div className="mb-6 inline-flex p-3 rounded-lg bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
