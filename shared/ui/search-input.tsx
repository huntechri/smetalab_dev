"use client"

import * as React from "react"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/shared/ui/input"

type SearchInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  loading?: boolean
  autoLoading?: boolean
}

function SearchInput({
  className,
  value,
  loading = false,
  autoLoading = true,
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
    <div className="relative">
      <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-5 peer-disabled:opacity-50">
        <SearchIcon className="size-4" />
        <span className="sr-only">Search</span>
      </div>
      <Input
        type="search"
        value={value}
        className={cn(
          "peer pl-9 pr-9",
          className
        )}
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
