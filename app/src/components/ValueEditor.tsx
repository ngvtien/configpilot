// "use client"

// import React from "react"
// import { useEffect, useRef, useState } from "react"
// import yaml from "js-yaml"
// import "./ValueEditor.css"
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

// interface ValueEditorProps {
//     schema?: any
//     initialValues?: any
//     environment?: string
//     product?: string
//     customer?: string
//     version?: string
//     userRole?: string
//     onSave?: (values: any) => void
// }

// const ValueEditor = ({
//     schema,
//     initialValues,
//     environment = "dev",
//     product = "k8s",
//     customer = "ACE",
//     version = "1.2.7",
//     userRole = "operations",
//     onSave,
// }: ValueEditorProps) => {
//     const [yamlContent, setYamlContent] = useState("")
//     const [formData, setFormData] = useState<any>({})
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState<string | null>(null)
//     const monacoEditorRef = useRef<any>(null)
//     const fileInputRef = useRef<HTMLInputElement>(null)
//     const [activeTab, setActiveTab] = useState("configmap")
//     const [isYamlPanelCollapsed, setIsYamlPanelCollapsed] = useState(false)

//     const toggleYamlPanel = () => {
//         setIsYamlPanelCollapsed(!isYamlPanelCollapsed)
//     }

//     useEffect(() => {
//         // Load schema when component mounts
//         loadSchema()
//         // Load values based on environment
//         setIsLoading(true)
//         loadValues(environment)
//     }, [environment])

//     const loadSchema = async () => {
//         try {
//             console.log("Loading schema...")
//             const schemaPath = "/src/mock/schema/values.schema.json"
//             const savedSchema = localStorage.getItem(`schema_${schemaPath}`)
//             if (savedSchema) {
//                 try {
//                     const schemaData = JSON.parse(savedSchema)
//                     console.log("Loaded schema from localStorage:", schemaData)
//                     return
//                 } catch (error) {
//                     console.error("Error parsing saved schema:", error)
//                 }
//             }

//             const res = await fetch(schemaPath)
//             if (!res.ok) {
//                 console.error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
//                 return
//             }

//             const schemaData = await res.json()
//             console.log("Loaded schema from fetch:", schemaData)
//             localStorage.setItem(`schema_${schemaPath}`, JSON.stringify(schemaData))
//         } catch (error) {
//             console.error("Error loading schema:", error)
//         }
//     }

//     const loadValues = async (env: string) => {
//         try {
//             // First try to load from localStorage
//             const savedValues = localStorage.getItem(`value_editor_${env}`)
//             if (savedValues) {
//                 setYamlContent(savedValues)
//                 try {
//                     const parsedValues = yaml.load(savedValues) as any
//                     setFormData(parsedValues || {})
//                 } catch (e) {
//                     console.error("Error parsing YAML:", e)
//                 }
//                 setIsLoading(false)
//                 return
//             }

//             // If no saved values, try to load from file
//             try {
//                 const response = await fetch(`/src/mock/${env}/values.yaml`)
//                 if (response.ok) {
//                     const content = await response.text()
//                     setYamlContent(content)
//                     try {
//                         const parsedValues = yaml.load(content) as any
//                         setFormData(parsedValues || {})
//                     } catch (e) {
//                         console.error("Error parsing YAML:", e)
//                     }
//                     localStorage.setItem(`value_editor_${env}`, content)
//                     setIsLoading(false)
//                     return
//                 }
//             } catch (e) {
//                 console.error("Error loading from file:", e)
//             }

//             // If all else fails, use mock data
//             const mockData = {
//                 replicaCount: 2,
//                 environments: ["dev", "sit"],
//                 image: {
//                     repository: "nginx",
//                     tag: "1.25.0",
//                 },
//                 service: {
//                     type: "ClusterIP",
//                     port: 80,
//                     ports: [
//                         { name: "http", port: 80 },
//                         { name: "https", port: 443 },
//                     ],
//                 },
//                 config: {
//                     featureToggles: {
//                         enableNewUI: true,
//                         enableBetaMode: false,
//                     },
//                     logging: {
//                         level: "information",
//                         output: "console",
//                     },
//                 },
//             }

//             setFormData(mockData)
//             setYamlContent(yaml.dump(mockData))
//             setIsLoading(false)
//         } catch (error) {
//             console.error("Error loading values:", error)
//             setError("Failed to load values. Please try again.")
//             setIsLoading(false)
//         }
//     }

//     const handleYamlChange = (value: string | undefined) => {
//         if (value === undefined) return
//         setYamlContent(value)
//         try {
//             const parsedValues = yaml.load(value) as any
//             setFormData(parsedValues || {})
//             setError(null)
//         } catch (e) {
//             console.error("Error parsing YAML:", e)
//             setError("Invalid YAML syntax")
//         }
//     }

//     const handleInputChange = (path: string[], value: any) => {
//         const newFormData = { ...formData }
//         let current = newFormData

//         // Navigate to the correct location in the object
//         for (let i = 0; i < path.length - 1; i++) {
//             if (current[path[i]] === undefined) {
//                 current[path[i]] = {}
//             }
//             current = current[path[i]]
//         }

//         // Update the value
//         current[path[path.length - 1]] = value

//         // Update state
//         setFormData(newFormData)

//         // Generate YAML from the updated form data
//         const newYamlContent = yaml.dump(newFormData)
//         setYamlContent(newYamlContent)

//         // Save to localStorage
//         localStorage.setItem(`value_editor_${environment}`, newYamlContent)
//     }

//     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0]
//         if (!file) return

//         const reader = new FileReader()
//         reader.onload = (event) => {
//             const content = event.target?.result as string
//             setYamlContent(content)
//             try {
//                 const parsedValues = yaml.load(content) as any
//                 setFormData(parsedValues || {})
//             } catch (e) {
//                 console.error("Error parsing YAML:", e)
//             }
//         }
//         reader.readAsText(file)
//     }

//     const triggerFileInput = () => {
//         fileInputRef.current?.click()
//     }

//     const addArrayItem = (path: string[], defaultValue: any) => {
//         const newFormData = { ...formData }
//         let current = newFormData

//         // Navigate to the array
//         for (let i = 0; i < path.length; i++) {
//             if (current[path[i]] === undefined) {
//                 current[path[i]] = i === path.length - 1 ? [] : {}
//             }
//             current = current[path[i]]
//         }

//         // Add new item
//         if (Array.isArray(current)) {
//             current.push(defaultValue)
//         }

//         // Update state
//         setFormData(newFormData)

//         // Generate YAML and update
//         const newYamlContent = yaml.dump(newFormData)
//         setYamlContent(newYamlContent)
//         localStorage.setItem(`value_editor_${environment}`, newYamlContent)
//     }

//     const removeArrayItem = (path: string[], index: number) => {
//         const newFormData = { ...formData }
//         let current = newFormData

//         // Navigate to the array
//         for (let i = 0; i < path.length; i++) {
//             if (current[path[i]] === undefined) return
//             current = current[path[i]]
//         }

//         // Remove item
//         if (Array.isArray(current)) {
//             current.splice(index, 1)
//         }

//         // Update state
//         setFormData(newFormData)

//         // Generate YAML and update
//         const newYamlContent = yaml.dump(newFormData)
//         setYamlContent(newYamlContent)
//         localStorage.setItem(`value_editor_${environment}`, newYamlContent)
//     }

//     const generateConfigMap = () => {
//         try {
//             const values = formData || {}
//             const configMap = `apiVersion: v1
// kind: ConfigMap
// metadata:
//   name: my-config
// data:
// ${Object.entries(values)
//                     .map(([key, value]) => {
//                         const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
//                         return `  ${key}: ${JSON.stringify(stringValue)}`
//                     })
//                     .join("\n")}`
//             return configMap
//         } catch (error) {
//             console.error("Error generating ConfigMap:", error)
//             return "Error generating ConfigMap"
//         }
//     }

//     const generateConfigJson = () => {
//         try {
//             return JSON.stringify(formData, null, 2)
//         } catch (error) {
//             console.error("Error generating config.json:", error)
//             return "Error generating config.json"
//         }
//     }

//     const copyToClipboard = (text: string) => {
//         navigator.clipboard.writeText(text)
//         const toast = document.createElement("div")
//         toast.className = "copy-notification"
//         toast.textContent = "Copied to clipboard!"
//         toast.style.position = "fixed"
//         toast.style.top = "20px"
//         toast.style.right = "20px"
//         toast.style.backgroundColor = "#4CAF50"
//         toast.style.color = "white"
//         toast.style.padding = "10px 20px"
//         toast.style.borderRadius = "4px"
//         toast.style.zIndex = "1000"
//         document.body.appendChild(toast)
//         setTimeout(() => document.body.removeChild(toast), 2000)
//     }

//     const copyYamlContent = () => {
//         copyToClipboard(yamlContent)
//     }

//     const downloadYaml = () => {
//         const blob = new Blob([yamlContent], { type: "text/yaml" })
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `values-${environment}.yaml`
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
//     }

//     const saveValues = () => {
//         try {
//             localStorage.setItem(`value_editor_${environment}`, yamlContent)
//             if (onSave) {
//                 onSave(formData)
//             }
//             alert("Values saved successfully!")
//         } catch (error) {
//             console.error("Error saving values:", error)
//             alert("Failed to save values. Please try again.")
//         }
//     }

//     if (isLoading) {
//         return <div className="loading-indicator">Loading values...</div>
//     }

//     return (
//         <div className="value-editor">
//             {/* Context bar */}
//             <div className="context-bar">
//                 <div className="context-item">
//                     <span className="context-label">Environment:</span>
//                     <span className="context-value">{environment}</span>
//                 </div>
//                 <div className="context-item">
//                     <span className="context-label">Product:</span>
//                     <span className="context-value">{product}</span>
//                 </div>
//                 <div className="context-item">
//                     <span className="context-label">Customer:</span>
//                     <span className="context-value">{customer}</span>
//                 </div>
//                 <div className="context-item">
//                     <span className="context-label">Version:</span>
//                     <span className="context-value">{version}</span>
//                 </div>
//                 <div className="context-actions">
//                     <button className="context-button">Edit Context</button>
//                 </div>
//             </div>

//             {/* Title */}
//             <div className="editor-title-container">
//                 <h2 className="editor-title">Helm Values Editor</h2>

//                 <div className="editor-actions">
//                     <button className="editor-action-button" onClick={triggerFileInput}>
//                         Load File
//                     </button>
//                     <button className="editor-action-button" onClick={downloadYaml}>
//                         Download YAML
//                     </button>
//                     <button className="editor-action-button" onClick={saveValues}>
//                         Save Values
//                     </button>
//                 </div>

//             </div>

//             {error && <div className="error-message">{error}</div>}

//             <div className="main-layout">
//                 {/* Form container */}
//                 <div className="form-container">
//                     <div className="form-sections">
//                         {/* Replicas Section */}
//                         <div className="form-section">
//                             <div className="form-section-title">Replicas</div>
//                             <div className="form-row">
//                                 <input
//                                     type="number"
//                                     value={formData.replicaCount || 1}
//                                     onChange={(e) => handleInputChange(["replicaCount"], Number.parseInt(e.target.value))}
//                                     className="form-input"
//                                 />
//                             </div>
//                         </div>

//                         {/* Environments Section */}
//                         <div className="form-section">
//                             <div className="form-section-title">Environments</div>
//                             {Array.isArray(formData.environments) &&
//                                 formData.environments.map((env: string, index: number) => (
//                                     <div className="form-row" key={index}>
//                                         <div className="form-field-label">name</div>
//                                         <div className="form-field-input">
//                                             <input
//                                                 type="text"
//                                                 value={env}
//                                                 onChange={(e) => {
//                                                     const newEnvironments = [...formData.environments]
//                                                     newEnvironments[index] = e.target.value
//                                                     handleInputChange(["environments"], newEnvironments)
//                                                 }}
//                                                 className="form-input"
//                                             />
//                                         </div>
//                                         <button className="delete-button" onClick={() => removeArrayItem(["environments"], index)}>
//                                             ×
//                                         </button>
//                                     </div>
//                                 ))}
//                             <div className="form-row">
//                                 <button className="add-button" onClick={() => addArrayItem(["environments"], "")}>
//                                     + Add Item
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Image Section */}
//                         <div className="form-section">
//                             <div className="form-section-title">Image</div>
//                             <div className="form-row">
//                                 <div className="form-field-label">repository</div>
//                                 <div className="form-field-input">
//                                     <input
//                                         type="text"
//                                         value={formData.image?.repository || "nginx"}
//                                         onChange={(e) => handleInputChange(["image", "repository"], e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="form-row">
//                                 <div className="form-field-label">tag</div>
//                                 <div className="form-field-input">
//                                     <input
//                                         type="text"
//                                         value={formData.image?.tag || "1.25.0"}
//                                         onChange={(e) => handleInputChange(["image", "tag"], e.target.value)}
//                                         className="form-input"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Service Section */}
//                         <div className="form-section">
//                             <div className="form-section-title">Service</div>
//                             <div className="form-row">
//                                 <div className="form-field-label">type</div>
//                                 <div className="form-field-input">
//                                     <select
//                                         value={formData.service?.type || "ClusterIP"}
//                                         onChange={(e) => handleInputChange(["service", "type"], e.target.value)}
//                                         className="form-input"
//                                     >
//                                         <option value="ClusterIP">ClusterIP</option>
//                                         <option value="NodePort">NodePort</option>
//                                         <option value="LoadBalancer">LoadBalancer</option>
//                                     </select>
//                                 </div>
//                             </div>
//                             <div className="form-row">
//                                 <div className="form-field-label">port</div>
//                                 <div className="form-field-input">
//                                     <input
//                                         type="number"
//                                         value={formData.service?.port || 80}
//                                         onChange={(e) => handleInputChange(["service", "port"], Number.parseInt(e.target.value))}
//                                         className="form-input"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Ports Array */}
//                             <div className="form-row">
//                                 <div className="form-field-label">ports</div>
//                             </div>
//                             {Array.isArray(formData.service?.ports) &&
//                                 formData.service.ports.map((port: any, index: number) => (
//                                     <div className="form-nested-section" key={index}>
//                                         <div className="form-row">
//                                             <div className="form-field-label">name</div>
//                                             <div className="form-field-input">
//                                                 <input
//                                                     type="text"
//                                                     value={port.name || ""}
//                                                     onChange={(e) => handleInputChange(["service", "ports", index, "name"], e.target.value)}
//                                                     className="form-input"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <div className="form-row">
//                                             <div className="form-field-label">port</div>
//                                             <div className="form-field-input">
//                                                 <input
//                                                     type="number"
//                                                     value={port.port || 0}
//                                                     onChange={(e) =>
//                                                         handleInputChange(["service", "ports", index, "port"], Number.parseInt(e.target.value))
//                                                     }
//                                                     className="form-input"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <button
//                                             className="delete-button nested-delete"
//                                             onClick={() => removeArrayItem(["service", "ports"], index)}
//                                         >
//                                             ×
//                                         </button>
//                                     </div>
//                                 ))}
//                             <div className="form-row">
//                                 <button
//                                     className="add-button"
//                                     onClick={() => addArrayItem(["service", "ports"], { name: "", port: 80 })}
//                                 >
//                                     + Add Item
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Config Section */}
//                         <div className="form-section">
//                             <div className="form-section-title">Config</div>

//                             {/* Feature Toggles */}
//                             <div className="form-nested-section">
//                                 <div className="form-subsection-title">featureToggles</div>
//                                 <div className="form-row">
//                                     <div className="form-field-label">enableNewUI</div>
//                                     <div className="form-field-input">
//                                         <input
//                                             type="checkbox"
//                                             checked={formData.config?.featureToggles?.enableNewUI || false}
//                                             onChange={(e) => handleInputChange(["config", "featureToggles", "enableNewUI"], e.target.checked)}
//                                             className="form-checkbox"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="form-row">
//                                     <div className="form-field-label">enableBetaMode</div>
//                                     <div className="form-field-input">
//                                         <input
//                                             type="checkbox"
//                                             checked={formData.config?.featureToggles?.enableBetaMode || false}
//                                             onChange={(e) =>
//                                                 handleInputChange(["config", "featureToggles", "enableBetaMode"], e.target.checked)
//                                             }
//                                             className="form-checkbox"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Logging */}
//                             <div className="form-nested-section">
//                                 <div className="form-subsection-title">logging</div>
//                                 <div className="form-row">
//                                     <div className="form-field-label">level</div>
//                                     <div className="form-field-input">
//                                         <select
//                                             value={formData.config?.logging?.level || "information"}
//                                             onChange={(e) => handleInputChange(["config", "logging", "level"], e.target.value)}
//                                             className="form-input"
//                                         >
//                                             <option value="debug">debug</option>
//                                             <option value="information">information</option>
//                                             <option value="warning">warning</option>
//                                             <option value="error">error</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div className="form-row">
//                                     <div className="form-field-label">output</div>
//                                     <div className="form-field-input">
//                                         <select
//                                             value={formData.config?.logging?.output || "console"}
//                                             onChange={(e) => handleInputChange(["config", "logging", "output"], e.target.value)}
//                                             className="form-input"
//                                         >
//                                             <option value="console">console</option>
//                                             <option value="file">file</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* YAML Editor */}
//                     <div className={`yaml-panel ${isYamlPanelCollapsed ? "collapsed" : ""}`}>
//                         <div className="yaml-header">
//                             <div className="yaml-actions">
//                                 <button className="yaml-action-button" onClick={copyYamlContent}>
//                                     Copy
//                                 </button>
//                                 <button className="yaml-action-button" onClick={toggleYamlPanel}>
//                                     {isYamlPanelCollapsed ? "Expand" : "Collapse"}
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="yaml-content">
//                             <SyntaxHighlighter
//                                 language="yaml"
//                                 style={tomorrow}
//                                 customStyle={{
//                                     margin: 0,
//                                     height: "100%",
//                                     borderRadius: 0,
//                                     fontSize: "14px",
//                                     backgroundColor: "#1e1e1e",
//                                 }}
//                                 showLineNumbers={true}
//                             >
//                                 {yamlContent}
//                             </SyntaxHighlighter>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right panel with tabs */}
//                 <div className="right-panel">
//                     <div className="tab-header">
//                         <button
//                             className={`tab-button ${activeTab === "configmap" ? "active" : ""}`}
//                             onClick={() => setActiveTab("configmap")}
//                         >
//                             ConfigMap
//                         </button>
//                         <button
//                             className={`tab-button ${activeTab === "config.json" ? "active" : ""}`}
//                             onClick={() => setActiveTab("config.json")}
//                         >
//                             config.json
//                         </button>
//                     </div>
//                     <div className="tab-content">
//                         {activeTab === "configmap" ? (
//                             <SyntaxHighlighter
//                                 language="yaml"
//                                 style={tomorrow}
//                                 customStyle={{
//                                     margin: 0,
//                                     height: "100%",
//                                     borderRadius: 0,
//                                     fontSize: "14px",
//                                     backgroundColor: "#1e1e1e",
//                                 }}
//                                 showLineNumbers={true}
//                             >
//                                 {generateConfigMap()}
//                             </SyntaxHighlighter>
//                         ) : (
//                             <SyntaxHighlighter
//                                 language="json"
//                                 style={tomorrow}
//                                 customStyle={{
//                                     margin: 0,
//                                     height: "100%",
//                                     borderRadius: 0,
//                                     fontSize: "14px",
//                                     backgroundColor: "#1e1e1e",
//                                 }}
//                                 showLineNumbers={true}
//                             >
//                                 {generateConfigJson()}
//                             </SyntaxHighlighter>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Hidden file input */}
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: "none" }}
//                 accept=".yaml,.yml"
//                 onChange={handleFileUpload}
//             />
//         </div>
//     )
// }

// export default ValueEditor

"use client"

import React from "react"
import { useRef, useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import yaml from "js-yaml"
import Editor from "@monaco-editor/react"
import "./ValueEditor.css"

interface ValueEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  environment?: string
  schemaPath?: string
}

// interface ValueEditorProps {
//     schema?: any
//     initialValues?: any
//     environment?: string
//     product?: string
//     customer?: string
//     version?: string
//     userRole?: string
//     onSave?: (values: any) => void
// }

const ValueEditor: React.FC<ValueEditorProps> = ({
  initialValue = "",
  onChange,
  environment = "dev",
  schemaPath = "/src/mock/schema/values.schema.json",
}) => {
  const [yamlContent, setYamlContent] = useState(initialValue)
  const [formData, setFormData] = useState<any>({})
  const [displayFormat, setDisplayFormat] = useState<"configmap" | "configjson">("configjson")
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showYamlEditor, setShowYamlEditor] = useState(true)
  const [editorHeight, setEditorHeight] = useState("300px")
  const monacoEditorRef = useRef<any>(null)
  const [schema, setSchema] = useState<any>(null)

  // Load schema when component mounts
  useEffect(() => {
    loadSchema()
  }, [])

  // Load schema from file
  const loadSchema = async () => {
    try {
      const savedSchema = localStorage.getItem(`schema_${schemaPath}`)
      if (savedSchema) {
        try {
          const schemaData = JSON.parse(savedSchema)
          // Force a new object reference to ensure React detects the change
          setSchema({ ...schemaData })

          // Show a notification that schema was refreshed
          const toast = document.createElement("div")
          toast.className = "copy-notification"
          toast.textContent = "Schema refreshed!"
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

          return
        } catch (error) {
          console.error("Error parsing saved schema:", error)
        }
      }

      const res = await fetch(schemaPath)
      if (!res.ok) {
        console.error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
        return
      }

      const schemaData = await res.json()
      setSchema({ ...schemaData })
      localStorage.setItem(`schema_${schemaPath}`, JSON.stringify(schemaData))
    } catch (error) {
      console.error("Error loading schema:", error)
    }
  }

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
        try {
          const parsedValues = yaml.load(savedValues) as any
          setFormData(parsedValues || {})
        } catch (e) {
          console.error("Error parsing YAML:", e)
        }
        setIsLoading(false)
        return
      }

      // If no saved values, try to load from file
      try {
        const response = await fetch(`/src/mock/${env}/values.yaml`)
        if (response.ok) {
          const content = await response.text()
          setYamlContent(content)
          try {
            const parsedValues = yaml.load(content) as any
            setFormData(parsedValues || {})
          } catch (e) {
            console.error("Error parsing YAML:", e)
          }
          localStorage.setItem(`value_editor_${env}`, content)
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error("Error loading from file:", e)
      }

      // If all else fails, use initialValue
      setYamlContent(initialValue)
      try {
        const parsedValues = yaml.load(initialValue) as any
        setFormData(parsedValues || {})
      } catch (e) {
        console.error("Error parsing YAML:", e)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading values:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (onChange) {
      onChange(yamlContent)
    }
  }, [yamlContent, onChange])

  const handleYamlChange = (value: string | undefined) => {
    if (value === undefined) return
    setYamlContent(value)
    try {
      const parsedValues = yaml.load(value) as any
      setFormData(parsedValues || {})
    } catch (e) {
      console.error("Error parsing YAML:", e)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setYamlContent(content)
      try {
        const parsedValues = yaml.load(content) as any
        setFormData(parsedValues || {})
      } catch (e) {
        console.error("Error parsing YAML:", e)
      }
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Get the title for a property from the schema if available
  const getPropertyTitle = (path: string[], key: string): string => {
    if (!schema) return key

    try {
      // Navigate to the correct location in the schema
      let current = schema

      // For root level properties
      if (path.length === 0) {
        if (current.properties && current.properties[key] && current.properties[key].title) {
          return current.properties[key].title
        }
        return key
      }

      // For nested properties
      for (let i = 0; i < path.length; i++) {
        if (!current.properties || !current.properties[path[i]]) {
          return key
        }
        current = current.properties[path[i]]
      }

      // Check if the property has a title
      if (current.properties && current.properties[key] && current.properties[key].title) {
        return current.properties[key].title
      }

      return key
    } catch (error) {
      console.error("Error getting property title:", error)
      return key
    }
  }

  // Update form data and regenerate YAML
  const updateFormData = (path: string[], value: any) => {
    const newFormData = JSON.parse(JSON.stringify(formData))
    let current = newFormData

    // Navigate to the correct location in the object
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        // If the path doesn't exist, create it
        if (i === path.length - 2 && Array.isArray(value)) {
          current[path[i]] = []
        } else {
          current[path[i]] = {}
        }
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

  // Add a new item to an array
  const addArrayItem = (path: string[], arrayType: string, isObject = false) => {
    const newFormData = JSON.parse(JSON.stringify(formData))
    let current = newFormData

    // Navigate to the array
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] === undefined) {
        current[path[i]] = i === path.length - 1 ? [] : {}
      }
      current = current[path[i]]
    }

    // Add a new item based on type
    if (isObject) {
      // For object arrays, add an empty object with the expected structure
      if (path[path.length - 1] === "ports") {
        current.push({ name: "", port: 0 })
      } else {
        current.push({})
      }
    } else if (arrayType === "number") {
      current.push(0)
    } else {
      current.push("")
    }

    // Update state and YAML
    setFormData(newFormData)
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)

    if (onChange) {
      onChange(newYamlContent)
    }

    localStorage.setItem(`value_editor_${environment}`, newYamlContent)
  }

  // Remove an item from an array
  const removeArrayItem = (path: string[], index: number) => {
    const newFormData = JSON.parse(JSON.stringify(formData))
    let current = newFormData

    // Navigate to the array
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] === undefined) return
      current = current[path[i]]
    }

    // Remove the item
    if (Array.isArray(current)) {
      current.splice(index, 1)

      // Update state and YAML
      setFormData(newFormData)
      const newYamlContent = yaml.dump(newFormData)
      setYamlContent(newYamlContent)

      if (onChange) {
        onChange(newYamlContent)
      }

      localStorage.setItem(`value_editor_${environment}`, newYamlContent)
    }
  }

  // Update an array item
  const updateArrayItem = (path: string[], index: number, value: any) => {
    const newFormData = JSON.parse(JSON.stringify(formData))
    let current = newFormData

    // Navigate to the array
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] === undefined) return
      current = current[path[i]]
    }

    // Update the item
    if (Array.isArray(current)) {
      current[index] = value

      // Update state and YAML
      setFormData(newFormData)
      const newYamlContent = yaml.dump(newFormData)
      setYamlContent(newYamlContent)

      if (onChange) {
        onChange(newYamlContent)
      }

      localStorage.setItem(`value_editor_${environment}`, newYamlContent)
    }
  }

  // Update a property of an object in an array
  const updateObjectArrayItem = (path: string[], index: number, key: string, value: any) => {
    const newFormData = JSON.parse(JSON.stringify(formData))
    let current = newFormData

    // Navigate to the array
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] === undefined) return
      current = current[path[i]]
    }

    // Update the object property
    if (Array.isArray(current) && current[index]) {
      current[index][key] = value

      // Update state and YAML
      setFormData(newFormData)
      const newYamlContent = yaml.dump(newFormData)
      setYamlContent(newYamlContent)

      if (onChange) {
        onChange(newYamlContent)
      }

      localStorage.setItem(`value_editor_${environment}`, newYamlContent)
    }
  }

  const generateConfigMap = () => {
    try {
      const values = yaml.load(yamlContent) || {}
      const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
 name: my-config
data:
${Object.entries(values)
  .map(([key, value]) => {
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
      const values = yaml.load(yamlContent) || {}
      return JSON.stringify(values, null, 2)
    } catch (error) {
      console.error("Error generating Config.json:", error)
      return "Error generating Config.json"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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

  const copyEditorContent = () => {
    if (monacoEditorRef.current) {
      const editorValue = monacoEditorRef.current.getValue()
      copyToClipboard(editorValue)
    }
  }

  const downloadYaml = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `values-${environment}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderDisplayContent = () => {
    let content = ""
    let language = "yaml"

    switch (displayFormat) {
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

  const toggleYamlEditor = () => {
    setShowYamlEditor(!showYamlEditor)
    if (!showYamlEditor) {
      setEditorHeight("300px")
    }
  }

  const handleEditorResize = () => {
    setEditorHeight(editorHeight === "300px" ? "500px" : "300px")
  }

  const handleEditorDidMount = (editor: any) => {
    monacoEditorRef.current = editor
  }

  // Function to refresh the schema
  const refreshSchema = () => {
    loadSchema()
    // Show a temporary notification
    const toast = document.createElement("div")
    toast.className = "refresh-notification"
    toast.textContent = "Schema refreshed!"
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

  // Render a simple field (string, number, boolean)
  const renderSimpleField = (key: string, path: string[], value: any, type: string) => {
    const displayName = getPropertyTitle(path.slice(0, -1), key)

    return (
      <div key={path.join(".")} className="form-field horizontal">
        <label>{displayName}</label>
        {type === "boolean" ? (
          <input type="checkbox" checked={!!value} onChange={(e) => updateFormData(path, e.target.checked)} />
        ) : type === "number" ? (
          <input type="number" value={value || 0} onChange={(e) => updateFormData(path, Number(e.target.value))} />
        ) : (
          <input type="text" value={value || ""} onChange={(e) => updateFormData(path, e.target.value)} />
        )}
      </div>
    )
  }

  // Render a primitive array (array of strings or numbers)
  const renderPrimitiveArray = (key: string, path: string[], values: any[]) => {
    const displayName = getPropertyTitle(path.slice(0, -1), key)
    const type = values.length > 0 && typeof values[0] === "number" ? "number" : "string"

    return (
      <div key={path.join(".")} className="form-array-field">
        <div className="array-section-label">{displayName}</div>
        <div className="array-items">
          {values.map((item, index) => (
            <div key={`${path.join(".")}-${index}`} className="array-item">
              <div className="form-field horizontal">
                <label>name</label>
                <div className="input-wrapper">
                  {type === "number" ? (
                    <input
                      type="number"
                      value={item || 0}
                      onChange={(e) => updateArrayItem(path, index, Number(e.target.value))}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item || ""}
                      onChange={(e) => updateArrayItem(path, index, e.target.value)}
                    />
                  )}
                  <button
                    className="delete-button"
                    onClick={() => removeArrayItem(path, index)}
                    style={{
                      width: "22px",
                      height: "22px",
                      minWidth: "22px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "3px",
                      marginLeft: "4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="add-item-button" type="button" onClick={() => addArrayItem(path, type)}>
            + Add Item
          </button>
        </div>
      </div>
    )
  }

  // Render an object array (array of objects)
  const renderObjectArray = (key: string, path: string[], values: any[]) => {
    const displayName = getPropertyTitle(path.slice(0, -1), key)

    return (
      <div key={path.join(".")} className="form-array-field">
        <div className="array-section-label">{displayName}</div>
        <div className="array-items">
          {values.map((item, index) => (
            <div key={`${path.join(".")}-${index}`} className="array-item">
              <div className="object-array-item">
                {Object.entries(item).map(([itemKey, itemValue]) => {
                  // For items in an array, we need to construct the path differently
                  // The path is the path to the array + the index + the property key
                  const itemPath = [...path, index.toString(), itemKey]
                  const itemDisplayName = getPropertyTitle([...path, index.toString()], itemKey)

                  return (
                    <div key={`${path.join(".")}-${index}-${itemKey}`} className="form-field horizontal">
                      <label>{itemDisplayName}</label>
                      <div className="input-wrapper">
                        {typeof itemValue === "number" ? (
                          <input
                            type="number"
                            value={itemValue || 0}
                            onChange={(e) => updateObjectArrayItem(path, index, itemKey, Number(e.target.value))}
                          />
                        ) : typeof itemValue === "boolean" ? (
                          <input
                            type="checkbox"
                            checked={!!itemValue}
                            onChange={(e) => updateObjectArrayItem(path, index, itemKey, e.target.checked)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={itemValue || ""}
                            onChange={(e) => updateObjectArrayItem(path, index, itemKey, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
                <button
                  className="delete-button"
                  onClick={() => removeArrayItem(path, index)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "22px",
                    height: "22px",
                    minWidth: "22px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "3px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <button className="add-item-button" type="button" onClick={() => addArrayItem(path, "object", true)}>
            + Add Item
          </button>
        </div>
      </div>
    )
  }

  // Recursively render form fields with proper indentation
  const renderFormFields = (data: any, basePath: string[] = [], level = 0) => {
    if (!data) return null

    return Object.entries(data).map(([key, value]) => {
      const path = [...basePath, key]
      const displayName = getPropertyTitle(basePath, key)

      // Calculate indentation based on nesting level
      const indentStyle = {
        marginLeft: level > 0 ? `${level * 20}px` : "0px",
        borderLeft: level > 0 ? "2px solid #e2e8f0" : "none",
        paddingLeft: level > 0 ? "10px" : "0px",
      }

      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object") {
          return (
            <div key={path.join(".")} className="form-array-field" style={indentStyle}>
              <div className="array-section-label">{displayName}</div>
              <div className="array-items">
                {value.map((item, index) => (
                  <div
                    key={`${path.join(".")}-${index}`}
                    className="array-item"
                    style={{ position: "relative", paddingRight: "30px" }}
                  >
                    <div className="object-array-item">
                      {Object.entries(item).map(([itemKey, itemValue]) => {
                        const itemPath = [...path, index.toString(), itemKey]
                        const itemDisplayName = getPropertyTitle([...path, index.toString()], itemKey)

                        return (
                          <div key={`${path.join(".")}-${index}-${itemKey}`} className="form-field horizontal">
                            <label>{itemDisplayName}</label>
                            <div className="input-wrapper">
                              {typeof itemValue === "number" ? (
                                <input
                                  type="number"
                                  value={itemValue || 0}
                                  onChange={(e) => updateObjectArrayItem(path, index, itemKey, Number(e.target.value))}
                                />
                              ) : typeof itemValue === "boolean" ? (
                                <input
                                  type="checkbox"
                                  checked={!!itemValue}
                                  onChange={(e) => updateObjectArrayItem(path, index, itemKey, e.target.checked)}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={itemValue || ""}
                                  onChange={(e) => updateObjectArrayItem(path, index, itemKey, e.target.value)}
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <button
                        className="delete-button"
                        onClick={() => removeArrayItem(path, index)}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "22px",
                          height: "22px",
                          minWidth: "22px",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "3px",
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <button className="add-item-button" type="button" onClick={() => addArrayItem(path, "object", true)}>
                  + Add Item
                </button>
              </div>
            </div>
          )
        } else {
          return (
            <div key={path.join(".")} className="form-array-field" style={indentStyle}>
              <div className="array-section-label">{displayName}</div>
              <div className="array-items">
                {value.map((item, index) => (
                  <div key={`${path.join(".")}-${index}`} className="array-item">
                    <div className="form-field horizontal">
                      <label>name</label>
                      <div className="input-wrapper">
                        {typeof item === "number" ? (
                          <input
                            type="number"
                            value={item || 0}
                            onChange={(e) => updateArrayItem(path, index, Number(e.target.value))}
                          />
                        ) : (
                          <input
                            type="text"
                            value={item || ""}
                            onChange={(e) => updateArrayItem(path, index, e.target.value)}
                          />
                        )}
                        <button
                          className="delete-button"
                          onClick={() => removeArrayItem(path, index)}
                          style={{
                            width: "22px",
                            height: "22px",
                            minWidth: "22px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px",
                            marginLeft: "4px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="add-item-button"
                  type="button"
                  onClick={() => addArrayItem(path, typeof value[0] === "number" ? "number" : "text")}
                >
                  + Add Item
                </button>
              </div>
            </div>
          )
        }
      } else if (typeof value === "object" && value !== null) {
        return (
          <div key={path.join(".")} className="form-section-group" style={indentStyle}>
            <h3 className="section-title">{displayName}</h3>
            {renderFormFields(value, path, level + 1)}
          </div>
        )
      } else {
        return (
          <div key={path.join(".")} className="form-field horizontal" style={indentStyle}>
            <label>{displayName}</label>
            {typeof value === "boolean" ? (
              <input type="checkbox" checked={!!value} onChange={(e) => updateFormData(path, e.target.checked)} />
            ) : typeof value === "number" ? (
              <input type="number" value={value || 0} onChange={(e) => updateFormData(path, Number(e.target.value))} />
            ) : (
              <input type="text" value={value || ""} onChange={(e) => updateFormData(path, e.target.value)} />
            )}
          </div>
        )
      }
    })
  }

  return (
    <div className="value-editor">
      <div className="value-editor-header">
        <h2
          className="value-editor-title"
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: "#1a202c",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
          }}
        >
          Helm Values Editor
        </h2>
        <div className="value-editor-actions">
          <button className="action-button" onClick={triggerFileInput}>
            Load File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".yaml,.yml"
            onChange={handleFileUpload}
          />
          <button className="action-button" onClick={toggleYamlEditor}>
            {showYamlEditor ? "Hide YAML Editor" : "Show YAML Editor"}
          </button>
          <button className="action-button" onClick={downloadYaml}>
            Download YAML
          </button>
          <button
            className="action-button"
            onClick={() => {
              console.log("Refreshing schema...")
              // Force reload schema from localStorage
              const savedSchema = localStorage.getItem(`schema_${schemaPath}`)
              if (savedSchema) {
                try {
                  const schemaData = JSON.parse(savedSchema)
                  console.log("New schema loaded:", schemaData)
                  // Create a new object to force React to detect the change
                  setSchema(JSON.parse(JSON.stringify(schemaData)))
                  alert("Schema refreshed!")
                } catch (error) {
                  console.error("Error parsing schema:", error)
                  alert("Error refreshing schema")
                }
              } else {
                alert("No schema found in localStorage")
              }
            }}
          >
            Refresh Schema
          </button>
        </div>
      </div>

      <div className="value-editor-content" style={{ display: "flex", gap: "16px", padding: "16px", flex: 1, overflow: "hidden" }}>
        {/* Left side - main content (2/3 width) */}
        <div className="main-content" style={{ flex: "2", minWidth: 0 }}>
          <div className="form-editor-container">
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="form-container">
                <form>{renderFormFields(formData, [], 0)}</form>
              </div>
            )}
          </div>

          {showYamlEditor && (
            <div className="yaml-editor-container" style={{ height: editorHeight }}>
              <div className="yaml-editor-header">
                <h3>YAML Editor</h3>
                <div className="yaml-editor-actions">
                  <button className="editor-action-button" onClick={copyEditorContent}>
                    Copy
                  </button>
                  <button className="editor-action-button" onClick={handleEditorResize}>
                    {editorHeight === "300px" ? "Expand" : "Collapse"}
                  </button>
                </div>
              </div>
              <div className="monaco-editor-wrapper">
                <Editor
                  height="100%"
                  defaultLanguage="yaml"
                  value={yamlContent}
                  onChange={handleYamlChange}
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    tabSize: 2,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right side - tab control (1/3 width) */}
        <div className="value-display-panel"  style={{ flex: "1", minWidth: 0 }}>
          <div className="value-display-tabs">
            <button
              className={`tab-button ${displayFormat === "configjson" ? "active" : ""}`}
              onClick={() => setDisplayFormat("configjson")}
            >
              config.json
            </button>
            <button
              className={`tab-button ${displayFormat === "configmap" ? "active" : ""}`}
              onClick={() => setDisplayFormat("configmap")}
            >
              ConfigMap
            </button>
          </div>
          <div className="value-display">{renderDisplayContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default ValueEditor
