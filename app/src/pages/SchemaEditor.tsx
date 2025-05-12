import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Save } from "lucide-react"
import React from "react"

const SchemaEditor = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Schema Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Left-aligned buttons */}
          <Button variant="outline" size="sm">
            <span className="sr-only">Validate</span>
            <CheckCircle className="h-4 w-4 mr-2" />
            Validate
          </Button>

          {/* Right-aligned buttons with consistent spacing */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <span className="sr-only">Reset</span>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="primary" size="sm">
              <span className="sr-only">Save</span>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Editor content */}
        <div className="border rounded-md p-4">
          {/* Your editor component here */}
          <p>Schema Editor Content Here</p>
        </div>

        {/* Bottom buttons if any */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Apply Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default SchemaEditor
