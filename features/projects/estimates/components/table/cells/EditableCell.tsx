'use client';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function EditableCell({
    value,
    onCommit,
    type = 'text',
    disabled,
    align = 'left',
    clearOnFocus = false,
    cancelOnEmpty = false,
    displayValue,
    ariaLabel,
    className,
}: {
    value: string | number;
    displayValue?: string;
    ariaLabel?: string;
    className?: string;
    onCommit: (value: string) => Promise<void>;
    type?: 'text' | 'number' | 'date';
    disabled?: boolean;
    align?: 'left' | 'right' | 'center';
    clearOnFocus?: boolean;
    cancelOnEmpty?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const wasClearedOnFocus = useRef(false);

    const cancel = () => {
        setDraft(String(value));
        setEditing(false);
    };

    const submit = async () => {
        if (disabled) return;
        if (cancelOnEmpty && draft === '') {
            cancel();
            return;
        }
        await onCommit(draft);
        setEditing(false);
    };

    const alignmentClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

    if (!editing) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="xs"
                className={cn('w-full min-w-0 hover:bg-muted/50 rounded-sm px-1 -mx-1 transition-colors min-h-5 text-inherit font-inherit', alignmentClass, className)}
                disabled={disabled}
                onClick={() => {
                    wasClearedOnFocus.current = false;
                    setDraft(String(value));
                    setEditing(true);
                }}
            >
                {displayValue ?? String(value)}
            </Button>
        );
    }

    return (
        <Input
            aria-label={ariaLabel}
            autoFocus
            className={cn(
                'h-7 px-1 text-inherit font-inherit border border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm bg-muted/80',
                alignmentClass,
                className,
            )}
            value={draft}
            type={type}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={() => {
                if (!clearOnFocus || wasClearedOnFocus.current) {
                    return;
                }
                wasClearedOnFocus.current = true;
                setDraft('');
            }}
            onBlur={() => void submit()}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    void submit();
                }
                if (event.key === 'Escape') {
                    cancel();
                }
            }}
        />
    );
}
