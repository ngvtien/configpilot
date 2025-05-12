"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Edit, Folder } from "lucide-react"
import React from "react"

const ChartList = () => {
  const [charts, setCharts] = useState([])

  useEffect(() => {
    // Load charts from your storage
    // This is just an example
    const loadCharts = async () => {
      // In a real app, you would load this from storage or a database
      setCharts([
        { id: 1, name: "nginx", path: "/path/to/nginx" },
        { id: 2, name: "mysql", path: "/path/to/mysql" },
        { id: 3, name: "prometheus", path: "/path/to/prometheus" },
      ])
    }

    loadCharts()
  }, [])

  const openChartEditor = (chartPath) => {
    // In a real Electron app, you might use IPC to open a new window
    // For this example, we'll just navigate to the editor page
    window.location.href = `/chart-editor?path=${encodeURIComponent(chartPath)}`
  }

  const selectChartDirectory = async () => {
    const dirPath = await window.electron.invoke("dialog:selectDirectory", {
      title: "Select Helm Chart Directory",
    })

    if (dirPath) {
      openChartEditor(dirPath)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Helm Charts</h1>

        <Button onClick={selectChartDirectory}>
          <Folder className="h-4 w-4 mr-2" />
          Open Chart Directory
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {charts.map((chart) => (
          <div key={chart.id} className="border rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{chart.name}</h2>
              <Button size="sm" variant="outline" onClick={() => openChartEditor(chart.path)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{chart.path}</p>
          </div>
        ))}

        {charts.length === 0 && (
          <div className="col-span-full text-center p-8 bg-gray-50 border rounded-md">
            No charts found. Click "Open Chart Directory" to add a chart.
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartList
