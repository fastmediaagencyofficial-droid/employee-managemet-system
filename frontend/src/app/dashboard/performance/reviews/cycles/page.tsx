'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Settings2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewCyclesPage() {
    const router = useRouter();
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCycle, setNewCycle] = useState({
        name: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        status: 'PLANNING'
    });

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/review-cycles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setCycles(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch cycles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCycle.name) return toast.error('Name is required');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/review-cycles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newCycle)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Review cycle created');
                setIsAddOpen(false);
                fetchCycles();
            }
        } catch (error) {
            toast.error('Failed to create cycle');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this cycle?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/review-cycles/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Cycle deleted');
                fetchCycles();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to delete cycle');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/review-cycles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Cycle status updated to ${status}`);
                fetchCycles();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            PLANNING: 'secondary',
            ACTIVE: 'default',
            COMPLETED: 'success',
            CANCELLED: 'destructive'
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Review Cycles</h1>
                    <p className="text-muted-foreground">Manage organizational performance evaluation periods</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Cycle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Review Cycle</DialogTitle>
                            <DialogDescription>Setup a new structured performance review period.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Cycle Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Annual Review 2024"
                                    value={newCycle.name}
                                    onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start">Start Date</Label>
                                    <Input
                                        id="start"
                                        type="date"
                                        value={newCycle.startDate}
                                        onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end">End Date</Label>
                                    <Input
                                        id="end"
                                        type="date"
                                        value={newCycle.endDate}
                                        onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Goals and instructions for this cycle..."
                                    value={newCycle.description}
                                    onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Cycle</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Management Overview</CardTitle>
                    <CardDescription>Track and control active evaluation periods</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading cycles...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cycle Name</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reviews</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cycles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No review cycles defined. Create one to start evaluations.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cycles.map((cycle) => (
                                        <TableRow key={cycle.id}>
                                            <TableCell className="font-medium">
                                                <div>{cycle.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{cycle.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(cycle.startDate), 'MMM dd')} - {format(new Date(cycle.endDate), 'MMM dd, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Settings2 className="h-3 w-3" />
                                                    {cycle._count?.reviews || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {cycle.status === 'PLANNING' && (
                                                        <Button variant="outline" size="sm" onClick={() => updateStatus(cycle.id, 'ACTIVE')}>
                                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Start
                                                        </Button>
                                                    )}
                                                    {cycle.status === 'ACTIVE' && (
                                                        <Button variant="outline" size="sm" onClick={() => updateStatus(cycle.id, 'COMPLETED')}>
                                                            <Clock className="h-4 w-4 mr-1" /> Close
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cycle.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
