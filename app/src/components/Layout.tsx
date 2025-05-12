import React from "react"
import type { UserRole } from "./RoleSelector"
import "./Layout.css"

interface LayoutProps {
  role: UserRole
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ role, children }) => {
  const roleColors = {
    developer: "#0f766e",
    devops: "#0369a1",
    operations: "#7e22ce",
  }

  const headerColor = roleColors[role] || "#0f766e"

  return (
    <div className="layout">
      <header className="app-header" style={{ backgroundColor: headerColor }}>
        <div className="app-title">
          <h1>ConfigPilot</h1>
          <span className="role-badge">{role.charAt(0).toUpperCase() + role.slice(1)} Mode</span>
        </div>
        <div className="header-actions">
          <button className="header-button">Settings</button>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <footer className="app-footer">
        <p>ConfigPilot - Local Kubeconfig Mode</p>
      </footer>
    </div>
  )
}

export default Layout
