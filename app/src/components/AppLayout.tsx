"use client"

import React from "react"
import { useState, useEffect } from "react"
import SchemaEditor from "./SchemaEditor"
import ValueEditor from "./ValueEditor"
import SecretEditor from "./SecretEditor"
import "./AppLayout.css"
import { KubernetesContextSelector, KubernetesView } from "./kubernetes"
import "./kubernetes/kubernetes.css"

// Add this import at the top of your file
import LogConsole from "./LogConsole"

type UserRole = "developer" | "devops" | "operations"
type ViewType =
  | "schema"
  | "values"
  | "secrets"
  | "chart-builder"
  | "template-editor"
  | "oci-registry"
  | "kubernetes"
  | "argocd"
  | "git-repos"

interface AppLayoutProps {
  initialRole?: UserRole
  initialView?: ViewType
}

const KUBE_CONTEXT_STORAGE_KEY = "kubernetes_context"

const AppLayout = ({ initialRole = "developer", initialView }: AppLayoutProps) => {
  const [userRole, setUserRole] = useState<UserRole>(initialRole)
  const [view, setView] = useState<ViewType>(initialView || (userRole === "developer" ? "schema" : "values"))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentSchema, setCurrentSchema] = useState<any>(null)
  const [environment, setEnvironment] = useState("dev")
  const [product, setProduct] = useState("k8s")
  const [customer, setCustomer] = useState("ACE")
  const [version, setVersion] = useState("1.2.7")
  const [isEditingContext, setIsEditingContext] = useState(false)
  const [contextForm, setContextForm] = useState({
    environment,
    product,
    customer,
    version,
  })
  const [kubeContext, setKubeContext] = useState<string>("")

  // Load context settings from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem("helm_editor_context")
    if (savedContext) {
      try {
        const contextData = JSON.parse(savedContext)
        if (contextData.environment) setEnvironment(contextData.environment)
        if (contextData.product) setProduct(contextData.product)
        if (contextData.customer) setCustomer(contextData.customer)
        if (contextData.version) setVersion(contextData.version)

        // Update the form data too
        setContextForm({
          environment: contextData.environment || environment,
          product: contextData.product || product,
          customer: contextData.customer || customer,
          version: contextData.version || version,
        })

        console.log("Loaded context from localStorage:", contextData)
      } catch (e) {
        console.error("Error parsing saved context:", e)
      }
    }

    // Load and set Kubernetes context from localStorage
    const savedKubeContext = localStorage.getItem(KUBE_CONTEXT_STORAGE_KEY)
    if (savedKubeContext) {
      console.log("Found saved Kubernetes context:", savedKubeContext)
      setKubeContext(savedKubeContext)

      // We'll set the context when the component is fully loaded
      // This avoids issues with the dynamic import
      setTimeout(async () => {
        try {
          const KubernetesService = (await import("../services/KubernetesService")).default
          if (KubernetesService) {
            await KubernetesService.setContext(savedKubeContext)
            console.log("Successfully restored Kubernetes context:", savedKubeContext)
          }
        } catch (error) {
          console.error("Failed to restore Kubernetes context:", error)
        }
      }, 1000)
    }
  }, [])

  // Save context settings to localStorage
  const saveContextToLocalStorage = () => {
    try {
      const contextData = {
        environment,
        product,
        customer,
        version,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem("helm_editor_context", JSON.stringify(contextData))
      console.log("Saved context to localStorage:", contextData)
    } catch (e) {
      console.error("Error saving context to localStorage:", e)
    }
  }


  // Handle schema changes
  const handleSchemaChange = (schema: any) => {
    setCurrentSchema(schema)

    // Save schema to localStorage
    try {
      localStorage.setItem("current_schema", JSON.stringify(schema))

      // Also save to the specific schema path for ValueEditor to find
      localStorage.setItem("schema_/src/mock/schema/values.schema.json", JSON.stringify(schema))

      // Trigger a custom event to notify components of schema change
      window.dispatchEvent(new Event("schemaUpdated"))
    } catch (e) {
      console.error("Error saving schema to localStorage:", e)
    }
  }

  // Handle context form submission
  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnvironment(contextForm.environment)
    setProduct(contextForm.product)
    setCustomer(contextForm.customer)
    setVersion(contextForm.version)
    setIsEditingContext(false)

    // Save to localStorage
    localStorage.setItem(
      "helm_editor_context",
      JSON.stringify({
        environment: contextForm.environment,
        product: contextForm.product,
        customer: contextForm.customer,
        version: contextForm.version,
        lastUpdated: new Date().toISOString(),
      }),
    )
  }

  const handleKubeContextChange = (contextName: string) => {
    setKubeContext(contextName)
    console.log(`Kubernetes context changed to: ${contextName}`)

    // Save to localStorage
    try {
      localStorage.setItem(KUBE_CONTEXT_STORAGE_KEY, contextName)
      console.log("Saved Kubernetes context to localStorage:", contextName)
    } catch (e) {
      console.error("Error saving Kubernetes context to localStorage:", e)
    }
  }

  const renderContent = () => {
    switch (view) {
      case "schema":
        return <SchemaEditor onSchemaChange={handleSchemaChange} />
      case "values":
        return (
          <ValueEditor
            schema={currentSchema}
            environment={environment}
            product={product}
            customer={customer}
            version={version}
            userRole={userRole}
          />
        )
      case "secrets":
        return <SecretEditor environment={environment} product={product} customer={customer} />
      case "kubernetes":
        return <KubernetesView currentContext={kubeContext} />
      default:
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h3>Coming Soon</h3>
            <p>This feature is currently under development.</p>
          </div>
        )
    }
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div
            className="logo-container"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="app-logo-sidebar">
              <div className="app-logo-inner">CP</div>
            </div>
            {!sidebarCollapsed && <span className="logo-text">ConfigPilot</span>}
          </div>
        </div>

        {/* Navigation sections */}
        <div className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <div className="section-title">ROLE</div>}
            <div className="role-buttons">
              <button
                className={`nav-button ${userRole === "developer" ? "active" : ""}`}
                onClick={() => setUserRole("developer")}
                title="Developer"
              >
                <span className="nav-icon" role="img" aria-label="Developer">
                  💻
                </span>
                {!sidebarCollapsed && "Developer"}
              </button>

              <button
                className={`nav-button ${userRole === "devops" ? "active" : ""}`}
                onClick={() => setUserRole("devops")}
                title="DevOps/Platform"
              >
                <span className="nav-icon" role="img" aria-label="DevOps">
                  ⚙️
                </span>
                {!sidebarCollapsed && "DevOps/Platform"}
              </button>

              <button
                className={`nav-button ${userRole === "operations" ? "active" : ""}`}
                onClick={() => setUserRole("operations")}
                title="Operations"
              >
                <span className="nav-icon" role="img" aria-label="Operations">
                  📊
                </span>
                {!sidebarCollapsed && "Operations"}
              </button>
            </div>
          </div>

          {userRole === "developer" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">DEVELOPER TOOLS</div>}
              <button
                className={`nav-button ${view === "schema" ? "active" : ""}`}
                onClick={() => setView("schema")}
                title="Schema Editor"
              >
                <span className="nav-icon" role="img" aria-label="Schema Editor">
                  📝
                </span>
                {!sidebarCollapsed && "Schema Editor"}
              </button>
              <button
                className={`nav-button ${view === "values" ? "active" : ""}`}
                onClick={() => setView("values")}
                title="Values Editor"
              >
                <span className="nav-icon" role="img" aria-label="Values Editor">
                  📋
                </span>
                {!sidebarCollapsed && "Values Editor"}
              </button>

              <button
                className={`nav-button ${view === "secrets" ? "active" : ""}`}
                onClick={() => setView("secrets")}
                title="Secrets Editor"
              >
                <span className="nav-icon" role="img" aria-label="Secrets Editor">
                  🔑
                </span>
                {!sidebarCollapsed && "Secrets Editor"}
              </button>

              <button
                className={`nav-button ${view === "chart-builder" ? "active" : ""}`}
                onClick={() => setView("chart-builder")}
                title="Chart Builder"
              >
                <span className="nav-icon" role="img" aria-label="Chart Builder">
                  📊
                </span>
                {!sidebarCollapsed && "Chart Builder"}
              </button>
              <button
                className={`nav-button ${view === "template-editor" ? "active" : ""}`}
                onClick={() => setView("template-editor")}
                title="Template Editor"
              >
                <span className="nav-icon" role="img" aria-label="Template Editor">
                  📄
                </span>
                {!sidebarCollapsed && "Template Editor"}
              </button>
              <button
                className={`nav-button ${view === "oci-registry" ? "active" : ""}`}
                onClick={() => setView("oci-registry")}
                title="OCI Registry"
              >
                <span className="nav-icon" role="img" aria-label="OCI Registry">
                  🗃️
                </span>
                {!sidebarCollapsed && "OCI Registry"}
              </button>
            </div>
          )}

          {userRole === "devops" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">DEVOPS TOOLS</div>}
              <button
                className={`nav-button ${view === "kubernetes" ? "active" : ""}`}
                onClick={() => setView("kubernetes")}
                title="Kubernetes"
              >
                <span className="nav-icon" role="img" aria-label="Kubernetes">
                  📦
                </span>
                {!sidebarCollapsed && "Kubernetes"}
              </button>
              <button
                className={`nav-button ${view === "argocd" ? "active" : ""}`}
                onClick={() => setView("argocd")}
                title="ArgoCD"
              >
                <span className="nav-icon" role="img" aria-label="ArgoCD">
                  🔄
                </span>
                {!sidebarCollapsed && "ArgoCD"}
              </button>
              <button
                className={`nav-button ${view === "git-repos" ? "active" : ""}`}
                onClick={() => setView("git-repos")}
                title="Git Repositories"
              >
                <span className="nav-icon" role="img" aria-label="Git Repositories">
                  📁
                </span>
                {!sidebarCollapsed && "Git Repositories"}
              </button>
            </div>
          )}

          {userRole === "operations" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">OPERATIONS TOOLS</div>}
              <button
                className={`nav-button ${view === "values" ? "active" : ""}`}
                onClick={() => setView("values")}
                title="Values Editor"
              >
                <span className="nav-icon" role="img" aria-label="Values Editor">
                  📋
                </span>
                {!sidebarCollapsed && "Values Editor"}
              </button>

              <button
                className={`nav-button ${view === "secrets" ? "active" : ""}`}
                onClick={() => setView("secrets")}
                title="Secrets Editor"
              >
                <span className="nav-icon" role="img" aria-label="Secrets Editor">
                  🔑
                </span>
                {!sidebarCollapsed && "Secrets Editor"}
              </button>
            </div>
          )}

          {/* Environment Selector */}
          <div className="environment-selector">
            {!sidebarCollapsed && (
              <>
                <div className="environment-selector-dropdown">
                  <select
                    className="env-dropdown"
                    value={environment}
                    onChange={(e) => {
                      setEnvironment(e.target.value)
                      saveContextToLocalStorage()
                    }}
                  >
                    <option value="dev">Development</option>
                    <option value="sit">System Integration</option>
                    <option value="uat">User Acceptance</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
                <div className="environment-buttons">
                  <button
                    className={`env-button ${environment === "dev" ? "active" : ""}`}
                    onClick={() => {
                      setEnvironment("dev")
                      saveContextToLocalStorage()
                    }}
                  >
                    DEV
                  </button>
                  <button
                    className={`env-button ${environment === "prod" ? "active" : ""}`}
                    onClick={() => {
                      setEnvironment("prod")
                      saveContextToLocalStorage()
                    }}
                  >
                    PROD
                  </button>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <div className="env-badge" title={`Environment: ${environment.toUpperCase()}`}>
                {environment.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <div className="app-header">
          {isEditingContext ? (
            <div className="context-edit-form">
              <form onSubmit={handleContextSubmit} className="compact-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Environment</label>
                    <input
                      type="text"
                      value={contextForm.environment}
                      onChange={(e) => setContextForm({ ...contextForm, environment: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Product</label>
                    <input
                      type="text"
                      value={contextForm.product}
                      onChange={(e) => setContextForm({ ...contextForm, product: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Customer</label>
                    <input
                      type="text"
                      value={contextForm.customer}
                      onChange={(e) => setContextForm({ ...contextForm, customer: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Version</label>
                    <input
                      type="text"
                      value={contextForm.version}
                      onChange={(e) => setContextForm({ ...contextForm, version: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setIsEditingContext(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="header-info">
              <div className="header-item">
                <span className="header-label">Environment:</span>
                <span className="header-value">{environment}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Product:</span>
                <span className="header-value">{product}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Customer:</span>
                <span className="header-value">{customer}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Version:</span>
                <span className="header-value">{version}</span>
              </div>
              <button className="header-link" onClick={() => setIsEditingContext(true)}>
                Edit Context
              </button>
              <KubernetesContextSelector
                onContextChange={handleKubeContextChange}
                className="header-context-selector"
                initialContext={kubeContext}
              />
            </div>
          )}
        </div>
        {/* Content area */}
        <div className="content-area">{renderContent()}</div>
      </div>
      {/* Add the LogConsole component */}
      <LogConsole initialOpen={false} />
    </div>
  )
}

export default AppLayout
