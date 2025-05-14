"use client"

import React from "react"
import { useRef, useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import yaml from "js-yaml"
import Editor from "@monaco-editor/react"
import "./SecretEditor.css"

interface SecretEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  environment?: string
  schemaPath?: string
  product?: string
  customer?: string
}

interface SecretItem {
  name: string
  vaultRef: {
    path: string
    key: string
  }
  value?: string
}

type TabType = "schema" | "secrets" | "external-secrets"

const SecretEditor: React.FC<SecretEditorProps> = ({
  initialValue = "",
  onChange,
  environment = "dev",
  schemaPath = "/src/mock/schema/secrets.schema.json",
  product = "product-a",
  customer = "ace",
}) => {
  const [yamlContent, setYamlContent] = useState(initialValue)
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showYamlEditor, setShowYamlEditor] = useState(false)
  const [editorHeight, setEditorHeight] = useState("300px")
  const monacoEditorRef = useRef<any>(null)
  const [schema, setSchema] = useState<any>(null)
  const [secretValues, setSecretValues] = useState<Record<string, string>>({})
  const [editingSecretIndex, setEditingSecretIndex] = useState<number | null>(null)
  const [secretInputValue, setSecretInputValue] = useState("")
  const [showSecretValue, setShowSecretValue] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSecrets, setSelectedSecrets] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("schema")
  const [externalSecretsYaml, setExternalSecretsYaml] = useState("")

  // State for the edit modal
  const [editSecretName, setEditSecretName] = useState("")
  const [editVaultPath, setEditVaultPath] = useState("")
  const [editVaultKey, setEditVaultKey] = useState("")

  // Add this after the other state variables
  const [tempSecret, setTempSecret] = useState<SecretItem | null>(null)
  const [isProcessingLargeInput, setIsProcessingLargeInput] = useState(false)

  // Add this function after the other state variables
  const safelySetSecretValue = (value) => {
    // Use a worker if the string is very large
    if (value.length > 1000000) {
      setIsProcessingLargeInput(true)
      // Use setTimeout to avoid blocking the UI thread
      setTimeout(() => {
        try {
          setSecretInputValue(value)
          setIsProcessingLargeInput(false)
        } catch (error) {
          console.error("Error setting large secret value:", error)
          showToast("Error: The value is too large to process")
          setIsProcessingLargeInput(false)
        }
      }, 0)
    } else {
      // For smaller strings, set directly
      setSecretInputValue(value)
    }
  }

  // Add this useEffect for handling large inputs
  useEffect(() => {
    if (isProcessingLargeInput) {
      const timer = setTimeout(() => {
        setIsProcessingLargeInput(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isProcessingLargeInput])

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
          showToast("Schema refreshed!")
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
      const savedValues = localStorage.getItem(`secrets_editor_${env}`)
      if (savedValues) {
        setYamlContent(savedValues)
        try {
          const parsedValues = yaml.load(savedValues) as any
          setFormData(parsedValues || {})
          generateExternalSecretsYaml(parsedValues || {})
        } catch (e) {
          console.error("Error parsing YAML:", e)
        }
        setIsLoading(false)
        return
      }

      // If no saved values, try to load from file
      try {
        const response = await fetch(`/src/mock/${env}/secrets.yaml`)
        if (response.ok) {
          const content = await response.text()
          setYamlContent(content)
          try {
            const parsedValues = yaml.load(content) as any
            setFormData(parsedValues || {})
            generateExternalSecretsYaml(parsedValues || {})
          } catch (e) {
            console.error("Error parsing YAML:", e)
          }
          localStorage.setItem(`secrets_editor_${env}`, content)
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error("Error loading from file:", e)
      }

      // If all else fails, use initialValue or create a basic structure
      const defaultValue = initialValue || "env: []"
      setYamlContent(defaultValue)
      try {
        const parsedValues = yaml.load(defaultValue) as any
        setFormData(parsedValues || { env: [] })
        generateExternalSecretsYaml(parsedValues || { env: [] })
      } catch (e) {
        console.error("Error parsing YAML:", e)
        setFormData({ env: [] })
        generateExternalSecretsYaml({ env: [] })
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading values:", error)
      setIsLoading(false)
    }
  }

  // Generate external-secrets.yaml content
  const generateExternalSecretsYaml = (data: any) => {
    if (!data || !data.env || !Array.isArray(data.env)) {
      setExternalSecretsYaml("")
      return
    }

    const secretsData = data.env
      .filter((secret: SecretItem) => secret.name && secret.vaultRef?.path && secret.vaultRef?.key)
      .map((secret: SecretItem) => ({
        secretKey: secret.name,
        remoteRef: {
          key: secret.vaultRef.path,
          property: secret.vaultRef.key,
        },
      }))

    // Create the external secret template with placeholders
    const externalSecretTemplate = {
      apiVersion: "external-secrets.io/v1beta1",
      kind: "ExternalSecret",
      metadata: {
        name: `${product}-secrets`,
        namespace: `${customer}-${environment}`,
      },
      spec: {
        refreshInterval: "1h",
        secretStoreRef: {
          name: "vault-backend",
          kind: "ClusterSecretStore",
        },
        target: {
          name: `${product}-secret`,
          creationPolicy: "Owner",
        },
        data: secretsData,
      },
    }

    setExternalSecretsYaml(yaml.dump(externalSecretTemplate, { lineWidth: -1 }))
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
      generateExternalSecretsYaml(parsedValues || {})
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
        generateExternalSecretsYaml(parsedValues || {})
      } catch (e) {
        console.error("Error parsing YAML:", e)
      }
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const showToast = (message: string) => {
    const toast = document.createElement("div")
    toast.className = "copy-notification"
    toast.textContent = message
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast("Copied to clipboard!")
  }

  const copyEditorContent = () => {
    if (monacoEditorRef.current) {
      const editorValue = monacoEditorRef.current.getValue()
      copyToClipboard(editorValue)
    }
  }

  const copyRightPanelContent = () => {
    let contentToCopy = ""

    switch (activeTab) {
      case "schema":
        contentToCopy = JSON.stringify(schema, null, 2)
        break
      case "secrets":
        contentToCopy = yamlContent
        break
      case "external-secrets":
        contentToCopy = externalSecretsYaml
        break
    }

    if (contentToCopy) {
      copyToClipboard(contentToCopy)
    }
  }

  const downloadYaml = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `secrets-${environment}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadExternalSecretsYaml = () => {
    const blob = new Blob([externalSecretsYaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `external-secret-${environment}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  // Add a new secret
  const addSecret = () => {
    // Create a new secret in memory only
    const newSecret: SecretItem = {
      name: "",
      vaultRef: {
        path: `kv/${customer}/${environment}/${product}`,
        key: "",
      },
    }

    // Store it in the temporary state
    setTempSecret(newSecret)

    // Open the edit modal for the new secret
    setEditingSecretIndex(-1) // Use -1 to indicate this is a new secret
    setSecretInputValue("")
    setShowSecretValue(false)

    // Initialize the edit fields with empty values and defaults
    setEditSecretName("")
    setEditVaultPath(`kv/${customer}/${environment}/${product}`)
    setEditVaultKey("")
  }

  // Remove a secret
  const removeSecret = (index: number) => {
    if (window.confirm("Are you sure you want to delete this secret?")) {
      const newFormData = { ...formData }
      if (newFormData.env && Array.isArray(newFormData.env)) {
        const secretName = newFormData.env[index]?.name
        newFormData.env.splice(index, 1)

        // Update YAML
        const newYamlContent = yaml.dump(newFormData)
        setYamlContent(newYamlContent)
        localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)
        setFormData(newFormData)

        // Update external secrets YAML
        generateExternalSecretsYaml(newFormData)

        // Remove from selected secrets if it was selected
        setSelectedSecrets((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)))

        // Remove from secret values if it had a value
        if (secretName) {
          const newSecretValues = { ...secretValues }
          delete newSecretValues[secretName]
          setSecretValues(newSecretValues)
        }
      }
    }
  }

  // Remove multiple secrets
  const removeSelectedSecrets = () => {
    if (selectedSecrets.length === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedSecrets.length} selected secrets?`)) {
      const newFormData = { ...formData }
      const newSecretValues = { ...secretValues }

      // Sort indices in descending order to avoid shifting issues when removing
      const sortedIndices = [...selectedSecrets].sort((a, b) => b - a)

      sortedIndices.forEach((index) => {
        if (newFormData.env && Array.isArray(newFormData.env)) {
          const secretName = newFormData.env[index]?.name
          if (secretName && newSecretValues[secretName]) {
            delete newSecretValues[secretName]
          }
          newFormData.env.splice(index, 1)
        }
      })

      // Update YAML
      const newYamlContent = yaml.dump(newFormData)
      setYamlContent(newYamlContent)
      localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)
      setFormData(newFormData)
      setSecretValues(newSecretValues)
      setSelectedSecrets([])

      // Update external secrets YAML
      generateExternalSecretsYaml(newFormData)
    }
  }

  // Update a secret field
  const updateSecretField = (index: number, field: string, value: string) => {
    const newFormData = { ...formData }
    if (newFormData.env && Array.isArray(newFormData.env)) {
      // If updating the name, we need to update the secretValues map
      if (field === "name") {
        const oldName = newFormData.env[index].name
        if (oldName && secretValues[oldName]) {
          const newSecretValues = { ...secretValues }
          newSecretValues[value] = newSecretValues[oldName]
          delete newSecretValues[oldName]
          setSecretValues(newSecretValues)
        }
        newFormData.env[index].name = value
      } else if (field === "path") {
        if (!newFormData.env[index].vaultRef) {
          newFormData.env[index].vaultRef = { path: "", key: "" }
        }
        newFormData.env[index].vaultRef.path = value
      } else if (field === "key") {
        if (!newFormData.env[index].vaultRef) {
          newFormData.env[index].vaultRef = { path: "", key: "" }
        }
        newFormData.env[index].vaultRef.key = value
      }

      // Update YAML
      const newYamlContent = yaml.dump(newFormData)
      setYamlContent(newYamlContent)
      localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)
      setFormData(newFormData)

      // Update external secrets YAML
      generateExternalSecretsYaml(newFormData)
    }
  }

  // Open secret edit modal with smart defaults
  const openSecretEditModal = (index: number) => {
    const secret = formData.env[index]
    if (!secret) return

    setEditingSecretIndex(index)
    setSecretInputValue(secretValues[secret.name] || "")
    setShowSecretValue(false)

    // Set the edit fields with current values or smart defaults
    setEditSecretName(secret.name || "")

    // Default vault path if empty
    if (!secret.vaultRef?.path) {
      setEditVaultPath(`kv/${customer}/${environment}/${product}`)
    } else {
      setEditVaultPath(secret.vaultRef.path)
    }

    // Default vault key if empty, or keep existing
    if (!secret.vaultRef?.key) {
      // If we have a name, use it to generate a default key
      if (secret.name) {
        setEditVaultKey(secret.name.toLowerCase().replace(/-/g, "_"))
      } else {
        setEditVaultKey("")
      }
    } else {
      setEditVaultKey(secret.vaultRef.key)
    }
  }

  // Handle secret name change with uppercase enforcement
  const handleSecretNameChange = (value: string) => {
    // Convert to uppercase
    const uppercasedValue = value.toUpperCase()
    setEditSecretName(uppercasedValue)

    // If vault key is empty or was derived from the name, update it
    if (!editVaultKey || editVaultKey === editSecretName.toLowerCase().replace(/-/g, "_")) {
      setEditVaultKey(uppercasedValue.toLowerCase().replace(/-/g, "_"))
    }
  }

  // Handle vault key change with lowercase enforcement
  const handleVaultKeyChange = (value: string) => {
    // Convert to lowercase
    setEditVaultKey(value.toLowerCase())
  }

  // Save changes from the edit modal
  const saveSecretChanges = () => {
    try {
      if (secretInputValue && secretInputValue.length > 1000000) {
        showToast("Processing large secret value...")
      }

      // Use setTimeout for large values to avoid UI blocking
      setTimeout(() => {
        try {
          if (editingSecretIndex === -1) {
            // This is a new secret being added
            if (editSecretName) {
              // Only add if the secret has a name
              const newFormData = { ...formData }
              if (!newFormData.env) {
                newFormData.env = []
              }

              // Create the new secret with the values from the form
              const newSecret: SecretItem = {
                name: editSecretName,
                vaultRef: {
                  path: editVaultPath,
                  key: editVaultKey,
                },
              }

              newFormData.env.push(newSecret)
              setFormData(newFormData)

              // Update YAML
              const newYamlContent = yaml.dump(newFormData)
              setYamlContent(newYamlContent)
              localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

              // Update external secrets YAML
              generateExternalSecretsYaml(newFormData)

              // Also save the secret value if provided
              if (secretInputValue) {
                try {
                  setSecretValues({
                    ...secretValues,
                    [editSecretName]: secretInputValue,
                  })
                  showToast("Secret value updated locally")
                } catch (error) {
                  console.error("Error saving secret value:", error)
                  showToast("Error: Could not save the secret value. It might be too large.")
                }
              }
            }
          } else if (editingSecretIndex !== null) {
            // This is an existing secret being edited
            // Update the secret fields
            updateSecretField(editingSecretIndex, "name", editSecretName)
            updateSecretField(editingSecretIndex, "path", editVaultPath)
            updateSecretField(editingSecretIndex, "key", editVaultKey)

            // Also save the secret value if provided
            if (secretInputValue) {
              try {
                setSecretValues({
                  ...secretValues,
                  [editSecretName]: secretInputValue,
                })
                showToast("Secret value updated locally")
              } catch (error) {
                console.error("Error saving secret value:", error)
                showToast("Error: Could not save the secret value. It might be too large.")
              }
            }
          }

          // Clear the temporary secret and close the modal
          setTempSecret(null)
          closeSecretEditModal()
        } catch (error) {
          console.error("Error in saveSecretChanges:", error)
          showToast("Error: Could not save changes. Please try again with smaller values.")
        }
      }, 0)
    } catch (error) {
      console.error("Error in saveSecretChanges outer block:", error)
      showToast("Error: Could not save changes. Please try again with smaller values.")
    }
  }

  // Save secret value locally
  const saveSecretValue = () => {
    saveSecretChanges()
  }

  // Save secret to vault (mock implementation)
  const saveSecretToVault = (index: number) => {
    const secret = formData.env[index]
    if (!secret) return

    const secretName = secret.name
    const secretValue = secretValues[secretName]

    if (!secretValue) {
      alert("Please update the secret value first")
      return
    }

    if (!secret.vaultRef.path || !secret.vaultRef.key) {
      alert("Please provide both Vault Path and Vault Key")
      return
    }

    // Mock API call to save to vault
    setTimeout(() => {
      showToast(`Secret "${secretName}" saved to vault at ${secret.vaultRef.path}`)
    }, 500)
  }

  // Close secret edit modal
  const closeSecretEditModal = () => {
    setEditingSecretIndex(null)
    setSecretInputValue("")
    setShowSecretValue(false)
    setEditSecretName("")
    setEditVaultPath("")
    setEditVaultKey("")
    setTempSecret(null) // Clear the temporary secret
  }

  // Toggle secret value visibility
  const toggleSecretValueVisibility = () => {
    setShowSecretValue(!showSecretValue)
  }

  // Toggle select all secrets
  const toggleSelectAll = () => {
    if (selectedSecrets.length === (formData.env?.length || 0)) {
      setSelectedSecrets([])
    } else {
      setSelectedSecrets(formData.env ? Array.from({ length: formData.env.length }, (_, i) => i) : [])
    }
  }

  // Toggle select a single secret
  const toggleSelectSecret = (index: number) => {
    setSelectedSecrets((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  // Sort secrets
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Get sorted and filtered secrets
  const getSortedAndFilteredSecrets = () => {
    if (!formData.env || !Array.isArray(formData.env)) return []

    // First filter by search term
    const filteredSecrets = formData.env.filter((secret: SecretItem) => {
      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      return (
        (secret.name && secret.name.toLowerCase().includes(searchLower)) ||
        (secret.vaultRef?.path && secret.vaultRef.path.toLowerCase().includes(searchLower)) ||
        (secret.vaultRef?.key && secret.vaultRef.key.toLowerCase().includes(searchLower))
      )
    })

    // Then sort if needed
    if (sortConfig) {
      filteredSecrets.sort((a: any, b: any) => {
        let aValue, bValue

        if (sortConfig.key === "name") {
          aValue = a.name || ""
          bValue = b.name || ""
        } else if (sortConfig.key === "path") {
          aValue = a.vaultRef?.path || ""
          bValue = b.vaultRef?.path || ""
        } else if (sortConfig.key === "key") {
          aValue = a.vaultRef?.key || ""
          bValue = b.vaultRef?.key || ""
        } else {
          return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filteredSecrets
  }

  // Function to refresh the schema
  const refreshSchemaData = () => {
    loadSchema()
    // Show a temporary notification
    showToast("Schema refreshed!")
  }

  // Get sort indicator
  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return "↕️"
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓"
  }

  // Get filtered secrets
  const filteredSecrets = getSortedAndFilteredSecrets()

  // Helper function to get the title of a property from the schema
  const getPropertyTitle = (path: string[], key: string): string => {
    if (!schema || !schema.properties) return key

    let current = schema.properties
    for (const segment of path) {
      if (current && current[segment] && current[segment].properties) {
        current = current[segment].properties
      } else {
        return key
      }
    }

    if (current && current[key] && current[key].title) {
      return current[key].title
    }

    return key
  }

  // Generic function to update form data
  const updateFormData = (path: string[], value: any) => {
    const newFormData = { ...formData }
    let current = newFormData

    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]
      if (!current[segment]) {
        current[segment] = {}
      }
      current = current[segment]
    }

    current[path[path.length - 1]] = value

    setFormData(newFormData)

    // Update YAML
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)
    localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

    // Update external secrets YAML
    generateExternalSecretsYaml(newFormData)
  }

  // Update an item in an array
  const updateArrayItem = (path: string[], index: number, value: any) => {
    const newFormData = { ...formData }
    let current = newFormData

    for (const segment of path) {
      current = current[segment]
    }

    current[index] = value

    setFormData(newFormData)

    // Update YAML
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)
    localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

    // Update external secrets YAML
    generateExternalSecretsYaml(newFormData)
  }

  // Update an item in an object array
  const updateObjectArrayItem = (path: string[], index: number, itemKey: string, value: any) => {
    const newFormData = { ...formData }
    let current = newFormData

    for (const segment of path) {
      current = current[segment]
    }

    current[index][itemKey] = value

    setFormData(newFormData)

    // Update YAML
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)
    localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

    // Update external secrets YAML
    generateExternalSecretsYaml(newFormData)
  }

  // Remove an item from an array
  const removeArrayItem = (path: string[], index: number) => {
    const newFormData = { ...formData }
    let current = newFormData

    for (const segment of path) {
      current = current[segment]
    }

    current.splice(index, 1)

    setFormData(newFormData)

    // Update YAML
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)
    localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

    // Update external secrets YAML
    generateExternalSecretsYaml(newFormData)
  }

  // Add an item to an array
  const addArrayItem = (path: string[], type: string, isObject = false) => {
    const newFormData = { ...formData }
    let current = newFormData

    for (const segment of path) {
      current = current[segment]
    }

    let newItem: any
    if (type === "number") {
      newItem = 0
    } else if (type === "object" && isObject) {
      newItem = {}
    } else {
      newItem = ""
    }

    current.push(newItem)

    setFormData(newFormData)

    // Update YAML
    const newYamlContent = yaml.dump(newFormData)
    setYamlContent(newYamlContent)
    localStorage.setItem(`secrets_editor_${environment}`, newYamlContent)

    // Update external secrets YAML
    generateExternalSecretsYaml(newFormData)
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
          <button className="add-item-button" onClick={() => addArrayItem(path, type)}>
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
          <button className="add-item-button" onClick={() => addArrayItem(path, "object", true)}>
            Add Item
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
                <button className="add-item-button" onClick={() => addArrayItem(path, "object", true)}>
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
    <div className="secret-editor">
      <div className="secret-editor-header">
        <h2
          className="secret-editor-title"
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: "#1a202c",
            paddingBottom: "0.5rem",
          }}
        >
          Helm Secrets Editor
        </h2>
        <div className="secret-editor-actions">
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
            {showYamlEditor ? "Hide YAML" : "Show YAML"}
          </button>
          <button className="action-button" onClick={downloadYaml}>
            Download YAML
          </button>
        </div>
      </div>

      <div className="secret-editor-content">
        {/* Main content */}
        <div className="main-content">
          <div className="form-editor-container">
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="form-container">
                <div className="secrets-toolbar">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search secrets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="toolbar-actions">
                    <button className="toolbar-button add-button" onClick={addSecret} title="Add New Secret">
                      + Add Secret
                    </button>
                    {selectedSecrets.length > 0 && (
                      <button
                        className="toolbar-button delete-button"
                        onClick={removeSelectedSecrets}
                        title={`Delete ${selectedSecrets.length} Selected Secrets`}
                      >
                        🗑 Delete Selected ({selectedSecrets.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="secrets-grid">
                  <table className="secrets-table">
                    <thead>
                      <tr>
                        <th className="checkbox-column">
                          <input
                            type="checkbox"
                            checked={selectedSecrets.length === filteredSecrets.length && filteredSecrets.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="sortable-column" onClick={() => requestSort("name")}>
                          Secret Key Name {getSortIndicator("name")}
                        </th>
                        <th className="sortable-column" onClick={() => requestSort("path")}>
                          Vault Path {getSortIndicator("path")}
                        </th>
                        <th className="sortable-column" onClick={() => requestSort("key")}>
                          Vault Key {getSortIndicator("key")}
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSecrets.length > 0 ? (
                        filteredSecrets.map((secret: SecretItem, index: number) => {
                          // Find the original index in the formData.env array
                          const originalIndex = formData.env.findIndex(
                            (s: SecretItem) =>
                              s.name === secret.name &&
                              s.vaultRef?.path === secret.vaultRef?.path &&
                              s.vaultRef?.key === secret.vaultRef?.key,
                          )

                          return (
                            <tr
                              key={originalIndex}
                              className={selectedSecrets.includes(originalIndex) ? "selected-row" : ""}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedSecrets.includes(originalIndex)}
                                  onChange={() => toggleSelectSecret(originalIndex)}
                                />
                              </td>
                              <td>{secret.name || <span className="empty-value">No name</span>}</td>
                              <td>{secret.vaultRef?.path || <span className="empty-value">No path</span>}</td>
                              <td>{secret.vaultRef?.key || <span className="empty-value">No key</span>}</td>
                              <td>
                                {secretValues[secret.name] ? (
                                  <span className="status-badge has-value">Has Value</span>
                                ) : (
                                  <span className="status-badge no-value">No Value</span>
                                )}
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="table-action-button edit-button"
                                    onClick={() => openSecretEditModal(originalIndex)}
                                    title="Edit Secret"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="table-action-button save-button"
                                    onClick={() => saveSecretToVault(originalIndex)}
                                    title="Save to Vault"
                                    disabled={!secretValues[secret.name]}
                                  >
                                    🔒
                                  </button>
                                  <button
                                    className="table-action-button delete-button"
                                    onClick={() => removeSecret(originalIndex)}
                                    title="Delete Secret"
                                  >
                                    🗑
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="no-secrets-message">
                            {searchTerm ? "No secrets match your search" : "No secrets defined yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {showYamlEditor && (
            <div className="yaml-editor-container" style={{ height: editorHeight, marginTop: "16px" }}>
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

        {/* Right Panel - Tabbed View */}
        <div className="schema-editor-panel schema-editor-right-panel">
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === "schema" ? "active" : ""}`}
                onClick={() => setActiveTab("schema")}
              >
                Schema
              </button>
              <button
                className={`tab-button ${activeTab === "secrets" ? "active" : ""}`}
                onClick={() => setActiveTab("secrets")}
              >
                secrets.yaml
              </button>
              <button
                className={`tab-button ${activeTab === "external-secrets" ? "active" : ""}`}
                onClick={() => setActiveTab("external-secrets")}
              >
                external-secret.yaml
              </button>
              <div className="tab-actions">
                <button className="tab-action-button" onClick={copyRightPanelContent} title="Copy to clipboard">
                  📋
                </button>
                {activeTab === "external-secrets" && (
                  <button className="tab-action-button" onClick={downloadExternalSecretsYaml} title="Download YAML">
                    💾
                  </button>
                )}
              </div>
            </div>
            <div className="tab-content">
              {activeTab === "schema" && (
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
                  className="code-preview"
                >
                  {schema ? JSON.stringify(schema, null, 2) : "No schema loaded"}
                </SyntaxHighlighter>
              )}
              {activeTab === "secrets" && (
                <SyntaxHighlighter
                  language="yaml"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    height: "100%",
                    borderRadius: 0,
                    fontSize: "14px",
                    backgroundColor: "#1e1e1e",
                  }}
                  showLineNumbers={true}
                  className="code-preview"
                >
                  {formData && formData.env ? `env:\n${yaml.dump({ env: formData.env }).substring(5)}` : "env: []"}
                </SyntaxHighlighter>
              )}
              {activeTab === "external-secrets" && (
                <SyntaxHighlighter
                  language="yaml"
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    height: "100%",
                    borderRadius: 0,
                    fontSize: "14px",
                    backgroundColor: "#1e1e1e",
                  }}
                  showLineNumbers={true}
                  className="code-preview"
                >
                  {externalSecretsYaml || "No external secrets defined"}
                </SyntaxHighlighter>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secret Edit Modal */}
      {editingSecretIndex !== null && (
        <div className="secret-modal-overlay">
          <div className="secret-modal">
            <h3>Edit Secret</h3>
            <div className="context-info">
              <span className="context-label">Environment:</span> <span className="context-value">{environment}</span>
              <span className="context-label">Product:</span> <span className="context-value">{product}</span>
              <span className="context-label">Customer:</span> <span className="context-value">{customer}</span>
            </div>

            <div className="modal-form">
              <div className="modal-field">
                <label>Secret Key Name</label>
                <input
                  type="text"
                  value={editSecretName}
                  onChange={(e) => handleSecretNameChange(e.target.value)}
                  placeholder="DB-PASSWORD"
                  className="uppercase-input"
                />
                <div className="field-hint">Secret names are automatically converted to uppercase</div>
              </div>

              <div className="modal-field">
                <label>Vault Path</label>
                <input
                  type="text"
                  value={editVaultPath}
                  onChange={(e) => setEditVaultPath(e.target.value)}
                  placeholder={(`kv/${customer}/${environment}/${product}`).toLocaleLowerCase()}
                  className="lowercase-input"
                />
                <div className="field-hint">
                Default: {(`kv/${customer}/${environment}/${product}`).toLowerCase()}
                </div>
              </div>

              <div className="modal-field">
                <label>Vault Key</label>
                <input
                  type="text"
                  value={editVaultKey}
                  onChange={(e) => handleVaultKeyChange(e.target.value)}
                  placeholder="db_password"
                  className="lowercase-input"
                />
                <div className="field-hint">Keys are automatically converted to lowercase</div>
              </div>

              <div className="modal-field">
                <div className="secret-value-header">
                  <label>Secret Value</label>
                  <button type="button" className="toggle-visibility-button" onClick={toggleSecretValueVisibility}>
                    {showSecretValue ? "🙈 Hide" : "👁️ Show"}
                  </button>
                </div>

                <textarea
                  value={secretInputValue}
                  onChange={(e) => {
                    try {
                      // Get the new value
                      const newValue = e.target.value

                      // Check if the value is too large (over 5MB as an example threshold)
                      if (newValue.length > 5000000) {
                        showToast("Warning: Very large input detected. This may cause performance issues.")
                      }

                      // Use requestAnimationFrame to avoid blocking the UI
                      requestAnimationFrame(() => {
                        try {
                          setSecretInputValue(newValue)
                        } catch (error) {
                          console.error("Error updating secret value:", error)
                          showToast("Error: The value is too large to process")
                        }
                      })
                    } catch (error) {
                      console.error("Error in textarea change handler:", error)
                      showToast("Error processing input")
                    }
                  }}
                  onPaste={(e) => {
                    try {
                      const pastedText = e.clipboardData.getData("text")
                      if (pastedText.length > 1000000) {
                        e.preventDefault() // Prevent the default paste
                        showToast("Processing large paste...")
                        safelySetSecretValue(pastedText)
                      }
                    } catch (error) {
                      console.error("Error handling paste:", error)
                      showToast("Error processing pasted content")
                    }
                  }}
                  placeholder="Enter secret value here..."
                  rows={5}
                  maxLength={10000000} // Increased but still has a reasonable limit
                  className={showSecretValue ? "" : "masked-input"}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeSecretEditModal}>
                Cancel
              </button>
              <button type="button" className="save-btn" onClick={saveSecretChanges}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isProcessingLargeInput && (
        <div className="processing-overlay">
          <div className="processing-message">Processing large input...</div>
        </div>
      )}
    </div>
  )
}

export default SecretEditor
