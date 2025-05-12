
# Team Responsibilities with Helm Charts

## Developer Team
- Create and maintain application code
- Develop Helm charts for the application
- Package Helm charts as OCI artifacts
- Push Helm chart packages to OCI registry
- Define default configuration in values.yaml
- Create templates for required Kubernetes resources
- Define Chart.yaml with dependencies and metadata
- Implement proper versioning for Helm charts
- Document chart usage and configuration options

## DevOps/Platform Team
- Set up and maintain ArgoCD infrastructure
- Configure GitOps workflow and repositories
- Create ArgoCD application manifests
- Configure sync policies and schedules
- Set up HashiCorp Vault integration
- Configure Kong API gateway ingress
- Implement F5 AS3 for load balancing
- Set up CI/CD pipelines to validate charts
- Implement OpenShift/Kubernetes cluster policies
- Configure cluster and namespace resource quotas

## Ops/Support Team
- Maintain the git-values repository structure
- Update environment-specific values in git-values repo
- Manage secrets in HashiCorp Vault or inject into git-values
- Approve and trigger deployments to production
- Schedule production deployments
- Monitor deployments and application health
- Perform rollbacks when necessary
- Maintain emergency access procedures
- Audit deployment logs and activities
- Manage certificate renewals

## Phase 1: Initial Setup

### Developer Team
1. Develop application code in their repository
2. Create Helm chart structure (templates, values.yaml, Chart.yaml)
3. Package Helm chart as OCI artifact
4. Push Helm chart to OCI registry with proper versioning
5. Document chart configuration options

### DevOps/Platform Team
1. Set up ArgoCD infrastructure on the Kubernetes/OpenShift cluster
2. Create git-values repository structure for environment-specific values
3. Configure HashiCorp Vault integration for secrets management
4. Create ArgoCD application manifests that reference:
   - OCI Helm chart repository
   - git-values repository
5. Configure Kong API gateway for application routing
6. Set up F5 AS3 for load balancing

## Phase 2: Deployment Process

### Continuous Process
1. **Developers** update application code and Helm charts
2. CI pipeline builds, tests, packages, and pushes Helm chart to OCI registry
3. **DevOps** team updates ArgoCD application manifests when needed

### Per Deployment
1. **Ops/Support** team updates environment-specific values.yaml in git-values repo
2. **Ops/Support** manages secrets in HashiCorp Vault or updates encrypted secrets
3. ArgoCD detects changes to values or OCI chart versions
4. **Ops/Support** manually triggers or schedules the deployment sync
5. ArgoCD pulls latest Helm chart and values, applies to Kubernetes
6. **Ops/Support** monitors deployment health and metrics

## GitOps Flow Details

1. **Source Control**:
   - Application code and Helm charts in one repository (managed by Developers)
   - Environment-specific values in git-values repository (managed by Ops)
   - ArgoCD application manifests in GitOps repository (managed by DevOps)

2. **OCI Registry**:
   - Versioned Helm charts stored as OCI artifacts
   - Immutable artifacts ensure deployment consistency

3. **ArgoCD Configuration**:
   - Application manifests define the relationship between:
     - Helm chart (from OCI registry)
     - Values (from git-values repository)
     - Target Kubernetes namespace

4. **Secret Management**:
   - HashiCorp Vault stores sensitive information
   - ArgoCD can be configured to pull secrets from Vault at sync time
   - Alternatively, sealed secrets or other encryption can be used in git-values repo

5. **Deployment Triggering**:
   - Manual triggering by Ops for production environments
   - Scheduled syncs for maintenance windows
   - Automatic syncs for lower environments (dev, QA)

## Key Benefits for Banking SoD Requirements

1. **Clear Separation of Duties**:
   - Developers cannot deploy directly to any environment
   - DevOps team manages the platform but not application values
   - Ops team controls when deployments happen but cannot modify application code

2. **Audit Trail**:
   - All changes are tracked in Git repositories
   - Deployment history is maintained in ArgoCD
   - Approvals can be enforced through pull requests

3. **Security**:
   - Secrets are managed securely through HashiCorp Vault
   - No direct cluster access required for routine deployments
   - RBAC controls who can access what resources

4. **Consistency**:
   - Same deployment mechanism across all environments
   - Reduced risk of configuration drift
   - Compliance with banking regulations through clear responsibilities


-------------

## GitOps Workflow with Clear Repository Separation


### Repository Structure

1. **Developer Team Repositories:**
   - **Application Code Repository:** Contains the source code, tests, documentation
   - **Helm Chart Repository:** Contains all Helm charts separate from application code
     - This separation allows chart versioning independent from app versioning
     - Chart updates can happen without code changes (configuration improvements)
     - Multiple applications can share chart patterns

2. **DevOps/Platform Team Repository:**
   - **Infrastructure Repository:** Contains ArgoCD application manifests and cluster configurations
     - ArgoCD application definitions reference both the OCI chart and config values repos
     - Cluster-wide resources (namespaces, network policies, etc.)
     - Automation scripts and pipelines for infrastructure

3. **Ops/Support Team Repository:**
   - **Config Values Repository:** Organized by customer/product/environment
     - Clear hierarchy: `/{customer}/{product}/{environment}/values.yaml`
     - Environment-specific configurations
     - Encrypted secrets or references to external secret stores

### Workflow Benefits

1. **Clear Ownership Boundaries:**
   - Developers own application code and Helm templates
   - DevOps owns infrastructure configuration and deployment platform
   - Ops owns environment-specific values and deployment timing

2. **Audit Trail:**
   - Each team's changes are tracked separately
   - Pull request reviews can enforce team-specific approvals
   - Clear history of who changed what and when

3. **Improved Security:**
   - Limited access to production values (Ops only)
   - Developers can't directly modify environment configurations
   - Infrastructure changes require DevOps team approval

4. **Simplified Troubleshooting:**
   - Issues can be traced to specific repositories/teams
   - Rollbacks can be performed at different levels (app code, chart, values)

### Deployment Process

As shown in the sequence diagram:

1. **Development Phase:**
   - Developers update application code
   - Developers update Helm charts and push to separate repository
   - CI/CD builds and packages Helm charts as OCI artifacts

2. **Configuration Phase:**
   - DevOps creates/updates ArgoCD application manifests as needed
   - Ops updates environment-specific values for target deployment
   - Ops manages secrets in HashiCorp Vault or as encrypted secrets

3. **Deployment Phase:**
   - Ops triggers deployment manually or via schedule
   - ArgoCD pulls latest charts from OCI registry
   - ArgoCD pulls latest values from config values repository
   - ArgoCD pulls secrets from Vault or decrypts from git
   - ArgoCD applies resources to Kubernetes cluster

4. **Monitoring Phase:**
   - Ops monitors deployment success and application health
   - Rollbacks can be performed by reverting values or changing chart version


### Banking-Specific Considerations

For a banking environment, this separation provides:

1. **Regulatory Compliance:**
   - Clear separation of duties meets financial regulatory requirements
   - Audit trails for all changes across environments
   - Limited access to production configurations and secrets

2. **Risk Mitigation:**
   - Changes can be tested in lower environments with identical processes
   - Production deployments require explicit Ops team actions
   - Fast rollback capabilities if issues arise

3. **Security:**
   - Secrets are managed securely through Vault or encryption
   - Limited number of people with direct cluster access
   - Multiple levels of review before changes reach production


---------

I'll update the other two Mermaid diagrams with better contrast to improve readability:

Now let's update the repository structure diagram with better contrast:

Let's also update the sequence diagram to make it more readable:

The diagrams have been updated with improved contrast for better readability. Here's a summary of the changes made:

1. **GitOps Workflow Diagram**:

```mermaid
flowchart TD
    %% Define subgraphs for teams
    subgraph DEV["Developer Team"]
        direction TB
        AppRepo["Application Code\nGit Repository"]
        HelmRepo["Helm Charts\nGit Repository"]
        OCI["OCI Registry\nHelm Chart Packages"]
        CI["CI Pipeline\nBuild & Test"]
    end
    
    subgraph DEVOPS["DevOps/Platform Team"]
        direction TB
        InfraRepo["Infrastructure Git Repo\n(ArgoCD manifests, cluster config)"]
        ArgoCD["ArgoCD\nGitOps Controller"]
        K8s["Kubernetes/OpenShift\nCluster"]
        Vault["HashiCorp Vault\nSecrets Management"]
    end
    
    subgraph OPS["Ops/Support Team"]
        direction TB
        ConfigRepo["Config Values Git Repo\n/{customer}/{product}/{environment}"]
        SyncJob["Manual/Scheduled\nSync Trigger"]
        Monitor["Deployment\nMonitoring"]
    end
    
    %% Define flows
    AppRepo -->|commits| CI
    CI -->|builds & tests| HelmRepo
    HelmRepo -->|package| OCI
    
    InfraRepo -->|defines| ArgoCD
    ArgoCD -->|deploys to| K8s
    
    ConfigRepo -->|provides values| ArgoCD
    Vault -->|provides secrets| ArgoCD
    SyncJob -->|triggers| ArgoCD
    K8s -->|status| Monitor
    
    %% Additional connections
    OCI -->|references| ArgoCD
    
    %% Define styles with better contrast
    classDef dev fill:#0066cc,stroke:#003366,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef devops fill:#009933,stroke:#006622,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef ops fill:#cc6600,stroke:#993300,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef note fill:#f9f9f9,stroke:#333333,stroke-width:1px,color:#333333
    
    class AppRepo,HelmRepo,OCI,CI dev
    class InfraRepo,ArgoCD,K8s,Vault devops
    class ConfigRepo,SyncJob,Monitor ops
    
    %% Add labels to explain the flow with higher contrast
    AppRepo -.->|"1. Application Development"| HelmRepo
    HelmRepo -.->|"2. Create/Update Helm Charts"| OCI
    InfraRepo -.->|"3. Configure ArgoCD Apps"| ArgoCD
    ConfigRepo -.->|"4. Update Environment Values"| ArgoCD
    SyncJob -.->|"5. Trigger Deployment"| ArgoCD
    
    %% Additional annotations
    appNote["Key Flows:\n- Developers create charts & push to OCI\n- DevOps manages infra & ArgoCD config\n- Ops updates env values & triggers deployment"]
    class appNote note
    
    %% Team labels styling
    style DEV fill:#0066cc,stroke:#003366,color:#ffffff,stroke-width:2px
    style DEVOPS fill:#009933,stroke:#006622,color:#ffffff,stroke-width:2px
    style OPS fill:#cc6600,stroke:#993300,color:#ffffff,stroke-width:2px
```

2. **Repository Structure Diagram**:

```mermaid
flowchart TD
    %% Main repositories
    AppRepo["Application Code Repository\n(Developer Team)"] 
    HelmRepo["Helm Chart Repository\n(Developer Team)"]
    InfraRepo["Infrastructure Repository\n(DevOps Team)"]
    ConfigRepo["Config Values Repository\n(Ops/Support Team)"]
    OCI["OCI Registry\nHelm Chart Packages"]
    
    %% File structures
    subgraph appStructure["Application Code Structure"]
        direction TB
        AppCode["Application Code\n- Source code\n- Tests\n- Documentation\n- CI/CD Pipelines"]
    end
    
    subgraph helmStructure["Helm Chart Structure"]
        direction TB
        HelmRoot["Helm Chart Root\n- Chart.yaml\n- values.yaml (defaults)\n- README.md"]
        HelmTemplates["templates/\n- deployment.yaml\n- service.yaml\n- ingress.yaml\n- configmap.yaml\n- etc."]
    end
    
    subgraph infraStructure["Infrastructure Repository Structure"]
        direction TB
        ArgoApps["argocd/\n- applications/\n  - app1.yaml\n  - app2.yaml\n- projects/\n  - project1.yaml"]
        ClusterConfig["cluster/\n- namespaces.yaml\n- quotas.yaml\n- networking.yaml"]
        Automation["automation/\n- scripts\n- CI/CD pipelines"]
    end
    
    subgraph configStructure["Config Values Repository Structure"]
        direction TB
        Customers["customers/\n- bankA/\n  - product1/\n    - dev/\n      - values.yaml\n      - secrets.yaml\n    - staging/\n    - prod/\n  - product2/\n- bankB/"]
    end
    
    %% Connections with better visibility
    AppRepo ===>|referenced by| HelmRepo
    HelmRepo ===>|packages| OCI
    
    AppRepo -.-> appStructure
    HelmRepo -.-> helmStructure
    InfraRepo -.-> infraStructure
    ConfigRepo -.-> configStructure
    
    %% Extra connections showing the flow
    ArgoApps ===>|references| OCI
    ArgoApps ===>|references| Customers
    
    %% Define styles with better contrast
    classDef dev fill:#0066cc,stroke:#003366,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef devops fill:#009933,stroke:#006622,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef ops fill:#cc6600,stroke:#993300,stroke-width:2px,color:#ffffff,font-weight:bold
    classDef structure fill:#f0f0f0,stroke:#444444,stroke-width:2px,color:#333333,font-weight:bold
    classDef fileContent fill:#ffffff,stroke:#555555,stroke-width:1px,color:#000000
    
    class AppRepo,HelmRepo dev
    class appStructure,helmStructure structure
    class AppCode,HelmRoot,HelmTemplates fileContent
    
    class InfraRepo devops
    class infraStructure structure
    class ArgoApps,ClusterConfig,Automation fileContent
    
    class ConfigRepo ops
    class configStructure structure
    class Customers fileContent
    
    class OCI devops
    
    %% Structure labels styling
    style appStructure fill:#e6eeff,stroke:#0066cc,color:#003366,stroke-width:2px
    style helmStructure fill:#e6eeff,stroke:#0066cc,color:#003366,stroke-width:2px
    style infraStructure fill:#e6ffe6,stroke:#009933,color:#006622,stroke-width:2px
    style configStructure fill:#ffe6cc,stroke:#cc6600,color:#993300,stroke-width:2px
```

3. **Deployment Sequence Diagram**:

```mermaid
sequenceDiagram
    participant Dev as Developer Team
    participant DevOps as DevOps/Platform Team
    participant Ops as Ops/Support Team
    participant Git as Git Repositories
    participant OCI as OCI Registry
    participant ArgoCD as ArgoCD
    participant Vault as HashiCorp Vault
    participant K8s as Kubernetes Cluster
    
    %% Initial setup
    Note over Dev,Ops: One-time setup
    Dev->>Git: Create Helm Chart repository
    DevOps->>Git: Create Infrastructure repository
    DevOps->>K8s: Install ArgoCD
    DevOps->>K8s: Setup HashiCorp Vault
    DevOps->>Git: Create ArgoCD application manifests
    Ops->>Git: Create Config Values repository structure
    
    %% Regular deployment flow
    Note over Dev,Ops: Regular deployment flow
    Dev->>Git: Push code changes to App repo
    activate Dev
    Dev->>Git: Update Helm Chart in Helm repo
    Dev->>OCI: Package & push Helm chart to OCI registry
    deactivate Dev
    
    Note over Ops: For each environment deployment
    Ops->>Git: Update values.yaml and/or secrets.yaml for environment
    activate Ops
    Ops->>Vault: Update secrets in HashiCorp Vault (optional)
    Ops->>ArgoCD: Trigger sync (manual or scheduled)
    deactivate Ops
    
    ArgoCD->>Git: Pull ArgoCD application manifest
    activate ArgoCD
    ArgoCD->>OCI: Pull Helm chart package
    ArgoCD->>Git: Pull environment-specific values
    ArgoCD->>Vault: Retrieve secrets
    ArgoCD->>K8s: Apply Kubernetes resources
    K8s-->>ArgoCD: Deployment status
    ArgoCD-->>Ops: Sync result
    deactivate ArgoCD
    
    Ops->>K8s: Monitor deployment
    
    %% Rollback scenario
    Note over Ops: Rollback scenario (if needed)
    Ops->>Git: Revert values to previous version
    Ops->>ArgoCD: Trigger sync with previous version
    
    ArgoCD->>Git: Pull rollback values
    ArgoCD->>K8s: Apply rollback
```
