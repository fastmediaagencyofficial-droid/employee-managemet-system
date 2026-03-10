'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ListItem {
    id: string;
    title: string;
    description?: string;
    metadata?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

interface ListWidgetProps {
    title: string;
    description?: string;
    items: ListItem[];
    emptyMessage?: string;
    onItemClick?: (id: string) => void;
}

export default function ListWidget({
    title,
    description,
    items,
    emptyMessage = 'No items to display',
    onItemClick,
}: ListWidgetProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${onItemClick ? 'cursor-pointer hover:bg-accent' : ''
                                    }`}
                                onClick={() => onItemClick?.(item.id)}
                            >
                                {item.icon && <div className="mt-0.5">{item.icon}</div>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none">{item.title}</p>
                                    {item.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.metadata && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.metadata}
                                        </p>
                                    )}
                                </div>
                                {item.action && <div>{item.action}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
