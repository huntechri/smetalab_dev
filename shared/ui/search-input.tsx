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
          className,
          "peer file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input !h-7 !w-[min(20rem,calc(100vw-2rem))] max-w-full min-w-0 rounded-[7.6px] border bg-transparent !pl-9 !pr-9 py-1 !text-[12px] leading-[16px] transition-colors outline-none file:inline-flex file:h-5 file:border-0 file:bg-transparent file:text-[12px] file:font-medium focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-primary/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:!text-[12px] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
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
