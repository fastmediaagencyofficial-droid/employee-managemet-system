'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: string;
    assignedTo: {
        firstName: string;
        lastName: string;
    };
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Task;
}

export default function TaskCalendarPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTasks = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const url = statusFilter === 'all'
                ? '/api/tasks/my-tasks'
                : `/api/tasks/my-tasks?status=${statusFilter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.data);

                // Convert tasks to calendar events
                const calendarEvents: CalendarEvent[] = data.data.map((task: Task) => ({
                    id: task.id,
                    title: `${task.title} (${task.priority})`,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    resource: task,
                }));

                setEvents(calendarEvents);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const task = event.resource;
        let backgroundColor = '#3174ad';

        // Color by priority
        switch (task.priority) {
            case 'URGENT':
                backgroundColor = '#dc2626';
                break;
            case 'HIGH':
                backgroundColor = '#ea580c';
                break;
            case 'MEDIUM':
                backgroundColor = '#2563eb';
                break;
            case 'LOW':
                backgroundColor = '#16a34a';
                break;
        }

        // Dim if completed
        if (task.status === 'COMPLETED') {
            backgroundColor = '#6b7280';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        router.push(`/dashboard/tasks/${event.id}`);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading calendar...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Calendar 📅</h1>
                    <p className="text-muted-foreground">View your tasks in a calendar format</p>
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => router.push('/dashboard/my-tasks')}>
                        View List
                    </Button>
                </div>
            </div>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Priority Legend</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-red-600"></div>
                        <span className="text-sm">Urgent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-orange-600"></div>
                        <span className="text-sm">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-600"></div>
                        <span className="text-sm">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-green-600"></div>
                        <span className="text-sm">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-600"></div>
                        <span className="text-sm">Completed</span>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
                <CardContent className="p-6">
                    <div style={{ height: '600px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                            views={['month', 'week', 'day']}
                            defaultView="month"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
