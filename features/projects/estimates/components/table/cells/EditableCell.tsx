'use client';

import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';

export function EditableCell({
    value,
    onCommit,
    type = 'text',
    disabled,
    align = 'left',
    clearOnFocus = false,
    cancelOnEmpty = false,
}: {
    value: string | number;
    onCommit: (value: string) => Promise<void>;
    type?: 'text' | 'number';
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
            <button
                className={`w-full hover:bg-muted/50 rounded-sm px-1 -mx-1 transition-colors min-h-[1.25rem] ${alignmentClass}`}
                disabled={disabled}
                onClick={() => {
                    wasClearedOnFocus.current = false;
                    setDraft(String(value));
                    setEditing(true);
                }}
            >
                {String(value)}
            </button>
        );
    }

    return (
        <Input
            autoFocus
            className={`h-7 px-1 text-inherit font-inherit border border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm bg-muted/80 ${alignmentClass}`}
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
