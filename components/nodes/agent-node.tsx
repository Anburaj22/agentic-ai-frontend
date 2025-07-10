"use client"

import React from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { Brain, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Slider } from "../ui/slider"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"

export function AgentNode({ id, data, selected }: NodeProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [agentName, setAgentName] = React.useState(data?.agent_name || "New Agent")
  const [temperature, setTemperature] = React.useState(data?.agent_temprature || 0.5)
  const { setNodes } = useReactFlow()

  const [nodeData, setNodeData] = React.useState({
    agent_name: data?.agent_name || "",
    agent_role: data?.agent_role || "",
    agent_goal: data?.agent_goal || "",
    agent_backstory: data?.agent_backstory || "",
    agent_model: data?.agent_model || "",
    agent_temprature: data?.agent_temprature || 0.5,
    agent_iteration: data?.agent_iteration || 80,
    agent_delegation: data?.agent_delegation || false,
    agent_verbose: data?.agent_verbose || false,
    agent_cache: data?.agent_cache || false,
  })

  // Update local state when props change
  React.useEffect(() => {
    if (data) {
      setNodeData({
        agent_name: data.agent_name || nodeData.agent_name,
        agent_role: data.agent_role || nodeData.agent_role,
        agent_goal: data.agent_goal || nodeData.agent_goal,
        agent_backstory: data.agent_backstory || nodeData.agent_backstory,
        agent_model: data.agent_model || nodeData.agent_model,
        agent_temprature: data.agent_temprature || nodeData.agent_temprature,
        agent_iteration: data.agent_iteration || nodeData.agent_iteration,
        agent_delegation: data.agent_delegation || nodeData.agent_delegation,
        agent_verbose: data.agent_verbose || nodeData.agent_verbose,
        agent_cache: data.agent_cache || nodeData.agent_cache,
      })
    }
  }, [data])

  const handleChange = (e: any) => {
    if (e.target) {
      const { name, value } = e.target
      if (name === "agent_name") {
        if (value) {
          setAgentName(value)
        } else {
          setAgentName("New Agent")
        }
      }

      // Update local state
      const updatedData = { ...nodeData, [name]: value }
      setNodeData(updatedData)

      // Update the node data in the flow
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            // Create a custom event with all the node data
            const event = new CustomEvent("agent-node-updated", {
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

            return {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
              },
            }
          }
          return node
        }),
      )
    }
  }

  return (
    <Card className={`w-80 shadow-md node-type-agent`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 text-blue-500">
            <Brain className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{agentName}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            Agent
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
                  placeholder="Agent Name"
                  className="w-100 h-9 bg-background nodrag"
                  name="agent_name"
                  value={nodeData.agent_name}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-1">
                <Input
                  placeholder="Role"
                  className="w-100 h-9 bg-background nodrag"
                  name="agent_role"
                  value={nodeData.agent_role}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-1">
                <Textarea
                  placeholder="Goal"
                  className="bg-background nodrag"
                  name="agent_goal"
                  value={nodeData.agent_goal}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-1">
                <Textarea
                  placeholder="Backstory"
                  className="bg-background nodrag"
                  name="agent_backstory"
                  value={nodeData.agent_backstory}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-1">
                <Select
                  value={nodeData.agent_model || ""}
                  onValueChange={(value) => handleChange({ target: { name: "agent_model", value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">OpenAI: gpt-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">OpenAI: gpt-4o-mini</SelectItem>
                    <SelectItem value="anthropic.claude-3-sonnet-20240229-v1:0">Anthropic: Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-medium text-muted-foreground">Temprature: {temperature}</label>
                <Slider
                  className="py-4"
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  value={[Number.parseFloat(String(temperature))]}
                  onValueChange={(value) => {
                    setTemperature(value[0])
                    handleChange({
                      target: { name: "agent_temprature", value: value[0] },
                    })
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.00</span>
                  <span>1.00</span>
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-medium text-muted-foreground">Max Iterations</label>
                <Input type="number" value={nodeData.agent_iteration} name="agent_iteration" onChange={handleChange} className="nodrag" />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="allow-delegation"
                    checked={!!nodeData.agent_delegation}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: "agent_delegation",
                          value: checked ? true : false,
                        },
                      })
                    }
                  />
                  <Label htmlFor="allow-delegation">Allow delegation</Label>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="verbose"
                    checked={!!nodeData.agent_verbose}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: "agent_verbose",
                          value: checked ? true : false,
                        },
                      })
                    }
                  />
                  <Label htmlFor="verbose">Verbose</Label>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <Checkbox
                    id="cache"
                    checked={!!nodeData.agent_cache}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: "agent_cache",
                          value: checked ? true : false,
                        },
                      })
                    }
                  />
                  <Label htmlFor="cache">Cache</Label>
                </div>
              </div>

              {/* <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="icon">
                  <Copy />
                </Button>
              </div> */}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" />
    </Card>
  )
}
