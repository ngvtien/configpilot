"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { VariableSizeList as List } from "react-window"
import { Download, RefreshCw, X, Filter, Search, ChevronDown, ChevronUp } from "lucide-react"
import LoggingService, { type LogEntry, LogLevel } from "../services/LoggingService"
import "./LogViewer.css"

interface LogViewerProps {
  initialMaxEntries?: number
  initialMinLevel?: LogLevel
  onClose?: () => void
  className?: string
}

const LogViewer: React.FC<LogViewerProps> = ({
  initialMaxEntries = 1000,
  initialMinLevel = LogLevel.DEBUG,
  onClose,
  className = "",
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState({
    level: initialMinLevel,
    source: "",
    search: "",
  })
  const [sources, setSources] = useState<string[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxEntries, setMaxEntries] = useState(initialMaxEntries)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const listRef = useRef<List>(null)
  const rowHeights = useRef<{ [index: number]: number }>({})

  // Function to calculate row height
  const getRowHeight = (index: number) => {
    return rowHeights.current[index] || 30 // Default height
  }

  // Function to set row height
  const setRowHeight = useCallback((index: number, height: number) => {
    if (rowHeights.current[index] !== height) {
      rowHeights.current[index] = height
      if (listRef.current) {
        listRef.current.resetAfterIndex(index)
      }
    }
  }, [])

  // Load initial logs
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logEntries = await LoggingService.getLogs()
        setLogs(logEntries.slice(-maxEntries))

        // Extract unique sources
        const uniqueSources = Array.from(new Set(logEntries.map((log) => log.source))).sort()
        setSources(uniqueSources)
      } catch (error) {
        console.error("Failed to load logs:", error)
      }
    }

    loadLogs()

    // Subscribe to new logs
    const unsubscribe = LoggingService.subscribe((logEntry) => {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, logEntry]
        if (newLogs.length > maxEntries) {
          return newLogs.slice(-maxEntries)
        }
        return newLogs
      })

      // Add new source if needed
      if (!sources.includes(logEntry.source)) {
        setSources((prevSources) => [...prevSources, logEntry.source].sort())
      }
    })

    return unsubscribe
  }, [maxEntries])

  // Apply filters when logs or filter criteria change
  useEffect(() => {
    const levelPriority: { [key: string]: number } = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      verbose: 4,
      silly: 5,
    }

    const filtered = logs.filter((log) => {
      // Filter by level
      if (levelPriority[log.level] > levelPriority[filter.level]) {
        return false
      }

      // Filter by source
      if (filter.source && log.source !== filter.source) {
        return false
      }

      // Filter by search text
      if (filter.search && !log.message.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }

      return true
    })

    setFilteredLogs(filtered)

    // Reset row heights when filtered logs change
    rowHeights.current = {}

    // Auto-scroll to bottom if enabled
    if (autoScroll && listRef.current && filtered.length > 0) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToItem(filtered.length - 1)
        }
      }, 0)
    }
  }, [logs, filter, autoScroll])

  // Handle scroll to detect if user has manually scrolled up
  const handleScroll = ({
    scrollOffset,
    scrollUpdateWasRequested,
  }: { scrollOffset: number; scrollUpdateWasRequested: boolean }) => {
    if (!scrollUpdateWasRequested) {
      const listElement = listRef.current?._outerRef as HTMLDivElement
      if (listElement) {
        const { scrollHeight, clientHeight } = listElement
        const isAtBottom = scrollOffset >= scrollHeight - clientHeight - 10
        setAutoScroll(isAtBottom)
      }
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    setFilter({ ...filter, [key]: value })
  }

  // Handle clear logs
  const handleClearLogs = async () => {
    try {
      await LoggingService.clearLogs()
      setLogs([])
      setFilteredLogs([])
      rowHeights.current = {}
    } catch (error) {
      console.error("Failed to clear logs:", error)
    }
  }

  // Handle export logs
  const handleExportLogs = async (format: "json" | "csv" | "txt") => {
    try {
      setIsExporting(true)
      const result = await LoggingService.exportLogs(format)
      setIsExporting(false)
      setIsExportOpen(false)

      if (result.success) {
        LoggingService.info("LogViewer", `Logs exported successfully to ${result.path}`)
      } else {
        LoggingService.error("LogViewer", `Failed to export logs: ${result.error}`)
      }
    } catch (error) {
      setIsExporting(false)
      LoggingService.error("LogViewer", "Failed to export logs", { error })
    }
  }

  // Handle log level change
  const handleLogLevelChange = async (level: LogLevel) => {
    try {
      await LoggingService.setLogLevel(level)
      handleFilterChange("level", level)
    } catch (error) {
      console.error("Failed to change log level:", error)
    }
  }

  // Row renderer for virtualized list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowRef = useRef<HTMLDivElement>(null)
    const log = filteredLogs[index]

    // Measure row height after render
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height
        setRowHeight(index, height)
      }
    }, [log, index])

    // Format timestamp
    const formatTimestamp = (timestamp: string): string => {
      try {
        const date = new Date(timestamp)
        return date.toLocaleTimeString()
      } catch (e) {
        return timestamp
      }
    }

    return (
      <div
        ref={rowRef}
        className={`log-row log-level-${log.level}`}
        style={{
          ...style,
          height: "auto", // Let content determine height
        }}
      >
        <div className="log-row-content">
          <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
          <span className={`log-level log-level-${log.level}`}>{log.level.toUpperCase()}</span>
          <span className="log-source">{log.source}</span>
          <div className="log-message-container">
            <span className="log-message">{log.message}</span>
            {log.data && <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`log-viewer ${className}`}>
      <div className="log-viewer-header">
        <h2>Application Logs</h2>

        <div className="log-viewer-controls">
          <button className="log-viewer-button" onClick={() => setIsFilterOpen(!isFilterOpen)} title="Filter logs">
            <Filter size={16} />
            <span>Filter</span>
            {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            className="log-viewer-button"
            onClick={() => {
              setAutoScroll(true)
              if (listRef.current && filteredLogs.length > 0) {
                listRef.current.scrollToItem(filteredLogs.length - 1)
              }
            }}
            title="Scroll to latest logs"
            disabled={autoScroll}
          >
            <RefreshCw size={16} />
            <span>Latest</span>
          </button>

          <div className="log-viewer-dropdown">
            <button className="log-viewer-button" onClick={() => setIsExportOpen(!isExportOpen)} title="Export logs">
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} />
            </button>

            {isExportOpen && (
              <div className="log-viewer-dropdown-menu">
                <button onClick={() => handleExportLogs("json")} disabled={isExporting}>
                  Export as JSON
                </button>
                <button onClick={() => handleExportLogs("csv")} disabled={isExporting}>
                  Export as CSV
                </button>
                <button onClick={() => handleExportLogs("txt")} disabled={isExporting}>
                  Export as Text
                </button>
              </div>
            )}
          </div>

          <button className="log-viewer-button log-viewer-button-clear" onClick={handleClearLogs} title="Clear logs">
            <X size={16} />
            <span>Clear</span>
          </button>

          {onClose && (
            <button className="log-viewer-button log-viewer-button-close" onClick={onClose} title="Close log viewer">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <div className="log-viewer-filters">
          <div className="log-filter">
            <label>Log Level:</label>
            <select value={filter.level} onChange={(e) => handleLogLevelChange(e.target.value as LogLevel)}>
              <option value={LogLevel.ERROR}>Error & Above</option>
              <option value={LogLevel.WARN}>Warning & Above</option>
              <option value={LogLevel.INFO}>Info & Above</option>
              <option value={LogLevel.DEBUG}>Debug & Above</option>
              <option value={LogLevel.VERBOSE}>Verbose & Above</option>
              <option value={LogLevel.SILLY}>All Logs</option>
            </select>
          </div>

          <div className="log-filter">
            <label>Source:</label>
            <select value={filter.source} onChange={(e) => handleFilterChange("source", e.target.value)}>
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div className="log-filter log-filter-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={filter.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            {filter.search && (
              <button className="log-search-clear" onClick={() => handleFilterChange("search", "")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="log-filter">
            <label>Max Entries:</label>
            <select value={maxEntries} onChange={(e) => setMaxEntries(Number(e.target.value))}>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>
        </div>
      )}

      <div className="log-viewer-container">
        {filteredLogs.length === 0 ? (
          <div className="log-viewer-empty">
            <p>No logs to display</p>
            {filter.level !== LogLevel.SILLY || filter.source || filter.search ? (
              <p>Try adjusting your filters</p>
            ) : null}
          </div>
        ) : (
          <List
            ref={listRef}
            className="log-viewer-list"
            height={500} // Adjust based on your UI
            width="100%"
            itemCount={filteredLogs.length}
            itemSize={getRowHeight}
            onScroll={handleScroll}
          >
            {Row}
          </List>
        )}
      </div>

      {!autoScroll && filteredLogs.length > 0 && (
        <button
          className="log-scroll-to-bottom"
          onClick={() => {
            setAutoScroll(true)
            if (listRef.current) {
              listRef.current.scrollToItem(filteredLogs.length - 1)
            }
          }}
          title="Scroll to latest logs"
        >
          <ChevronDown size={20} />
        </button>
      )}

      <div className="log-viewer-footer">
        <div className="log-stats">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>
    </div>
  )
}

export default LogViewer
