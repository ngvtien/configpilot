// "use client"

// import React from "react"
// import { useState, useEffect } from "react"
// import SchemaEditor from "./SchemaEditor"
// import ValueEditor from "./ValueEditor" // Changed from ValuesEditor to ValueEditor
// import "./AppLayout.css"
// import "./ValueEditorWrapper.css"

// type UserRole = "developer" | "devops" | "operations"
// type ViewType =
//   | "schema"
//   | "values"
//   | "chart-builder"
//   | "template-editor"
//   | "oci-registry"
//   | "kubernetes"
//   | "argocd"
//   | "git-repos"

// interface AppLayoutProps {
//   initialRole?: UserRole
//   initialView?: ViewType
// }

// const AppLayout = ({ initialRole = "developer", initialView }: AppLayoutProps) => {
//   const [userRole, setUserRole] = useState<UserRole>(initialRole)
//   const [view, setView] = useState<ViewType>(initialView || (userRole === "developer" ? "schema" : "values"))
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
//   const [currentSchema, setCurrentSchema] = useState<any>(null)
//   const [environment, setEnvironment] = useState("dev")
//   const [product, setProduct] = useState("k8s")
//   const [customer, setCustomer] = useState("ACE")
//   const [version, setVersion] = useState("1.2.7")
//   const [isEditingContext, setIsEditingContext] = useState(false)
//   const [contextForm, setContextForm] = useState({
//     environment,
//     product,
//     customer,
//     version,
//   })

//   // Load context settings from localStorage on mount
//   useEffect(() => {
//     const savedContext = localStorage.getItem("helm_editor_context")
//     if (savedContext) {
//       try {
//         const contextData = JSON.parse(savedContext)
//         if (contextData.environment) setEnvironment(contextData.environment)
//         if (contextData.product) setProduct(contextData.product)
//         if (contextData.customer) setCustomer(contextData.customer)
//         if (contextData.version) setVersion(contextData.version)

//         // Update the form data too
//         setContextForm({
//           environment: contextData.environment || environment,
//           product: contextData.product || product,
//           customer: contextData.customer || customer,
//           version: contextData.version || version,
//         })

//         console.log("Loaded context from localStorage:", contextData)
//       } catch (e) {
//         console.error("Error parsing saved context:", e)
//       }
//     }
//   }, [])

//   // Save context settings to localStorage
//   const saveContextToLocalStorage = () => {
//     try {
//       localStorage.setItem(
//         "helm_editor_context",
//         JSON.stringify({
//           environment,
//           product,
//           customer,
//           version,
//           lastUpdated: new Date().toISOString(),
//         }),
//       )
//       console.log("Saved context to localStorage")
//     } catch (e) {
//       console.error("Error saving context to localStorage:", e)
//     }
//   }

//   // Handle schema changes
//   const handleSchemaChange = (schema: any) => {
//     setCurrentSchema(schema)

//     // Save schema to localStorage
//     try {
//       localStorage.setItem("current_schema", JSON.stringify(schema))

//       // Also save to the specific schema path for ValueEditor to find
//       localStorage.setItem("schema_/src/mock/schema/values.schema.json", JSON.stringify(schema))

//       // Trigger a custom event to notify components of schema change
//       window.dispatchEvent(new Event("schemaUpdated"))
//     } catch (e) {
//       console.error("Error saving schema to localStorage:", e)
//     }
//   }

//   // Handle context form submission
//   const handleContextSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setEnvironment(contextForm.environment)
//     setProduct(contextForm.product)
//     setCustomer(contextForm.customer)
//     setVersion(contextForm.version)
//     setIsEditingContext(false)

//     // Save to localStorage
//     localStorage.setItem(
//       "helm_editor_context",
//       JSON.stringify({
//         environment: contextForm.environment,
//         product: contextForm.product,
//         customer: contextForm.customer,
//         version: contextForm.version,
//         lastUpdated: new Date().toISOString(),
//       }),
//     )
//   }

//   const renderContent = () => {
//     switch (view) {
//       case "schema":
//         return <SchemaEditor onSchemaChange={handleSchemaChange} />
//       case "values":
//         return (
//           <ValueEditor
//             schema={currentSchema}
//             environment={environment}
//             product={product}
//             customer={customer}
//             version={version}
//             userRole={userRole}
//           />
//         )
//       case "kubernetes":
//         return (
//           <div className="coming-soon">
//             <div className="coming-soon-icon">🚧</div>
//             <h3>Kubernetes Integration Coming Soon</h3>
//             <p>This feature is currently under development.</p>
//           </div>
//         )
//       default:
//         return (
//           <div className="coming-soon">
//             <div className="coming-soon-icon">🚧</div>
//             <h3>Coming Soon</h3>
//             <p>This feature is currently under development.</p>
//           </div>
//         )
//     }
//   }

//   return (
//     <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
//       {/* Sidebar */}
//       <div className="sidebar">
//         {/* Logo */}
//         <div className="sidebar-logo">
//           <div className="logo-container">
//             <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path
//                 d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//               <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//             {!sidebarCollapsed && <span className="logo-text">Helm UI</span>}
//           </div>
//           <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
//             {sidebarCollapsed ? "→" : "←"}
//           </button>
//         </div>

//         {/* Navigation sections */}
//         <div className="sidebar-nav">
//           <div className="nav-section">
//             {!sidebarCollapsed && <div className="section-header">ROLE</div>}
//             <div className="role-buttons">
//               <button
//                 className={`nav-button ${userRole === "developer" ? "active" : ""}`}
//                 onClick={() => setUserRole("developer")}
//                 title="Developer"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M8 3H7C5.34315 3 4 4.34315 4 6V7M8 3H16M8 3V7M16 3H17C18.6569 3 20 4.34315 20 6V7M16 3V7M4 7V17C4 18.6569 5.34315 20 7 20H8M4 7H8M8 7H16M16 7H20M16 7V20M20 7V17C20 18.6569 18.6569 20 17 20H16M8 20H16M8 20V16C8 14.8954 8.89543 14 10 14H14C15.1046 14 16 14.8954 16 16V20"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Developer"}
//               </button>

//               <button
//                 className={`nav-button ${userRole === "devops" ? "active" : ""}`}
//                 onClick={() => setUserRole("devops")}
//                 title="DevOps/Platform"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M9 6L15 12L9 18"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "DevOps/Platform"}
//               </button>

//               <button
//                 className={`nav-button ${userRole === "operations" ? "active" : ""}`}
//                 onClick={() => setUserRole("operations")}
//                 title="Operations"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M15.0505 9.05019L16.586 7.51472M18.0002 6.10051L16.586 7.51472M16.586 7.51472L14.0002 10.1005L13.0002 9.10051L15.586 6.51472L14.586 5.51472L12.0002 8.10051L11.0002 7.10051L13.586 4.51472L12.586 3.51472L9.00019 7.10051L17.0002 15.1005L20.586 11.5147L19.586 10.5147L17.0002 13.1005L16.0002 12.1005L18.586 9.51472L17.586 8.51472L15.0002 11.1005L14.0002 10.1005"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Operations"}
//               </button>
//             </div>
//           </div>

//           {userRole === "developer" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-header">DEVELOPER TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "schema" ? "active" : ""}`}
//                 onClick={() => setView("schema")}
//                 title="Schema Editor"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M14 3V7C14 7.55228 14.4477 8 15 8H19M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8M14 3L19 8M8 12H16M8 16H16"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Schema Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "values" ? "active" : ""}`}
//                 onClick={() => setView("values")}
//                 title="Values Editor"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M9 7H6C4.89543 7 4 7.89543 4 9V18C4 19.1046 4.89543 20 6 20H15C16.1046 20 17 19.1046 17 18V15M9 7V4C9 2.89543 9.89543 2 11 2H18C19.1046 2 20 2.89543 20 4V11C20 12.1046 19.1046 13 18 13H15M9 7H15V13"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Values Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "chart-builder" ? "active" : ""}`}
//                 onClick={() => setView("chart-builder")}
//                 title="Chart Builder"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Chart Builder"}
//               </button>
//               <button
//                 className={`nav-button ${view === "template-editor" ? "active" : ""}`}
//                 onClick={() => setView("template-editor")}
//                 title="Template Editor"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M10 13C10.5523 13 11 12.5523 11 12C11 11.4477 10.5523 11 10 11C9.44772 11 9 11.4477 9 12C9 12.5523 9.44772 13 10 13Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M10 5C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4C9 4.55228 9.44772 5 10 5Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M10 21C10.5523 21 11 20.5523 11 20C11 19.4477 10.5523 19 10 19C9.44772 19 9 19.4477 9 20C9 20.5523 9.44772 21 10 21Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M14 14C14 13.4477 14.4477 13 15 13C15.5523 13 16 13.4477 16 14V19C16 19.5523 15.5523 20 15 20H14"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M14 6C14 5.44772 14.4477 5 15 5H19C19.5523 5 20 5.44772 20 6V10C20 10.5523 19.5523 11 19 11H15C14.4477 11 14 10.5523 14 10V9"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Template Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "oci-registry" ? "active" : ""}`}
//                 onClick={() => setView("oci-registry")}
//                 title="OCI Registry"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M21 9V3H15M21 3L13 11M10 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V16"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "OCI Registry"}
//               </button>
//             </div>
//           )}

//           {userRole === "devops" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-header">DEVOPS TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "kubernetes" ? "active" : ""}`}
//                 onClick={() => setView("kubernetes")}
//                 title="Kubernetes"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M3 12H4M12 3V4M20 12H21M12 20V21M18.364 5.63604L17.6569 6.34315M5.63604 5.63604L6.34315 6.34315M6.34315 17.6569L5.63604 18.364M17.6569 17.6569L18.364 18.364"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Kubernetes"}
//               </button>
//               <button
//                 className={`nav-button ${view === "argocd" ? "active" : ""}`}
//                 onClick={() => setView("argocd")}
//                 title="ArgoCD"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M9 17H7C5.89543 17 5 16.1046 5 15V7C5 5.89543 5.89543 5 7 5H15C16.1046 5 17 5.89543 17 7V9"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M9 17C9 18.1046 9.89543 19 11 19H17C18.1046 19 19 18.1046 19 17V11C19 9.89543 18.1046 9 17 9H11C9.89543 9 9 9.89543 9 11V17Z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "ArgoCD"}
//               </button>
//               <button
//                 className={`nav-button ${view === "git-repos" ? "active" : ""}`}
//                 onClick={() => setView("git-repos")}
//                 title="Git Repositories"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M15 4.5V4.5C13.3431 4.5 12 5.84315 12 7.5V7.5M15 4.5H18C19.1046 4.5 20 5.39543 20 6.5V18.5C20 19.6046 19.1046 20.5 18 20.5H6C4.89543 20.5 4 19.6046 4 18.5V6.5C4 5.39543 4.89543 4.5 6 4.5H9M15 4.5C15 3.39543 14.1046 2.5 13 2.5H11C9.89543 2.5 9 3.39543 9 4.5M9 4.5C9 5.84315 10.3431 7.5 12 7.5M12 7.5V14.5M12 14.5L10 12.5M12 14.5L14 12.5"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Git Repositories"}
//               </button>
//             </div>
//           )}

//           {userRole === "operations" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-header">OPERATIONS TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "values" ? "active" : ""}`}
//                 onClick={() => setView("values")}
//                 title="Values Editor"
//               >
//                 <span className="nav-icon">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                       d="M9 7H6C4.89543 7 4 7.89543 4 9V18C4 19.1046 4.89543 20 6 20H15C16.1046 20 17 19.1046 17 18V15M9 7V4C9 2.89543 9.89543 2 11 2H18C19.1046 2 20 2.89543 20 4V11C20 12.1046 19.1046 13 18 13H15M9 7H15V13"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 </span>
//                 {!sidebarCollapsed && "Values Editor"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="main-content">{renderContent()}</div>

//       {/* Context editing modal */}
//       {isEditingContext && (
//         <div className="context-modal">
//           <div className="context-modal-content">
//             <h2>Edit Context</h2>
//             <form onSubmit={handleContextSubmit}>
//               <div className="form-group">
//                 <label>Environment</label>
//                 <input
//                   type="text"
//                   value={contextForm.environment}
//                   onChange={(e) => setContextForm({ ...contextForm, environment: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Product</label>
//                 <input
//                   type="text"
//                   value={contextForm.product}
//                   onChange={(e) => setContextForm({ ...contextForm, product: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Customer</label>
//                 <input
//                   type="text"
//                   value={contextForm.customer}
//                   onChange={(e) => setContextForm({ ...contextForm, customer: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Version</label>
//                 <input
//                   type="text"
//                   value={contextForm.version}
//                   onChange={(e) => setContextForm({ ...contextForm, version: e.target.value })}
//                 />
//               </div>
//               <div className="form-actions">
//                 <button type="button" onClick={() => setIsEditingContext(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit">Save</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default AppLayout

// --------------

// "use client"

// import React from "react"
// import { useState, useEffect } from "react"
// import SchemaEditor from "./SchemaEditor"
// import ValueEditor from "./ValueEditor" // Changed from ValuesEditor to ValueEditor
// import "./AppLayout.css"
// import "./ValueEditorWrapper.css"

// type UserRole = "developer" | "devops" | "operations"
// type ViewType =
//   | "schema"
//   | "values"
//   | "chart-builder"
//   | "template-editor"
//   | "oci-registry"
//   | "kubernetes"
//   | "argocd"
//   | "git-repos"

// interface AppLayoutProps {
//   initialRole?: UserRole
//   initialView?: ViewType
// }

// const AppLayout = ({ initialRole = "developer", initialView }: AppLayoutProps) => {
//   const [userRole, setUserRole] = useState<UserRole>(initialRole)
//   const [view, setView] = useState<ViewType>(initialView || (userRole === "developer" ? "schema" : "values"))
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
//   const [currentSchema, setCurrentSchema] = useState<any>(null)
//   const [environment, setEnvironment] = useState("dev")
//   const [product, setProduct] = useState("k8s")
//   const [customer, setCustomer] = useState("ACE")
//   const [version, setVersion] = useState("1.2.7")
//   const [isEditingContext, setIsEditingContext] = useState(false)
//   const [contextForm, setContextForm] = useState({
//     environment,
//     product,
//     customer,
//     version,
//   })

//   // Load context settings from localStorage on mount
//   useEffect(() => {
//     const savedContext = localStorage.getItem("helm_editor_context")
//     if (savedContext) {
//       try {
//         const contextData = JSON.parse(savedContext)
//         if (contextData.environment) setEnvironment(contextData.environment)
//         if (contextData.product) setProduct(contextData.product)
//         if (contextData.customer) setCustomer(contextData.customer)
//         if (contextData.version) setVersion(contextData.version)

//         // Update the form data too
//         setContextForm({
//           environment: contextData.environment || environment,
//           product: contextData.product || product,
//           customer: contextData.customer || customer,
//           version: contextData.version || version,
//         })

//         console.log("Loaded context from localStorage:", contextData)
//       } catch (e) {
//         console.error("Error parsing saved context:", e)
//       }
//     }
//   }, [])

//   // Save context settings to localStorage
//   const saveContextToLocalStorage = () => {
//     try {
//       localStorage.setItem(
//         "helm_editor_context",
//         JSON.stringify({
//           environment,
//           product,
//           customer,
//           version,
//           lastUpdated: new Date().toISOString(),
//         }),
//       )
//       console.log("Saved context to localStorage")
//     } catch (e) {
//       console.error("Error saving context to localStorage:", e)
//     }
//   }

//   // Handle schema changes
//   const handleSchemaChange = (schema: any) => {
//     setCurrentSchema(schema)

//     // Save schema to localStorage
//     try {
//       localStorage.setItem("current_schema", JSON.stringify(schema))

//       // Also save to the specific schema path for ValueEditor to find
//       localStorage.setItem("schema_/src/mock/schema/values.schema.json", JSON.stringify(schema))

//       // Trigger a custom event to notify components of schema change
//       window.dispatchEvent(new Event("schemaUpdated"))
//     } catch (e) {
//       console.error("Error saving schema to localStorage:", e)
//     }
//   }

//   // Handle context form submission
//   const handleContextSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setEnvironment(contextForm.environment)
//     setProduct(contextForm.product)
//     setCustomer(contextForm.customer)
//     setVersion(contextForm.version)
//     setIsEditingContext(false)

//     // Save to localStorage
//     localStorage.setItem(
//       "helm_editor_context",
//       JSON.stringify({
//         environment: contextForm.environment,
//         product: contextForm.product,
//         customer: contextForm.customer,
//         version: contextForm.version,
//         lastUpdated: new Date().toISOString(),
//       }),
//     )
//   }

//   const renderContent = () => {
//     switch (view) {
//       case "schema":
//         return <SchemaEditor onSchemaChange={handleSchemaChange} />
//       case "values":
//         return (
//           <ValueEditor
//             schema={currentSchema}
//             environment={environment}
//             product={product}
//             customer={customer}
//             version={version}
//             userRole={userRole}
//           />
//         )
//       case "kubernetes":
//         return (
//           <div className="coming-soon">
//             <div className="coming-soon-icon">🚧</div>
//             <h3>Kubernetes Integration Coming Soon</h3>
//             <p>This feature is currently under development.</p>
//           </div>
//         )
//       default:
//         return (
//           <div className="coming-soon">
//             <div className="coming-soon-icon">🚧</div>
//             <h3>Coming Soon</h3>
//             <p>This feature is currently under development.</p>
//           </div>
//         )
//     }
//   }

//   return (
//     <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
//       {/* Sidebar */}
//       <div className="sidebar">
//         {/* Logo */}
//         <div className="sidebar-logo">
//           <div className="logo-container">
//             <span className="logo-icon" role="img" aria-label="Helm UI">⎈</span>
//             {!sidebarCollapsed && <span className="logo-text">Helm UI</span>}
//           </div>
//           <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
//             {sidebarCollapsed ? "→" : "←"}
//           </button>
//         </div>

//         {/* Navigation sections */}
//         <div className="sidebar-nav">
//           <div className="nav-section">
//             {!sidebarCollapsed && <div className="section-title">ROLE</div>}
//             <div className="role-buttons">
//               <button
//                 className={`nav-button ${userRole === "developer" ? "active" : ""}`}
//                 onClick={() => setUserRole("developer")}
//                 title="Developer"
//               >
//                 <span className="nav-icon" role="img" aria-label="Developer">💻</span>
//                 {!sidebarCollapsed && "Developer"}
//               </button>

//               <button
//                 className={`nav-button ${userRole === "devops" ? "active" : ""}`}
//                 onClick={() => setUserRole("devops")}
//                 title="DevOps/Platform"
//               >
//                 <span className="nav-icon" role="img" aria-label="DevOps">⚙️</span>
//                 {!sidebarCollapsed && "DevOps/Platform"}
//               </button>

//               <button
//                 className={`nav-button ${userRole === "operations" ? "active" : ""}`}
//                 onClick={() => setUserRole("operations")}
//                 title="Operations"
//               >
//                 <span className="nav-icon" role="img" aria-label="Operations">📊</span>
//                 {!sidebarCollapsed && "Operations"}
//               </button>
//             </div>
//           </div>

//           {userRole === "developer" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-title">DEVELOPER TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "schema" ? "active" : ""}`}
//                 onClick={() => setView("schema")}
//                 title="Schema Editor"
//               >
//                 <span className="nav-icon" role="img" aria-label="Schema Editor">📝</span>
//                 {!sidebarCollapsed && "Schema Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "values" ? "active" : ""}`}
//                 onClick={() => setView("values")}
//                 title="Values Editor"
//               >
//                 <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
//                 {!sidebarCollapsed && "Values Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "chart-builder" ? "active" : ""}`}
//                 onClick={() => setView("chart-builder")}
//                 title="Chart Builder"
//               >
//                 <span className="nav-icon" role="img" aria-label="Chart Builder">📊</span>
//                 {!sidebarCollapsed && "Chart Builder"}
//               </button>
//               <button
//                 className={`nav-button ${view === "template-editor" ? "active" : ""}`}
//                 onClick={() => setView("template-editor")}
//                 title="Template Editor"
//               >
//                 <span className="nav-icon" role="img" aria-label="Template Editor">📄</span>
//                 {!sidebarCollapsed && "Template Editor"}
//               </button>
//               <button
//                 className={`nav-button ${view === "oci-registry" ? "active" : ""}`}
//                 onClick={() => setView("oci-registry")}
//                 title="OCI Registry"
//               >
//                 <span className="nav-icon" role="img" aria-label="OCI Registry">🗃️</span>
//                 {!sidebarCollapsed && "OCI Registry"}
//               </button>
//             </div>
//           )}

//           {userRole === "devops" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-title">DEVOPS TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "kubernetes" ? "active" : ""}`}
//                 onClick={() => setView("kubernetes")}
//                 title="Kubernetes"
//               >
//                 <span className="nav-icon" role="img" aria-label="Kubernetes">📦</span>
//                 {!sidebarCollapsed && "Kubernetes"}
//               </button>
//               <button
//                 className={`nav-button ${view === "argocd" ? "active" : ""}`}
//                 onClick={() => setView("argocd")}
//                 title="ArgoCD"
//               >
//                 <span className="nav-icon" role="img" aria-label="ArgoCD">🔄</span>
//                 {!sidebarCollapsed && "ArgoCD"}
//               </button>
//               <button
//                 className={`nav-button ${view === "git-repos" ? "active" : ""}`}
//                 onClick={() => setView("git-repos")}
//                 title="Git Repositories"
//               >
//                 <span className="nav-icon" role="img" aria-label="Git Repositories">📁</span>
//                 {!sidebarCollapsed && "Git Repositories"}
//               </button>
//             </div>
//           )}

//           {userRole === "operations" && (
//             <div className="nav-section">
//               {!sidebarCollapsed && <div className="section-title">OPERATIONS TOOLS</div>}
//               <button
//                 className={`nav-button ${view === "values" ? "active" : ""}`}
//                 onClick={() => setView("values")}
//                 title="Values Editor"
//               >
//                 <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
//                 {!sidebarCollapsed && "Values Editor"}
//               </button>
//             </div>
//           )}

//           {/* Environment Selector */}
//           <div className="environment-selector">
//             {!sidebarCollapsed && (
//               <>
//                 <div className="environment-selector-dropdown">
//                   <select
//                     className="env-dropdown"
//                     value={environment}
//                     onChange={(e) => {
//                       setEnvironment(e.target.value)
//                       saveContextToLocalStorage()
//                     }}
//                   >
//                     <option value="dev">Development</option>
//                     <option value="sit">System Integration</option>
//                     <option value="uat">User Acceptance</option>
//                     <option value="prod">Production</option>
//                   </select>
//                 </div>
//                 <div className="environment-buttons">
//                   <button
//                     className={`env-button ${environment === "dev" ? "active" : ""}`}
//                     onClick={() => {
//                       setEnvironment("dev")
//                       saveContextToLocalStorage()
//                     }}
//                   >
//                     DEV
//                   </button>
//                   <button
//                     className={`env-button ${environment === "prod" ? "active" : ""}`}
//                     onClick={() => {
//                       setEnvironment("prod")
//                       saveContextToLocalStorage()
//                     }}
//                   >
//                     PROD
//                   </button>
//                 </div>
//               </>
//             )}
//             {sidebarCollapsed && (
//               <div className="env-badge" title={`Environment: ${environment.toUpperCase()}`}>
//                 {environment.substring(0, 1).toUpperCase()}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="main-content">
//         {/* Header */}
//         <div className="app-header">
//           <div className="header-info">
//             <div className="header-item">
//               <span className="header-label">Environment:</span>
//               <span className="header-value">{environment}</span>
//             </div>
//             <div className="header-item">
//               <span className="header-label">Product:</span>
//               <span className="header-value">{product}</span>
//             </div>
//             <div className="header-item">
//               <span className="header-label">Customer:</span>
//               <span className="header-value">{customer}</span>
//             </div>
//             <div className="header-item">
//               <span className="header-label">Version:</span>
//               <span className="header-value">{version}</span>
//             </div>
//             <button className="header-link" onClick={() => setIsEditingContext(true)}>
//               Edit Context
//             </button>
//           </div>
//         </div>

//         {/* Content area */}
//         <div className="content-area">{renderContent()}</div>
//       </div>

//       {/* Context editing modal */}
//       {isEditingContext && (
//         <div className="context-modal">
//           <div className="context-modal-content">
//             <h2>Edit Context</h2>
//             <form onSubmit={handleContextSubmit}>
//               <div className="form-group">
//                 <label>Environment</label>
//                 <input
//                   type="text"
//                   value={contextForm.environment}
//                   onChange={(e) => setContextForm({ ...contextForm, environment: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Product</label>
//                 <input
//                   type="text"
//                   value={contextForm.product}
//                   onChange={(e) => setContextForm({ ...contextForm, product: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Customer</label>
//                 <input
//                   type="text"
//                   value={contextForm.customer}
//                   onChange={(e) => setContextForm({ ...contextForm, customer: e.target.value })}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Version</label>
//                 <input
//                   type="text"
//                   value={contextForm.version}
//                   onChange={(e) => setContextForm({ ...contextForm, version: e.target.value })}
//                 />
//               </div>
//               <div className="form-actions">
//                 <button type="button" onClick={() => setIsEditingContext(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit">Save</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default AppLayout

"use client"

import React from "react"
import { useState, useEffect } from "react"
import SchemaEditor from "./SchemaEditor"
import ValueEditor from "./ValueEditor"
import SecretEditor from "./SecretEditor"
import "./AppLayout.css"

type UserRole = "developer" | "devops" | "operations"
type ViewType =
  | "schema"
  | "values"
  | "secrets"
  | "chart-builder"
  | "template-editor"
  | "oci-registry"
  | "kubernetes"
  | "argocd"
  | "git-repos"

interface AppLayoutProps {
  initialRole?: UserRole
  initialView?: ViewType
}

const AppLayout = ({ initialRole = "developer", initialView }: AppLayoutProps) => {
  const [userRole, setUserRole] = useState<UserRole>(initialRole)
  const [view, setView] = useState<ViewType>(initialView || (userRole === "developer" ? "schema" : "values"))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentSchema, setCurrentSchema] = useState<any>(null)
  const [environment, setEnvironment] = useState("dev")
  const [product, setProduct] = useState("k8s")
  const [customer, setCustomer] = useState("ACE")
  const [version, setVersion] = useState("1.2.7")
  const [isEditingContext, setIsEditingContext] = useState(false)
  const [contextForm, setContextForm] = useState({
    environment,
    product,
    customer,
    version,
  })

  // Load context settings from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem("helm_editor_context")
    if (savedContext) {
      try {
        const contextData = JSON.parse(savedContext)
        if (contextData.environment) setEnvironment(contextData.environment)
        if (contextData.product) setProduct(contextData.product)
        if (contextData.customer) setCustomer(contextData.customer)
        if (contextData.version) setVersion(contextData.version)

        // Update the form data too
        setContextForm({
          environment: contextData.environment || environment,
          product: contextData.product || product,
          customer: contextData.customer || customer,
          version: contextData.version || version,
        })

        console.log("Loaded context from localStorage:", contextData)
      } catch (e) {
        console.error("Error parsing saved context:", e)
      }
    }
  }, [])

  // Save context settings to localStorage
  const saveContextToLocalStorage = () => {
    try {
      localStorage.setItem(
        "helm_editor_context",
        JSON.stringify({
          environment,
          product,
          customer,
          version,
          lastUpdated: new Date().toISOString(),
        }),
      )
      console.log("Saved context to localStorage")
    } catch (e) {
      console.error("Error saving context to localStorage:", e)
    }
  }

  // Handle schema changes
  const handleSchemaChange = (schema: any) => {
    setCurrentSchema(schema)

    // Save schema to localStorage
    try {
      localStorage.setItem("current_schema", JSON.stringify(schema))

      // Also save to the specific schema path for ValueEditor to find
      localStorage.setItem("schema_/src/mock/schema/values.schema.json", JSON.stringify(schema))

      // Trigger a custom event to notify components of schema change
      window.dispatchEvent(new Event("schemaUpdated"))
    } catch (e) {
      console.error("Error saving schema to localStorage:", e)
    }
  }

  // Handle context form submission
  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnvironment(contextForm.environment)
    setProduct(contextForm.product)
    setCustomer(contextForm.customer)
    setVersion(contextForm.version)
    setIsEditingContext(false)

    // Save to localStorage
    localStorage.setItem(
      "helm_editor_context",
      JSON.stringify({
        environment: contextForm.environment,
        product: contextForm.product,
        customer: contextForm.customer,
        version: contextForm.version,
        lastUpdated: new Date().toISOString(),
      }),
    )
  }

  const renderContent = () => {
    switch (view) {
      case "schema":
        return <SchemaEditor onSchemaChange={handleSchemaChange} />
      case "values":
        return (
          <ValueEditor
            schema={currentSchema}
            environment={environment}
            product={product}
            customer={customer}
            version={version}
            userRole={userRole}
          />
        )
        case "secrets":
          return (
            <SecretEditor
              //schema={currentSchema}
              environment={environment}
              //product={product}
              //customer={customer}
              //version={version}
              //userRole={userRole}
            />
          )        
      case "kubernetes":
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h3>Kubernetes Integration Coming Soon</h3>
            <p>This feature is currently under development.</p>
          </div>
        )
      default:
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h3>Coming Soon</h3>
            <p>This feature is currently under development.</p>
          </div>
        )
    }
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-container">
            <span className="logo-icon" role="img" aria-label="Helm UI">⎈</span>
            {!sidebarCollapsed && <span className="logo-text">ConfigPilot</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation sections */}
        <div className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <div className="section-title">ROLE</div>}
            <div className="role-buttons">
              <button
                className={`nav-button ${userRole === "developer" ? "active" : ""}`}
                onClick={() => setUserRole("developer")}
                title="Developer"
              >
                <span className="nav-icon" role="img" aria-label="Developer">💻</span>
                {!sidebarCollapsed && "Developer"}
              </button>

              <button
                className={`nav-button ${userRole === "devops" ? "active" : ""}`}
                onClick={() => setUserRole("devops")}
                title="DevOps/Platform"
              >
                <span className="nav-icon" role="img" aria-label="DevOps">⚙️</span>
                {!sidebarCollapsed && "DevOps/Platform"}
              </button>

              <button
                className={`nav-button ${userRole === "operations" ? "active" : ""}`}
                onClick={() => setUserRole("operations")}
                title="Operations"
              >
                <span className="nav-icon" role="img" aria-label="Operations">📊</span>
                {!sidebarCollapsed && "Operations"}
              </button>
            </div>
          </div>

          {userRole === "developer" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">DEVELOPER TOOLS</div>}
              <button
                className={`nav-button ${view === "schema" ? "active" : ""}`}
                onClick={() => setView("schema")}
                title="Schema Editor"
              >
                <span className="nav-icon" role="img" aria-label="Schema Editor">📝</span>
                {!sidebarCollapsed && "Schema Editor"}
              </button>
              <button
                className={`nav-button ${view === "values" ? "active" : ""}`}
                onClick={() => setView("values")}
                title="Values Editor"
              >
                <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
                {!sidebarCollapsed && "Values Editor"}
              </button>

              <button
                className={`nav-button ${view === "secrets" ? "active" : ""}`}
                onClick={() => setView("secrets")}
                title="Secrets Editor"
              >
                <span className="nav-icon" role="img" aria-label="Secrets Editor">🔑</span>
                {!sidebarCollapsed && "Secrets Editor"}
              </button>

              <button
                className={`nav-button ${view === "chart-builder" ? "active" : ""}`}
                onClick={() => setView("chart-builder")}
                title="Chart Builder"
              >
                <span className="nav-icon" role="img" aria-label="Chart Builder">📊</span>
                {!sidebarCollapsed && "Chart Builder"}
              </button>
              <button
                className={`nav-button ${view === "template-editor" ? "active" : ""}`}
                onClick={() => setView("template-editor")}
                title="Template Editor"
              >
                <span className="nav-icon" role="img" aria-label="Template Editor">📄</span>
                {!sidebarCollapsed && "Template Editor"}
              </button>
              <button
                className={`nav-button ${view === "oci-registry" ? "active" : ""}`}
                onClick={() => setView("oci-registry")}
                title="OCI Registry"
              >
                <span className="nav-icon" role="img" aria-label="OCI Registry">🗃️</span>
                {!sidebarCollapsed && "OCI Registry"}
              </button>
            </div>
          )}

          {userRole === "devops" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">DEVOPS TOOLS</div>}
              <button
                className={`nav-button ${view === "kubernetes" ? "active" : ""}`}
                onClick={() => setView("kubernetes")}
                title="Kubernetes"
              >
                <span className="nav-icon" role="img" aria-label="Kubernetes">📦</span>
                {!sidebarCollapsed && "Kubernetes"}
              </button>
              <button
                className={`nav-button ${view === "argocd" ? "active" : ""}`}
                onClick={() => setView("argocd")}
                title="ArgoCD"
              >
                <span className="nav-icon" role="img" aria-label="ArgoCD">🔄</span>
                {!sidebarCollapsed && "ArgoCD"}
              </button>
              <button
                className={`nav-button ${view === "git-repos" ? "active" : ""}`}
                onClick={() => setView("git-repos")}
                title="Git Repositories"
              >
                <span className="nav-icon" role="img" aria-label="Git Repositories">📁</span>
                {!sidebarCollapsed && "Git Repositories"}
              </button>
            </div>
          )}

          {userRole === "operations" && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="section-title">OPERATIONS TOOLS</div>}
              <button
                className={`nav-button ${view === "values" ? "active" : ""}`}
                onClick={() => setView("values")}
                title="Values Editor"
              >
                <span className="nav-icon" role="img" aria-label="Values Editor">📋</span>
                {!sidebarCollapsed && "Values Editor"}
              </button>
            </div>
          )}

          {/* Environment Selector */}
          <div className="environment-selector">
            {!sidebarCollapsed && (
              <>
                <div className="environment-selector-dropdown">
                  <select
                    className="env-dropdown"
                    value={environment}
                    onChange={(e) => {
                      setEnvironment(e.target.value)
                      saveContextToLocalStorage()
                    }}
                  >
                    <option value="dev">Development</option>
                    <option value="sit">System Integration</option>
                    <option value="uat">User Acceptance</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
                <div className="environment-buttons">
                  <button
                    className={`env-button ${environment === "dev" ? "active" : ""}`}
                    onClick={() => {
                      setEnvironment("dev")
                      saveContextToLocalStorage()
                    }}
                  >
                    DEV
                  </button>
                  <button
                    className={`env-button ${environment === "prod" ? "active" : ""}`}
                    onClick={() => {
                      setEnvironment("prod")
                      saveContextToLocalStorage()
                    }}
                  >
                    PROD
                  </button>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <div className="env-badge" title={`Environment: ${environment.toUpperCase()}`}>
                {environment.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <div className="app-header">
          {isEditingContext ? (
            <div className="context-edit-form">
              <form onSubmit={handleContextSubmit} className="compact-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Environment</label>
                    <input
                      type="text"
                      value={contextForm.environment}
                      onChange={(e) => setContextForm({ ...contextForm, environment: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Product</label>
                    <input
                      type="text"
                      value={contextForm.product}
                      onChange={(e) => setContextForm({ ...contextForm, product: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Customer</label>
                    <input
                      type="text"
                      value={contextForm.customer}
                      onChange={(e) => setContextForm({ ...contextForm, customer: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Version</label>
                    <input
                      type="text"
                      value={contextForm.version}
                      onChange={(e) => setContextForm({ ...contextForm, version: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setIsEditingContext(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="header-info">
              <div className="header-item">
                <span className="header-label">Environment:</span>
                <span className="header-value">{environment}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Product:</span>
                <span className="header-value">{product}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Customer:</span>
                <span className="header-value">{customer}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Version:</span>
                <span className="header-value">{version}</span>
              </div>
              <button className="header-link" onClick={() => setIsEditingContext(true)}>
                Edit Context
              </button>
            </div>
          )}
        </div>
        {/* Content area */}
        <div className="content-area">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AppLayout