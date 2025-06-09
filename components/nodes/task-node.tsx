"use client"

import { useState } from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { ListTodo, ChevronDown, ChevronUp, Trash2, Copy, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import React from "react"

export function TaskNode({ id, data, selected }: NodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [taskName, setTaskName] = useState(data?.task_name || "New Task");
  const { setNodes } = useReactFlow();
  
  const [nodeData, setNodeData] = useState({
    task_name: data?.task_name || "",
    task_description: data?.task_description || "",
    task_expected_op: data?.task_expected_op || ""
  })

  React.useEffect(() => {
    if (data) {
      setNodeData({
        task_name: data.task_name || nodeData.task_name,
        task_description: data.task_description || nodeData.task_description,
        task_expected_op: data.task_expected_op || nodeData.task_expected_op,
      })
    }
  }, [data]);

  const handleChange = (e: any) => {
    if(e.target) {
      const {name, value} = e.target;
      if(name === 'task_name') {
        setTaskName(value);
      }
      const updatedData = { ...nodeData, [name]: value };
      setNodeData(updatedData);

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            // Create a custom event with all the node data
            const event = new CustomEvent("task-node-updated", {
              detail: {
                id,
                data: updatedData,
                position: {
                  x: node.position.x,
                  y: node.position.y
                }
              },
            })

            // Dispatch the event
            document.dispatchEvent(event)
            return {...node, data: { ...node.data, ...updatedData}}
          }
          return node
        }),
      )
    }
  }

  return (
    <Card className={`w-80 shadow-md node-type-task`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10 text-green-500">
            <ListTodo className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{taskName || data.label}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            Task
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
                <Input
                  type="text"
                  name="task_name"
                  value={nodeData.task_name}
                  placeholder="Name"
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-1">
                <Textarea
                  name="task_description"
                  value={nodeData.task_description}
                  placeholder="Description"
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-1">
                <Textarea
                  name="task_expected_op"
                  value={nodeData.task_expected_op}
                  placeholder="Expected Output"
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" />
    </Card>
  )
}
