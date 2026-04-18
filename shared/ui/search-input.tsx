"use client"

import * as React from "react"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/shared/ui/input"

type SearchInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  loading?: boolean
  autoLoading?: boolean
  highlighted?: boolean
}

function SearchInput({
  value,
  loading = false,
  autoLoading = true,
  highlighted = false,
  ...props
}: SearchInputProps) {
  const [isAutoLoading, setIsAutoLoading] = React.useState(false)

  React.useEffect(() => {
    if (!autoLoading) {
      setIsAutoLoading(false)
      return
    }

    if (typeof value !== "string" || value.length === 0) {
      setIsAutoLoading(false)
      return
    }

    setIsAutoLoading(true)
    const timer = window.setTimeout(() => {
      setIsAutoLoading(false)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [autoLoading, value])

  const showLoader = loading || (autoLoading && isAutoLoading)

  return (
    <div className={cn(
      "relative [&_input]:pl-9 [&_input]:pr-9",
      highlighted && "ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)] rounded-md"
    )}>
      <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
        <SearchIcon className="size-4" />
        <span className="sr-only">Search</span>
      </div>
      <Input
        type="search"
        value={value}
        {...props}
      />
      {showLoader && (
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
          <LoaderCircleIcon className="size-4 animate-spin" />
          <span className="sr-only">Loading</span>
        </div>
      )}
    </div>
  )
}

export { SearchInput }
