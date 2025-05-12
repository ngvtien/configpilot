"use client"

import React from "react"

import { useState, useEffect } from "react"
import type { K8sContext } from "../../services/types"

interface K8sContextSelectorProps {
  onContextChange: (context: K8sContext) => void
}

const K8sContextSelector: React.FC<K8sContextSelectorProps> = ({ onContextChange }) => {
  const [contexts, setContexts] = useState<K8sContext[]>([])
  const [selectedContext, setSelectedContext] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, this would call your backend API
    const fetchContexts = async () => {
      try {
        setLoading(true)
        // Mock data for demonstration
        const mockContexts: K8sContext[] = [
          { name: "docker-desktop", cluster: "docker-desktop", user: "docker-desktop", isActive: true },
          { name: "minikube", cluster: "minikube", user: "minikube", isActive: false },
          { name: "production", cluster: "eks-cluster", user: "admin", namespace: "default", isActive: false },
        ]

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        setContexts(mockContexts)
        // Set the active context as selected by default
        const activeContext = mockContexts.find((ctx) => ctx.isActive)
        if (activeContext) {
          setSelectedContext(activeContext.name)
          onContextChange(activeContext)
        }
      } catch (err) {
        setError("Failed to load Kubernetes contexts")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContexts()
  }, [onContextChange])

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contextName = e.target.value
    setSelectedContext(contextName)

    const selectedCtx = contexts.find((ctx) => ctx.name === contextName)
    if (selectedCtx) {
      onContextChange(selectedCtx)
    }
  }

  if (loading) {
    return <div className="loading-indicator">Loading Kubernetes contexts...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="k8s-context-selector">
      <label className="field-label" htmlFor="k8s-context">
        Kubernetes Context
      </label>
      <div className="field-input-wrapper">
        <select id="k8s-context" value={selectedContext} onChange={handleContextChange}>
          <option value="" disabled>
            Select a Kubernetes context
          </option>
          {contexts.map((ctx) => (
            <option key={ctx.name} value={ctx.name}>
              {ctx.name} {ctx.isActive ? "(current)" : ""}
            </option>
          ))}
        </select>
      </div>
      {selectedContext && (
        <div className="field-description">
          Connected to cluster: {contexts.find((ctx) => ctx.name === selectedContext)?.cluster}
        </div>
      )}
    </div>
  )
}

export default K8sContextSelector
