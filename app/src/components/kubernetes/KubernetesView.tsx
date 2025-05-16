"use client"

import React from "react"
import { useState, useEffect } from "react"
import KubernetesService from "../../services/KubernetesService"

interface KubernetesViewProps {
  currentContext: string
}

const KubernetesView: React.FC<KubernetesViewProps> = ({ currentContext }) => {
  const [namespaces, setNamespaces] = useState<any[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>("default")
  const [pods, setPods] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("pods")

  useEffect(() => {
    loadData()

    // Set up a resource watcher for real-time updates
    const setupWatcher = async () => {
      try {
        await KubernetesService.watchResources(activeTab, selectedNamespace, handleResourceUpdate)
      } catch (err) {
        console.error("Failed to set up resource watcher:", err)
      }
    }

    setupWatcher()

    // Clean up the watcher when the component unmounts or when dependencies change
    return () => {
      KubernetesService.stopWatchingResources().catch((err) => {
        console.error("Failed to stop resource watcher:", err)
      })
    }
  }, [currentContext, selectedNamespace, activeTab])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load namespaces
      const namespaceList = await KubernetesService.getResources("namespaces")
      setNamespaces(namespaceList)

      // Load resources based on the active tab
      if (activeTab === "pods") {
        const podList = await KubernetesService.getResources("pods", selectedNamespace)
        setPods(podList)
      } else if (activeTab === "deployments") {
        const deploymentList = await KubernetesService.getResources("deployments", selectedNamespace)
        setDeployments(deploymentList)
      } else if (activeTab === "services") {
        const serviceList = await KubernetesService.getResources("services", selectedNamespace)
        setServices(serviceList)
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Failed to load Kubernetes data:", err)
      setError(`Failed to load Kubernetes data: ${(err as Error).message}`)
      setIsLoading(false)
    }
  }

  const handleResourceUpdate = (type: string, obj: any) => {
    if (type === "ERROR") {
      console.error("Watch error:", obj.message)
      return
    }

    // Update the appropriate resource list based on the kind
    const kind = obj.kind.toLowerCase()

    if (kind === "pod") {
      if (type === "ADDED" || type === "MODIFIED") {
        setPods((current) => {
          const index = current.findIndex((p) => p.metadata.name === obj.metadata.name)
          if (index >= 0) {
            const updated = [...current]
            updated[index] = obj
            return updated
          } else {
            return [...current, obj]
          }
        })
      } else if (type === "DELETED") {
        setPods((current) => current.filter((p) => p.metadata.name !== obj.metadata.name))
      }
    } else if (kind === "deployment") {
      if (type === "ADDED" || type === "MODIFIED") {
        setDeployments((current) => {
          const index = current.findIndex((d) => d.metadata.name === obj.metadata.name)
          if (index >= 0) {
            const updated = [...current]
            updated[index] = obj
            return updated
          } else {
            return [...current, obj]
          }
        })
      } else if (type === "DELETED") {
        setDeployments((current) => current.filter((d) => d.metadata.name !== obj.metadata.name))
      }
    } else if (kind === "service") {
      if (type === "ADDED" || type === "MODIFIED") {
        setServices((current) => {
          const index = current.findIndex((s) => s.metadata.name === obj.metadata.name)
          if (index >= 0) {
            const updated = [...current]
            updated[index] = obj
            return updated
          } else {
            return [...current, obj]
          }
        })
      } else if (type === "DELETED") {
        setServices((current) => current.filter((s) => s.metadata.name !== obj.metadata.name))
      }
    }
  }

  const handleNamespaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNamespace(e.target.value)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleDeleteResource = async (resourceType: string, name: string) => {
    try {
      await KubernetesService.deleteResource(resourceType, name, selectedNamespace)
      // The watch should update the UI, but we can also refresh the data
      loadData()
    } catch (err) {
      console.error(`Failed to delete ${resourceType} ${name}:`, err)
      setError(`Failed to delete ${resourceType} ${name}: ${(err as Error).message}`)
    }
  }

  if (isLoading) {
    return <div className="k8s-loading">Loading Kubernetes resources...</div>
  }

  if (error) {
    return (
      <div className="k8s-error">
        {error}
        <button className="k8s-retry-button" onClick={loadData}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="k8s-view">
      <div className="k8s-header">
        <h2>Kubernetes Resources</h2>
        <div className="k8s-controls">
          <div className="k8s-namespace-selector">
            <label htmlFor="namespace-select">Namespace:</label>
            <select id="namespace-select" value={selectedNamespace} onChange={handleNamespaceChange}>
              {namespaces.map((ns) => (
                <option key={ns.metadata.name} value={ns.metadata.name}>
                  {ns.metadata.name}
                </option>
              ))}
            </select>
          </div>
          <button className="k8s-refresh-button" onClick={loadData}>
            Refresh
          </button>
        </div>
      </div>

      <div className="k8s-tabs">
        <button className={`k8s-tab ${activeTab === "pods" ? "active" : ""}`} onClick={() => handleTabChange("pods")}>
          Pods
        </button>
        <button
          className={`k8s-tab ${activeTab === "deployments" ? "active" : ""}`}
          onClick={() => handleTabChange("deployments")}
        >
          Deployments
        </button>
        <button
          className={`k8s-tab ${activeTab === "services" ? "active" : ""}`}
          onClick={() => handleTabChange("services")}
        >
          Services
        </button>
      </div>

      <div className="k8s-resources">
        {activeTab === "pods" && (
          <div className="k8s-section">
            <h3>Pods</h3>
            {pods.length === 0 ? (
              <p className="k8s-empty">No pods found in this namespace</p>
            ) : (
              <table className="k8s-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Restarts</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pods.map((pod) => (
                    <tr key={pod.metadata?.name}>
                      <td>{pod.metadata?.name}</td>
                      <td>{pod.status?.phase}</td>
                      <td>
                        {pod.status?.containerStatuses?.reduce(
                          (sum: number, container: any) => sum + (container.restartCount || 0),
                          0,
                        ) || 0}
                      </td>
                      <td>{getAge(pod.metadata?.creationTimestamp)}</td>
                      <td>
                        <button
                          className="k8s-delete-button"
                          onClick={() => handleDeleteResource("pods", pod.metadata?.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "deployments" && (
          <div className="k8s-section">
            <h3>Deployments</h3>
            {deployments.length === 0 ? (
              <p className="k8s-empty">No deployments found in this namespace</p>
            ) : (
              <table className="k8s-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Replicas</th>
                    <th>Available</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((deployment) => (
                    <tr key={deployment.metadata?.name}>
                      <td>{deployment.metadata?.name}</td>
                      <td>{deployment.spec?.replicas}</td>
                      <td>{deployment.status?.availableReplicas || 0}</td>
                      <td>{getAge(deployment.metadata?.creationTimestamp)}</td>
                      <td>
                        <button
                          className="k8s-delete-button"
                          onClick={() => handleDeleteResource("deployments", deployment.metadata?.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div className="k8s-section">
            <h3>Services</h3>
            {services.length === 0 ? (
              <p className="k8s-empty">No services found in this namespace</p>
            ) : (
              <table className="k8s-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Cluster IP</th>
                    <th>External IP</th>
                    <th>Ports</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.metadata?.name}>
                      <td>{service.metadata?.name}</td>
                      <td>{service.spec?.type}</td>
                      <td>{service.spec?.clusterIP}</td>
                      <td>
                        {service.spec?.type === "LoadBalancer"
                          ? service.status?.loadBalancer?.ingress?.[0]?.ip || "Pending"
                          : "N/A"}
                      </td>
                      <td>
                        {service.spec?.ports
                          ?.map((port: any) => `${port.port}:${port.targetPort}/${port.protocol || "TCP"}`)
                          .join(", ")}
                      </td>
                      <td>{getAge(service.metadata?.creationTimestamp)}</td>
                      <td>
                        <button
                          className="k8s-delete-button"
                          onClick={() => handleDeleteResource("services", service.metadata?.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate age from timestamp
function getAge(timestamp: string): string {
  if (!timestamp) return "Unknown"

  const created = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 0) return `${diffDays}d`

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours > 0) return `${diffHours}h`

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes}m`
}

export default KubernetesView
