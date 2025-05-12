import React from "react"
import { createRoot } from "react-dom/client"
import { ValuesDiff } from "./components/ValuesDiff"

// Sample values
const originalValues = `name: my-app
replicas: 1
image: nginx:1.19
resources:
  limits:
    cpu: 100m
    memory: 128Mi`

const newValues = `name: my-app
replicas: 3
image: nginx:1.20
resources:
  limits:
    cpu: 200m
    memory: 256Mi`

function MinimalExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ValuesDiff Example</h1>
      
      <ValuesDiff
        originalValues={originalValues}
        newValues={newValues}
        originalLabel="Original Values"
        newLabel="New Values"
      />
    </div>
  )
}

// Render the app
const container = document.getElementById("root")
const root = createRoot(container)
root.render(<MinimalExample />)
