"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useVirtualizedEditor } from "@/hooks/useVirtualizedEditor"

interface OptimizedEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  lineHeight?: number
}

export const OptimizedEditor: React.FC<OptimizedEditorProps> = ({ value, onChange, height = 500, lineHeight = 20 }) => {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    setLines(value.split("\n"))
  }, [value])

  const visibleLines = Math.ceil(height / lineHeight)

  const { containerRef, startLine, endLine, totalHeight, offsetY } = useVirtualizedEditor({
    totalLines: lines.length,
    visibleLines,
    lineHeight,
  })

  const handleLineChange = (index: number, newContent: string) => {
    const newLines = [...lines]
    newLines[index] = newContent
    onChange(newLines.join("\n"))
  }

  const visibleLineNumbers = Array.from({ length: endLine - startLine + 1 }, (_, i) => startLine + i)

  return (
    <div ref={containerRef} className="border rounded-md overflow-auto font-mono text-sm" style={{ height }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, width: "100%" }}>
          <div className="flex">
            {/* Line numbers */}
            <div className="bg-gray-100 text-gray-500 p-2 text-right select-none" style={{ minWidth: "3rem" }}>
              {visibleLineNumbers.map((lineNumber) => (
                <div key={lineNumber} style={{ height: lineHeight }}>
                  {lineNumber + 1}
                </div>
              ))}
            </div>

            {/* Editor lines */}
            <div className="p-2 flex-1">
              {visibleLineNumbers.map((lineNumber) => (
                <div key={lineNumber} style={{ height: lineHeight }}>
                  <input
                    type="text"
                    value={lines[lineNumber] || ""}
                    onChange={(e) => handleLineChange(lineNumber, e.target.value)}
                    className="w-full h-full border-none p-0 focus:outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
