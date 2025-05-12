"use client"

import React from "react"

import { useState, useEffect } from "react"
import yaml from "js-yaml"
import "./ValuesEditor.css"

interface ValuesEditorProps {
  schema?: any
  initialValues?: any
  environment?: string
  product?: string
  customer?: string
  version?: string
  onSave?: (values: any) => void
}

const ValuesEditor: React.FC<ValuesEditorProps> = ({
  schema,
  initialValues,
  environment = "dev",
  product = "",
  customer = "",
  version = "",
  onSave,
}) => {
  const [values, setValues] = useState<any>(initialValues || {})
  const [yamlView, setYamlView] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"form" | "yaml" | "configmap">("form")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Update YAML view when values change
  useEffect(() => {
    try {
      const yamlString = yaml.dump(values)
      setYamlView(yamlString)
    } catch (err) {
      console.error("Error converting to YAML:", err)
    }
  }, [values])

  // Initialize with default values from schema if available
  useEffect(() => {
    if (schema && !initialValues) {
      const defaultValues = generateDefaultValues(schema)
      setValues(defaultValues)
    }
  }, [schema, initialValues])

  // Generate default values from schema
  const generateDefaultValues = (schema: any) => {
    if (!schema || !schema.properties) return {}

    const defaults: any = {}

    Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
      if (property.type === "object" && property.properties) {
        defaults[key] = generateDefaultValues(property)
      } else if (property.type === "array" && property.items) {
        defaults[key] = property.default || []
      } else {
        defaults[key] = property.default !== undefined ? property.default : getDefaultForType(property.type)
      }
    })

    return defaults
  }

  // Get default value based on type
  const getDefaultForType = (type: string) => {
    switch (type) {
      case "string":
        return ""
      case "number":
      case "integer":
        return 0
      case "boolean":
        return false
      case "object":
        return {}
      case "array":
        return []
      default:
        return null
    }
  }

  // Handle form field changes
  const handleFieldChange = (path: string[], value: any) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues }
      let current = newValues

      // Navigate to the parent object
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]
        if (!current[key]) {
          current[key] = {}
        }
        current = current[key]
      }

      // Set the value
      current[path[path.length - 1]] = value

      return newValues
    })
  }

  // Handle YAML text changes
  const handleYamlChange = (yamlText: string) => {
    setYamlView(yamlText)
    try {
      const parsedValues = yaml.load(yamlText)
      setValues(parsedValues)
      setError(null)
    } catch (err) {
      console.error("Error parsing YAML:", err)
      setError("Invalid YAML format")
    }
  }

  // Save values
  const handleSave = () => {
    if (onSave) {
      onSave(values)
    }
    alert("Values saved successfully!")
  }

  // Render form fields based on schema
  const renderFormFields = (schemaProperties: any, path: string[] = []) => {
    if (!schemaProperties) return null

    return Object.entries(schemaProperties).map(([key, property]: [string, any]) => {
      const currentPath = [...path, key]
      const fieldId = currentPath.join("-")

      // Get current value
      let currentValue = values
      for (const pathSegment of currentPath) {
        if (!currentValue) break
        currentValue = currentValue[pathSegment]
      }

      if (property.type === "object" && property.properties) {
        return (
          <div key={fieldId} className="object-field">
            <h3 className="object-title">{property.title || key}</h3>
            {property.description && <p className="object-description">{property.description}</p>}
            <div className="object-properties">{renderFormFields(property.properties, currentPath)}</div>
          </div>
        )
      }

      if (property.type === "array") {
        // Simple array rendering for now
        return (
          <div key={fieldId} className="array-field">
            <label htmlFor={fieldId}>{property.title || key}</label>
            <div className="array-field-value">
              <textarea
                id={fieldId}
                value={currentValue ? JSON.stringify(currentValue) : "[]"}
                onChange={(e) => {
                  try {
                    const arrayValue = JSON.parse(e.target.value)
                    handleFieldChange(currentPath, arrayValue)
                  } catch (err) {
                    console.error("Invalid array JSON:", err)
                  }
                }}
                placeholder="Enter JSON array"
              />
            </div>
            {property.description && <p className="field-description">{property.description}</p>}
          </div>
        )
      }

      // Render based on property type
      switch (property.type) {
        case "string":
          if (property.enum) {
            return (
              <div key={fieldId} className="field">
                <label htmlFor={fieldId}>{property.title || key}</label>
                <select
                  id={fieldId}
                  value={currentValue || ""}
                  onChange={(e) => handleFieldChange(currentPath, e.target.value)}
                >
                  {property.enum.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {property.description && <p className="field-description">{property.description}</p>}
              </div>
            )
          }
          return (
            <div key={fieldId} className="field">
              <label htmlFor={fieldId}>{property.title || key}</label>
              <input
                type="text"
                id={fieldId}
                value={currentValue || ""}
                onChange={(e) => handleFieldChange(currentPath, e.target.value)}
                placeholder={property.description || `Enter ${key}`}
              />
              {property.description && <p className="field-description">{property.description}</p>}
            </div>
          )

        case "integer":
        case "number":
          return (
            <div key={fieldId} className="field">
              <label htmlFor={fieldId}>{property.title || key}</label>
              <input
                type="number"
                id={fieldId}
                value={currentValue !== undefined ? currentValue : ""}
                onChange={(e) => handleFieldChange(currentPath, Number(e.target.value))}
                placeholder={property.description || `Enter ${key}`}
              />
              {property.description && <p className="field-description">{property.description}</p>}
            </div>
          )

        case "boolean":
          return (
            <div key={fieldId} className="field checkbox-field">
              <label htmlFor={fieldId}>
                <input
                  type="checkbox"
                  id={fieldId}
                  checked={!!currentValue}
                  onChange={(e) => handleFieldChange(currentPath, e.target.checked)}
                />
                {property.title || key}
              </label>
              {property.description && <p className="field-description">{property.description}</p>}
            </div>
          )

        default:
          return null
      }
    })
  }

  if (loading) {
    return <div className="values-editor-loading">Loading values editor...</div>
  }

  return (
    <div className="values-editor-container">
      <div className="values-editor-header">
        <h2 className="values-editor-title">Helm Values Editor</h2>
        <div className="context-info">
          {environment && <span className="context-item">Environment: {environment}</span>}
          {product && <span className="context-item">Product: {product}</span>}
          {customer && <span className="context-item">Customer: {customer}</span>}
          {version && <span className="context-item">Version: {version}</span>}
        </div>
      </div>

      <div className="values-editor-tabs">
        <button className={`tab-button ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
          Form View
        </button>
        <button className={`tab-button ${activeTab === "yaml" ? "active" : ""}`} onClick={() => setActiveTab("yaml")}>
          YAML
        </button>
        <button
          className={`tab-button ${activeTab === "configmap" ? "active" : ""}`}
          onClick={() => setActiveTab("configmap")}
        >
          ConfigMap
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="values-editor-content">
        {activeTab === "form" && (
          <div className="form-view">
            {schema && schema.properties ? (
              renderFormFields(schema.properties)
            ) : (
              <div className="no-schema-message">No schema available. Please define a schema first.</div>
            )}
          </div>
        )}

        {activeTab === "yaml" && (
          <div className="yaml-view">
            <textarea
              value={yamlView}
              onChange={(e) => handleYamlChange(e.target.value)}
              spellCheck={false}
              className="yaml-editor"
            />
          </div>
        )}

        {activeTab === "configmap" && (
          <div className="configmap-view">
            <pre className="configmap-preview">
              {`apiVersion: v1
kind: ConfigMap
metadata:
  name: ${product || "my-app"}-config
  namespace: ${environment || "default"}
data:
  values.yaml: |-
${yamlView
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
`}
            </pre>
          </div>
        )}
      </div>

      <div className="values-editor-actions">
        <button className="save-button" onClick={handleSave}>
          Save Values
        </button>
        <button
          className="download-button"
          onClick={() => {
            const blob = new Blob([yamlView], { type: "text/yaml" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `values-${environment || "default"}.yaml`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
        >
          Download YAML
        </button>
      </div>
    </div>
  )
}

export default ValuesEditor
