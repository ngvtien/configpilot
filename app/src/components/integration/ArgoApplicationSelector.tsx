"use client"

import React from "react"

import { useState, useEffect } from "react"
import type { ArgoApplication, K8sContext } from "../../services/types"

interface ArgoApplicationSelectorProps {
  k8sContext: K8sContext | null
  namespace: string
  onApplicationChange: (app: ArgoApplication | null) => void
}

const ArgoApplicationSelector: React.FC<ArgoApplicationSelectorProps> = ({
  k8sContext,
  namespace,
  onApplicationChange,
}) => {
  const [applications, setApplications] = useState<ArgoApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!k8sContext) return

    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data for demonstration
        const mockApps: ArgoApplication[] = [
          {
            name: "frontend-app",
            namespace: "argocd",
            project: "default",
            status: "Healthy",
            syncStatus: "Synced",
            source: {
              repoURL: "https://github.com/example/frontend-app",
              path: "charts/frontend",
              targetRevision: "HEAD",
            },
          },
          {
            name: "backend-api",
            namespace: "argocd",
            project: "default",
            status: "Healthy",
            syncStatus: "Synced",
            source: {
              repoURL: "https://github.com/example/backend-api",
              path: "charts/backend",
              targetRevision: "HEAD",
            },
          },
          {
            name: "database",
            namespace: "argocd",
            project: "infrastructure",
            status: "Healthy",
            syncStatus: "Synced",
            source: {
              repoURL: "oci://registry.example.com/charts",
              chart: "postgresql",
              targetRevision: "12.1.0",
            },
          },
        ]

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        setApplications(mockApps)
      } catch (err) {
        setError("Failed to load ArgoCD applications")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [k8sContext])

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const appName = e.target.value
    setSelectedApp(appName)

    if (appName) {
      const app = applications.find((a) => a.name === appName)
      if (app) {
        onApplicationChange(app)
      }
    } else {
      onApplicationChange(null)
    }
  }

  if (!k8sContext) {
    return <div className="notice-message">Please select a Kubernetes context first</div>
  }

  if (loading) {
    return <div className="loading-indicator">Loading ArgoCD applications...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="argo-application-selector">
      <h3 className="object-title">ArgoCD Application</h3>

      <div className="field-container">
        <label className="field-label" htmlFor="argo-app">
          Application
        </label>
        <div className="field-input-wrapper">
          <select id="argo-app" value={selectedApp} onChange={handleAppChange}>
            <option value="">Select an application</option>
            {applications.map((app) => (
              <option key={app.name} value={app.name}>
                {app.name} ({app.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedApp && (
        <div className="argo-app-details">
          {(() => {
            const app = applications.find((a) => a.name === selectedApp)
            if (!app) return null

            return (
              <>
                <div className="field-container">
                  <label className="field-label">Source</label>
                  <div className="field-value">
                    {app.source.chart
                      ? `Chart: ${app.source.chart} (${app.source.repoURL})`
                      : `Path: ${app.source.path} (${app.source.repoURL})`}
                  </div>
                </div>

                <div className="field-container">
                  <label className="field-label">Revision</label>
                  <div className="field-value">{app.source.targetRevision}</div>
                </div>

                <div className="field-container">
                  <label className="field-label">Status</label>
                  <div className={`field-value status-${app.status.toLowerCase()}`}>
                    {app.status} / {app.syncStatus}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default ArgoApplicationSelector
