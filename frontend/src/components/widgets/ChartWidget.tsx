'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartWidgetProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export default function ChartWidget({ title, description, children, className = '' }: ChartWidgetProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
