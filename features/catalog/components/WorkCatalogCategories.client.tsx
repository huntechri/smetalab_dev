'use client';

import { useRef, useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { catalogRepository } from '../repository';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    className?: string;
    loadCategories?: () => Promise<string[]>;
    allLabel?: string;
}

export function WorkCatalogCategories({ selectedCategory, onCategoryChange, className, loadCategories: loadCategoriesProp, allLabel = 'Все разделы' }: Props) {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mouse wheel horizontal scroll
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // Grab to scroll logic
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        setIsDragging(true);
        setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const stopDragging = () => setIsDragging(false);

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = loadCategoriesProp ? await loadCategoriesProp() : await catalogRepository.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, [loadCategoriesProp]);

    if (loading && categories.length === 0) {
        return (
            <div className={cn("px-4 py-2 border-b flex gap-2 overflow-hidden", className)}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full shrink-0" />
                ))}
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className={cn("border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10", className)}>
            <div
                ref={scrollRef}
                className={cn(
                    "w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 p-2 px-4 select-none",
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                onPointerLeave={stopDragging}
            >
                <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                        "h-7 px-3 rounded-full text-[11px] font-medium transition-all shrink-0 pointer-events-auto",
                        selectedCategory === 'all'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => !isDragging && onCategoryChange('all')}
                >
                    {allLabel}
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                            "h-7 px-3 rounded-full text-[11px] font-medium transition-all shrink-0 pointer-events-auto",
                            selectedCategory === category
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        onClick={() => !isDragging && onCategoryChange(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
    );
}
