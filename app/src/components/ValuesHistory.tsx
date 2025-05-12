"use client"

import React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Clock } from "lucide-react"

interface HistoryEntry {
  id: string
  timestamp: number
  values: string
  comment?: string
}

interface ValuesHistoryProps {
  currentValues: string
  filePath: string
  onRestoreVersion: (values: string) => void
}

export const ValuesHistory: React.FC<ValuesHistoryProps> = ({ currentValues, filePath, onRestoreVersion }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // In a real implementation, this would call Electron's IPC
        const historyData = await window.electron.invoke("values:getHistory", { filePath })
        setHistory(historyData)
      } catch (error) {
        console.error("Failed to load history:", error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [filePath])

  const saveCurrentVersion = async (comment = "") => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        values: currentValues,
        comment,
      }

      // In a real implementation, this would call Electron's IPC
      await window.electron.invoke("values:saveVersion", {
        filePath,
        entry: newEntry,
      })

      setHistory((prev) => [newEntry, ...prev])
    } catch (error) {
      console.error("Failed to save version:", error)
    }
  }

  const selectedEntry = selectedVersion ? history.find((entry) => entry.id === selectedVersion) : null

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Version History
        </h3>
        <Button
          size="sm"
          onClick={() => {
            const comment = window.prompt("Add a comment for this version (optional):")
            saveCurrentVersion(comment || undefined)
          }}
        >
          Save Current Version
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No history available. Save a version to start tracking changes.
        </div>
      ) : (
        <div className="flex h-96">
          <div className="w-1/3 border-r overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedVersion === entry.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedVersion(entry.id)}
              >
                <div className="font-medium">{format(entry.timestamp, "MMM d, yyyy h:mm a")}</div>
                {entry.comment && <div className="text-sm text-gray-600 mt-1">{entry.comment}</div>}
              </div>
            ))}
          </div>

          <div className="w-2/3 flex flex-col">
            {selectedEntry ? (
              <>
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                  <div>Version from {format(selectedEntry.timestamp, "MMM d, yyyy h:mm a")}</div>
                  <Button size="sm" onClick={() => onRestoreVersion(selectedEntry.values)}>
                    Restore This Version
                  </Button>
                </div>
                <pre className="p-4 overflow-auto flex-1 text-sm font-mono">{selectedEntry.values}</pre>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">
                Select a version to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
