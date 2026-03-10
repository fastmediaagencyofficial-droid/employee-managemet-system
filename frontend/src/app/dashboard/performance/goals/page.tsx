'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Target, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Goal {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    targetValue: string;
    currentValue: string;
    progress: number;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    completedAt: string;
}

export default function GoalsPage() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/performance/goals', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setGoals(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch goals:', error);
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/performance/goals/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Goal deleted successfully');
                fetchGoals();
                setDeleteId(null);
            } else {
                toast.error('Failed to delete goal');
            }
        } catch (error) {
            console.error('Failed to delete goal:', error);
            toast.error('Failed to delete goal');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            NOT_STARTED: { variant: 'secondary', label: 'Not Started' },
            IN_PROGRESS: { variant: 'default', label: 'In Progress' },
            COMPLETED: { variant: 'outline', label: 'Completed' },
            OVERDUE: { variant: 'destructive', label: 'Overdue' },
            CANCELLED: { variant: 'secondary', label: 'Cancelled' },
        };
        const config = variants[status] || variants.NOT_STARTED;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            LOW: 'bg-blue-100 text-blue-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority] || colors.MEDIUM}>{priority}</Badge>;
    };

    const getCompletionStatus = (goal: Goal) => {
        if (goal.status !== 'COMPLETED' || !goal.completedAt) return null;

        const completed = new Date(goal.completedAt);
        const due = new Date(goal.dueDate);

        if (completed <= due) {
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 ml-2">On-time</Badge>;
        } else {
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 ml-2">Late</Badge>;
        }
    };

    const filteredGoals = goals.filter((goal) => {
        const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || goal.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || goal.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
                    <p className="text-muted-foreground">Track and manage your performance goals</p>
                </div>
                <Button onClick={() => router.push('/dashboard/performance/goals/add')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Goals</CardTitle>
                    <CardDescription>{filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} found</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search goals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                <SelectItem value="TEAM">Team</SelectItem>
                                <SelectItem value="DEPARTMENT">Department</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Goal</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGoals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No goals found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGoals.map((goal) => (
                                        <TableRow key={goal.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{goal.title}</div>
                                                    {goal.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                                            {goal.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{goal.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Progress value={goal.progress} className="w-[100px]" />
                                                    <div className="text-xs text-muted-foreground">{goal.progress}%</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {getStatusBadge(goal.status)}
                                                    {getCompletionStatus(goal)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(goal.priority)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(goal.dueDate).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/dashboard/performance/goals/${goal.id}`)}
                                                    >
                                                        <Target className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/dashboard/performance/goals/${goal.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteId(goal.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the goal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
