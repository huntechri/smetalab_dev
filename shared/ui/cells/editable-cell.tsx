'use client';

import * as React from "react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../button"
import { Input } from "../input"

interface EditableCellProps {
    value: string | number;
    displayValue?: string;
    ariaLabel?: string;
    title?: string;
    onCommit: (value: string) => Promise<void>;
    type?: 'text' | 'number' | 'date';
    disabled?: boolean;
    align?: 'left' | 'right' | 'center';
    clearOnFocus?: boolean;
    cancelOnEmpty?: boolean;
    className?: string;
}

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
    title,
    className,
}: EditableCellProps) {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(String(value));
    const wasClearedOnFocus = React.useRef(false);

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
            <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-label={ariaLabel}
                title={title}
                className={cn(
                    'group w-full justify-start rounded-sm cursor-text hover:underline hover:decoration-dashed hover:underline-offset-2 focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:underline focus-visible:decoration-dashed focus-visible:underline-offset-2',
                    className,
                )}
                onClick={() => {
                    wasClearedOnFocus.current = false;
                    setDraft(String(value));
                    setEditing(true);
                }}
            >
                {displayValue ?? String(value)}
                <Pencil className="ml-auto shrink-0 size-3 opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40 transition-opacity" />
            </Button>
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
