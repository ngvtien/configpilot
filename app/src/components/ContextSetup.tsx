"use client"

import React from "react"
import { useState, useEffect } from "react"
import "./ContextSetup.css"

const ContextSetup = ({ formMeta, onComplete }: any) => {
  const [product, setProduct] = useState("")
  const [customer, setCustomer] = useState("")
  const [version, setVersion] = useState("")
  const [gitRepo, setGitRepo] = useState("")
  const [helmOCI, setHelmOCI] = useState("")
  const [env, setEnv] = useState("dev")

  const [formData, setFormData] = useState({
    product: "",
    customer: "",
    version: "",
    gitRepo: "",
    helmOCI: "",
    environment: "dev",
  })

  useEffect(() => {
    if (formMeta) {
      setFormData({
        product: formMeta.product || "",
        customer: formMeta.customer || "",
        version: formMeta.version || "",
        gitRepo: formMeta.gitRepo || "",
        helmOCI: formMeta.helmOCI || "",
        environment: formMeta.env || "dev",
      })
      setProduct(formMeta.product || "")
      setCustomer(formMeta.customer || "")
      setVersion(formMeta.version || "")
      setGitRepo(formMeta.gitRepo || "")
      setHelmOCI(formMeta.helmOCI || "")
      setEnv(formMeta.env || "dev")
    }
  }, [formMeta])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ product, customer, version, gitRepo, helmOCI, env })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (name === "environment") {
      setEnv(value)
    }
  }

  return (
    <div className="context-setup">
      <h2 className="context-setup-title">Context Setup</h2>
      <p className="context-setup-description">Configure the context for your Helm chart deployment.</p>

      <div className="context-setup-content">
        <div className="form-field">
          <label htmlFor="environment">Environment</label>
          <select
            id="environment"
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            className="form-select"
          >
            <option value="dev">DEV</option>
            <option value="sit">SIT</option>
            <option value="uat">UAT</option>
            <option value="prod">Prod</option>
          </select>
        </div>
      </div>

      <button className="context-setup-button" onClick={handleSubmit}>
        Continue
      </button>
    </div>
  )
}

export default ContextSetup
