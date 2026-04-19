'use client';

import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

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
    onCommit: (value: string) => Promise<void>;
    type?: 'text' | 'number' | 'date';
    disabled?: boolean;
    align?: 'left' | 'right' | 'center';
    clearOnFocus?: boolean;
    cancelOnEmpty?: boolean;
    className?: string;
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

    if (!editing) {
        return (
            <button
                type="button"
                disabled={disabled}
                className={cn(
                    'inline-flex w-full items-center rounded-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
                    className,
                )}
                onClick={() => {
                    wasClearedOnFocus.current = false;
                    setDraft(String(value));
                    setEditing(true);
                }}
            >
                {displayValue ?? String(value)}
            </button>
        );
    }

    return (
        <Input
            aria-label={ariaLabel}
            autoFocus
            className={className}
            textAlign={align}
            numeric={type === 'number'}
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
