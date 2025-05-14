"use client"

import React from "react"
import { useState, useEffect } from "react"
import SchemaEditor from "./SchemaEditor"
import ValueEditor from "./ValueEditor"
import SecretEditor from "./SecretEditor"
import "./AppLayout.css"

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
  }, [])

  // Save context settings to localStorage
  const saveContextToLocalStorage = () => {
    try {
      localStorage.setItem(
        "helm_editor_context",
        JSON.stringify({
          environment,
          product,
          customer,
          version,
          lastUpdated: new Date().toISOString(),
        }),
      )
      console.log("Saved context to localStorage")
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
          return (
            <SecretEditor
              //schema={currentSchema}
              environment={environment}
              product={product}
              customer={customer}
              //version={version}
              //userRole={userRole}
            />
          )        
      case "kubernetes":
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h3>Kubernetes Integration Coming Soon</h3>
            <p>This feature is currently under development.</p>
          </div>
        )
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
          <div className="logo-container">
            <span className="logo-icon" role="img" aria-label="Helm UI">⎈</span>
            {!sidebarCollapsed && <span className="logo-text">ConfigPilot</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
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
                <span className="nav-icon" role="img" aria-label="Developer">💻</span>
                {!sidebarCollapsed && "Developer"}
              </button>

              <button
                className={`nav-button ${userRole === "devops" ? "active" : ""}`}
                onClick={() => setUserRole("devops")}
                title="DevOps/Platform"
              >
                <span className="nav-icon" role="img" aria-label="DevOps">⚙️</span>
                {!sidebarCollapsed && "DevOps/Platform"}
              </button>

              <button
                className={`nav-button ${userRole === "operations" ? "active" : ""}`}
                onClick={() => setUserRole("operations")}
                title="Operations"
              >
                <span className="nav-icon" role="img" aria-label="Operations">📊</span>
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
                <span className="nav-icon" role="img" aria-label="Schema Editor">📝</span>
                {!sidebarCollapsed && "Schema Editor"}
              </button>
              <button
                className={`nav-button ${view === "values" ? "active" : ""}`}
                onClick={() => setView("values")}
                title="Values Editor"
              >
                <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
                {!sidebarCollapsed && "Values Editor"}
              </button>

              <button
                className={`nav-button ${view === "secrets" ? "active" : ""}`}
                onClick={() => setView("secrets")}
                title="Secrets Editor"
              >
                <span className="nav-icon" role="img" aria-label="Secrets Editor">🔑</span>
                {!sidebarCollapsed && "Secrets Editor"}
              </button>

              <button
                className={`nav-button ${view === "chart-builder" ? "active" : ""}`}
                onClick={() => setView("chart-builder")}
                title="Chart Builder"
              >
                <span className="nav-icon" role="img" aria-label="Chart Builder">📊</span>
                {!sidebarCollapsed && "Chart Builder"}
              </button>
              <button
                className={`nav-button ${view === "template-editor" ? "active" : ""}`}
                onClick={() => setView("template-editor")}
                title="Template Editor"
              >
                <span className="nav-icon" role="img" aria-label="Template Editor">📄</span>
                {!sidebarCollapsed && "Template Editor"}
              </button>
              <button
                className={`nav-button ${view === "oci-registry" ? "active" : ""}`}
                onClick={() => setView("oci-registry")}
                title="OCI Registry"
              >
                <span className="nav-icon" role="img" aria-label="OCI Registry">🗃️</span>
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
                <span className="nav-icon" role="img" aria-label="Kubernetes">📦</span>
                {!sidebarCollapsed && "Kubernetes"}
              </button>
              <button
                className={`nav-button ${view === "argocd" ? "active" : ""}`}
                onClick={() => setView("argocd")}
                title="ArgoCD"
              >
                <span className="nav-icon" role="img" aria-label="ArgoCD">🔄</span>
                {!sidebarCollapsed && "ArgoCD"}
              </button>
              <button
                className={`nav-button ${view === "git-repos" ? "active" : ""}`}
                onClick={() => setView("git-repos")}
                title="Git Repositories"
              >
                <span className="nav-icon" role="img" aria-label="Git Repositories">📁</span>
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
                <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
                {!sidebarCollapsed && "Values Editor"}
              </button>

              <button
                className={`nav-button ${view === "secrets" ? "active" : ""}`}
                onClick={() => setView("secrets")}
                title="Secrets Editor"
              >
                <span className="nav-icon" role="img" aria-label="Secrets Editor">🔑</span>
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
            </div>
          )}
        </div>
        {/* Content area */}
        <div className="content-area">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AppLayout