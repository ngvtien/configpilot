"use client"

import React from "react"
import type { UserRole } from "./RoleSelector"
import "./Navigation.css"

interface NavigationProps {
  role: UserRole
  activePage: string
  onNavigate: (page: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ role, activePage, onNavigate }) => {
  // Define navigation items for each role
  const navigationItems = {
    developer: [
      { id: "schema-editor", label: "📝 Schema Editor", description: "Edit JSON schema for values.yaml" },
      { id: "chart-builder", label: "📊 Chart Builder", description: "Create and edit Helm charts" },
      { id: "template-editor", label: "📄 Template Editor", description: "Edit Helm templates" },
      { id: "oci-registry", label: "📦 OCI Registry", description: "Push charts to OCI registry" },
    ],
    devops: [
      { id: "kubernetes", label: "☸️ Kubernetes", description: "Manage Kubernetes contexts and RBAC" },
      { id: "argocd", label: "🔄 ArgoCD", description: "Manage ArgoCD applications" },
      { id: "git-repos", label: "📁 Git Repositories", description: "Manage Git repositories" },
      { id: "helm-repos", label: "⎈ Helm Repositories", description: "Manage Helm repositories" },
    ],
    operations: [
      { id: "values-editor", label: "⚙️ Values Editor", description: "Edit environment-specific values" },
      { id: "deployment", label: "🚀 Deployment", description: "Trigger and monitor deployments" },
      { id: "git-prs", label: "🔀 Git PRs", description: "Create and manage Git pull requests" },
    ],
  }

  const items = navigationItems[role] || []

  return (
    <div className="navigation">
      <div className="nav-header">
        <h3>{role.charAt(0).toUpperCase() + role.slice(1)} Tools</h3>
      </div>
      <div className="nav-items">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <div className="nav-item-content">
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-description">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Navigation
