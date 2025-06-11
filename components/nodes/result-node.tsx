"use client"

import { useState } from "react"
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow"
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import React from "react"

interface ResultNodeProps extends NodeProps {
  onOpenSidebar?: (nodeId: string) => void
}

export function ResultNode({ id, data, selected, onOpenSidebar }: ResultNodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { setNodes } = useReactFlow()

  const [nodeData, setNodeData] = useState({
    result_output: data?.result_output || "",
  })

  React.useEffect(() => {
    if (data) {
      setNodeData({
        result_output: data.result_output || nodeData.result_output,
      })
    }
  }, [data])

  const handleChange = (e: any) => {
    if (e.target) {
      const { name, value } = e.target
      const updatedData = { ...nodeData, [name]: value }
      setNodeData(updatedData)

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            // Create a custom event with all the node data
            const event = new CustomEvent("result-node-updated", {
              detail: {
                id,
                data: updatedData,
                position: {
                  x: node.position.x,
                  y: node.position.y,
                },
              },
            })

            // Dispatch the event
            document.dispatchEvent(event)
            return { ...node, data: { ...node.data, ...updatedData } }
          }
          return node
        }),
      )
    }
  }

  const handleOpenSidebar = () => {
    // console.log("ResultNode: Button clicked, nodeId:", id)
    // console.log("ResultNode: onOpenSidebar prop:", onOpenSidebar)

    // Try multiple approaches to open the sidebar
    if (onOpenSidebar) {
      onOpenSidebar(id)
    } else if (data?.setShowResultSidebar) {
      data.setShowResultSidebar(true)
    } else {
      // Fallback: dispatch a custom event
      const event = new CustomEvent("open-result-sidebar", {
        detail: { nodeId: id },
      })
      document.dispatchEvent(event)
    }
  }

  return (
    <Card className={`w-80 shadow-md node-type-result`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-500/10 text-amber-500">
            <BarChart3 className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">Result</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
            Result
          </Badge>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="rounded-md p-1 hover:bg-accent">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>

      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              <div className="grid gap-1">
                <Button className="bg-crew hover:bg-crew-dark" onClick={handleOpenSidebar}>
                  Show Result
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" />
    </Card>
  )
}
