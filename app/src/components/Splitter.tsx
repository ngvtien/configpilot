"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

interface SplitterProps {
  direction: "horizontal" | "vertical"
  initialSizes?: [number, number] // Percentages
  minSizes?: [number, number] // Percentages
  className?: string
  children: [React.ReactNode, React.ReactNode]
}

export const Splitter: React.FC<SplitterProps> = ({
  direction,
  initialSizes = [50, 50],
  minSizes = [20, 20],
  className = "",
  children,
}) => {
  const [sizes, setSizes] = useState<[number, number]>(initialSizes)
  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<boolean>(false)
  const startPos = useRef<number>(0)
  const startSizes = useRef<[number, number]>([0, 0])

  const isHorizontal = direction === "horizontal"

  // Memoize the resize handler to improve performance
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerSize = isHorizontal ? containerRect.width : containerRect.height

      const delta = isHorizontal ? e.clientX - startPos.current : e.clientY - startPos.current

      const deltaPercent = (delta / containerSize) * 100

      let newFirstSize = startSizes.current[0] + deltaPercent
      let newSecondSize = startSizes.current[1] - deltaPercent

      // Enforce minimum sizes
      if (newFirstSize < minSizes[0]) {
        newFirstSize = minSizes[0]
        newSecondSize = 100 - newFirstSize
      } else if (newSecondSize < minSizes[1]) {
        newSecondSize = minSizes[1]
        newFirstSize = 100 - newSecondSize
      }

      setSizes([newFirstSize, newSecondSize])
    },
    [isHorizontal, minSizes],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [])

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render to ensure the splitter adjusts to the new window size
      setSizes((prevSizes) => [...prevSizes] as [number, number])
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startPos.current = isHorizontal ? e.clientX : e.clientY
    startSizes.current = [...sizes]
    document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  return (
    <div
      ref={containerRef}
      className={`splitter-container ${isHorizontal ? "horizontal" : "vertical"} ${className}`}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="splitter-panel first-panel"
        style={{
          [isHorizontal ? "width" : "height"]: `${sizes[0]}%`,
          overflow: "auto",
          minHeight: isHorizontal ? "auto" : `${minSizes[0]}%`,
          minWidth: isHorizontal ? `${minSizes[0]}%` : "auto",
        }}
      >
        {children[0]}
      </div>
      <div
        ref={dividerRef}
        className="splitter-divider"
        style={{
          cursor: isHorizontal ? "col-resize" : "row-resize",
          [isHorizontal ? "width" : "height"]: "6px",
          background: "var(--color-border)",
          position: "relative",
          zIndex: 10,
          [isHorizontal ? "borderLeft" : "borderTop"]: "1px solid var(--color-border-dark)",
          [isHorizontal ? "borderRight" : "borderBottom"]: "1px solid var(--color-border-dark)",
          flexShrink: 0,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="splitter-handle"
          style={{
            position: "absolute",
            [isHorizontal ? "left" : "top"]: "50%",
            [isHorizontal ? "top" : "left"]: "50%",
            transform: "translate(-50%, -50%)",
            width: isHorizontal ? "4px" : "20px",
            height: isHorizontal ? "20px" : "4px",
            backgroundColor: "var(--color-secondary-light)",
            borderRadius: "2px",
            opacity: 0.5,
          }}
        />
      </div>
      <div
        className="splitter-panel second-panel"
        style={{
          [isHorizontal ? "width" : "height"]: `${sizes[1]}%`,
          overflow: "auto",
          minHeight: isHorizontal ? "auto" : `${minSizes[1]}%`,
          minWidth: isHorizontal ? `${minSizes[1]}%` : "auto",
        }}
      >
        {children[1]}
      </div>
    </div>
  )
}

export default Splitter
