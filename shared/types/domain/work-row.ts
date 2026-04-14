import { Work } from '@/lib/data/db/schema';

export type WorkRow = Omit<Work, 'embedding' | 'searchVector'> & {
    embedding?: number[] | null;
    isPlaceholder?: boolean;
    similarity?: number;
};
