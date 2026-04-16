'use client';

import Link from 'next/link';
import type { BreadcrumbEntry } from '@/components/providers/breadcrumb-provider';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

type Breadcrumb03Props = {
    items: BreadcrumbEntry[];
};

export function Breadcrumb03({ items }: Breadcrumb03Props) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList className="text-xs sm:text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <BreadcrumbItem key={`${item.label}-${index}`} className="min-w-0">
                            {isLast || !item.href ? (
                                <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href} className="truncate">
                                        {item.label}
                                    </Link>
                                </BreadcrumbLink>
                            )}
                            {!isLast ? <BreadcrumbSeparator /> : null}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
