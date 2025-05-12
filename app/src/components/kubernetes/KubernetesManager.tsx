"use client"

import React from "react"
import { useState } from "react"
import "./KubernetesManager.css"

const KubernetesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"contexts" | "rbac">("contexts")
  const [selectedNamespace, setSelectedNamespace] = useState<string>("default")

  return (
    <div className="kubernetes-manager">
      <h2 className="kubernetes-manager-title">Kubernetes Manager</h2>
      <p className="kubernetes-manager-description">Manage Kubernetes contexts and RBAC permissions.</p>

      <div className="kubernetes-manager-content">Kubernetes manager will be implemented here.</div>
    </div>
  )
}

export default KubernetesManager
