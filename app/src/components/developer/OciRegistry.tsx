"use client"

import { useState, useEffect } from "react"
import "./OciRegistry.css"
import React from "react"

interface RegistryConfig {
  name: string
  url: string
  username?: string
  password?: string
  useToken?: boolean
  token?: string
}

interface ChartPackage {
  name: string
  version: string
  path: string
  description?: string
  lastPushed?: string
}

const OciRegistry: React.FC = () => {
  const [registries, setRegistries] = useState<RegistryConfig[]>([])
  const [selectedRegistry, setSelectedRegistry] = useState<string>("")
  const [newRegistry, setNewRegistry] = useState<RegistryConfig>({
    name: "",
    url: "",
  })
  const [showAddRegistry, setShowAddRegistry] = useState(false)
  const [charts, setCharts] = useState<ChartPackage[]>([])
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load saved registries from localStorage
  useEffect(() => {
    const savedRegistries = localStorage.getItem("ociRegistries")
    if (savedRegistries) {
      try {
        const parsed = JSON.parse(savedRegistries)
        setRegistries(parsed)
        if (parsed.length > 0) {
          setSelectedRegistry(parsed[0].name)
        }
      } catch (err) {
        console.error("Error parsing saved registries:", err)
      }
    }

    // Load mock chart data
    const mockCharts: ChartPackage[] = [
      {
        name: "my-app",
        version: "1.0.0",
        path: "./charts/my-app",
        description: "A sample application chart",
        lastPushed: "2023-05-15",
      },
      {
        name: "api-service",
        version: "0.5.2",
        path: "./charts/api-service",
        description: "Backend API service chart",
        lastPushed: "2023-04-22",
      },
      {
        name: "database",
        version: "2.1.0",
        path: "./charts/database",
        description: "Database deployment chart",
        lastPushed: "2023-06-01",
      },
    ]
    setCharts(mockCharts)
  }, [])

  // Save registries to localStorage when they change
  useEffect(() => {
    if (registries.length > 0) {
      localStorage.setItem("ociRegistries", JSON.stringify(registries))
    }
  }, [registries])

  const handleAddRegistry = () => {
    if (!newRegistry.name || !newRegistry.url) {
      setError("Registry name and URL are required")
      return
    }

    // Check if registry with same name already exists
    if (registries.some((r) => r.name === newRegistry.name)) {
      setError("A registry with this name already exists")
      return
    }

    setRegistries([...registries, newRegistry])
    setSelectedRegistry(newRegistry.name)
    setNewRegistry({ name: "", url: "" })
    setShowAddRegistry(false)
    setSuccess("Registry added successfully")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleRemoveRegistry = (name: string) => {
    const updatedRegistries = registries.filter((r) => r.name !== name)
    setRegistries(updatedRegistries)
    
    if (selectedRegistry === name) {
      setSelectedRegistry(updatedRegistries.length > 0 ? updatedRegistries[0].name : "")
    }
  }

  const handlePushChart = (chartName: string) => {
    if (!selectedRegistry) {
      setError("Please select a registry first")
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate pushing chart to registry
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(`Successfully pushed ${chartName} to ${selectedRegistry}`)
      
      // Update the lastPushed date for the chart
      const updatedCharts = charts.map(chart => 
        chart.name === chartName 
          ? { ...chart, lastPushed: new Date().toISOString().split('T')[0] }
          : chart
      )
      setCharts(updatedCharts)
      
      setTimeout(() => setSuccess(null), 3000)
    }, 1500)
  }

  const getSelectedRegistryUrl = () => {
    const registry = registries.find(r => r.name === selectedRegistry)
    return registry ? registry.url : ""
  }

  return (
    <div className="oci-registry-container">
      <h2 className="page-title">OCI Registry</h2>
      <p className="page-description">Push Helm charts to OCI-compatible registries.</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="registry-section">
        <div className="section-header">
          <h3>Registries</h3>
          <button 
            className="action-button"
            onClick={() => setShowAddRegistry(!showAddRegistry)}
          >
            {showAddRegistry ? "Cancel" : "Add Registry"}
          </button>
        </div>

        {showAddRegistry && (
          <div className="add-registry-form">
            <div className="form-group">
              <label>Registry Name</label>
              <input 
                type="text" 
                value={newRegistry.name}
                onChange={(e) => setNewRegistry({...newRegistry, name: e.target.value})}
                placeholder="e.g., my-registry"
              />
            </div>
            <div className="form-group">
              <label>Registry URL</label>
              <input 
                type="text" 
                value={newRegistry.url}
                onChange={(e) => setNewRegistry({...newRegistry, url: e.target.value})}
                placeholder="e.g., registry.example.com"
              />
            </div>
            <div className="form-group">
              <label>Authentication</label>
              <div className="auth-toggle">
                <label>
                  <input 
                    type="checkbox" 
                    checked={newRegistry.useToken || false}
                    onChange={(e) => setNewRegistry({...newRegistry, useToken: e.target.checked})}
                  />
                  Use Token Authentication
                </label>
              </div>
            </div>

            {newRegistry.useToken ? (
              <div className="form-group">
                <label>Token</label>
                <input 
                  type="password" 
                  value={newRegistry.token || ""}
                  onChange={(e) => setNewRegistry({...newRegistry, token: e.target.value})}
                  placeholder="Enter token"
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={newRegistry.username || ""}
                    onChange={(e) => setNewRegistry({...newRegistry, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={newRegistry.password || ""}
                    onChange={(e) => setNewRegistry({...newRegistry, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button 
                className="primary-button"
                onClick={handleAddRegistry}
              >
                Add Registry
              </button>
            </div>
          </div>
        )}

        {registries.length > 0 ? (
          <div className="registry-list">
            <div className="registry-selector">
              <label>Select Registry:</label>
              <select 
                value={selectedRegistry}
                onChange={(e) => setSelectedRegistry(e.target.value)}
              >
                {registries.map(registry => (
                  <option key={registry.name} value={registry.name}>
                    {registry.name} ({registry.url})
                  </option>
                ))}
              </select>
            </div>

            {selectedRegistry && (
              <div className="registry-details">
                <h4>Registry Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedRegistry}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">URL:</span>
                  <span className="detail-value">{getSelectedRegistryUrl()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Authentication:</span>
                  <span className="detail-value">
                    {registries.find(r => r.name === selectedRegistry)?.useToken 
                      ? "Token" 
                      : registries.find(r => r.name === selectedRegistry)?.username 
                        ? "Username/Password" 
                        : "None"}
                  </span>
                </div>
                <button 
                  className="danger-button"
                  onClick={() => handleRemoveRegistry(selectedRegistry)}
                >
                  Remove Registry
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>No registries configured. Add a registry to push Helm charts.</p>
          </div>
        )}
      </div>

      <div className="charts-section">
        <h3>Available Charts</h3>
        
        {charts.length > 0 ? (
          <div className="charts-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Path</th>
                  <th>Description</th>
                  <th>Last Pushed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charts.map(chart => (
                  <tr key={chart.name} className={selectedChart === chart.name ? "selected" : ""}>
                    <td>{chart.name}</td>
                    <td>{chart.version}</td>
                    <td>{chart.path}</td>
                    <td>{chart.description}</td>
                    <td>{chart.lastPushed || "Never"}</td>
                    <td>
                      <button 
                        className="push-button"
                        onClick={() => handlePushChart(chart.name)}
                        disabled={isLoading || !selectedRegistry}
                      >
                        {isLoading && selectedChart === chart.name ? "Pushing..." : "Push"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No charts available. Create a chart using the Chart Builder.</p>
          </div>
        )}
      </div>

      <div className="help-section">
        <h3>About OCI Registries</h3>
        <p>
          OCI (Open Container Initiative) registries allow you to store and distribute Helm charts 
          using the same infrastructure as container images. This provides a standardized way to 
          manage both your application containers and Helm charts.
        </p>
        <div className="command-example">
          <h4>Command Line Example</h4>
          <pre>
            <code>
              # Login to the registry
              helm registry login registry.example.com --username myuser

              # Push a chart
              helm push ./mychart-0.1.0.tgz oci://registry.example.com/charts

              # Pull a chart
              helm pull oci://registry.example.com/charts/mychart --version 0.1.0
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export default OciRegistry
