import { ImageIcon } from 'lucide-react';

export function ImageCell({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
    if (!imageUrl) {
        return (
            <div className="size-8 rounded bg-muted flex items-center justify-center">
                <ImageIcon className="size-4 text-muted-foreground" />
            </div>
        );
    }

    return <img className="size-8 rounded object-cover" src={imageUrl} alt={name} />;
}
