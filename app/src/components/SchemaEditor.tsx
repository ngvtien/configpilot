// "use client"

// import React from "react"
// import { useState, useEffect, useRef, useCallback, useMemo } from "react"
// import "./SchemaEditor.css"
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

// interface SchemaEditorProps {
//   schemaPath?: string
//   onSchemaChange?: (schema: any) => void
// }

// interface PropertyEditorProps {
//   property: any
//   propertyName: string
//   path: string[]
//   onUpdate: (path: string[], updates: any) => void
//   onDelete?: (path: string[]) => void
// }

// const PropertyEditor: React.FC<PropertyEditorProps> = ({ property, propertyName, path, onUpdate, onDelete }) => {
//   // Create local state for each field that's independent of the property prop
//   const [localState, setLocalState] = useState({
//     type: property.type || "string",
//     title: property.title || "",
//     description: property.description || "",
//     defaultValue: property.default !== undefined ? JSON.stringify(property.default) : "",
//   })

//   // Track if the form has been modified
//   const [isModified, setIsModified] = useState(false)

//   // Update local state ONLY when the path changes, not when property changes
//   useEffect(() => {
//     setLocalState({
//       type: property.type || "string",
//       title: property.title || "",
//       description: property.description || "",
//       defaultValue: property.default !== undefined ? JSON.stringify(property.default) : "",
//     })
//     setIsModified(false)
//   }, [path.join("/")])

//   // Generic handler for all form field changes
//   const handleChange = useCallback((field: string, value: string) => {
//     setLocalState((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//     setIsModified(true)
//   }, [])

//   const handleApplyChanges = useCallback(() => {
//     try {
//       // Parse default value based on type
//       let parsedDefault = undefined
//       if (localState.defaultValue) {
//         if (localState.type === "boolean") {
//           parsedDefault = localState.defaultValue === "true"
//         } else if (localState.type === "number" || localState.type === "integer") {
//           parsedDefault = Number(localState.defaultValue)
//         } else if (localState.type === "object" || localState.type === "array") {
//           try {
//             parsedDefault = JSON.parse(localState.defaultValue)
//           } catch (e) {
//             parsedDefault = localState.defaultValue
//           }
//         } else {
//           parsedDefault = localState.defaultValue
//         }
//       }

//       const updates = {
//         ...property,
//         type: localState.type,
//         ...(localState.title ? { title: localState.title } : {}),
//         ...(localState.description ? { description: localState.description } : {}),
//         ...(localState.defaultValue !== "" ? { default: parsedDefault } : {}),
//       }

//       onUpdate(path, updates)
//       setIsModified(false)
//     } catch (err) {
//       console.error("Error applying changes:", err)
//       alert("Error applying changes. Check console for details.")
//     }
//   }, [localState, property, path, onUpdate])

//   const handleDelete = useCallback(() => {
//     if (onDelete && window.confirm(`Are you sure you want to delete ${propertyName}?`)) {
//       onDelete(path)
//     }
//   }, [onDelete, propertyName, path])

//   return (
//     <div className="property-editor">
//       <h3>Property Editor</h3>

//       <div className="property-field">
//         <label>Property Name</label>
//         <input type="text" value={propertyName} disabled />
//       </div>

//       <div className="property-field">
//         <label>Type</label>
//         <select value={localState.type} onChange={(e) => handleChange("type", e.target.value)}>
//           <option value="string">string</option>
//           <option value="number">number</option>
//           <option value="integer">integer</option>
//           <option value="boolean">boolean</option>
//           <option value="object">object</option>
//           <option value="array">array</option>
//         </select>
//       </div>

//       <div className="property-field">
//         <label>Title</label>
//         <input
//           type="text"
//           value={localState.title}
//           onChange={(e) => handleChange("title", e.target.value)}
//           placeholder="Display title for this property"
//         />
//       </div>

//       <div className="property-field">
//         <label>Description</label>
//         <textarea
//           value={localState.description}
//           onChange={(e) => handleChange("description", e.target.value)}
//           placeholder="Description of this property"
//         />
//       </div>

//       <div className="property-field">
//         <label>Default Value</label>
//         {localState.type === "boolean" ? (
//           <select value={localState.defaultValue} onChange={(e) => handleChange("defaultValue", e.target.value)}>
//             <option value="">No default</option>
//             <option value="true">true</option>
//             <option value="false">false</option>
//           </select>
//         ) : (
//           <input
//             type="text"
//             value={localState.defaultValue}
//             onChange={(e) => handleChange("defaultValue", e.target.value)}
//             placeholder={`Default value (${localState.type})`}
//           />
//         )}
//       </div>

//       <div className="property-actions">
//         <button
//           className={`property-action-btn update-btn ${isModified ? "modified" : ""}`}
//           onClick={handleApplyChanges}
//           disabled={!isModified}
//         >
//           Apply Changes
//         </button>
//         {onDelete && (
//           <button className="property-action-btn delete-btn" onClick={handleDelete}>
//             Delete Property
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// // Memoize the PropertyTreeItem to prevent unnecessary re-renders
// const PropertyTreeItem = React.memo(({ name, property, path, selectedPath, onSelect }: PropertyTreeItemProps) => {
//   const isSelected = path.length === selectedPath.length && path.every((p, i) => p === selectedPath[i])
//   const hasChildren = property.type === "object" && property.properties && Object.keys(property.properties).length > 0

//   const handleSelect = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation() // Prevent event bubbling
//       onSelect(path)
//     },
//     [path, onSelect],
//   )

//   // Memoize the children to prevent unnecessary re-renders
//   const children = useMemo(() => {
//     if (!hasChildren) return null
//     return Object.entries(property.properties).map(([childName, childProperty]) => (
//       <PropertyTreeItem
//         key={`${childName}`}
//         name={childName}
//         property={childProperty as any}
//         path={[...path, "properties", childName]}
//         selectedPath={selectedPath}
//         onSelect={onSelect}
//       />
//     ))
//   }, [hasChildren, property.properties, path, selectedPath, onSelect])

//   return (
//     <div className={`property-item ${path.length === 0 ? "root-item" : ""}`}>
//       <div
//         className={`property-name ${isSelected ? "selected" : ""}`}
//         onClick={handleSelect}
//         title={property.description}
//       >
//         <span>{name}</span>
//         {property.type && <span className={`property-type ${property.type}`}>{property.type}</span>}
//         {property.title && <span className="property-title">{property.title}</span>}
//       </div>

//       {hasChildren && <div className="property-children">{children}</div>}
//     </div>
//   )
// })

// PropertyTreeItem.displayName = "PropertyTreeItem"

// interface PropertyTreeItemProps {
//   name: string
//   property: any
//   path: string[]
//   selectedPath: string[]
//   onSelect: (path: string[]) => void
// }

// const SchemaEditor: React.FC<SchemaEditorProps> = ({ schemaPath = "/src/mock", onSchemaChange }) => {
//   // Use a single source of truth for the schema
//   const [schemaState, setSchemaState] = useState<{
//     text: string
//     parsed: any
//   }>({
//     text: "",
//     parsed: null,
//   })

//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [selectedPath, setSelectedPath] = useState<string[]>([])
//   const [panelWidths, setPanelWidths] = useState<[number, number, number]>([33.33, 33.33, 33.33])
//   const containerRef = useRef<HTMLDivElement>(null)
//   const startXRef = useRef<number>(0)
//   const startWidthsRef = useRef<[number, number, number]>([33.33, 33.33, 33.33])
//   const activeResizerRef = useRef<0 | 1 | null>(null)

//   // Add state for direct JSON editing
//   const [isEditingJson, setIsEditingJson] = useState(false)
//   const [jsonEditorValue, setJsonEditorValue] = useState("")
//   const [jsonEditorError, setJsonEditorError] = useState<string | null>(null)

//   // Handle tree item selection
//   const handleSelectPath = useCallback((path: string[]) => {
//     setSelectedPath([...path]) // Create a new array to ensure state update
//   }, [])

//   // Update schema state in a single function to keep everything in sync
//   const updateSchema = useCallback(
//     (newSchema: any) => {
//       const schemaText = JSON.stringify(newSchema, null, 2)

//       setSchemaState({
//         text: schemaText,
//         parsed: newSchema,
//       })

//       setJsonEditorValue(schemaText)

//       // Save to localStorage
//       try {
//         localStorage.setItem(`schema_${schemaPath}`, JSON.stringify(newSchema))
//       } catch (err) {
//         console.error("Error saving schema to localStorage:", err)
//       }

//       // Notify parent component if callback provided
//       if (onSchemaChange) {
//         onSchemaChange(newSchema)
//       }
//     },
//     [schemaPath, onSchemaChange],
//   )

//   // Load schema
//   useEffect(() => {
//     const loadSchema = async () => {
//       try {
//         setLoading(true)
//         // First check if we have a saved schema in localStorage
//         const savedSchema = localStorage.getItem(`schema_${schemaPath}`)

//         if (savedSchema) {
//           try {
//             // Use the saved schema if available
//             const schemaData = JSON.parse(savedSchema)
//             updateSchema(schemaData)
//             setLoading(false)
//             return
//           } catch (parseError) {
//             console.error("Error parsing saved schema:", parseError)
//             // If there's an error parsing the saved schema, continue to fetch from the server
//           }
//         }

//         // Fetch from server if no saved schema or error parsing
//         const res = await fetch(`${schemaPath}/schema/values.schema.json`)
//         if (!res.ok) {
//           throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
//         }

//         const schemaData = await res.json()
//         updateSchema(schemaData)
//       } catch (error) {
//         console.error("Error loading schema:", error)
//         setError("Failed to load schema. Using default schema.")

//         // Create a basic schema if all else fails
//         const basicSchema = {
//           type: "object",
//           properties: {
//             replicaCount: {
//               type: "integer",
//               title: "Replicas",
//               default: 1,
//             },
//             image: {
//               type: "object",
//               properties: {
//                 repository: {
//                   type: "string",
//                   default: "nginx",
//                 },
//                 tag: {
//                   type: "string",
//                   default: "latest",
//                 },
//               },
//             },
//             service: {
//               type: "object",
//               properties: {
//                 type: {
//                   type: "string",
//                   enum: ["ClusterIP", "NodePort", "LoadBalancer"],
//                 },
//                 port: {
//                   type: "integer",
//                   default: 80,
//                 },
//               },
//             },
//           },
//         }

//         updateSchema(basicSchema)
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadSchema()
//   }, [schemaPath, updateSchema])

//   // Set up resizer functionality
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (activeResizerRef.current === null || !containerRef.current) return

//       const containerWidth = containerRef.current.clientWidth
//       const dx = e.clientX - startXRef.current
//       const dxPercent = (dx / containerWidth) * 100

//       const newWidths = [...startWidthsRef.current] as [number, number, number]

//       if (activeResizerRef.current === 0) {
//         // First resizer (between panel 1 and 2)
//         newWidths[0] = Math.max(15, Math.min(70, startWidthsRef.current[0] + dxPercent))
//         newWidths[1] = Math.max(15, Math.min(70, startWidthsRef.current[1] - dxPercent))
//         newWidths[2] = startWidthsRef.current[2]
//       } else if (activeResizerRef.current === 1) {
//         // Second resizer (between panel 2 and 3)
//         newWidths[0] = startWidthsRef.current[0]
//         newWidths[1] = Math.max(15, Math.min(70, startWidthsRef.current[1] + dxPercent))
//         newWidths[2] = Math.max(15, Math.min(70, startWidthsRef.current[2] - dxPercent))
//       }

//       // Ensure the sum is 100%
//       const sum = newWidths.reduce((a, b) => a + b, 0)
//       if (Math.abs(sum - 100) > 0.1) {
//         const factor = 100 / sum
//         newWidths[0] *= factor
//         newWidths[1] *= factor
//         newWidths[2] *= factor
//       }

//       setPanelWidths(newWidths)
//     }

//     const handleMouseUp = () => {
//       activeResizerRef.current = null
//       document.body.style.cursor = "default"
//       document.body.style.userSelect = "auto"
//     }

//     document.addEventListener("mousemove", handleMouseMove)
//     document.addEventListener("mouseup", handleMouseUp)

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove)
//       document.removeEventListener("mouseup", handleMouseUp)
//     }
//   }, [])

//   const startResize = useCallback(
//     (index: 0 | 1, e: React.MouseEvent) => {
//       e.preventDefault()
//       startXRef.current = e.clientX
//       startWidthsRef.current = [...panelWidths] as [number, number, number]
//       activeResizerRef.current = index
//       document.body.style.cursor = "col-resize"
//       document.body.style.userSelect = "none"
//     },
//     [panelWidths],
//   )

//   const getPropertyAtPath = useCallback(
//     (path: string[]) => {
//       if (!schemaState.parsed || path.length === 0) return schemaState.parsed

//       let current = schemaState.parsed
//       let i = 0

//       while (i < path.length) {
//         if (current === undefined) {
//           return undefined
//         }

//         // Handle properties path segment
//         if (path[i] === "properties" && current.properties) {
//           current = current.properties
//           i++
//           continue
//         }

//         if (current[path[i]] === undefined) {
//           return undefined
//         }

//         current = current[path[i]]
//         i++
//       }

//       return current
//     },
//     [schemaState.parsed],
//   )

//   const getPropertyNameFromPath = useCallback((path: string[]) => {
//     if (path.length === 0) return "Root"
//     return path[path.length - 1]
//   }, [])

//   // Memoize the selected property to prevent unnecessary calculations
//   const selectedProperty = useMemo(() => getPropertyAtPath(selectedPath), [getPropertyAtPath, selectedPath])

//   const updateProperty = useCallback(
//     (path: string[], updates: any) => {
//       try {
//         // Create a deep copy of the schema to avoid reference issues
//         const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

//         if (path.length === 0) {
//           // Updating root schema
//           const updatedSchema = { ...schemaObj, ...updates }
//           updateSchema(updatedSchema)
//           return
//         }

//         let current = schemaObj
//         let i = 0

//         // Navigate to the parent of the property we want to update
//         while (i < path.length - 1) {
//           if (current[path[i]] === undefined) {
//             current[path[i]] = {}
//           }
//           current = current[path[i]]
//           i++
//         }

//         // Update the property
//         current[path[i]] = updates

//         // Update the schema
//         updateSchema(schemaObj)
//       } catch (err) {
//         console.error("Error updating property:", err)
//         setError("Failed to update property: " + (err as Error).message)
//       }
//     },
//     [schemaState.parsed, updateSchema],
//   )

//   const deleteProperty = useCallback(
//     (path: string[]) => {
//       try {
//         if (path.length === 0) {
//           console.error("Cannot delete root schema")
//           return
//         }

//         // Create a deep copy of the schema to avoid reference issues
//         const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

//         let current = schemaObj
//         let i = 0

//         // Navigate to the parent of the property we want to delete
//         while (i < path.length - 1) {
//           if (current[path[i]] === undefined) {
//             return // Property not found
//           }
//           current = current[path[i]]
//           i++
//         }

//         // Delete the property
//         delete current[path[i]]

//         // Update the schema
//         updateSchema(schemaObj)

//         // Clear selection after deletion
//         setSelectedPath([])
//       } catch (err) {
//         console.error("Error deleting property:", err)
//         setError("Failed to delete property: " + (err as Error).message)
//       }
//     },
//     [schemaState.parsed, updateSchema],
//   )

//   const addProperty = useCallback(() => {
//     try {
//       // Create a deep copy of the schema to avoid reference issues
//       const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

//       if (!schemaObj.properties) {
//         schemaObj.properties = {}
//       }

//       // Add a new property with a unique name
//       const propertyName = `newProperty${Object.keys(schemaObj.properties).length + 1}`
//       schemaObj.properties[propertyName] = {
//         type: "string",
//         title: "New Property",
//         description: "Description for the new property",
//       }

//       // Update the schema
//       updateSchema(schemaObj)
//     } catch (err) {
//       console.error("Error adding property:", err)
//       setError("Failed to add property: Invalid JSON")
//     }
//   }, [schemaState.parsed, updateSchema])

//   const addChildProperty = useCallback(() => {
//     try {
//       if (!selectedPath.length) {
//         // If no property is selected, add to root
//         addProperty()
//         return
//       }

//       // Create a deep copy of the schema to avoid reference issues
//       const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

//       let current = schemaObj
//       let i = 0

//       // Navigate to the selected property
//       while (i < selectedPath.length) {
//         if (current[selectedPath[i]] === undefined) {
//           return // Property not found
//         }
//         current = current[selectedPath[i]]
//         i++
//       }

//       // Ensure the selected property is an object with properties
//       if (current.type !== "object") {
//         current.type = "object"
//       }

//       if (!current.properties) {
//         current.properties = {}
//       }

//       // Add a new property with a unique name
//       const propertyName = `newProperty${Object.keys(current.properties).length + 1}`
//       current.properties[propertyName] = {
//         type: "string",
//         title: "New Property",
//         description: "Description for the new property",
//       }

//       // Update the schema
//       updateSchema(schemaObj)

//       // Update selection to the new property
//       setSelectedPath([...selectedPath, "properties", propertyName])
//     } catch (err) {
//       console.error("Error adding child property:", err)
//       setError("Failed to add child property: " + (err as Error).message)
//     }
//   }, [selectedPath, schemaState.parsed, updateSchema, addProperty])

//   // Handle JSON editor changes
//   const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setJsonEditorValue(e.target.value)
//     setJsonEditorError(null)
//   }, [])

//   // Apply JSON changes
//   const applyJsonChanges = useCallback(() => {
//     try {
//       const parsedJson = JSON.parse(jsonEditorValue)
//       updateSchema(parsedJson)
//       setIsEditingJson(false)
//       setJsonEditorError(null)
//     } catch (err) {
//       console.error("Error parsing JSON:", err)
//       setJsonEditorError("Invalid JSON: " + (err as Error).message)
//     }
//   }, [jsonEditorValue, updateSchema])

//   // Toggle JSON editing mode
//   const toggleJsonEditing = useCallback(() => {
//     if (isEditingJson) {
//       // If we're exiting edit mode, try to apply changes
//       applyJsonChanges()
//     } else {
//       // If we're entering edit mode, just set the flag
//       setIsEditingJson(true)
//     }
//   }, [isEditingJson, applyJsonChanges])

//   // Memoize the tree component to prevent unnecessary re-renders
//   const treeComponent = useMemo(() => {
//     return (
//       <PropertyTreeItem
//         name="Root"
//         property={schemaState.parsed || {}}
//         path={[]}
//         selectedPath={selectedPath}
//         onSelect={handleSelectPath}
//       />
//     )
//   }, [schemaState.parsed, selectedPath, handleSelectPath])

//   if (loading) {
//     return <div className="schema-editor-loading">Loading schema...</div>
//   }

//   return (
//     <div className="schema-editor">
//       <div className="schema-editor-header">
//         <h2 className="schema-editor-title">JSON Schema Editor</h2>
//         <button
//           className="schema-editor-button"
//           onClick={() => {
//             navigator.clipboard.writeText(schemaState.text)
//             // Show a temporary notification
//             const toast = document.createElement("div")
//             toast.className = "copy-notification"
//             toast.textContent = "Copied to clipboard!"
//             toast.style.position = "fixed"
//             toast.style.top = "20px"
//             toast.style.right = "20px"
//             toast.style.backgroundColor = "#4CAF50"
//             toast.style.color = "white"
//             toast.style.padding = "10px 20px"
//             toast.style.borderRadius = "4px"
//             toast.style.zIndex = "1000"
//             document.body.appendChild(toast)
//             setTimeout(() => document.body.removeChild(toast), 2000)
//           }}
//         >
//           Copy to Clipboard
//         </button>
//       </div>

//       {error && <div className="schema-editor-error">{error}</div>}
//       {jsonEditorError && <div className="schema-editor-error">{jsonEditorError}</div>}

//       <div className="schema-editor-content" ref={containerRef}>
//         {/* Left Panel - Property Tree */}
//         <div className="schema-editor-panel schema-editor-left-panel" style={{ width: `${panelWidths[0]}%` }}>
//           <div className="property-tree-container">{treeComponent}</div>
//           <div className="schema-editor-panel-actions">
//             <button onClick={addChildProperty}>Add Property</button>
//           </div>
//         </div>

//         {/* Left Panel Resizer */}
//         <div className="schema-editor-resizer" onMouseDown={(e) => startResize(0, e)} />

//         {/* Middle Panel - Property Editor */}
//         <div className="schema-editor-panel schema-editor-middle-panel" style={{ width: `${panelWidths[1]}%` }}>
//           {selectedPath.length > 0 || schemaState.parsed ? (
//             <PropertyEditor
//               property={selectedProperty || {}}
//               propertyName={getPropertyNameFromPath(selectedPath)}
//               path={selectedPath}
//               onUpdate={updateProperty}
//               onDelete={selectedPath.length > 0 ? deleteProperty : undefined}
//             />
//           ) : (
//             <div className="no-property-selected">Select a property from the tree to edit its details</div>
//           )}
//         </div>

//         {/* Middle Panel Resizer */}
//         <div className="schema-editor-resizer" onMouseDown={(e) => startResize(1, e)} />

//         {/* Right Panel - Code View */}
//         <div className="schema-editor-panel schema-editor-right-panel" style={{ width: `${panelWidths[2]}%` }}>
//           <div className="schema-editor-code-view">
//             {isEditingJson ? (
//               <textarea
//                 className="schema-editor-json-textarea"
//                 value={jsonEditorValue}
//                 onChange={handleJsonChange}
//                 spellCheck={false}
//               />
//             ) : (
//               <SyntaxHighlighter
//                 language="json"
//                 style={tomorrow}
//                 customStyle={{
//                   margin: 0,
//                   height: "100%",
//                   borderRadius: 0,
//                   fontSize: "14px",
//                   backgroundColor: "#1e1e1e",
//                 }}
//                 showLineNumbers={true}
//                 className="schema-json-preview"
//               >
//                 {schemaState.text}
//               </SyntaxHighlighter>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SchemaEditor

"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import "./SchemaEditor.css"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

interface SchemaEditorProps {
  schemaPath?: string
  onSchemaChange?: (schema: any) => void
}

interface PropertyEditorProps {
  property: any
  propertyName: string
  path: string[]
  onUpdate: (path: string[], updates: any) => void
  onDelete?: (path: string[]) => void
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ property, propertyName, path, onUpdate, onDelete }) => {
  // Create local state for each field that's independent of the property prop
  const [localState, setLocalState] = useState({
    type: property.type || "string",
    title: property.title || "",
    description: property.description || "",
    defaultValue: property.default !== undefined ? JSON.stringify(property.default) : "",
  })

  // Track if the form has been modified
  const [isModified, setIsModified] = useState(false)

  // Update local state ONLY when the path changes, not when property changes
  useEffect(() => {
    setLocalState({
      type: property.type || "string",
      title: property.title || "",
      description: property.description || "",
      defaultValue: property.default !== undefined ? JSON.stringify(property.default) : "",
    })
    setIsModified(false)
  }, [path.join("/")])

  // Generic handler for all form field changes
  const handleChange = useCallback((field: string, value: string) => {
    setLocalState((prev) => ({
      ...prev,
      [field]: value,
    }))
    setIsModified(true)
  }, [])

  const handleApplyChanges = useCallback(() => {
    try {
      // Parse default value based on type
      let parsedDefault = undefined
      if (localState.defaultValue) {
        if (localState.type === "boolean") {
          parsedDefault = localState.defaultValue === "true"
        } else if (localState.type === "number" || localState.type === "integer") {
          parsedDefault = Number(localState.defaultValue)
        } else if (localState.type === "object" || localState.type === "array") {
          try {
            parsedDefault = JSON.parse(localState.defaultValue)
          } catch (e) {
            parsedDefault = localState.defaultValue
          }
        } else {
          parsedDefault = localState.defaultValue
        }
      }

      const updates = {
        ...property,
        type: localState.type,
        ...(localState.title ? { title: localState.title } : {}),
        ...(localState.description ? { description: localState.description } : {}),
        ...(localState.defaultValue !== "" ? { default: parsedDefault } : {}),
      }

      onUpdate(path, updates)
      setIsModified(false)

      // Save metadata with timestamp to indicate schema has been updated
      const schemaPath = localStorage.getItem("current_schema_path") || "/src/mock/schema/values.schema.json"
      const metadataKey = `schema_${schemaPath}_metadata`
      localStorage.setItem(
        metadataKey,
        JSON.stringify({
          lastModified: new Date().toISOString(),
        }),
      )
    } catch (err) {
      console.error("Error applying changes:", err)
      alert("Error applying changes. Check console for details.")
    }
  }, [localState, property, path, onUpdate])

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm(`Are you sure you want to delete ${propertyName}?`)) {
      onDelete(path)
    }
  }, [onDelete, propertyName, path])

  return (
    <div className="property-editor">
      <h3>Property Editor</h3>

      <div className="property-field">
        <label>Property Name</label>
        <input type="text" value={propertyName} disabled />
      </div>

      <div className="property-field">
        <label>Type</label>
        <select value={localState.type} onChange={(e) => handleChange("type", e.target.value)}>
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="integer">integer</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
          <option value="array">array</option>
        </select>
      </div>

      <div className="property-field">
        <label>Title</label>
        <input
          type="text"
          value={localState.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Display title for this property"
        />
      </div>

      <div className="property-field">
        <label>Description</label>
        <textarea
          value={localState.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description of this property"
        />
      </div>

      <div className="property-field">
        <label>Default Value</label>
        {localState.type === "boolean" ? (
          <select value={localState.defaultValue} onChange={(e) => handleChange("defaultValue", e.target.value)}>
            <option value="">No default</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="text"
            value={localState.defaultValue}
            onChange={(e) => handleChange("defaultValue", e.target.value)}
            placeholder={`Default value (${localState.type})`}
          />
        )}
      </div>

      <div className="property-actions">
        <button
          className={`property-action-btn update-btn ${isModified ? "modified" : ""}`}
          onClick={handleApplyChanges}
          disabled={!isModified}
        >
          Apply Changes
        </button>
        {onDelete && (
          <button className="property-action-btn delete-btn" onClick={handleDelete}>
            Delete Property
          </button>
        )}
      </div>
    </div>
  )
}

// Memoize the PropertyTreeItem to prevent unnecessary re-renders
const PropertyTreeItem = React.memo(({ name, property, path, selectedPath, onSelect }: PropertyTreeItemProps) => {
  const isSelected = path.length === selectedPath.length && path.every((p, i) => p === selectedPath[i])
  const hasChildren = property.type === "object" && property.properties && Object.keys(property.properties).length > 0

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      onSelect(path)
    },
    [path, onSelect],
  )

  // Memoize the children to prevent unnecessary re-renders
  const children = useMemo(() => {
    if (!hasChildren) return null
    return Object.entries(property.properties).map(([childName, childProperty]) => (
      <PropertyTreeItem
        key={`${childName}`}
        name={childName}
        property={childProperty as any}
        path={[...path, "properties", childName]}
        selectedPath={selectedPath}
        onSelect={onSelect}
      />
    ))
  }, [hasChildren, property.properties, path, selectedPath, onSelect])

  return (
    <div className={`property-item ${path.length === 0 ? "root-item" : ""}`}>
      <div
        className={`property-name ${isSelected ? "selected" : ""}`}
        onClick={handleSelect}
        title={property.description}
      >
        <span>{name}</span>
        {property.type && <span className={`property-type ${property.type}`}>{property.type}</span>}
        {property.title && <span className="property-title">{property.title}</span>}
      </div>

      {hasChildren && <div className="property-children">{children}</div>}
    </div>
  )
})

PropertyTreeItem.displayName = "PropertyTreeItem"

interface PropertyTreeItemProps {
  name: string
  property: any
  path: string[]
  selectedPath: string[]
  onSelect: (path: string[]) => void
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ schemaPath = "/src/mock", onSchemaChange }) => {
  // Use a single source of truth for the schema
  const [schemaState, setSchemaState] = useState<{
    text: string
    parsed: any
  }>({
    text: "",
    parsed: null,
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const [panelWidths, setPanelWidths] = useState<[number, number, number]>([33.33, 33.33, 33.33])
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthsRef = useRef<[number, number, number]>([33.33, 33.33, 33.33])
  const activeResizerRef = useRef<0 | 1 | null>(null)

  // Add state for direct JSON editing
  const [isEditingJson, setIsEditingJson] = useState(false)
  const [jsonEditorValue, setJsonEditorValue] = useState("")
  const [jsonEditorError, setJsonEditorError] = useState<string | null>(null)

  // Handle tree item selection
  const handleSelectPath = useCallback((path: string[]) => {
    setSelectedPath([...path]) // Create a new array to ensure state update
  }, [])

  // Update schema state in a single function to keep everything in sync
  const updateSchema = useCallback(
    (newSchema: any) => {
      const schemaText = JSON.stringify(newSchema, null, 2)

      setSchemaState({
        text: schemaText,
        parsed: newSchema,
      })

      setJsonEditorValue(schemaText)

      // Save to localStorage
      try {
        localStorage.setItem(`schema_${schemaPath}`, JSON.stringify(newSchema))
        // Store the current schema path for reference
        localStorage.setItem("current_schema_path", schemaPath)

        // Save metadata with timestamp
        const metadataKey = `schema_${schemaPath}_metadata`
        localStorage.setItem(
          metadataKey,
          JSON.stringify({
            lastModified: new Date().toISOString(),
          }),
        )
      } catch (err) {
        console.error("Error saving schema to localStorage:", err)
      }

      // Notify parent component if callback provided
      if (onSchemaChange) {
        onSchemaChange(newSchema)
      }
    },
    [schemaPath, onSchemaChange],
  )

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
            updateSchema(schemaData)
            setLoading(false)
            return
          } catch (parseError) {
            console.error("Error parsing saved schema:", parseError)
            // If there's an error parsing the saved schema, continue to fetch from the server
          }
        }

        // Fetch from server if no saved schema or error parsing
        const res = await fetch(`${schemaPath}/schema/values.schema.json`)
        if (!res.ok) {
          throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText}`)
        }

        const schemaData = await res.json()
        updateSchema(schemaData)
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

        updateSchema(basicSchema)
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [schemaPath, updateSchema])

  // Set up resizer functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeResizerRef.current === null || !containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const dx = e.clientX - startXRef.current
      const dxPercent = (dx / containerWidth) * 100

      const newWidths = [...startWidthsRef.current] as [number, number, number]

      if (activeResizerRef.current === 0) {
        // First resizer (between panel 1 and 2)
        newWidths[0] = Math.max(15, Math.min(70, startWidthsRef.current[0] + dxPercent))
        newWidths[1] = Math.max(15, Math.min(70, startWidthsRef.current[1] - dxPercent))
        newWidths[2] = startWidthsRef.current[2]
      } else if (activeResizerRef.current === 1) {
        // Second resizer (between panel 2 and 3)
        newWidths[0] = startWidthsRef.current[0]
        newWidths[1] = Math.max(15, Math.min(70, startWidthsRef.current[1] + dxPercent))
        newWidths[2] = Math.max(15, Math.min(70, startWidthsRef.current[2] - dxPercent))
      }

      // Ensure the sum is 100%
      const sum = newWidths.reduce((a, b) => a + b, 0)
      if (Math.abs(sum - 100) > 0.1) {
        const factor = 100 / sum
        newWidths[0] *= factor
        newWidths[1] *= factor
        newWidths[2] *= factor
      }

      setPanelWidths(newWidths)
    }

    const handleMouseUp = () => {
      activeResizerRef.current = null
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const startResize = useCallback(
    (index: 0 | 1, e: React.MouseEvent) => {
      e.preventDefault()
      startXRef.current = e.clientX
      startWidthsRef.current = [...panelWidths] as [number, number, number]
      activeResizerRef.current = index
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [panelWidths],
  )

  const getPropertyAtPath = useCallback(
    (path: string[]) => {
      if (!schemaState.parsed || path.length === 0) return schemaState.parsed

      let current = schemaState.parsed
      let i = 0

      while (i < path.length) {
        if (current === undefined) {
          return undefined
        }

        // Handle properties path segment
        if (path[i] === "properties" && current.properties) {
          current = current.properties
          i++
          continue
        }

        if (current[path[i]] === undefined) {
          return undefined
        }

        current = current[path[i]]
        i++
      }

      return current
    },
    [schemaState.parsed],
  )

  const getPropertyNameFromPath = useCallback((path: string[]) => {
    if (path.length === 0) return "Root"
    return path[path.length - 1]
  }, [])

  // Memoize the selected property to prevent unnecessary calculations
  const selectedProperty = useMemo(() => getPropertyAtPath(selectedPath), [getPropertyAtPath, selectedPath])

  const updateProperty = useCallback(
    (path: string[], updates: any) => {
      try {
        // Create a deep copy of the schema to avoid reference issues
        const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

        if (path.length === 0) {
          // Updating root schema
          const updatedSchema = { ...schemaObj, ...updates }
          updateSchema(updatedSchema)
          return
        }

        let current = schemaObj
        let i = 0

        // Navigate to the parent of the property we want to update
        while (i < path.length - 1) {
          if (current[path[i]] === undefined) {
            current[path[i]] = {}
          }
          current = current[path[i]]
          i++
        }

        // Update the property
        current[path[i]] = updates

        // Update the schema
        updateSchema(schemaObj)
      } catch (err) {
        console.error("Error updating property:", err)
        setError("Failed to update property: " + (err as Error).message)
      }
    },
    [schemaState.parsed, updateSchema],
  )

  const deleteProperty = useCallback(
    (path: string[]) => {
      try {
        if (path.length === 0) {
          console.error("Cannot delete root schema")
          return
        }

        // Create a deep copy of the schema to avoid reference issues
        const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

        let current = schemaObj
        let i = 0

        // Navigate to the parent of the property we want to delete
        while (i < path.length - 1) {
          if (current[path[i]] === undefined) {
            return // Property not found
          }
          current = current[path[i]]
          i++
        }

        // Delete the property
        delete current[path[i]]

        // Update the schema
        updateSchema(schemaObj)

        // Clear selection after deletion
        setSelectedPath([])
      } catch (err) {
        console.error("Error deleting property:", err)
        setError("Failed to delete property: " + (err as Error).message)
      }
    },
    [schemaState.parsed, updateSchema],
  )

  const addProperty = useCallback(() => {
    try {
      // Create a deep copy of the schema to avoid reference issues
      const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

      if (!schemaObj.properties) {
        schemaObj.properties = {}
      }

      // Add a new property with a unique name
      const propertyName = `newProperty${Object.keys(schemaObj.properties).length + 1}`
      schemaObj.properties[propertyName] = {
        type: "string",
        title: "New Property",
        description: "Description for the new property",
      }

      // Update the schema
      updateSchema(schemaObj)
    } catch (err) {
      console.error("Error adding property:", err)
      setError("Failed to add property: Invalid JSON")
    }
  }, [schemaState.parsed, updateSchema])

  const addChildProperty = useCallback(() => {
    try {
      if (!selectedPath.length) {
        // If no property is selected, add to root
        addProperty()
        return
      }

      // Create a deep copy of the schema to avoid reference issues
      const schemaObj = JSON.parse(JSON.stringify(schemaState.parsed))

      let current = schemaObj
      let i = 0

      // Navigate to the selected property
      while (i < selectedPath.length) {
        if (current[selectedPath[i]] === undefined) {
          return // Property not found
        }
        current = current[selectedPath[i]]
        i++
      }

      // Ensure the selected property is an object with properties
      if (current.type !== "object") {
        current.type = "object"
      }

      if (!current.properties) {
        current.properties = {}
      }

      // Add a new property with a unique name
      const propertyName = `newProperty${Object.keys(current.properties).length + 1}`
      current.properties[propertyName] = {
        type: "string",
        title: "New Property",
        description: "Description for the new property",
      }

      // Update the schema
      updateSchema(schemaObj)

      // Update selection to the new property
      setSelectedPath([...selectedPath, "properties", propertyName])
    } catch (err) {
      console.error("Error adding child property:", err)
      setError("Failed to add child property: " + (err as Error).message)
    }
  }, [selectedPath, schemaState.parsed, updateSchema, addProperty])

  // Handle JSON editor changes
  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonEditorValue(e.target.value)
    setJsonEditorError(null)
  }, [])

  // Apply JSON changes
  const applyJsonChanges = useCallback(() => {
    try {
      const parsedJson = JSON.parse(jsonEditorValue)
      updateSchema(parsedJson)
      setIsEditingJson(false)
      setJsonEditorError(null)
    } catch (err) {
      console.error("Error parsing JSON:", err)
      setJsonEditorError("Invalid JSON: " + (err as Error).message)
    }
  }, [jsonEditorValue, updateSchema])

  // Toggle JSON editing mode
  const toggleJsonEditing = useCallback(() => {
    if (isEditingJson) {
      // If we're exiting edit mode, try to apply changes
      applyJsonChanges()
    } else {
      // If we're entering edit mode, just set the flag
      setIsEditingJson(true)
    }
  }, [isEditingJson, applyJsonChanges])

  // Memoize the tree component to prevent unnecessary re-renders
  const treeComponent = useMemo(() => {
    return (
      <PropertyTreeItem
        name="Root"
        property={schemaState.parsed || {}}
        path={[]}
        selectedPath={selectedPath}
        onSelect={handleSelectPath}
      />
    )
  }, [schemaState.parsed, selectedPath, handleSelectPath])

  if (loading) {
    return <div className="schema-editor-loading">Loading schema...</div>
  }

  return (
    <div className="schema-editor">
      <div className="schema-editor-header">
        <h2 className="schema-editor-title">JSON Schema Editor</h2>
        <button
          className="schema-editor-button"
          onClick={() => {
            navigator.clipboard.writeText(schemaState.text)
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
          }}
        >
          Copy to Clipboard
        </button>
      </div>

      {error && <div className="schema-editor-error">{error}</div>}
      {jsonEditorError && <div className="schema-editor-error">{jsonEditorError}</div>}

      <div className="schema-editor-content" ref={containerRef}>
        {/* Left Panel - Property Tree */}
        <div className="schema-editor-panel schema-editor-left-panel" style={{ width: `${panelWidths[0]}%` }}>
          <div className="property-tree-container">{treeComponent}</div>
          <div className="schema-editor-panel-actions">
            <button onClick={addChildProperty}>Add Property</button>
          </div>
        </div>

        {/* Left Panel Resizer */}
        <div className="schema-editor-resizer" onMouseDown={(e) => startResize(0, e)} />

        {/* Middle Panel - Property Editor */}
        <div className="schema-editor-panel schema-editor-middle-panel" style={{ width: `${panelWidths[1]}%` }}>
          {selectedPath.length > 0 || schemaState.parsed ? (
            <PropertyEditor
              property={selectedProperty || {}}
              propertyName={getPropertyNameFromPath(selectedPath)}
              path={selectedPath}
              onUpdate={updateProperty}
              onDelete={selectedPath.length > 0 ? deleteProperty : undefined}
            />
          ) : (
            <div className="no-property-selected">Select a property from the tree to edit its details</div>
          )}
        </div>

        {/* Middle Panel Resizer */}
        <div className="schema-editor-resizer" onMouseDown={(e) => startResize(1, e)} />

        {/* Right Panel - Code View */}
        <div className="schema-editor-panel schema-editor-right-panel" style={{ width: `${panelWidths[2]}%` }}>
          <div className="schema-editor-code-view">
            {isEditingJson ? (
              <textarea
                className="schema-editor-json-textarea"
                value={jsonEditorValue}
                onChange={handleJsonChange}
                spellCheck={false}
              />
            ) : (
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  height: "100%",
                  borderRadius: 0,
                  fontSize: "14px",
                  backgroundColor: "#1e1e1e",
                }}
                showLineNumbers={true}
                className="schema-json-preview"
              >
                {schemaState.text}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchemaEditor
