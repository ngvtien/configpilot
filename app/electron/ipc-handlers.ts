import { ipcMain, dialog, app } from "electron"
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import util from "util"
import yaml from "js-yaml"

const execPromise = util.promisify(exec)

// Set up IPC handlers
export function setupIpcHandlers() {
  // Get chart details (values, schema, etc.)
  ipcMain.handle("chart:getDetails", async (_, { path: chartPath }) => {
    try {
      // Read values.yaml
      const valuesPath = path.join(chartPath, "values.yaml")
      const valuesContent = await fs.readFile(valuesPath, "utf-8")

      // Read schema if it exists (values.schema.json)
      let schema = {}
      try {
        const schemaPath = path.join(chartPath, "values.schema.json")
        const schemaContent = await fs.readFile(schemaPath, "utf-8")
        schema = JSON.parse(schemaContent)
      } catch (error) {
        console.log("No schema file found or invalid schema")
      }

      // Read Chart.yaml for name
      const chartYamlPath = path.join(chartPath, "Chart.yaml")
      const chartYaml = yaml.load(await fs.readFile(chartYamlPath, "utf-8"))

      return {
        name: chartYaml.name,
        namespace: "default", // This could be stored in app settings
        values: valuesContent,
        schema,
      }
    } catch (error) {
      console.error("Error getting chart details:", error)
      throw new Error(`Failed to get chart details: ${error.message}`)
    }
  })

  // Save values
  ipcMain.handle("chart:saveValues", async (_, { chartPath, values }) => {
    try {
      const valuesPath = path.join(chartPath, "values.yaml")
      await fs.writeFile(valuesPath, values, "utf-8")
      return { success: true }
    } catch (error) {
      console.error("Error saving values:", error)
      throw new Error(`Failed to save values: ${error.message}`)
    }
  })

  // Generate Helm templates
  ipcMain.handle("helm:template", async (_, { releaseName, namespace, valuesYaml, chartPath }) => {
    try {
      // Create a temporary values file
      const tempDir = path.join(app.getPath("temp"), "helm-ui")
      await fs.mkdir(tempDir, { recursive: true })
      const tempValuesPath = path.join(tempDir, "values.yaml")
      await fs.writeFile(tempValuesPath, valuesYaml, "utf-8")

      // Run helm template command
      const { stdout } = await execPromise(
        `helm template ${releaseName} ${chartPath} --namespace ${namespace} -f ${tempValuesPath}`,
      )

      // Parse the output into separate files
      const templates = {}
      let currentFile = null
      let currentContent = ""

      for (const line of stdout.split("\n")) {
        if (line.startsWith("# Source:")) {
          // Save previous file if exists
          if (currentFile) {
            templates[currentFile] = currentContent.trim()
          }

          // Start new file
          currentFile = line.replace("# Source:", "").trim()
          currentContent = line + "\n"
        } else if (currentFile) {
          currentContent += line + "\n"
        }
      }

      // Save the last file
      if (currentFile) {
        templates[currentFile] = currentContent.trim()
      }

      return { templates }
    } catch (error) {
      console.error("Error generating templates:", error)
      throw new Error(`Failed to generate templates: ${error.message}`)
    }
  })

  // Select directory dialog
  ipcMain.handle("dialog:selectDirectory", async (_, options) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      ...options,
    })

    return result.canceled ? null : result.filePaths[0]
  })
}
