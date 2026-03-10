'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MessageSquare, User } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import { format } from 'date-fns';

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
    dueDate: string;
    assignedTo?: {
        firstName: string;
        lastName: string;
    };
    assignedBy?: {
        firstName: string;
        lastName: string;
    };
    _count?: {
        comments: number;
    };
}

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

    const getPriorityBorderColor = () => {
        switch (task.priority) {
            case 'URGENT':
                return 'border-l-red-500';
            case 'HIGH':
                return 'border-l-orange-500';
            case 'MEDIUM':
                return 'border-l-yellow-500';
            case 'LOW':
                return 'border-l-blue-500';
            default:
                return 'border-l-gray-500';
        }
    };

    return (
        <Card
            className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityBorderColor()}`}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                    <div className="flex gap-2">
                        <TaskPriorityBadge priority={task.priority} />
                        <TaskStatusBadge status={task.status} />
                    </div>
                </div>

                {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </span>
                        {isOverdue && (
                            <Badge variant="destructive" className="ml-1 text-xs">
                                Overdue
                            </Badge>
                        )}
                    </div>

                    {task.assignedTo && (
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                        </div>
                    )}

                    {task._count && task._count.comments > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{task._count.comments}</span>
                        </div>
                    )}
                </div>

                {task.assignedBy && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        Assigned by: {task.assignedBy.firstName} {task.assignedBy.lastName}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
