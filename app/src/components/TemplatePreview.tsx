"use client"

import React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/Button"
import { Loader2 } from "lucide-react"

interface TemplatePreviewProps {
  releaseName: string
  namespace: string
  valuesYaml: string
  chartPath: string
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ releaseName, namespace, valuesYaml, chartPath }) => {
  const [templates, setTemplates] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTemplates = async () => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would call Electron's IPC to run helm template
      // For now, we'll simulate it
      const result = await window.electron.invoke("helm:template", {
        releaseName,
        namespace,
        valuesYaml,
        chartPath,
      })

      setTemplates(result.templates)
    } catch (err) {
      setError(`Failed to generate templates: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Template Preview</h2>
        <Button onClick={generateTemplates} disabled={loading} variant="primary">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Templates
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">{error}</div>}

      {Object.keys(templates).length > 0 ? (
        <Tabs defaultValue={Object.keys(templates)[0]}>
          <TabsList className="mb-2 overflow-x-auto">
            {Object.keys(templates).map((filename) => (
              <TabsTrigger key={filename} value={filename}>
                {filename.split("/").pop()}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(templates).map(([filename, content]) => (
            <TabsContent key={filename} value={filename}>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto">
                <pre className="text-sm font-mono">{content}</pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        !loading && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-center text-gray-500">
            Click "Generate Templates" to preview the rendered Kubernetes manifests
          </div>
        )
      )}
    </div>
  )
}
