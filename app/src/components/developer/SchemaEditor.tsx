"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import "./SchemaEditor.css"

interface SchemaEditorProps {
  schemaPath?: string
  onComplete?: () => void
  onSchemaChange?: (schema: any) => void
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  schemaPath = "/src/mock",
  onComplete = () => {},
  onSchemaChange,
}) => {
  const [schema, setSchema] = useState<string>("")
  const [originalSchema, setOriginalSchema] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<"code" | "visual">("code")
  const [loading, setLoading] = useState<boolean>(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load schema
  useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true)
        // First check if we have a saved schema in localStorage
        const savedSchema = localStorage.getItem(`schema_${schemaPath}`)

        if (savedSchema) {
          try {
            // Use the saved schema if available
            const schemaData = JSON.parse(savedSchema)
            const schemaText = JSON.stringify(schemaData, null, 2)
            setSchema(schemaText)
            setOriginalSchema(schemaText)
            console.log("Loaded schema from localStorage")

            // Notify parent component if callback provided
            if (onSchemaChange) {
              onSchemaChange(schemaData)
            }

            setLoading(false)
            return
          } catch (parseError) {
            console.error("Error parsing saved schema:", parseError)
            // If there's an error parsing the saved schema, continue to fetch from the server
          }
        }

        // Fetch from server if no saved schema or error parsing
        console.log("Fetching schema from:", `${schemaPath}/schema/values.schema.json`)
        const res = await fetch(`${schemaPath}/schema/values.schema.json`)
        if (!res.ok) {
          throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
        }

        const schemaData = await res.json()
        const schemaText = JSON.stringify(schemaData, null, 2)
        setSchema(schemaText)
        setOriginalSchema(schemaText)
        console.log("Loaded schema from server")

        // Notify parent component if callback provided
        if (onSchemaChange) {
          onSchemaChange(schemaData)
        }
      } catch (error) {
        console.error("Error loading schema:", error)
        setError("Failed to load schema. Using default schema.")

        // Create a basic schema if all else fails
        const basicSchema = {
          type: "object",
          properties: {
            replicaCount: {
              type: "integer",
              title: "Replicas",
              default: 1,
            },
            image: {
              type: "object",
              properties: {
                repository: {
                  type: "string",
                  default: "nginx",
                },
                tag: {
                  type: "string",
                  default: "latest",
                },
              },
            },
            service: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["ClusterIP", "NodePort", "LoadBalancer"],
                },
                port: {
                  type: "integer",
                  default: 80,
                },
              },
            },
          },
        }

        const schemaText = JSON.stringify(basicSchema, null, 2)
        setSchema(schemaText)
        setOriginalSchema(schemaText)

        // Notify parent component if callback provided
        if (onSchemaChange) {
          onSchemaChange(basicSchema)
        }
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [schemaPath, onSchemaChange])

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSchema = e.target.value
    setSchema(newSchema)
    setIsSaved(newSchema === originalSchema)

    // Validate JSON
    try {
      const parsedSchema = JSON.parse(newSchema)
      setError(null)

      // Notify parent component if callback provided
      if (onSchemaChange) {
        onSchemaChange(parsedSchema)
      }
    } catch (err) {
      setError("Invalid JSON format")
    }
  }

  const formatSchema = () => {
    if (error) return

    try {
      const formatted = JSON.stringify(JSON.parse(schema), null, 2)
      setSchema(formatted)
    } catch (err) {
      console.error("Error formatting schema:", err)
    }
  }

  const handleSave = async () => {
    if (error) return

    try {
      // Parse to validate and then stringify to ensure proper formatting
      const schemaObj = JSON.parse(schema)

      // Save to localStorage
      localStorage.setItem(`schema_${schemaPath}`, JSON.stringify(schemaObj))
      setOriginalSchema(schema)
      setIsSaved(true)

      // Show success message
      alert("Schema saved successfully!")
    } catch (err) {
      console.error("Error saving schema:", err)
      setError("Failed to save schema: Invalid JSON")
    }
  }

  const handleReset = () => {
    setSchema(originalSchema)
    setIsSaved(true)
    setError(null)

    // Notify parent component if callback provided
    if (onSchemaChange) {
      try {
        onSchemaChange(JSON.parse(originalSchema))
      } catch (err) {
        console.error("Error parsing original schema:", err)
      }
    }
  }

  const addNewProperty = () => {
    try {
      const schemaObj = JSON.parse(schema)

      if (!schemaObj.properties) {
        schemaObj.properties = {}
      }

      // Add a new property
      schemaObj.properties.newProperty = {
        type: "string",
        title: "New Property",
        description: "Description for the new property",
      }

      const updatedSchema = JSON.stringify(schemaObj, null, 2)
      setSchema(updatedSchema)
      setIsSaved(false)

      // Notify parent component if callback provided
      if (onSchemaChange) {
        onSchemaChange(schemaObj)
      }
    } catch (err) {
      console.error("Error adding property:", err)
      setError("Failed to add property: Invalid JSON")
    }
  }

  if (loading) {
    return (
      <div className="schema-editor-container">
        <h2 className="schema-editor-title">JSON Schema Editor</h2>
        <p className="schema-editor-description">Loading schema...</p>
        <div className="loading-indicator">Loading schema data...</div>
      </div>
    )
  }

  return (
    <div className="schema-editor-container">
      <div className="schema-editor-header">
        <h2 className="schema-editor-title">JSON Schema Editor</h2>
        <div className="schema-editor-tools">
          <button
            className={`schema-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            Code View
          </button>
          <button
            className={`schema-tab-btn ${activeTab === "visual" ? "active" : ""}`}
            onClick={() => setActiveTab("visual")}
            disabled={true}
          >
            Visual Editor (Coming Soon)
          </button>
        </div>
      </div>

      <p className="schema-editor-description">Edit the JSON schema that defines the structure of your Helm values.</p>

      {error && <div className="error-message">{error}</div>}

      <div className="code-editor-container">
        <div className="code-editor-actions">
          <button className="action-btn" onClick={formatSchema} disabled={!schema || !!error}>
            Format JSON
          </button>
          <button className="action-btn" onClick={addNewProperty} disabled={!!error}>
            Add Property
          </button>
          <div className="spacer"></div>
          <button className="reset-btn" onClick={handleReset} disabled={isSaved}>
            Reset
          </button>
          <button className="submit-btn" onClick={handleSave} disabled={!!error || isSaved}>
            Save Schema
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="schema-textarea"
          value={schema}
          onChange={handleSchemaChange}
          spellCheck={false}
          placeholder="Loading schema..."
        />
      </div>

      {activeTab === "visual" && (
        <div className="visual-editor-placeholder">
          <p>Visual editor is coming soon!</p>
          <p>Please use the Code View for now.</p>
        </div>
      )}
    </div>
  )
}

export default SchemaEditor
