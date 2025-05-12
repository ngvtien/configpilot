"use client"

import React from "react"
import { useState, useEffect } from "react"
import "./DevelopmentSetup.css"

interface DevelopmentPaths {
  schemaPath: string
  templatesPath: string
  valuesPath: string
}

const DevelopmentSetup = ({
  developmentPaths,
  onComplete,
}: {
  developmentPaths: DevelopmentPaths | null
  onComplete: (paths: DevelopmentPaths) => void
}) => {
  const [schemaPath, setSchemaPath] = useState("/src/mock")
  const [templatesPath, setTemplatesPath] = useState("/src/mock")
  const [valuesPath, setValuesPath] = useState("/src/mock")

  useEffect(() => {
    if (developmentPaths) {
      setSchemaPath(developmentPaths.schemaPath || "/src/mock")
      setTemplatesPath(developmentPaths.templatesPath || "/src/mock")
      setValuesPath(developmentPaths.valuesPath || "/src/mock")
    }
  }, [developmentPaths])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      schemaPath,
      templatesPath,
      valuesPath,
    })
  }

  return (
    <div className="development-setup">
      <h2 className="development-setup-title">Development Setup</h2>
      <p className="development-setup-description">Configure development paths for schemas, templates, and values.</p>

      <div className="development-setup-content">Development setup will be implemented here.</div>

      <button className="development-setup-button" onClick={handleSubmit}>
        Save Settings
      </button>
    </div>
  )
}

export default DevelopmentSetup
