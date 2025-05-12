// Kubernetes types
export interface K8sContext {
    name: string
    cluster: string
    user: string
    namespace?: string
    isActive: boolean
  }
  
  export interface K8sNamespace {
    name: string
    status: string
    creationTimestamp: string
  }
  
  // Git types
  export interface GitRepository {
    url: string
    branch: string
    path?: string
    credentials?: {
      type: "ssh" | "https" | "token"
      secretName?: string
    }
  }
  
  // Helm types
  export interface HelmRepository {
    name: string
    url: string
    type: "oci" | "http"
    credentials?: {
      secretName?: string
    }
  }
  
  export interface HelmChart {
    name: string
    version: string
    description?: string
    repository: string
  }
  
  // ArgoCD types
  export interface ArgoApplication {
    name: string
    namespace: string
    project: string
    status: "Healthy" | "Degraded" | "Progressing" | "Suspended" | "Missing"
    syncStatus: "Synced" | "OutOfSync"
    source: {
      repoURL: string
      path?: string
      chart?: string
      targetRevision: string
    }
  }
  
  // Integration context
  export interface IntegrationContext {
    k8sContext?: K8sContext
    namespace?: string
    gitRepo?: GitRepository
    helmRepo?: HelmRepository
    argoApplication?: ArgoApplication
  }
  