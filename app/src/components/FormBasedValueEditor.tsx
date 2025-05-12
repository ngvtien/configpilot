"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import yaml from "js-yaml"
import "./FormBasedValueEditor.css"

interface FormBasedValueEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  environment?: string
}

interface FormField {
  path: string[]
  label: string
  type: "text" | "number" | "select" | "checkbox" | "array"
  options?: string[]
  arrayItemType?: "text" | "number" | "object"
  arrayItemFields?: FormField[]
}

const FormBasedValueEditor: React.FC<FormBasedValueEditorProps> = ({
  initialValue = "",
  onChange,
  environment = "dev",
}) => {
  const [yamlContent, setYamlContent] = useState(initialValue)
  const [formData, setFormData] = useState<any>({})
  const [displayFormat, setDisplayFormat] = useState<"yaml" | "configmap" | "configjson">("yaml")
  const [isLoading, setIsLoading] = useState(true)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [arrayItems, setArrayItems] = useState<Record<string, any[]>>({})

  // Load values when component mounts or environment changes
  useEffect(() => {
    loadValues(environment)
  }, [environment])

  const loadValues = async (env: string) => {
    try {
      setIsLoading(true)

      // First try to load from localStorage
      const savedValues = localStorage.getItem(`value_editor_${env}`)

      if (savedValues) {
        setYamlContent(savedValues)
        const parsedValues = yaml.load(savedValues) as any
        setFormData(parsedValues || {})
        generateFormFields(parsedValues || {})
        setIsLoading(false)
        return
      }

      // If no saved values, try to load from file
      try {
        const response = await fetch(`/src/mock/${env}/values.yaml`)
        if (response.ok) {
          const content = await response.text()
          setYamlContent(content)

          const parsedValues = yaml.load(content) as any
          setFormData(parsedValues || {})
          generateFormFields(parsedValues || {})

          // Save to localStorage for future use
          localStorage.setItem(`value_editor_${env}`, content)

          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error("Error loading from file:", e)
      }

      // If all else fails, use initialValue
      setYamlContent(initialValue)
      const parsedValues = yaml.load(initialValue) as any
      setFormData(parsedValues || {})
      generateFormFields(parsedValues || {})
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading values:", error)
      setIsLoading(false)
    }
  }

  // Generate form fields based on the YAML structure
  const generateFormFields = (data: any, basePath: string[] = []) => {
    const fields: FormField[] = []

    // Initialize array items
    const newArrayItems: Record<string, any[]> = {}

    for (const key in data) {
      const value = data[key]
      const path = [...basePath, key]
      const pathStr = path.join(".")

      if (Array.isArray(value)) {
        // Handle array type
        newArrayItems[pathStr] = [...value]

        // Determine array item type
        let arrayItemType: "text" | "number" | "object" = "text"
        const arrayItemFields: FormField[] = []

        if (value.length > 0) {
          const firstItem = value[0]
          if (typeof firstItem === "number") {
            arrayItemType = "number"
          } else if (typeof firstItem === "object" && firstItem !== null) {
            arrayItemType = "object"
            // Generate fields for object items
            for (const itemKey in firstItem) {
              arrayItemFields.push({
                path: [itemKey],
                label: itemKey,
                type: typeof firstItem[itemKey] === "number" ? "number" : "text",
              })
            }
          }
        }

        fields.push({
          path,
          label: key,
          type: "array",
          arrayItemType,
          arrayItemFields,
        })
      } else if (typeof value === "object" && value !== null) {
        // For objects, create a section header
        fields.push({
          path,
          label: key,
          type: "text", // This is just a placeholder, we'll render it as a section
        })

        // Recursively generate fields for nested objects
        const nestedFields = generateFormFieldsRecursive(value, path)
        fields.push(...nestedFields)
      } else if (typeof value === "boolean") {
        fields.push({
          path,
          label: key,
          type: "checkbox",
        })
      } else if (typeof value === "number") {
        fields.push({
          path,
          label: key,
          type: "number",
        })
      } else {
        // Default to text input
        fields.push({
          path,
          label: key,
          type: "text",
        })
      }
    }

    setArrayItems(newArrayItems)
    setFormFields(fields)
  }

  // Helper function for recursive field generation
  const generateFormFieldsRecursive = (data: any, basePath: string[] = []): FormField[] => {
    const fields: FormField[] = []

    for (const key in data) {
      const value = data[key]
      const path = [...basePath, key]

      if (Array.isArray(value)) {
        // Handle array type (simplified for nested arrays)
        fields.push({
          path,
          label: key,
          type: "array",
          arrayItemType: "text",
        })
      } else if (typeof value === "object" && value !== null) {
        // For nested objects, create a section header
        fields.push({
          path,
          label: key,
          type: "text", // This is just a placeholder, we'll render it as a section
        })

        // Recursively generate fields for nested objects
        const nestedFields = generateFormFieldsRecursive(value, path)
        fields.push(...nestedFields)
      } else if (typeof value === "boolean") {
        fields.push({
          path,
          label: key,
          type: "checkbox",
        })
      } else if (typeof value === "number") {
        fields.push({
          path,
          label: key,
          type: "number",
        })
      } else {
        // Default to text input
        fields.push({
          path,
          label: key,
          type: "text",
        })
      }
    }

    return fields
  }

  // Update form data and regenerate YAML
  const updateFormData = (path: string[], value: any) => {
    // Create a deep copy of the form data
    const newFormData = JSON.parse(JSON.stringify(formData))

    // Navigate to the correct location in the object
    let current = newFormData
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }

    // Update the value
    current[path[path.length - 1]] = value

    // Update state
    setFormData(newFormData)

    // Generate YAML from the updated form data
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)

    // Call onChange if provided
    if (onChange) {
      onChange(newYamlContent)
    }

    // Save to localStorage
    localStorage.setItem(`value_editor_${environment}`, newYamlContent)
  }

  // Handle array item changes
  const handleArrayItemChange = (pathStr: string, index: number, value: any) => {
    const newArrayItems = { ...arrayItems }
    newArrayItems[pathStr][index] = value
    setArrayItems(newArrayItems)

    // Update form data with the new array
    const path = pathStr.split(".")
    updateFormData(path, newArrayItems[pathStr])
  }

  // Handle object array item changes
  const handleObjectArrayItemChange = (pathStr: string, index: number, key: string, value: any) => {
    const newArrayItems = { ...arrayItems }
    if (!newArrayItems[pathStr][index]) {
      newArrayItems[pathStr][index] = {}
    }
    newArrayItems[pathStr][index][key] = value
    setArrayItems(newArrayItems)

    // Update form data with the new array
    const path = pathStr.split(".")
    updateFormData(path, newArrayItems[pathStr])
  }

  // Add a new item to an array
  const addArrayItem = (pathStr: string, type: "text" | "number" | "object") => {
    const newArrayItems = { ...arrayItems }

    // Create a new item based on type
    let newItem
    if (type === "object") {
      newItem = {}
    } else if (type === "number") {
      newItem = 0
    } else {
      newItem = ""
    }

    newArrayItems[pathStr] = [...(newArrayItems[pathStr] || []), newItem]
    setArrayItems(newArrayItems)

    // Update form data with the new array
    const path = pathStr.split(".")
    updateFormData(path, newArrayItems[pathStr])
  }

  // Remove an item from an array
  const removeArrayItem = (pathStr: string, index: number) => {
    const newArrayItems = { ...arrayItems }
    newArrayItems[pathStr] = newArrayItems[pathStr].filter((_, i) => i !== index)
    setArrayItems(newArrayItems)

    // Update form data with the new array
    const path = pathStr.split(".")
    updateFormData(path, newArrayItems[pathStr])
  }

  const generateConfigMap = () => {
    try {
      // Parse the YAML to get the values
      const values = yaml.load(yamlContent) || {}

      // Create a ConfigMap template
      const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
${Object.entries(values)
  .map(([key, value]) => {
    // Convert nested objects to JSON strings
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
    return `  ${key}: ${JSON.stringify(stringValue)}`
  })
  .join("\n")}
`
      return configMap
    } catch (error) {
      console.error("Error generating ConfigMap:", error)
      return "Error generating ConfigMap"
    }
  }

  const generateConfigJson = () => {
    try {
      // Parse the YAML to get the values
      const values = yaml.load(yamlContent) || {}
      // Convert to pretty JSON
      return JSON.stringify(values, null, 2)
    } catch (error) {
      console.error("Error generating Config.json:", error)
      return "Error generating Config.json"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show a temporary notification
    const toast = document.createElement("div")
    toast.className = "copy-notification"
    toast.textContent = "Copied to clipboard!"
    toast.style.position = "fixed"
    toast.style.top = "20px"
    toast.style.right = "20px"
    toast.style.backgroundColor = "#4CAF50"
    toast.style.color = "white"
    toast.style.padding = "10px 20px"
    toast.style.borderRadius = "4px"
    toast.style.zIndex = "1000"
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 2000)
  }

  const renderDisplayContent = () => {
    let content = ""
    let language = "yaml"

    switch (displayFormat) {
      case "yaml":
        content = yamlContent
        language = "yaml"
        break
      case "configmap":
        content = generateConfigMap()
        language = "yaml"
        break
      case "configjson":
        content = generateConfigJson()
        language = "json"
        break
    }

    return (
      <div className="value-display-container">
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            height: "100%",
            borderRadius: 0,
            fontSize: "14px",
            backgroundColor: "#1e1e1e",
          }}
          showLineNumbers={true}
        >
          {content}
        </SyntaxHighlighter>
        <button className="copy-button" onClick={() => copyToClipboard(content)}>
          Copy
        </button>
      </div>
    )
  }

  // Render a form field based on its type
  const renderFormField = (field: FormField, indent = 0) => {
    const pathStr = field.path.join(".")
    const fieldId = `field-${pathStr}`

    // Get the current value from form data
    let currentValue = formData
    for (const key of field.path) {
      if (!currentValue) break
      currentValue = currentValue[key]
    }

    // For section headers (object keys)
    if (
      field.type === "text" &&
      field.path.length > 1 &&
      typeof currentValue === "object" &&
      currentValue !== null &&
      !Array.isArray(currentValue)
    ) {
      return (
        <div key={fieldId} className="form-section" style={{ marginLeft: `${indent * 20}px` }}>
          <h3>{field.label}</h3>
        </div>
      )
    }

    // For array fields
    if (field.type === "array") {
      return (
        <div key={fieldId} className="form-array-field" style={{ marginLeft: `${indent * 20}px` }}>
          <label>{field.label}</label>
          <div className="array-items">
            {arrayItems[pathStr]?.map((item, index) => (
              <div key={`${pathStr}-${index}`} className="array-item">
                {field.arrayItemType === "object" ? (
                  <div className="object-array-item">
                    {field.arrayItemFields?.map((itemField) => (
                      <div key={`${pathStr}-${index}-${itemField.path[0]}`} className="form-field">
                        <label>{itemField.label}</label>
                        {itemField.type === "number" ? (
                          <input
                            type="number"
                            value={item[itemField.path[0]] || 0}
                            onChange={(e) =>
                              handleObjectArrayItemChange(pathStr, index, itemField.path[0], Number(e.target.value))
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            value={item[itemField.path[0]] || ""}
                            onChange={(e) =>
                              handleObjectArrayItemChange(pathStr, index, itemField.path[0], e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : field.arrayItemType === "number" ? (
                  <input
                    type="number"
                    value={item || 0}
                    onChange={(e) => handleArrayItemChange(pathStr, index, Number(e.target.value))}
                  />
                ) : (
                  <input
                    type="text"
                    value={item || ""}
                    onChange={(e) => handleArrayItemChange(pathStr, index, e.target.value)}
                  />
                )}
                <button className="remove-item-button" onClick={() => removeArrayItem(pathStr, index)}>
                  ×
                </button>
              </div>
            ))}
            <button className="add-item-button" onClick={() => addArrayItem(pathStr, field.arrayItemType || "text")}>
              + Add Item
            </button>
          </div>
        </div>
      )
    }

    // For regular fields
    return (
      <div key={fieldId} className="form-field" style={{ marginLeft: `${indent * 20}px` }}>
        <label htmlFor={fieldId}>{field.label}</label>
        {field.type === "select" ? (
          <select id={fieldId} value={currentValue || ""} onChange={(e) => updateFormData(field.path, e.target.value)}>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : field.type === "checkbox" ? (
          <input
            type="checkbox"
            id={fieldId}
            checked={!!currentValue}
            onChange={(e) => updateFormData(field.path, e.target.checked)}
          />
        ) : field.type === "number" ? (
          <input
            type="number"
            id={fieldId}
            value={currentValue || 0}
            onChange={(e) => updateFormData(field.path, Number(e.target.value))}
          />
        ) : (
          <input
            type="text"
            id={fieldId}
            value={currentValue || ""}
            onChange={(e) => updateFormData(field.path, e.target.value)}
          />
        )}
      </div>
    )
  }

  // Group form fields by top-level section
  const groupedFields: Record<string, FormField[]> = {}
  formFields.forEach((field) => {
    const topLevel = field.path[0]
    if (!groupedFields[topLevel]) {
      groupedFields[topLevel] = []
    }
    groupedFields[topLevel].push(field)
  })

  return (
    <div className="form-based-value-editor">
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="editor-header">
            <h2>Helm Values Editor</h2>
            <div className="format-buttons">
              <button
                className={`format-button ${displayFormat === "yaml" ? "active" : ""}`}
                onClick={() => setDisplayFormat("yaml")}
              >
                YAML
              </button>
              <button
                className={`format-button ${displayFormat === "configmap" ? "active" : ""}`}
                onClick={() => setDisplayFormat("configmap")}
              >
                ConfigMap
              </button>
              <button
                className={`format-button ${displayFormat === "configjson" ? "active" : ""}`}
                onClick={() => setDisplayFormat("configjson")}
              >
                Config.json
              </button>
            </div>
          </div>

          <div className="editor-content">
            <div className="form-container">
              <form>
                {Object.entries(groupedFields).map(([section, fields]) => (
                  <div key={section} className="form-section-group">
                    <h2>{section}</h2>
                    {fields.map((field) => renderFormField(field, field.path.length - 1))}
                  </div>
                ))}
              </form>
            </div>

            <div className="yaml-preview">{renderDisplayContent()}</div>
          </div>
        </>
      )}
    </div>
  )
}

export default FormBasedValueEditor
