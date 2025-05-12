"use client"

import React from "react"
import { useEffect, useState } from "react"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { AlertCircle, CheckCircle } from "lucide-react"

interface SchemaValidationProps {
  schema: any
  values: any
}

export const SchemaValidation: React.FC<SchemaValidationProps> = ({ schema, values }) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isValid, setIsValid] = useState<boolean>(true)

  useEffect(() => {
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)

    try {
      const validate = ajv.compile(schema)
      const valid = validate(values)

      setIsValid(valid)
      setErrors(
        valid
          ? []
          : validate.errors?.map((err) => {
              return `${err.instancePath} ${err.message}`
            }) || [],
      )
    } catch (error) {
      setIsValid(false)
      setErrors([`Schema validation error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }, [schema, values])

  if (isValid && errors.length === 0) {
    return (
      <div className="flex items-center text-green-600 p-2 bg-green-50 rounded-md">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span>Values are valid according to the schema</span>
      </div>
    )
  }

  return (
    <div className="border border-red-200 rounded-md p-4 bg-red-50">
      <div className="flex items-center text-red-600 mb-2">
        <AlertCircle className="h-5 w-5 mr-2" />
        <h3 className="font-medium">Validation Errors</h3>
      </div>
      <ul className="list-disc pl-5 space-y-1 text-sm text-red-600">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
