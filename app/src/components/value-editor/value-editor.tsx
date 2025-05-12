"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import yaml from "js-yaml"

interface ValueEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
}

const ValueEditor: React.FC<ValueEditorProps> = ({ initialValue = "", onChange }) => {
  const [yamlContent, setYamlContent] = useState(initialValue)
  const [displayFormat, setDisplayFormat] = useState<"yaml" | "configmap" | "configjson">("yaml")

  useEffect(() => {
    if (onChange) {
      onChange(yamlContent)
    }
  }, [yamlContent, onChange])

  const handleYamlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setYamlContent(e.target.value)
  }

  const generateConfigMap = () => {
    try {
      // Parse the YAML to get the values
      const values = yaml.load(yamlContent) || {}

      // Create a ConfigMap template
      const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
${Object.entries(values)
  .map(([key, value]) => {
    // Convert nested objects to JSON strings
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
    return `  ${key}: ${JSON.stringify(stringValue)}`
  })
  .join("\n")}
`
      return configMap
    } catch (error) {
      console.error("Error generating ConfigMap:", error)
      return "Error generating ConfigMap"
    }
  }

  const generateConfigJson = () => {
    try {
      // Parse the YAML to get the values
      const values = yaml.load(yamlContent) || {}
      // Convert to pretty JSON
      return JSON.stringify(values, null, 2)
    } catch (error) {
      console.error("Error generating Config.json:", error)
      return "Error generating Config.json"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Optional: Add a toast notification
    if (typeof window !== "undefined") {
      const toast = document.createElement("div")
      toast.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
      toast.textContent = "Copied to clipboard!"
      document.body.appendChild(toast)
      setTimeout(() => document.body.removeChild(toast), 2000)
    }
  }

  const renderDisplayContent = () => {
    let content = ""
    let language = "yaml"

    switch (displayFormat) {
      case "yaml":
        content = yamlContent
        language = "yaml"
        break
      case "configmap":
        content = generateConfigMap()
        language = "yaml"
        break
      case "configjson":
        content = generateConfigJson()
        language = "json"
        break
    }

    return (
      <div className="relative h-full">
        <SyntaxHighlighter language={language} style={tomorrow} className="h-full overflow-auto rounded-md">
          {content}
        </SyntaxHighlighter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(content)}
          className="absolute top-2 right-2 z-10"
        >
          Copy
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Value Editor</h2>
        <div className="flex space-x-2">
          <Button
            variant={displayFormat === "yaml" ? "default" : "outline"}
            size="sm"
            onClick={() => setDisplayFormat("yaml")}
          >
            YAML
          </Button>
          <Button
            variant={displayFormat === "configmap" ? "default" : "outline"}
            size="sm"
            onClick={() => setDisplayFormat("configmap")}
          >
            ConfigMap
          </Button>
          <Button
            variant={displayFormat === "configjson" ? "default" : "outline"}
            size="sm"
            onClick={() => setDisplayFormat("configjson")}
          >
            Config.json
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 h-full">
        {/* YAML Editor - 2/3 width */}
        <div className="w-2/3 h-full">
          <textarea
            value={yamlContent}
            onChange={handleYamlChange}
            className="w-full h-full p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter YAML here..."
          />
        </div>

        {/* Display Panel - 1/3 width */}
        <div className="w-1/3 h-full">{renderDisplayContent()}</div>
      </div>
    </div>
  )
}

export default ValueEditor