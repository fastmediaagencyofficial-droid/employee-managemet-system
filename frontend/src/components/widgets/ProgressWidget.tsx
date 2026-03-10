import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressItem {
    label: string;
    value: number;
    max?: number;
    color?: 'default' | 'success' | 'warning' | 'danger';
    description?: string;
}

interface ProgressWidgetProps {
    title: string;
    description?: string;
    items: ProgressItem[];
    showPercentage?: boolean;
    footer?: ReactNode;
}

export default function ProgressWidget({
    title,
    description,
    items,
    showPercentage = true,
    footer,
}: ProgressWidgetProps) {
    const getProgressColor = (color?: string) => {
        switch (color) {
            case 'success':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-primary';
        }
    };

    const calculatePercentage = (value: number, max: number = 100) => {
        return Math.min(Math.round((value / max) * 100), 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => {
                    const percentage = calculatePercentage(item.value, item.max);

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.label}</p>
                                    {item.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                {showPercentage && (
                                    <span className="text-sm font-semibold ml-2">
                                        {percentage}%
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Progress
                                    value={percentage}
                                    className="h-2"
                                />
                                <div
                                    className={cn(
                                        'absolute top-0 left-0 h-2 rounded-full transition-all',
                                        getProgressColor(item.color)
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            {item.max && (
                                <p className="text-xs text-muted-foreground text-right">
                                    {item.value} / {item.max}
                                </p>
                            )}
                        </div>
                    );
                })}
                {footer && <div className="pt-4 border-t">{footer}</div>}
            </CardContent>
        </Card>
    );
}
