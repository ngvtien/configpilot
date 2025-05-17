"use client"

import React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, Server, CheckCircle, AlertTriangle } from "lucide-react"
import KubernetesService from "../../services/KubernetesService"
import LoggingService from "../../services/LoggingService"

interface KubernetesContext {
  name: string
  cluster: string
  user: string
  namespace?: string
}

interface KubernetesContextSelectorProps {
  onContextChange: (contextName: string) => void
  className?: string
  showLabel?: boolean
  initialContext?: string
}

const KubernetesContextSelector: React.FC<KubernetesContextSelectorProps> = ({
  onContextChange,
  className = "",
  showLabel = true,
  initialContext = "",
}) => {
  //LoggingService.info("[KubernetesContextSelector]", "Rendering component with initialContext")
  //LoggingService.log("[KubernetesContextSelector] Rendering component with initialContext:", initialContext)
  const [contexts, setContexts] = useState<KubernetesContext[]>([])
  const [currentContext, setCurrentContext] = useState<string>(initialContext)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isSimulated, setIsSimulated] = useState<boolean>(false)

  useEffect(() => {
    LoggingService.info("[KubernetesContextSelector]", "Component mounted, loading contexts")
    loadContexts()

    // Check if we're in simulation mode by checking if the electron bridge is available
    setIsSimulated(!window.Electron)
  }, [])

  // Add a new useEffect to handle initialContext changes
  useEffect(() => {
    if (initialContext && initialContext !== currentContext && !isLoading) {
      //LoggingService.info("[KubernetesContextSelector]", "initialContext changed updating context", initialContext)
      LoggingService.info("[KubernetesContextSelector]", "initialContext changed updating context")
      handleContextChange(initialContext)
    }
  }, [initialContext, isLoading])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    console.log("[KubernetesContextSelector] Setting up click-outside handler")
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".k8s-context-selector")) {
        console.log("[KubernetesContextSelector] Click outside detected, closing dropdown")
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      LoggingService.info("[KubernetesContextSelector]", " Removing click-outside handler")
      document.removeEventListener("mousedown", handleClickOutside)

      //LoggingService.info("HomePage", "Component mounted")
      LoggingService.debug("SettingsPanel", "Fetching user preferences", { userId: 123 })
//LoggingService.error("DataLoader", "Failed to load config", error)

    }
  }, [isOpen])

  const loadContexts = async () => {
    console.log("[KubernetesContextSelector] loadContexts called")
    try {
      setIsLoading(true)
      setError(null)

      LoggingService.info("[KubernetesContextSelector]", "Calling KubernetesService.loadContexts")
      const contextList = await KubernetesService.loadContexts()
      LoggingService.info("[KubernetesContextSelector]", "Contexts loaded:", contextList)

      setContexts(contextList)

      const currentCtx = KubernetesService.getCurrentContext()
      console.log("[KubernetesContextSelector] Current context:", currentCtx)
      setCurrentContext(currentCtx)

      setIsLoading(false)
      console.log("[KubernetesContextSelector] Contexts loaded successfully")
    } catch (err) {
      LoggingService.error("[KubernetesContextSelector] Failed to load contexts:", err)
      setError("Failed to load Kubernetes contexts")
      setIsLoading(false)
    }
  }

  const handleContextChange = async (contextName: string) => {
    console.log("[KubernetesContextSelector] handleContextChange called with:", contextName)
    try {
      console.log("[KubernetesContextSelector] Calling KubernetesService.setContext")
      await KubernetesService.setContext(contextName)

      console.log("[KubernetesContextSelector] Context changed successfully, updating state")
      setCurrentContext(contextName)

      console.log("[KubernetesContextSelector] Calling onContextChange callback")
      onContextChange(contextName)

      setIsOpen(false)
      console.log("[KubernetesContextSelector] Dropdown closed")
    } catch (err) {
      LoggingService.error(`[KubernetesContextSelector] Failed to set context to ${contextName}:`, err)
      setError(`Failed to set context to ${contextName}`)
    }
  }

  console.log("[KubernetesContextSelector] Current state:", {
    isLoading,
    error,
    contextsCount: contexts.length,
    currentContext,
    isSimulated,
  })

  if (isLoading) {
    console.log("[KubernetesContextSelector] Rendering loading state")
    return (
      <div className={`k8s-context-selector ${className}`}>
        <div className="k8s-context-loading">Loading contexts...</div>
      </div>
    )
  }

  if (error) {
    console.log("[KubernetesContextSelector] Rendering error state:", error)
    return (
      <div className={`k8s-context-selector ${className}`}>
        <div className="k8s-context-error">Error: {error}</div>
      </div>
    )
  }

  console.log("[KubernetesContextSelector] Rendering normal state")
  return (
    <div className={`k8s-context-selector ${className}`}>
      {showLabel && <span className="k8s-context-label">Context:</span>}
      <div className="k8s-context-dropdown">
        <button
          className={`k8s-context-button ${isSimulated ? "k8s-context-simulated" : ""}`}
          onClick={() => {
            console.log("[KubernetesContextSelector] Dropdown button clicked, toggling dropdown")
            setIsOpen(!isOpen)
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={
            isSimulated
              ? "Running in simulation mode - context changes will not affect your actual Kubernetes configuration"
              : undefined
          }
        >
          {isSimulated ? (
            <AlertTriangle className="k8s-context-icon k8s-context-warning" size={16} />
          ) : (
            <Server className="k8s-context-icon" size={16} />
          )}
          <span className="k8s-context-current">{currentContext}</span>
          <ChevronDown className="k8s-context-chevron" size={14} />
        </button>

        {isOpen && (
          <ul className="k8s-context-menu" role="listbox" aria-activedescendant={currentContext}>
            {isSimulated && (
              <li className="k8s-context-simulation-notice">
                <AlertTriangle size={14} className="k8s-context-warning" />
                <span className="k8s-context-simulation-text">Simulation Mode</span>
              </li>
            )}
            {contexts.map((context) => (
              <li
                key={context.name}
                className={`k8s-context-item ${context.name === currentContext ? "active" : ""}`}
                onClick={() => {
                  console.log("[KubernetesContextSelector] Context item clicked:", context.name)
                  handleContextChange(context.name)
                }}
                role="option"
                aria-selected={context.name === currentContext}
              >
                <div className="k8s-context-name">
                  {context.name === currentContext && <CheckCircle size={14} className="k8s-context-check" />}
                  {context.name}
                </div>
                <div className="k8s-context-details">
                  <span className="k8s-context-cluster">{context.cluster}</span>
                  {context.namespace && <span className="k8s-context-namespace">{context.namespace}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default KubernetesContextSelector
