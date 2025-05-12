"use client"

import React from "react"

import { useState } from "react"
import K8sContextSelector from "./K8sContextSelector"
import NamespaceSelector from "./NamespaceSelector"
import GitRepositorySelector from "./GitRepositorySelector"
import HelmRepositorySelector from "./HelmRepositorySelector"
import ArgoApplicationSelector from "./ArgoApplicationSelector"
import type {
  K8sContext,
  GitRepository,
  HelmRepository,
  ArgoApplication,
  IntegrationContext,
} from "../../services/types"
import "./IntegrationSetup.css"

interface IntegrationSetupProps {
  onComplete: (integrationContext: IntegrationContext) => void
}

const IntegrationSetup: React.FC<IntegrationSetupProps> = ({ onComplete }) => {
  const [k8sContext, setK8sContext] = useState<K8sContext | null>(null)
  const [namespace, setNamespace] = useState<string>("")
  const [gitRepo, setGitRepo] = useState<GitRepository | null>(null)
  const [helmRepo, setHelmRepo] = useState<HelmRepository | null>(null)
  const [argoApp, setArgoApp] = useState<ArgoApplication | null>(null)
  const [activeTab, setActiveTab] = useState<"k8s" | "git" | "helm" | "argo">("k8s")

  const handleComplete = () => {
    const integrationContext: IntegrationContext = {
      k8sContext: k8sContext || undefined,
      namespace: namespace || undefined,
      gitRepo: gitRepo || undefined,
      helmRepo: helmRepo || undefined,
      argoApplication: argoApp || undefined,
    }

    onComplete(integrationContext)
  }

  return (
    <div className="integration-setup">
      <h2 className="integration-setup-title">Integration Setup</h2>
      <p className="integration-setup-description">Configure integrations with Kubernetes, Git, and ArgoCD.</p>

      <div className="integration-setup-content">
        <div className="helm-editor-container">
          <div className="context-bar">
            <div className="context-info">
              <div className="context-item">
                <strong>Integration Setup</strong>
              </div>
            </div>
          </div>

          <div className="integration-setup-layout">
            <div className="integration-tabs">
              <button
                className={`integration-tab ${activeTab === "k8s" ? "active" : ""}`}
                onClick={() => setActiveTab("k8s")}
              >
                Kubernetes
              </button>
              <button
                className={`integration-tab ${activeTab === "git" ? "active" : ""}`}
                onClick={() => setActiveTab("git")}
              >
                Git Repository
              </button>
              <button
                className={`integration-tab ${activeTab === "helm" ? "active" : ""}`}
                onClick={() => setActiveTab("helm")}
              >
                Helm Repository
              </button>
              <button
                className={`integration-tab ${activeTab === "argo" ? "active" : ""}`}
                onClick={() => setActiveTab("argo")}
              >
                ArgoCD
              </button>
            </div>

            <div className="integration-content">
              {activeTab === "k8s" && (
                <div className="integration-section">
                  <h2 className="form-title">Kubernetes Configuration</h2>
                  <p className="form-description">
                    Connect to your Kubernetes cluster and select the namespace where your application will be deployed.
                  </p>

                  <div className="form-section">
                    <K8sContextSelector onContextChange={setK8sContext} />
                    {k8sContext && <NamespaceSelector k8sContext={k8sContext} onNamespaceChange={setNamespace} />}
                  </div>
                </div>
              )}

              {activeTab === "git" && (
                <div className="integration-section">
                  <h2 className="form-title">Git Repository</h2>
                  <p className="form-description">
                    Connect to a Git repository containing your Helm charts or application manifests.
                  </p>

                  <GitRepositorySelector onRepositoryChange={setGitRepo} />
                </div>
              )}

              {activeTab === "helm" && (
                <div className="integration-section">
                  <h2 className="form-title">Helm Repository</h2>
                  <p className="form-description">
                    Configure a Helm repository to pull charts from. Supports both OCI registries and HTTP repositories.
                  </p>

                  <HelmRepositorySelector onRepositoryChange={setHelmRepo} />
                </div>
              )}

              {activeTab === "argo" && (
                <div className="integration-section">
                  <h2 className="form-title">ArgoCD Integration</h2>
                  <p className="form-description">
                    Connect to ArgoCD to manage your application deployments using GitOps principles.
                  </p>

                  <ArgoApplicationSelector
                    k8sContext={k8sContext}
                    namespace={namespace}
                    onApplicationChange={setArgoApp}
                  />
                </div>
              )}
            </div>

            <div className="integration-summary">
              <h3>Integration Summary</h3>
              <div className="summary-items">
                {k8sContext && (
                  <div className="summary-item">
                    <span className="summary-label">Kubernetes:</span>
                    <span className="summary-value">
                      {k8sContext.name} / {namespace}
                    </span>
                  </div>
                )}

                {gitRepo && (
                  <div className="summary-item">
                    <span className="summary-label">Git Repository:</span>
                    <span className="summary-value">
                      {gitRepo.url} ({gitRepo.branch})
                    </span>
                  </div>
                )}

                {helmRepo && (
                  <div className="summary-item">
                    <span className="summary-label">Helm Repository:</span>
                    <span className="summary-value">
                      {helmRepo.name} ({helmRepo.type})
                    </span>
                  </div>
                )}

                {argoApp && (
                  <div className="summary-item">
                    <span className="summary-label">ArgoCD App:</span>
                    <span className="summary-value">
                      {argoApp.name} ({argoApp.status})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="integration-actions">
              <button className="submit-btn" onClick={handleComplete} disabled={!k8sContext || !namespace}>
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        className="integration-setup-button"
        onClick={() =>
          onComplete({
            k8sContext: k8sContext || undefined,
            namespace: namespace || undefined,
            gitRepo: gitRepo || undefined,
            helmRepo: helmRepo || undefined,
            argoApplication: argoApp || undefined,
          })
        }
      >
        Complete Setup
      </button>
    </div>
  )
}

export default IntegrationSetup
