"use client"

import React from "react"

import { useState } from "react"
import type { HelmRepository } from "../../services/types"

interface HelmRepositorySelectorProps {
  onRepositoryChange: (repo: HelmRepository) => void
}

const HelmRepositorySelector: React.FC<HelmRepositorySelectorProps> = ({ onRepositoryChange }) => {
  const [name, setName] = useState<string>("")
  const [url, setUrl] = useState<string>("")
  const [type, setType] = useState<"oci" | "http">("oci")
  const [requiresAuth, setRequiresAuth] = useState<boolean>(false)
  const [secretName, setSecretName] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const repo: HelmRepository = {
      name,
      url,
      type,
      credentials: requiresAuth
        ? {
            secretName: secretName || undefined,
          }
        : undefined,
    }

    onRepositoryChange(repo)
  }

  return (
    <div className="helm-repository-selector">
      <h3 className="object-title">Helm Repository</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <label className="field-label" htmlFor="repo-name">
            Repository Name
          </label>
          <div className="field-input-wrapper">
            <input
              id="repo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-helm-repo"
              required
            />
          </div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="repo-type">
            Repository Type
          </label>
          <div className="field-input-wrapper">
            <select id="repo-type" value={type} onChange={(e) => setType(e.target.value as "oci" | "http")}>
              <option value="oci">OCI Registry</option>
              <option value="http">HTTP Repository</option>
            </select>
          </div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="repo-url">
            Repository URL
          </label>
          <div className="field-input-wrapper">
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={type === "oci" ? "oci://registry.example.com/charts" : "https://charts.example.com"}
              required
            />
          </div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="requires-auth">
            Authentication
          </label>
          <div className="field-input-wrapper checkbox-container">
            <input
              id="requires-auth"
              type="checkbox"
              checked={requiresAuth}
              onChange={(e) => setRequiresAuth(e.target.checked)}
            />
            <span>Requires Authentication</span>
          </div>
        </div>

        {requiresAuth && (
          <div className="field-container">
            <label className="field-label" htmlFor="secret-name">
              Secret Name
            </label>
            <div className="field-input-wrapper">
              <input
                id="secret-name"
                type="text"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                placeholder="helm-registry-credentials"
              />
            </div>
            <div className="field-description">Name of the Kubernetes secret containing registry credentials</div>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Add Repository
        </button>
      </form>
    </div>
  )
}

export default HelmRepositorySelector
