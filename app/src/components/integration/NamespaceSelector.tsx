"use client"

import React from "react"

import { useState, useEffect } from "react"
import type { K8sContext, K8sNamespace } from "../../services/types"

interface NamespaceSelectorProps {
  k8sContext: K8sContext | null
  onNamespaceChange: (namespace: string) => void
}

const NamespaceSelector: React.FC<NamespaceSelectorProps> = ({ k8sContext, onNamespaceChange }) => {
  const [namespaces, setNamespaces] = useState<K8sNamespace[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!k8sContext) return

    const fetchNamespaces = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data for demonstration
        const mockNamespaces: K8sNamespace[] = [
          { name: "default", status: "Active", creationTimestamp: "2023-01-01T00:00:00Z" },
          { name: "kube-system", status: "Active", creationTimestamp: "2023-01-01T00:00:00Z" },
          { name: "kube-public", status: "Active", creationTimestamp: "2023-01-01T00:00:00Z" },
          { name: "app-production", status: "Active", creationTimestamp: "2023-01-15T00:00:00Z" },
          { name: "app-staging", status: "Active", creationTimestamp: "2023-01-15T00:00:00Z" },
        ]

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300))

        setNamespaces(mockNamespaces)

        // Set default namespace if available in context
        if (k8sContext.namespace) {
          setSelectedNamespace(k8sContext.namespace)
          onNamespaceChange(k8sContext.namespace)
        } else {
          setSelectedNamespace("default")
          onNamespaceChange("default")
        }
      } catch (err) {
        setError("Failed to load namespaces")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchNamespaces()
  }, [k8sContext, onNamespaceChange])

  const handleNamespaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const namespace = e.target.value
    setSelectedNamespace(namespace)
    onNamespaceChange(namespace)
  }

  if (!k8sContext) {
    return <div className="notice-message">Please select a Kubernetes context first</div>
  }

  if (loading) {
    return <div className="loading-indicator">Loading namespaces...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="namespace-selector">
      <label className="field-label" htmlFor="namespace">
        Namespace
      </label>
      <div className="field-input-wrapper">
        <select id="namespace" value={selectedNamespace} onChange={handleNamespaceChange}>
          <option value="" disabled>
            Select a namespace
          </option>
          {namespaces.map((ns) => (
            <option key={ns.name} value={ns.name}>
              {ns.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default NamespaceSelector
