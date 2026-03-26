import { ImageIcon } from 'lucide-react';

export function ImageCell({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
    if (!imageUrl) {
        return (
            <div className="size-[25px] rounded bg-muted flex items-center justify-center">
                <ImageIcon className="size-3.5 text-muted-foreground" />
            </div>
        );
    }

    return <img className="size-[25px] rounded object-cover" src={imageUrl} alt={name} />;
}
