'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronsRightIcon, FolderIcon, FolderOpenIcon, HomeIcon } from 'lucide-react';
import type { BreadcrumbEntry } from '@/components/providers/breadcrumb-provider';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

type Breadcrumb07Props = {
    items: BreadcrumbEntry[];
};

export function Breadcrumb07({ items }: Breadcrumb07Props) {
    const [open, setOpen] = useState(false);

    if (!items || items.length === 0) {
        return null;
    }

    if (items.length === 1) {
        return (
            <Breadcrumb>
                <BreadcrumbList className="text-xs sm:text-sm">
                    <BreadcrumbItem>
                        <BreadcrumbPage className="truncate">{items[0].label}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    const first = items[0];
    const current = items[items.length - 1];
    const middleItems = items.slice(1, -1);

    return (
        <Breadcrumb>
            <BreadcrumbList className="text-xs sm:text-sm">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={first.href ?? '/app'} className="inline-flex items-center">
                            <HomeIcon className="size-4" />
                            <span className="sr-only">{first.label}</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <ChevronsRightIcon />
                </BreadcrumbSeparator>
                {middleItems.length > 0 ? (
                    <>
                        <BreadcrumbItem className="flex items-center gap-2">
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none">
                                    {open ? <FolderOpenIcon className="size-4" /> : <FolderIcon className="size-4" />}
                                    <span className="sr-only">{open ? 'Скрыть путь' : 'Показать путь'}</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {middleItems.map((item, index) => (
                                        <DropdownMenuItem key={`${item.label}-${index}`} asChild={Boolean(item.href)} disabled={!item.href}>
                                            {item.href ? (
                                                <Link href={item.href}>{item.label}</Link>
                                            ) : (
                                                <span>{item.label}</span>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronsRightIcon />
                        </BreadcrumbSeparator>
                    </>
                ) : null}
                <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate">{current.label}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
