"use client"

import React from "react"
import { useEffect, useRef } from "react"

interface CustomSyntaxHighlighterProps {
  code: string
  language: "json" | "yaml" | "plaintext"
  className?: string
  codeRef?: React.RefObject<HTMLElement>
}

export const CustomSyntaxHighlighter: React.FC<CustomSyntaxHighlighterProps> = ({
  code,
  language,
  className = "",
  codeRef: externalCodeRef,
}) => {
  const internalCodeRef = useRef<HTMLElement>(null)
  const codeRef = externalCodeRef || internalCodeRef

  useEffect(() => {
    // Dynamically import highlight.js
    const loadHighlight = async () => {
      try {
        const hljs = await import("highlight.js/lib/core")

        // Import only the languages we need
        if (language === "json") {
          const json = await import("highlight.js/lib/languages/json")
          hljs.default.registerLanguage("json", json.default)
        } else if (language === "yaml") {
          const yaml = await import("highlight.js/lib/languages/yaml")
          hljs.default.registerLanguage("yaml", yaml.default)
        }

        // Apply highlighting if we have a valid element and language
        if (codeRef.current && (language === "json" || language === "yaml")) {
          hljs.default.highlightElement(codeRef.current)
        }
      } catch (error) {
        console.error("Error loading highlight.js:", error)
      }
    }

    loadHighlight()
  }, [code, language, codeRef])

  return (
    <pre className={`syntax-highlighter ${className}`}>
      <code ref={codeRef} className={language}>
        {code}
      </code>
    </pre>
  )
}

export default CustomSyntaxHighlighter
