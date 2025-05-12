"use client"

import React from "react"
import { useMemo } from "react"
import { diffLines } from "diff"

interface ValuesDiffProps {
  originalValues: string
  newValues: string
  originalLabel?: string
  newLabel?: string
}

export const ValuesDiff: React.FC<ValuesDiffProps> = ({
  originalValues,
  newValues,
  originalLabel = "Original",
  newLabel = "New",
}) => {
  const diff = useMemo(() => {
    try {
      // Ensure both values are strings and not undefined
      const original = originalValues ? String(originalValues) : ""
      const updated = newValues ? String(newValues) : ""

      return diffLines(original, updated)
    } catch (error) {
      console.error("Failed to generate diff:", error)
      return []
    }
  }, [originalValues, newValues])

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex bg-gray-100 px-4 py-2 border-b">
        <div className="w-1/2 font-medium">{originalLabel}</div>
        <div className="w-1/2 font-medium border-l pl-4">{newLabel}</div>
      </div>

      <div className="flex">
        <pre className="w-1/2 p-4 overflow-auto text-sm font-mono">
          {diff.map((part, index) => (
            <span key={index} className={part.added ? "hidden" : part.removed ? "bg-red-100 block" : "block"}>
              {part.value}
            </span>
          ))}
        </pre>

        <pre className="w-1/2 p-4 overflow-auto text-sm font-mono border-l">
          {diff.map((part, index) => (
            <span key={index} className={part.removed ? "hidden" : part.added ? "bg-green-100 block" : "block"}>
              {part.value}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}
