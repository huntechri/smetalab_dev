"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

interface UseSidebarStateOptions {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isMobile: boolean
  cookieName: string
  cookieMaxAge: number
  keyboardShortcut: string
}

export function useSidebarState({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  isMobile,
  cookieName,
  cookieMaxAge,
  keyboardShortcut,
}: UseSidebarStateOptions) {
  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (onOpenChange) {
        onOpenChange(openState)
      } else {
        _setOpen(openState)
      }

      if (typeof document !== "undefined") {
        document.cookie = `${cookieName}=${openState}; path=/; max-age=${cookieMaxAge}`
      }
    },
    [cookieMaxAge, cookieName, onOpenChange, open]
  )

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((value) => !value) : setOpen((value) => !value)
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === keyboardShortcut && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [keyboardShortcut, toggleSidebar])

  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed"

  return useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [open, openMobile, setOpen, state, toggleSidebar]
  )
}
