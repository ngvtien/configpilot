"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValuesDiff } from "@/components/ValuesDiff"
import { SchemaValidation } from "@/components/SchemaValidation"
import { TemplatePreview } from "@/components/TemplatePreview"
import { OptimizedEditor } from "@/components/OptimizedEditor"
import { Save, FileText, Check, Eye } from "lucide-react"
import React from "react"

const ChartEditor = () => {
  // State for the chart data
  const [chartPath, setChartPath] = useState("")
  const [releaseName, setReleaseName] = useState("")
  const [namespace, setNamespace] = useState("default")

  // State for values and schema
  const [currentValues, setCurrentValues] = useState("")
  const [originalValues, setOriginalValues] = useState("")
  const [schema, setSchema] = useState({})

  // Load chart data on component mount
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Get the chart path from the URL or electron store
        const params = new URLSearchParams(window.location.search)
        const path = params.get("path") || ""

        if (path) {
          setChartPath(path)

          // Load chart values and schema using IPC
          const chartData = await window.electron.invoke("chart:getDetails", { path })

          setReleaseName(chartData.name || "")
          setNamespace(chartData.namespace || "default")
          setCurrentValues(chartData.values || "")
          setOriginalValues(chartData.values || "")
          setSchema(chartData.schema || {})
        }
      } catch (error) {
        console.error("Failed to load chart data:", error)
        // Show error notification
      }
    }

    loadChartData()
  }, [])

  // Save changes
  const saveChanges = async () => {
    try {
      await window.electron.invoke("chart:saveValues", {
        chartPath,
        values: currentValues,
      })

      // Update original values after save
      setOriginalValues(currentValues)

      // Show success notification
      console.log("Changes saved successfully")
    } catch (error) {
      console.error("Failed to save changes:", error)
      // Show error notification
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{releaseName ? `Editing: ${releaseName}` : "Chart Editor"}</h1>

        <div className="flex items-center gap-2">
          <Button onClick={saveChanges} disabled={currentValues === originalValues}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">
            <FileText className="h-4 w-4 mr-2" />
            Values Editor
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Check className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="diff">
            <FileText className="h-4 w-4 mr-2" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Template Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <OptimizedEditor value={currentValues} onChange={setCurrentValues} height={600} />
        </TabsContent>

        <TabsContent value="validation">
          <SchemaValidation schema={schema} values={currentValues ? JSON.parse(currentValues) : {}} />
        </TabsContent>

        <TabsContent value="diff">
          <ValuesDiff
            originalValues={originalValues}
            newValues={currentValues}
            originalLabel="Original Values"
            newLabel="Current Values"
          />
        </TabsContent>

        <TabsContent value="preview">
          <TemplatePreview
            releaseName={releaseName}
            namespace={namespace}
            valuesYaml={currentValues}
            chartPath={chartPath}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChartEditor
