import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableColumn {
    key: string;
    label: string;
    render?: (value: any, row: any) => ReactNode;
}

interface TableAction {
    label: string;
    onClick: (row: any) => void;
}

interface TableWidgetProps {
    title: string;
    description?: string;
    columns: TableColumn[];
    data: any[];
    actions?: TableAction[];
    emptyMessage?: string;
}

export default function TableWidget({
    title,
    description,
    columns,
    data,
    actions,
    emptyMessage = 'No data available',
}: TableWidgetProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column.key}>{column.label}</TableHead>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <TableHead className="w-[50px]"></TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell key={column.key}>
                                                {column.render
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key]}
                                            </TableCell>
                                        ))}
                                        {actions && actions.length > 0 && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {actions.map((action, actionIndex) => (
                                                            <DropdownMenuItem
                                                                key={actionIndex}
                                                                onClick={() => action.onClick(row)}
                                                            >
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
