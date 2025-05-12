"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import yaml from "js-yaml"
import "./HelmEditor.css"
import Splitter from "./Splitter"

// Import Handlebars for template rendering
// Note: In a real app, you'd need to install handlebars via npm
const Handlebars = {
  compile: (template: string) => {
    return (data: any) => {
      // Simple implementation of the lookup helper
      const lookupHelper = (obj: any, field: string) => {
        return obj && obj[field]
      }

      // Simple implementation of the splitLines helper
      const splitLinesHelper = (str: string) => {
        if (typeof str === "string") {
          return str.split("\n")
        }
        return []
      }

      // Replace {{#if (lookup Values.data "config.json")}} ... {{/if}}
      let result = template
      if (lookupHelper(data.Values.data, "config.json")) {
        // Replace the if block with the content
        result = result.replace(
          /{{#if $$lookup Values\.data "config\.json"$$}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/,
          "$1",
        )
      } else {
        // Replace the if block with the else content
        result = result.replace(
          /{{#if $$lookup Values\.data "config\.json"$$}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/,
          "$1",
        )
      }

      // Replace {{#each (splitLines (lookup Values.data "config.json"))}} ... {{/each}}
      if (lookupHelper(data.Values.data, "config.json")) {
        const configLines = splitLinesHelper(lookupHelper(data.Values.data, "config.json"))
        let eachContent = ""

        // Extract the content inside the each block
        const eachMatch = result.match(
          /{{#each $$splitLines $$lookup Values\.data "config\.json"$$$$}}([\s\S]*?){{\/each}}/,
        )
        if (eachMatch && eachMatch[1]) {
          const eachTemplate = eachMatch[1]

          // For each line, replace {{this}} with the line
          configLines.forEach((line) => {
            eachContent += eachTemplate.replace(/{{this}}/g, line)
          })

          // Replace the each block with the generated content
          result = result.replace(
            /{{#each $$splitLines $$lookup Values\.data "config\.json"$$$$}}[\s\S]*?{{\/each}}/,
            eachContent,
          )
        }
      }

      return result
    }
  },
}

// Custom component to render form fields based on JSON schema
const SchemaForm = ({ schema, formData, onChange }: any) => {
  if (!schema || !schema.properties) return null

  const renderField = (key: string, property: any, path: string[] = []) => {
    const currentPath = [...path, key]
    const fieldId = currentPath.join(".")
    const value = getNestedValue(formData, currentPath)

    if (property.type === "object" && property.properties) {
      return (
        <div key={fieldId} className="object-field-container">
          <h3 className="object-title">{property.title || key}</h3>
          {property.description && <p className="object-description">{property.description}</p>}
          <div className="object-properties">
            {Object.entries(property.properties).map(([propKey, propValue]: [string, any]) =>
              renderField(propKey, propValue, currentPath),
            )}
          </div>
        </div>
      )
    }

    if (property.type === "array") {
      const items = Array.isArray(value) ? value : []
      return (
        <div key={fieldId} className="array-field-container">
          <label className="field-label">{property.title || key}</label>
          {items.map((item, index) => (
            <div key={`${fieldId}-${index}`} className="array-field-item">
              <div className="array-field-content">
                {property.items.type === "object" ? (
                  Object.entries(property.items.properties || {}).map(([itemKey, itemProp]: [string, any]) =>
                    renderField(itemKey, itemProp, [...currentPath, index.toString()]),
                  )
                ) : (
                  <input
                    type={property.items.type === "number" ? "number" : "text"}
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[index] = property.items.type === "number" ? Number(e.target.value) : e.target.value
                      const newData = { ...formData }
                      setNestedValue(newData, currentPath, newItems)
                      onChange(newData)
                    }}
                  />
                )}
              </div>
              <button
                type="button"
                className="array-field-remove-btn"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== index)
                  const newData = { ...formData }
                  setNestedValue(newData, currentPath, newItems)
                  onChange(newData)
                }}
              >
                🗑
              </button>
            </div>
          ))}
          <button
            type="button"
            className="array-field-add-btn"
            onClick={() => {
              const newItem = property.items.type === "object" ? {} : property.items.type === "number" ? 0 : ""
              const newItems = [...items, newItem]
              const newData = { ...formData }
              setNestedValue(newData, currentPath, newItems)
              onChange(newData)
            }}
          >
            + Add Item
          </button>
        </div>
      )
    }

    if (property.enum) {
      return (
        <div key={fieldId} className="field-container">
          <label className="field-label" htmlFor={fieldId}>
            {property.title || key}
          </label>
          <div className="field-input-wrapper">
            <select
              id={fieldId}
              value={value || ""}
              onChange={(e) => {
                const newData = { ...formData }
                setNestedValue(newData, currentPath, e.target.value)
                onChange(newData)
              }}
            >
              {property.enum.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {property.description && <div className="field-description">{property.description}</div>}
        </div>
      )
    }

    if (property.type === "boolean") {
      return (
        <div key={fieldId} className="field-container">
          <label className="field-label" htmlFor={fieldId}>
            {property.title || key}
          </label>
          <div className="field-input-wrapper checkbox-container">
            <input
              id={fieldId}
              type="checkbox"
              checked={!!value}
              onChange={(e) => {
                const newData = { ...formData }
                setNestedValue(newData, currentPath, e.target.checked)
                onChange(newData)
              }}
            />
          </div>
          {property.description && <div className="field-description">{property.description}</div>}
        </div>
      )
    }

    return (
      <div key={fieldId} className="field-container">
        <label className="field-label" htmlFor={fieldId}>
          {property.title || key}
        </label>
        <div className="field-input-wrapper">
          <input
            id={fieldId}
            type={property.type === "number" || property.type === "integer" ? "number" : "text"}
            value={value !== undefined ? value : ""}
            onChange={(e) => {
              const newValue =
                property.type === "number" || property.type === "integer" ? Number(e.target.value) : e.target.value
              const newData = { ...formData }
              setNestedValue(newData, currentPath, newValue)
              onChange(newData)
            }}
          />
        </div>
        {property.description && <div className="field-description">{property.description}</div>}
      </div>
    )
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {Object.entries(schema.properties).map(([key, property]: [string, any]) => renderField(key, property))}
    </form>
  )
}

// Helper functions to get and set nested values in an object
const getNestedValue = (obj: any, path: string[]) => {
  return path.reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), obj)
}

const setNestedValue = (obj: any, path: string[], value: any) => {
  if (path.length === 0) return

  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (current[key] === undefined) {
      current[key] = isNaN(Number(path[i + 1])) ? {} : []
    }
    current = current[key]
  }

  current[path[path.length - 1]] = value
}

interface DevelopmentPaths {
  schemaPath: string
  templatesPath: string
  valuesPath: string
}

interface HelmEditorProps {
  formMeta: any
  developmentPaths?: DevelopmentPaths | null
}

const HelmEditor: React.FC<HelmEditorProps> = ({ formMeta, developmentPaths }) => {
  // Define all refs at the top level of the component
  const yamlCodeRef = useRef<HTMLElement | null>(null)
  const jsonCodeRef = useRef<HTMLElement | null>(null)
  const configmapCodeRef = useRef<HTMLElement | null>(null)

  // Define all state variables
  const [schema, setSchema] = useState<any>(null)
  const [values, setValues] = useState<any>(null)
  const [template, setTemplate] = useState<string>("")
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [previewTab, setPreviewTab] = useState<"yaml" | "configmap" | "json">("yaml")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [configJson, setConfigJson] = useState<string>("")
  const [renderedTemplate, setRenderedTemplate] = useState<string>("")

  // Get paths from development settings or use defaults
  const schemaPath = developmentPaths?.schemaPath || "/src/mock"
  const templatesPath = developmentPaths?.templatesPath || "/src/mock"
  const valuesPath = developmentPaths?.valuesPath || "/src/mock"

  // Load schema
  useEffect(() => {
    // First check if we have a saved schema in localStorage
    const savedSchema = localStorage.getItem(`schema_${schemaPath}`)

    if (savedSchema) {
      try {
        // Use the saved schema if available
        const schemaData = JSON.parse(savedSchema)
        setSchema(schemaData)
        console.log("Loaded schema from localStorage")
      } catch (parseError) {
        console.error("Error parsing saved schema:", parseError)
        // If there's an error parsing the saved schema, continue to fetch from the server
        fetchSchemaFromServer()
      }
    } else {
      // No saved schema, fetch from server
      fetchSchemaFromServer()
    }

    function fetchSchemaFromServer() {
      fetch(`${schemaPath}/schema/values.schema.json`)
        .then((res) => res.json())
        .then(setSchema)
        .catch((error) => {
          console.error("Error loading schema:", error)
          // Try fallback path if configured path fails
          if (schemaPath !== "/src/mock") {
            console.log("Trying fallback schema path...")
            fetch("/src/mock/schema/values.schema.json")
              .then((res) => res.json())
              .then(setSchema)
              .catch((fallbackError) => console.error("Fallback schema load failed:", fallbackError))
          }
        })
    }
  }, [schemaPath])

  // Also, add a useEffect that ensures config.json is generated when schema is loaded
  useEffect(() => {
    // When both schema and values are loaded, we could generate config.json
    // But we'll let the user trigger this manually instead
    if (schema && values && !values.data) {
      // Initialize data object if it doesn't exist
      values.data = {}
    }
  }, [schema, values])

  // Load template
  useEffect(() => {
    fetch(`${templatesPath}/templates/configmap.yaml`)
      .then((res) => res.text())
      .then(setTemplate)
      .catch((error) => {
        console.error("Error loading template:", error)
        // Try fallback path if configured path fails
        if (templatesPath !== "/src/mock") {
          console.log("Trying fallback template path...")
          fetch("/src/mock/templates/configmap.yaml")
            .then((res) => res.text())
            .then(setTemplate)
            .catch((fallbackError) => console.error("Fallback template load failed:", fallbackError))
        }
      })
  }, [templatesPath])

  // Load values based on environment
  useEffect(() => {
    if (formMeta?.env) {
      fetch(`${valuesPath}/${formMeta.env || "dev"}/values.yaml`)
        .then((res) => res.text())
        .then((text) => {
          try {
            const parsed = yaml.load(text)
            setValues(parsed)

            // Initialize data object if it doesn't exist
            if (!parsed.data) {
              parsed.data = {}
            }

            // Generate config.json from values and schema
            generateConfigJson(parsed)
          } catch (e) {
            console.error("Error parsing YAML:", e)
          }
        })
        .catch((error) => {
          console.error("Error loading values:", error)
          // Try fallback path if configured path fails
          if (valuesPath !== "/src/mock") {
            console.log("Trying fallback values path...")
            fetch(`/src/mock/${formMeta.env || "dev"}/values.yaml`)
              .then((res) => res.text())
              .then((text) => {
                try {
                  const parsed = yaml.load(text)
                  setValues(parsed)
                  if (!parsed.data) parsed.data = {}
                  generateConfigJson(parsed)
                } catch (e) {
                  console.error("Error parsing fallback YAML:", e)
                }
              })
              .catch((fallbackError) => console.error("Fallback values load failed:", fallbackError))
          }
        })
    }
  }, [formMeta, valuesPath])

  // Ensure template is properly loaded and rendered
  useEffect(() => {
    if (template && values) {
      renderTemplate(values)
    }
  }, [template, values])

  // Function to apply syntax highlighting
  const applyHighlighting = async (element: HTMLElement | null, language: string) => {
    if (!element) return

    try {
      const hljs = await import("highlight.js/lib/core")

      if (language === "json") {
        const json = await import("highlight.js/lib/languages/json")
        hljs.default.registerLanguage("json", json.default)
      } else if (language === "yaml") {
        const yaml = await import("highlight.js/lib/languages/yaml")
        hljs.default.registerLanguage("yaml", yaml.default)
      }

      hljs.default.highlightElement(element)
    } catch (error) {
      console.error("Error applying syntax highlighting:", error)
    }
  }

  // Effect to apply highlighting when tab changes
  useEffect(() => {
    if (previewTab === "yaml" && yamlCodeRef.current) {
      applyHighlighting(yamlCodeRef.current, "yaml")
    } else if (previewTab === "json" && jsonCodeRef.current) {
      applyHighlighting(jsonCodeRef.current, "json")
    } else if (previewTab === "configmap" && configmapCodeRef.current) {
      applyHighlighting(configmapCodeRef.current, "yaml")
    }
  }, [previewTab, configJson, renderedTemplate, values])

  // Generate config.json from values and schema
  const generateConfigJson = (valuesData: any) => {
    if (!schema || !valuesData) return

    // Ensure config object exists
    if (!valuesData.config) {
      valuesData.config = {}
    }

    // Generate JSON string from config object
    const configData = valuesData.config
    const jsonString = JSON.stringify(configData, null, 2)

    // Update the configJson state
    setConfigJson(jsonString)

    // Ensure data object exists
    if (!valuesData.data) {
      valuesData.data = {}
    }

    // Store the config.json in the data object
    valuesData.data["config.json"] = jsonString

    // Update the values state with the modified data
    setValues({ ...valuesData })

    // Render the template with the updated values
    renderTemplate(valuesData)
  }

  // Render the template with the current values
  const renderTemplate = (valuesData: any) => {
    if (!template || !valuesData) return

    try {
      const compiledTemplate = Handlebars.compile(template)
      const rendered = compiledTemplate({ Values: valuesData })
      setRenderedTemplate(rendered)
    } catch (e) {
      console.error("Error rendering template:", e)
      setRenderedTemplate("# Error rendering template")
    }
  }

  // Update the handleFormChange function to properly generate config.json
  const handleFormChange = (newData: any) => {
    // First, make a deep copy of the data to avoid reference issues
    const updatedData = JSON.parse(JSON.stringify(newData))

    // Ensure config object exists
    if (!updatedData.config) {
      updatedData.config = {}
    }

    // Generate config.json from the config object
    const jsonString = JSON.stringify(updatedData.config, null, 2)

    // Update the configJson state
    setConfigJson(jsonString)

    // Ensure data object exists
    if (!updatedData.data) {
      updatedData.data = {}
    }

    // Store the config.json in the data object
    updatedData.data["config.json"] = jsonString

    // Update the values state with the modified data
    setValues(updatedData)

    // Render the template with the updated values
    renderTemplate(updatedData)

    // Log for debugging
    console.log("Updated values:", updatedData)
    console.log("Config JSON:", jsonString)
  }

  // Modify the handleTabChange function to ensure it doesn't need to regenerate config.json
  const handleTabChange = (tab: "yaml" | "configmap" | "json") => {
    setPreviewTab(tab)
    // Regenerate config.json when switching to the json tab
    if (tab === "json" && values) {
      generateConfigJson(values)
    }
  }

  const handleDownload = () => {
    if (!values) return

    const content = yaml.dump(values)
    const blob = new Blob([content], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `values-${formMeta.env || "dev"}.yaml`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleConfigMapDownload = () => {
    if (!renderedTemplate) return

    const blob = new Blob([renderedTemplate], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "configmap.yaml"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!schema || !values) {
    return <div className="loading">Loading Helm values and schema...</div>
  }

  // Custom SyntaxHighlighter with ref
  const CustomSyntaxHighlighter = ({
    code,
    language,
    className = "",
    codeRef,
  }: {
    code: string
    language: "json" | "yaml" | "plaintext"
    className?: string
    codeRef: React.RefObject<HTMLElement>
  }) => {
    return (
      <pre className={`syntax-highlighter ${className}`}>
        <code ref={codeRef} className={language}>
          {code}
        </code>
      </pre>
    )
  }

  // Render the preview content based on the selected tab
  const renderPreviewContent = () => {
    switch (previewTab) {
      case "yaml":
        return (
          <>
            <CustomSyntaxHighlighter
              code={yaml.dump(values)}
              language="yaml"
              className="preview-content"
              codeRef={yamlCodeRef}
            />
            <button className="download-btn" onClick={handleDownload}>
              ⬇ Download YAML
            </button>
          </>
        )
      case "json":
        return (
          <>
            <CustomSyntaxHighlighter
              code={configJson}
              language="json"
              className="preview-content"
              codeRef={jsonCodeRef}
            />
            <div className="json-actions">
              <button
                className="download-btn"
                onClick={() => {
                  const blob = new Blob([configJson], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = "config.json"
                  link.click()
                  URL.revokeObjectURL(url)
                }}
                disabled={!!jsonError}
              >
                ⬇ Download JSON
              </button>
              <button
                className="action-btn"
                onClick={() => generateConfigJson(values)}
                title="Regenerate config.json from current values"
              >
                🔄 Regenerate
              </button>
            </div>
            {jsonError && <div className="json-error">{jsonError}</div>}
          </>
        )
      case "configmap":
        return (
          <>
            <CustomSyntaxHighlighter
              code={renderedTemplate}
              language="yaml"
              className="preview-content"
              codeRef={configmapCodeRef}
            />
            <button className="download-btn" onClick={handleConfigMapDownload}>
              ⬇ Download ConfigMap
            </button>
          </>
        )
      default:
        return null
    }
  }

  // Form content with vertical splitter
  const formContent = (
    <div className="form-fields-container">
      <h2 className="form-title">Helm Values Editor</h2>
      <SchemaForm schema={schema} formData={values} onChange={handleFormChange} />
    </div>
  )

  // Preview content
  const previewContent = (
    <div className="preview-container">
      <div className="preview-tabs">
        <button
          className={`preview-tab ${previewTab === "yaml" ? "active" : ""}`}
          onClick={() => handleTabChange("yaml")}
        >
          YAML
        </button>
        <button
          className={`preview-tab ${previewTab === "json" ? "active" : ""}`}
          onClick={() => handleTabChange("json")}
        >
          config.json
        </button>
        <button
          className={`preview-tab ${previewTab === "configmap" ? "active" : ""}`}
          onClick={() => handleTabChange("configmap")}
        >
          ConfigMap
        </button>
      </div>
      <div className="preview-content-container">{renderPreviewContent()}</div>
    </div>
  )

  return (
    <div className="helm-editor-container">
      {/* Context bar */}
      <div className="context-bar">
        <div className="context-info">
          <div className="context-item">
            <strong>Environment:</strong> {formMeta?.env || "dev"}
          </div>
          <div className="context-item">
            <strong>Product:</strong> {formMeta?.product || "N/A"}
          </div>
          <div className="context-item">
            <strong>Customer:</strong> {formMeta?.customer || "N/A"}
          </div>
          <div className="context-item">
            <strong>Version:</strong> {formMeta?.version || "N/A"}
          </div>
          {developmentPaths && (
            <div className="context-item dev-paths-info">
              <span title={`Schema: ${schemaPath}, Templates: ${templatesPath}, Values: ${valuesPath}`}>
                🛠️ Using custom paths
              </span>
            </div>
          )}
        </div>
        <button className="toggle-btn" onClick={() => setSidebarVisible(!sidebarVisible)}>
          {sidebarVisible ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className="helm-editor-layout">
        {sidebarVisible ? (
          <Splitter direction="horizontal" initialSizes={[60, 40]} minSizes={[30, 30]}>
            {formContent}
            {previewContent}
          </Splitter>
        ) : (
          formContent
        )}
      </div>

      <div className="helm-editor-actions">
        <button type="submit" onClick={handleDownload} className="submit-btn">
          Save Values
        </button>
      </div>
    </div>
  )
}

export default HelmEditor

/*
.generate-json-btn {
  margin-left: auto;
  background-color: var(--color-primary-light);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-1) var(--spacing-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.json-actions {
  display: flex;
  gap: var(--spacing-2);
  margin: var(--spacing-2);
}
*/
