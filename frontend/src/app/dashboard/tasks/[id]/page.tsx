'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge';
import { ArrowLeft, Calendar, Clock, User, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TaskDetail {
    id: string;
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
    category?: string;
    dueDate: string;
    estimatedHours?: number;
    actualHours?: number;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    assignedTo: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        position: string;
    };
    assignedBy: {
        id: string;
        firstName: string;
        lastName: string;
    };
    comments: Array<{
        id: string;
        comment: string;
        createdAt: string;
        employee: {
            id: string;
            firstName: string;
            lastName: string;
        };
    }>;
}

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.id as string;

    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [actualHours, setActualHours] = useState('');

    const fetchTaskDetail = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTask(data.data);
                if (data.data.actualHours) {
                    setActualHours(data.data.actualHours.toString());
                }
            } else {
                toast.error('Failed to fetch task details');
                router.push('/dashboard/my-tasks');
            }
        } catch (error) {
            console.error('Failed to fetch task:', error);
            toast.error('Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    }, [taskId, router]);

    useEffect(() => {
        fetchTaskDetail();
    }, [fetchTaskDetail]);

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdatingStatus(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                    actualHours: (newStatus === 'COMPLETED' && actualHours) ? parseFloat(actualHours) : null,
                }),
            });

            if (response.ok) {
                toast.success('Task status updated successfully');
                fetchTaskDetail();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setSubmittingComment(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ comment: newComment }),
            });

            if (response.ok) {
                toast.success('Comment added successfully');
                setNewComment('');
                fetchTaskDetail();
            } else {
                toast.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading task details...</p>
            </div>
        );
    }

    if (!task) {
        return null;
    }

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
                    <p className="text-muted-foreground">Task Details</p>
                </div>
                <div className="flex gap-2">
                    <TaskPriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {task.description || 'No description provided'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Status Update */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                            <CardDescription>Change the status of this task</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Task Status</Label>
                                <Select
                                    value={task.status}
                                    onValueChange={handleStatusUpdate}
                                    disabled={updatingStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {task.status === 'COMPLETED' && (
                                <div className="space-y-2">
                                    <Label>Actual Hours Spent</Label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={actualHours}
                                        onChange={(e) => setActualHours(e.target.value)}
                                        placeholder="Enter hours spent"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Comments ({task.comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Comment */}
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                />
                                <Button
                                    onClick={handleAddComment}
                                    disabled={submittingComment || !newComment.trim()}
                                    size="sm"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {task.comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No comments yet
                                    </p>
                                ) : (
                                    task.comments.map((comment) => (
                                        <div key={comment.id} className="border-l-2 pl-4 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">
                                                    {comment.employee.firstName} {comment.employee.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Task Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Assigned To</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                        {task.assignedTo.firstName} {task.assignedTo.lastName}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {task.assignedTo.position}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Assigned By</Label>
                                <p className="font-medium mt-1">
                                    {task.assignedBy.firstName} {task.assignedBy.lastName}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Due Date</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {isOverdue && (
                                    <p className="text-sm text-red-600 mt-1">Overdue!</p>
                                )}
                            </div>

                            {task.category && (
                                <div>
                                    <Label className="text-muted-foreground">Category</Label>
                                    <p className="font-medium mt-1">{task.category}</p>
                                </div>
                            )}

                            {task.estimatedHours && (
                                <div>
                                    <Label className="text-muted-foreground">Estimated Hours</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">{task.estimatedHours}h</span>
                                    </div>
                                </div>
                            )}

                            {task.actualHours && (
                                <div>
                                    <Label className="text-muted-foreground">Actual Hours</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">{task.actualHours}h</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="text-muted-foreground">Created</Label>
                                <p className="text-sm mt-1">
                                    {format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                            </div>

                            {task.startedAt && (
                                <div>
                                    <Label className="text-muted-foreground">Started</Label>
                                    <p className="text-sm mt-1">
                                        {format(new Date(task.startedAt), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                            )}

                            {task.completedAt && (
                                <div>
                                    <Label className="text-muted-foreground">Completed</Label>
                                    <p className="text-sm mt-1">
                                        {format(new Date(task.completedAt), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
