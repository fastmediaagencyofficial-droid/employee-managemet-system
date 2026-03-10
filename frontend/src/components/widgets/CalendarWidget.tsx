import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

interface CalendarEvent {
    date: Date;
    title: string;
    description?: string;
    color?: string;
}

interface CalendarWidgetProps {
    title: string;
    description?: string;
    events?: CalendarEvent[];
    selectedDate?: Date;
    onDateSelect?: (date: Date | undefined) => void;
    footer?: ReactNode;
}

export default function CalendarWidget({
    title,
    description,
    events = [],
    selectedDate,
    onDateSelect,
    footer,
}: CalendarWidgetProps) {
    // Create a map of dates with events for highlighting
    const eventDates = events.reduce((acc, event) => {
        const dateKey = event.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    const modifiers = {
        hasEvent: (date: Date) => {
            const dateKey = date.toISOString().split('T')[0];
            return !!eventDates[dateKey];
        },
    };

    const modifiersStyles = {
        hasEvent: {
            fontWeight: 'bold',
            textDecoration: 'underline',
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border"
                />

                {/* Display events for selected date */}
                {selectedDate && eventDates[selectedDate.toISOString().split('T')[0]] && (
                    <div className="mt-4 w-full space-y-2">
                        <h4 className="text-sm font-semibold">Events on this day:</h4>
                        {eventDates[selectedDate.toISOString().split('T')[0]].map((event, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-3"
                                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                            >
                                <p className="font-medium text-sm">{event.title}</p>
                                {event.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {footer && <div className="mt-4 w-full">{footer}</div>}
            </CardContent>
        </Card>
    );
}
