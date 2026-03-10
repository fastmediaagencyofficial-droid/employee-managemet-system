'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    workDays: string[];
    _count?: {
        employees: number;
    };
}

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState({
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    });

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching shifts with token:', token ? 'Token exists' : 'No token');

            const response = await fetch('/api/shifts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Fetch shifts failed status:', response.status, errorText);
                toast.error(`Error loading shifts: ${response.status}`);
                return;
            }

            const data = await response.json();
            if (data.success) {
                console.log('Shifts loaded:', data.data);
                setShifts(data.data);
            } else {
                console.error('API returned error:', data.message);
                toast.error(data.message || 'Failed to fetch shifts');
            }
        } catch (error) {
            console.error('Failed to fetch shifts:', error);
            toast.error('Failed to load shifts');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingShiftId(null);
        setFormValues({
            name: '',
            startTime: '09:00',
            endTime: '17:00',
            workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (shift: Shift) => {
        setEditingShiftId(shift.id);
        setFormValues({
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            workDays: shift.workDays
        });
        setIsDialogOpen(true);
    };

    const handleSaveShift = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingShiftId
                ? `/api/shifts/${editingShiftId}`
                : '/api/shifts';
            const method = editingShiftId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formValues),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingShiftId ? 'Shift updated successfully' : 'Shift created successfully');
                setIsDialogOpen(false);
                fetchShifts();
            } else {
                toast.error(data.message || `Failed to ${editingShiftId ? 'update' : 'create'} shift`);
            }
        } catch (error) {
            console.error('Save shift error:', error);
            toast.error(`Error saving shift`);
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/shifts/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Shift deleted successfully');
                fetchShifts();
            } else {
                toast.error(data.message || 'Failed to delete shift');
            }
        } catch (error) {
            console.error('Delete shift error:', error);
            toast.error('Failed to delete shift');
        }
    };

    const filteredShifts = shifts.filter(shift =>
        shift.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading shifts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
                    <p className="text-muted-foreground">Define and manage employee work schedules</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Shift
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingShiftId ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
                            <DialogDescription>
                                Set the name and working hours for the shift.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Shift Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Morning Shift"
                                    value={formValues.name}
                                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={formValues.startTime}
                                        onChange={(e) => setFormValues({ ...formValues, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endTime">End Time</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={formValues.endTime}
                                        onChange={(e) => setFormValues({ ...formValues, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Work Days</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                        <Badge
                                            key={day}
                                            variant={formValues.workDays.includes(day) ? 'default' : 'outline'}
                                            className="cursor-pointer capitalize"
                                            onClick={() => {
                                                const updated = formValues.workDays.includes(day)
                                                    ? formValues.workDays.filter(d => d !== day)
                                                    : [...formValues.workDays, day];
                                                setFormValues({ ...formValues, workDays: updated });
                                            }}
                                        >
                                            {day.toLowerCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveShift} disabled={!formValues.name || formValues.workDays.length === 0}>
                                {editingShiftId ? 'Save Changes' : 'Create Shift'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search shifts..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shift Name</TableHead>
                                <TableHead>Timing</TableHead>
                                <TableHead>Work Days</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No shifts found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredShifts.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell className="font-medium">{shift.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                {shift.startTime} - {shift.endTime}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {shift.workDays.slice(0, 3).map(day => (
                                                    <Badge key={day} variant="outline" className="text-[10px] px-1 py-0 capitalize">
                                                        {day.toLowerCase()}
                                                    </Badge>
                                                ))}
                                                {shift.workDays.length > 3 && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        +{shift.workDays.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                {shift._count?.employees || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(shift)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteShift(shift.id)}
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
                </CardContent>
            </Card>
        </div>
    );
}
