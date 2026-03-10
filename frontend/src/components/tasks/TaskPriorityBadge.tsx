'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowUp, Minus } from 'lucide-react';

interface TaskPriorityBadgeProps {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
    const getPriorityConfig = () => {
        switch (priority) {
            case 'URGENT':
                return {
                    label: 'Urgent',
                    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300',
                    icon: <AlertCircle className="h-3 w-3" />,
                };
            case 'HIGH':
                return {
                    label: 'High',
                    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-300',
                    icon: <ArrowUp className="h-3 w-3" />,
                };
            case 'MEDIUM':
                return {
                    label: 'Medium',
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
                    icon: <Minus className="h-3 w-3" />,
                };
            case 'LOW':
                return {
                    label: 'Low',
                    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300',
                    icon: <Minus className="h-3 w-3" />,
                };
            default:
                return {
                    label: 'Medium',
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
                    icon: <Minus className="h-3 w-3" />,
                };
        }
    };

    const config = getPriorityConfig();

    return (
        <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
            {config.icon}
            {config.label}
        </Badge>
    );
}
