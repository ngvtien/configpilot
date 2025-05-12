"use client"

import React from "react"
import { useState, useEffect } from "react"
import { ForceGraph2D } from "react-force-graph"

interface K8sResource {
  kind: string
  name: string
  namespace: string
  apiVersion: string
}

interface ResourceLink {
  source: string
  target: string
  type: string
}

interface GraphNode {
  id: string
  kind: string
  name: string
  namespace: string
  apiVersion: string
  group: string
}

interface GraphLink {
  source: string
  target: string
  type: string
}

interface ResourceVisualizationProps {
  resources: K8sResource[]
  links: ResourceLink[]
}

export const ResourceVisualization: React.FC<ResourceVisualizationProps> = ({ resources, links }) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] })

  useEffect(() => {
    // Transform resources and links into graph data
    const nodes = resources.map((resource) => ({
      id: `${resource.kind}:${resource.namespace}/${resource.name}`,
      kind: resource.kind,
      name: resource.name,
      namespace: resource.namespace,
      apiVersion: resource.apiVersion,
      group: resource.kind, // Group by resource kind
    }))

    const graphLinks = links.map((link) => ({
      source: link.source,
      target: link.target,
      type: link.type,
    }))

    setGraphData({ nodes, links: graphLinks })
  }, [resources, links])

  return (
    <div className="border rounded-md overflow-hidden" style={{ height: 600 }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node) => `${node.kind}: ${node.namespace}/${node.name}`}
        nodeColor={(node) => {
          // Color nodes by resource kind
          switch (node.kind) {
            case "Deployment":
              return "#3182ce" // blue
            case "Service":
              return "#38a169" // green
            case "ConfigMap":
              return "#dd6b20" // orange
            case "Secret":
              return "#e53e3e" // red
            case "Ingress":
              return "#805ad5" // purple
            default:
              return "#718096" // gray
          }
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        linkLabel={(link) => link.type}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2)

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1],
          )

          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = "black"
          ctx.fillText(label, node.x, node.y)
        }}
      />
    </div>
  )
}
