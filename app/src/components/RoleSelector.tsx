"use client"

import React from "react"

export type UserRole = "developer" | "devops" | "operations"

interface RoleSelectorProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  const roleInfo = {
    developer: {
      icon: "👨‍💻",
      label: "Developer",
      description: "Schema editing, chart building, and template creation",
    },
    devops: {
      icon: "🔄",
      label: "DevOps/Platform",
      description: "Infrastructure setup and ArgoCD management",
    },
    operations: {
      icon: "🛠️",
      label: "Operations/Support",
      description: "Environment configuration and deployment",
    },
  }

  return (
    <div className="role-selector">
      {Object.entries(roleInfo).map(([role, info]) => (
        <button
          key={role}
          className={`role-button ${currentRole === role ? "active" : ""}`}
          onClick={() => onRoleChange(role as UserRole)}
        >
          <span className="role-icon">{info.icon}</span>
          <div className="role-info">
            <span className="role-label">{info.label}</span>
            <span className="role-description">{info.description}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default RoleSelector
