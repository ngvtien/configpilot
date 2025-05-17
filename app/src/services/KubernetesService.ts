// This service acts as a bridge between the UI components and the Electron IPC calls
interface KubernetesContext {
    name: string
    cluster: string
    user: string
    namespace?: string
  }
  
  interface KubernetesResource {
    kind: string
    apiVersion: string
    metadata: {
      name: string
      namespace?: string
      [key: string]: any
    }
    [key: string]: any
  }
  
  class KubernetesService {
    private currentContext = ""
  
    // Load kubeconfig and get available contexts
    public async loadContexts(): Promise<KubernetesContext[]> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, using mock data")
          return [
            { name: "docker-desktop", cluster: "docker-desktop", user: "docker-desktop" },
            { name: "minikube", cluster: "minikube", user: "minikube" },
            { name: "kind-kind", cluster: "kind-kind", user: "kind-kind" },
          ]
        }
  
        const kubeConfigData = await window.Electron.loadKubeConfig()
  
        // Parse the kubeconfig data
        // In a real app, you'd use the KubeConfig class from @kubernetes/client-node
        // Here we're simulating it since we can't use Node.js modules directly in the renderer
        const configLines = kubeConfigData.split("\n")
        const contexts: KubernetesContext[] = []
        let currentContext = ""
  
        let inContextsSection = false
        let currentContextObj: Partial<KubernetesContext> = {}
  
        for (const line of configLines) {
          if (line.trim().startsWith("current-context:")) {
            currentContext = line.split(":")[1].trim()
          } else if (line.trim() === "contexts:") {
            inContextsSection = true
          } else if (inContextsSection && line.trim().startsWith("-")) {
            // Start of a new context
            if (currentContextObj.name) {
              contexts.push(currentContextObj as KubernetesContext)
            }
            currentContextObj = {}
          } else if (inContextsSection && line.trim().startsWith("name:")) {
            currentContextObj.name = line.split(":")[1].trim()
          } else if (inContextsSection && line.trim().startsWith("context:")) {
            // Context details follow
          } else if (inContextsSection && line.trim().startsWith("cluster:")) {
            currentContextObj.cluster = line.split(":")[1].trim()
          } else if (inContextsSection && line.trim().startsWith("user:")) {
            currentContextObj.user = line.split(":")[1].trim()
          } else if (inContextsSection && line.trim().startsWith("namespace:")) {
            currentContextObj.namespace = line.split(":")[1].trim()
          } else if (line.trim().startsWith("apiVersion:") || line.trim().startsWith("kind:")) {
            // We've moved past the contexts section
            if (currentContextObj.name) {
              contexts.push(currentContextObj as KubernetesContext)
            }
            inContextsSection = false
          }
        }
  
        // Add the last context if we have one
        if (inContextsSection && currentContextObj.name) {
          contexts.push(currentContextObj as KubernetesContext)
        }
  
        this.currentContext = currentContext
        return contexts
      } catch (error) {
        console.error("Failed to load contexts:", error)
        throw error
      }
    }
  
    // Set the current context
    public async setContext(contextName: string): Promise<boolean> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, simulating context change")
          this.currentContext = contextName
          return true
        }
  
        const result = await window.Electron.setKubeContext(contextName)
        if (result.success) {
          this.currentContext = contextName
          return true
        }
        throw new Error(result.error)
      } catch (error) {
        console.error(`Failed to set context to ${contextName}:`, error)
        throw error
      }
    }
  
    // Get the current context
    public getCurrentContext(): string {
      return this.currentContext
    }
  
    // Get resources of a specific type
    public async getResources(resourceType: string, namespace?: string): Promise<any[]> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, using mock data")
          return this.getMockResources(resourceType)
        }
  
        const result = await window.Electron.getKubernetesResources(resourceType, namespace, this.currentContext)
  
        if (result.success) {
          return result.items
        }
        throw new Error(result.error)
      } catch (error) {
        console.error(`Failed to get ${resourceType}:`, error)
        throw error
      }
    }
  
    // Apply YAML to the cluster
    public async applyYaml(yamlContent: string, namespace?: string): Promise<any> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, simulating YAML apply")
          return { success: true, message: "YAML applied (simulated)" }
        }
  
        const result = await window.Electron.applyYaml(yamlContent, namespace)
        if (result.success) {
          return result
        }
        throw new Error(result.error)
      } catch (error) {
        console.error("Failed to apply YAML:", error)
        throw error
      }
    }
  
    // Delete a resource
    public async deleteResource(resourceType: string, name: string, namespace?: string): Promise<any> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, simulating resource deletion")
          return { success: true, message: `${resourceType} ${name} deleted (simulated)` }
        }
  
        const result = await window.Electron.deleteKubernetesResource(resourceType, name, namespace, this.currentContext)
  
        if (result.success) {
          return result
        }
        throw new Error(result.error)
      } catch (error) {
        console.error(`Failed to delete ${resourceType} ${name}:`, error)
        throw error
      }
    }
  
    // Watch resources of a specific type
    public async watchResources(
      resourceType: string,
      namespace: string,
      callback: (type: string, obj: any) => void,
    ): Promise<void> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, watch not supported")
          return
        }
  
        // Set up the event listener for updates
        window.addEventListener("kubernetes-resource-update", ((event: CustomEvent) => {
          const { type, object } = event.detail
          callback(type, object)
        }) as EventListener)
  
        // Start the watch
        await window.Electron.watchKubernetesResources(resourceType, namespace, this.currentContext)
      } catch (error) {
        console.error(`Failed to watch ${resourceType}:`, error)
        throw error
      }
    }
  
    // Stop watching resources
    public async stopWatchingResources(): Promise<void> {
      try {
        if (!window.Electron) {
          console.warn("Electron bridge not available, watch not supported")
          return
        }
  
        await window.Electron.stopWatchingKubernetesResources()
      } catch (error) {
        console.error("Failed to stop watching resources:", error)
        throw error
      }
    }
  
    // Helper method to get mock resources for development
    private getMockResources(resourceType: string): any[] {
      switch (resourceType) {
        case "pods":
          return [
            {
              metadata: {
                name: "example-pod-1",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 3600000).toISOString(),
              },
              status: {
                phase: "Running",
                containerStatuses: [{ restartCount: 0 }],
              },
            },
            {
              metadata: {
                name: "example-pod-2",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 7200000).toISOString(),
              },
              status: {
                phase: "Running",
                containerStatuses: [{ restartCount: 2 }],
              },
            },
          ]
        case "deployments":
          return [
            {
              metadata: {
                name: "example-deployment-1",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 86400000).toISOString(),
              },
              spec: {
                replicas: 3,
              },
              status: {
                availableReplicas: 3,
              },
            },
            {
              metadata: {
                name: "example-deployment-2",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 172800000).toISOString(),
              },
              spec: {
                replicas: 2,
              },
              status: {
                availableReplicas: 1,
              },
            },
          ]
        case "services":
          return [
            {
              metadata: {
                name: "example-service-1",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 86400000).toISOString(),
              },
              spec: {
                type: "ClusterIP",
                ports: [{ port: 80, targetPort: 8080 }],
              },
            },
            {
              metadata: {
                name: "example-service-2",
                namespace: "default",
                creationTimestamp: new Date(Date.now() - 172800000).toISOString(),
              },
              spec: {
                type: "LoadBalancer",
                ports: [{ port: 443, targetPort: 8443 }],
              },
            },
          ]
        case "namespaces":
          return [
            {
              metadata: {
                name: "default",
                creationTimestamp: new Date(Date.now() - 2592000000).toISOString(),
              },
              status: {
                phase: "Active",
              },
            },
            {
              metadata: {
                name: "kube-system",
                creationTimestamp: new Date(Date.now() - 2592000000).toISOString(),
              },
              status: {
                phase: "Active",
              },
            },
            {
              metadata: {
                name: "kube-public",
                creationTimestamp: new Date(Date.now() - 2592000000).toISOString(),
              },
              status: {
                phase: "Active",
              },
            },
          ]
        default:
          return []
      }
    }
  }
  
  export default new KubernetesService()
  