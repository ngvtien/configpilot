"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface CodeViewProps {
  code: string
}

const CodeView: React.FC<CodeViewProps> = ({ code }) => {
  return (
    <div className="relative">
      <pre className="rounded-md bg-gray-100 p-4 overflow-auto">
        <code className="text-sm text-gray-800">{code}</code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(code)
          // Optional: Add a toast notification
          if (typeof window !== "undefined") {
            const toast = document.createElement("div")
            toast.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
            toast.textContent = "Copied to clipboard!"
            document.body.appendChild(toast)
            setTimeout(() => document.body.removeChild(toast), 2000)
          }
        }}
        className="absolute top-2 right-2 z-10"
      >
        Copy to Clipboard
      </Button>
    </div>
  )
}

export default CodeView
