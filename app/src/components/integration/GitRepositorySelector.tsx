"use client"

import React from "react"

import { useState } from "react"
import type { GitRepository } from "../../services/types"

interface GitRepositorySelectorProps {
  onRepositoryChange: (repo: GitRepository) => void
}

const GitRepositorySelector: React.FC<GitRepositorySelectorProps> = ({ onRepositoryChange }) => {
  const [repoUrl, setRepoUrl] = useState<string>("")
  const [branch, setBranch] = useState<string>("main")
  const [path, setPath] = useState<string>("")
  const [authType, setAuthType] = useState<"none" | "ssh" | "https" | "token">("none")
  const [secretName, setSecretName] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const repo: GitRepository = {
      url: repoUrl,
      branch,
      path: path || undefined,
      credentials:
        authType !== "none"
          ? {
              type: authType === "none" ? "https" : authType,
              secretName: secretName || undefined,
            }
          : undefined,
    }

    onRepositoryChange(repo)
  }

  return (
    <div className="git-repository-selector">
      <h3 className="object-title">Git Repository</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <label className="field-label" htmlFor="repo-url">
            Repository URL
          </label>
          <div className="field-input-wrapper">
            <input
              id="repo-url"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo.git"
              required
            />
          </div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="branch">
            Branch
          </label>
          <div className="field-input-wrapper">
            <input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
          </div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="path">
            Path (Optional)
          </label>
          <div className="field-input-wrapper">
            <input
              id="path"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="charts/my-app"
            />
          </div>
          <div className="field-description">Path within the repository where Helm charts are located</div>
        </div>

        <div className="field-container">
          <label className="field-label" htmlFor="auth-type">
            Authentication
          </label>
          <div className="field-input-wrapper">
            <select id="auth-type" value={authType} onChange={(e) => setAuthType(e.target.value as any)}>
              <option value="none">None (Public Repository)</option>
              <option value="ssh">SSH Key</option>
              <option value="https">Username/Password</option>
              <option value="token">Access Token</option>
            </select>
          </div>
        </div>

        {authType !== "none" && (
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
                placeholder="git-credentials"
              />
            </div>
            <div className="field-description">Name of the Kubernetes secret containing credentials</div>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Connect Repository
        </button>
      </form>
    </div>
  )
}

export default GitRepositorySelector
