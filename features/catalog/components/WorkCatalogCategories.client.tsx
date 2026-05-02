'use client';

import { useRef, useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { catalogRepository } from '../repository';
import { FilterBar, FilterBarSkeleton, FilterBarViewport } from '@/shared/ui/filter-bar';
import { CatalogCategoryButton } from './CatalogCategoryButton';

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
        return <FilterBarSkeleton className={className} />;
    }

    if (categories.length === 0) return null;

    return (
        <FilterBar className={className}>
            <FilterBarViewport
                ref={scrollRef}
                dragging={isDragging}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                onPointerLeave={stopDragging}
            >
                <CatalogCategoryButton
                    active={selectedCategory === 'all'}
                    onClick={() => !isDragging && onCategoryChange('all')}
                >
                    {allLabel}
                </CatalogCategoryButton>
                {categories.map((category) => (
                    <CatalogCategoryButton
                        key={category}
                        active={selectedCategory === category}
                        onClick={() => !isDragging && onCategoryChange(category)}
                    >
                        {category}
                    </CatalogCategoryButton>
                ))}
            </FilterBarViewport>
        </FilterBar>
    );
}
