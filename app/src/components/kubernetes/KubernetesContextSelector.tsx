"use client"

import React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, Server, CheckCircle } from "lucide-react"
import KubernetesService from "../../services/KubernetesService"

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
}

const KubernetesContextSelector: React.FC<KubernetesContextSelectorProps> = ({
  onContextChange,
  className = "",
  showLabel = true,
}) => {
  const [contexts, setContexts] = useState<KubernetesContext[]>([])
  const [currentContext, setCurrentContext] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    loadContexts()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".k8s-context-selector")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const loadContexts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const contextList = await KubernetesService.loadContexts()
      setContexts(contextList)
      setCurrentContext(KubernetesService.getCurrentContext())
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to load contexts:", err)
      setError("Failed to load Kubernetes contexts")
      setIsLoading(false)
    }
  }

  const handleContextChange = async (contextName: string) => {
    try {
      await KubernetesService.setContext(contextName)
      setCurrentContext(contextName)
      onContextChange(contextName)
      setIsOpen(false)
    } catch (err) {
      console.error(`Failed to set context to ${contextName}:`, err)
      setError(`Failed to set context to ${contextName}`)
    }
  }

  if (isLoading) {
    return (
      <div className={`k8s-context-selector ${className}`}>
        <div className="k8s-context-loading">Loading contexts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`k8s-context-selector ${className}`}>
        <div className="k8s-context-error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={`k8s-context-selector ${className}`}>
      {showLabel && <span className="k8s-context-label">Context:</span>}
      <div className="k8s-context-dropdown">
        <button
          className="k8s-context-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Server className="k8s-context-icon" size={16} />
          <span className="k8s-context-current">{currentContext}</span>
          <ChevronDown className="k8s-context-chevron" size={14} />
        </button>

        {isOpen && (
          <ul className="k8s-context-menu" role="listbox" aria-activedescendant={currentContext}>
            {contexts.map((context) => (
              <li
                key={context.name}
                className={`k8s-context-item ${context.name === currentContext ? "active" : ""}`}
                onClick={() => handleContextChange(context.name)}
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
