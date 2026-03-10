'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    className?: string;
    onRatingChange?: (rating: number) => void;
    editable?: boolean;
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    className,
    onRatingChange,
    editable = false,
}: StarRatingProps) {
    const stars = [];

    const handleClick = (index: number) => {
        if (editable && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    for (let i = 0; i < maxRating; i++) {
        const isFull = i < Math.floor(rating);
        const isHalf = !isFull && i < rating && rating % 1 !== 0;

        stars.push(
            <span
                key={i}
                className={cn(
                    'inline-block transition-colors',
                    editable ? 'cursor-pointer hover:scale-110' : 'cursor-default',
                    className
                )}
                onClick={() => handleClick(i)}
            >
                {isFull ? (
                    <Star
                        size={size}
                        className="fill-yellow-400 text-yellow-400"
                    />
                ) : isHalf ? (
                    <StarHalf
                        size={size}
                        className="fill-yellow-400 text-yellow-400"
                    />
                ) : (
                    <Star
                        size={size}
                        className="text-muted-foreground"
                    />
                )}
            </span>
        );
    }

    return <div className="flex gap-1">{stars}</div>;
}
