'use client';

import { useState } from 'react';
import TaskCard from './TaskCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

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

interface TaskListProps {
    tasks: Task[];
    onTaskClick?: (taskId: string) => void;
    showFilters?: boolean;
}

export default function TaskList({ tasks, onTaskClick, showFilters = true }: TaskListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="space-y-4">
            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
            </div>

            {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No tasks found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick?.(task.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
