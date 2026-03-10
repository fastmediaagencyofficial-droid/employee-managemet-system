'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Inbox, Send, BarChart2 } from 'lucide-react';

export default function FeedbackHubPage() {
    const router = useRouter();

    const menuItems = [
        {
            title: 'Give Feedback',
            description: 'Share constructive feedback with your peers or managers',
            icon: MessageSquarePlus,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            href: '/dashboard/performance/feedback/add'
        },
        {
            title: 'Received Feedback',
            description: 'View feedback you have received from others',
            icon: Inbox,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            href: '/dashboard/performance/feedback/received'
        },
        {
            title: 'Given Feedback',
            description: 'Review the feedback you have provided',
            icon: Send,
            color: 'text-green-500',
            bg: 'bg-green-50',
            href: '/dashboard/performance/feedback/given'
        },
        {
            title: 'Feedback Analytics',
            description: 'Analyze sentiment and feedback trends',
            icon: BarChart2,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            href: '/dashboard/performance/feedback/analytics'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">360° Feedback Hub</h1>
                <p className="text-muted-foreground">Manage and track continuous feedback</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {menuItems.map((item, index) => (
                    <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(item.href)}
                    >
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className={`p-3 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
