'use client';

import { Badge } from '@/components/ui/badge';

interface TaskStatusBadgeProps {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
        PENDING: { variant: 'secondary', label: 'Pending' },
        IN_PROGRESS: { variant: 'default', label: 'In Progress' },
        COMPLETED: { variant: 'outline', label: 'Completed' },
        CANCELLED: { variant: 'destructive', label: 'Cancelled' },
        ON_HOLD: { variant: 'secondary', label: 'On Hold' },
    };

    const config = variants[status] || variants.PENDING;

    const getStatusColor = () => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'ON_HOLD':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return '';
        }
    };

    return (
        <Badge variant={config.variant} className={getStatusColor()}>
            {config.label}
        </Badge>
    );
}
