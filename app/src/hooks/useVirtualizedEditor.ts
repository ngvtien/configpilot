"use client"

import { useEffect, useRef, useState } from "react"

interface UseVirtualizedEditorOptions {
  totalLines: number
  visibleLines: number
  lineHeight: number
  buffer?: number
}

export function useVirtualizedEditor({
  totalLines,
  visibleLines,
  lineHeight,
  buffer = 10,
}: UseVirtualizedEditorOptions) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate which lines should be rendered
  const startLine = Math.max(0, Math.floor(scrollTop / lineHeight) - buffer)
  const endLine = Math.min(totalLines - 1, Math.floor((scrollTop + visibleLines * lineHeight) / lineHeight) + buffer)

  // Calculate the total height to maintain proper scrollbar
  const totalHeight = totalLines * lineHeight

  // Calculate offset to position the visible lines correctly
  const offsetY = startLine * lineHeight

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return {
    containerRef,
    startLine,
    endLine,
    totalHeight,
    offsetY,
    visibleLines: endLine - startLine + 1,
  }
}
