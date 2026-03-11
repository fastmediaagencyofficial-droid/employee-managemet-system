'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationDropdownProps {
    onNotificationRead?: () => void;
    onClose?: () => void;
}

export default function NotificationDropdown({ onNotificationRead, onClose }: NotificationDropdownProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/notifications?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                onNotificationRead?.();
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                onNotificationRead?.();
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                onNotificationRead?.();
                toast.success('Notification deleted');
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Navigate to related item
        if (notification.relatedType === 'TASK' && notification.relatedId) {
            onClose?.();
            router.push(`/dashboard/tasks/${notification.relatedId}`);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'TASK_ASSIGNED':
                return '📋';
            case 'TASK_COMPLETED':
                return '✅';
            case 'TASK_DEADLINE':
                return '⏰';
            case 'TASK_UPDATED':
                return '🔄';
            default:
                return '🔔';
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-semibold">Notifications</h3>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-8 text-xs"
                    >
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-accent cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm line-clamp-1">
                                                {notification.title}
                                            </p>
                                            <div className="flex gap-1">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
