import * as React from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCellProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageUrl?: string | null
  name: string
  containerClassName?: string
}

export function ImageCell({
  imageUrl,
  name,
  className,
  containerClassName,
  ...props
}: ImageCellProps) {
  if (!imageUrl) {
    return (
      <div
        className={cn(
          "size-[25px] rounded bg-muted flex items-center justify-center shrink-0",
          containerClassName
        )}
      >
        <ImageIcon className="size-3.5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className={cn("size-[25px] rounded object-cover shrink-0", className)}
      {...props}
    />
  )
}
