"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Search, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface HelmChart {
  name: string
  version: string
  description: string
  appVersion: string
  repository: string
}

export const HelmChartSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [charts, setCharts] = useState<HelmChart[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>("all")
  const [repositories, setRepositories] = useState<string[]>([])

  useEffect(() => {
    // Load repositories
    const loadRepositories = async () => {
      try {
        // In a real implementation, this would call Electron's IPC
        const repos = await window.electron.invoke("helm:getRepositories")
        setRepositories(["all", ...repos])
      } catch (error) {
        console.error("Failed to load repositories:", error)
      }
    }

    loadRepositories()
  }, [])

  const searchCharts = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // In a real implementation, this would call Electron's IPC
      const results = await window.electron.invoke("helm:searchCharts", {
        query: searchQuery,
        repository: selectedRepo === "all" ? undefined : selectedRepo,
      })

      setCharts(results)
    } catch (error) {
      console.error("Failed to search charts:", error)
    } finally {
      setLoading(false)
    }
  }

  const installChart = async (chart: HelmChart) => {
    try {
      const targetDir = await window.electron.invoke("dialog:selectDirectory", {
        title: "Select directory to install chart",
      })

      if (!targetDir) return // User cancelled

      await window.electron.invoke("helm:pullChart", {
        chart: `${chart.repository}/${chart.name}`,
        version: chart.version,
        destination: targetDir,
      })

      // Show success notification
      // ...
    } catch (error) {
      console.error("Failed to install chart:", error)
      // Show error notification
      // ...
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search Helm Charts</h2>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCharts()}
            placeholder="Search for Helm charts..."
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>

        <select
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          {repositories.map((repo) => (
            <option key={repo} value={repo}>
              {repo === "all" ? "All Repositories" : repo}
            </option>
          ))}
        </select>

        <Button onClick={searchCharts} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {charts.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chart
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repository
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charts.map((chart, index) => (
                <tr key={`${chart.repository}-${chart.name}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{chart.name}</div>
                    <div className="text-sm text-gray-500">{chart.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{chart.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{chart.appVersion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{chart.repository}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => installChart(chart)}>
                        <Download className="h-4 w-4 mr-1" />
                        Install
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(`https://artifacthub.io/packages/helm/${chart.repository}/${chart.name}`)
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        searchQuery &&
        !loading && (
          <div className="text-center p-8 bg-gray-50 border rounded-md">
            No charts found matching your search criteria.
          </div>
        )
      )}
    </div>
  )
}
