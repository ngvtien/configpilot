import React from "react"
import "./ArgoAppManager.css"

const ArgoAppManager: React.FC = () => {
  return (
    <div className="argo-app-manager">
      <h2 className="argo-app-manager-title">ArgoCD Application Manager</h2>
      <p className="argo-app-manager-description">Manage your ArgoCD applications and deployments.</p>

      <div className="argo-app-manager-content">ArgoCD manager will be implemented here.</div>
    </div>
  )
}

export default ArgoAppManager
