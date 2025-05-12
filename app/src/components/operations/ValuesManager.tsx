import React from "react"
import "./ValuesManager.css"

const ValuesManager: React.FC = () => {
  return (
    <div className="values-manager">
      <h2 className="values-manager-title">Values Manager</h2>
      <p className="values-manager-description">Edit environment-specific values for your Helm charts.</p>

      <div className="values-manager-content">Values manager will be implemented here.</div>
    </div>
  )
}

export default ValuesManager
