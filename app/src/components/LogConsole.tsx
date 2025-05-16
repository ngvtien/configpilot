"use client"

import React from "react"
import { useState } from "react"
import { Terminal, X, Maximize2, Minimize2 } from "lucide-react"
import LogViewer from "./LogViewer"
import "./LogConsole.css"

interface LogConsoleProps {
  initialOpen?: boolean
}

const LogConsole: React.FC<LogConsoleProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isMaximized, setIsMaximized] = useState(false)

  const toggleConsole = () => {
    setIsOpen(!isOpen)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  return (
    <>
      {!isOpen && (
        <button className="log-console-toggle" onClick={toggleConsole} title="Open Log Console">
          <Terminal size={20} />
        </button>
      )}

      {isOpen && (
        <div className={`log-console ${isMaximized ? "log-console-maximized" : ""}`}>
          <div className="log-console-header">
            <div className="log-console-title">
              <Terminal size={16} />
              <span>Log Console</span>
            </div>
            <div className="log-console-controls">
              <button onClick={toggleMaximize} title={isMaximized ? "Minimize" : "Maximize"}>
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={toggleConsole} title="Close Console">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="log-console-content">
            <LogViewer />
          </div>
        </div>
      )}
    </>
  )
}

export default LogConsole
