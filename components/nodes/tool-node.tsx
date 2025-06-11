"use client"

import type React from "react"
import { useCallback, useEffect, useState, memo } from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { Wrench, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { getTools } from "@/services/ToolsServices";

function ToolNodeComponent({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow()

  const [isOpen, setIsOpen] = useState(false)
  const [toolName, setToolName] = useState(data?.tool_name || "New Tool")
  const [allTools, setAllTools] = useState<any[]>([])
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [schema, setSchema] = useState<any>({})

  // Complete node data including dynamic fields
  const [nodeData, setNodeData] = useState<{ [key: string]: any }>({
    tool_name: data?.tool_name || "",
    tool_description: data?.tool_description || "",
    tool_class_name: data?.tool_class_name || "",
    // Dynamic fields will be added here
    ...data,
  })

  // Initialize data from props
  useEffect(() => {
    if (data) {
      setNodeData((prevData) => ({
        ...prevData,
        ...data,
      }))

      if (data.tool_name) {
        setToolName(data.tool_name)
      }
    }
  }, [data])

  // Fetch all tools on mount
  useEffect(() => {
    getTools()
      .then((tools) => {
        setAllTools(tools)

        // If we have a tool_name in data, find and set the selected tool
        if (data?.tool_name) {
          const tool = tools.find((t: any) => t.original_id === data.tool_name)
          if (tool) {
            setSelectedTool(tool)
            setSchema(tool.parameters_schema || {})
          }
        }
      })
      .catch(console.error)
  }, [data?.tool_name])

  // Debounced update function
  const debouncedUpdate = useCallback(
    (updatedData: any) => {
      const timeoutId = setTimeout(() => {
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              const event = new CustomEvent("tool-node-updated", {
                detail: {
                  id,
                  data: updatedData,
                  position: node.position,
                },
              })
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
      }, 100) // 100ms debounce

      return () => clearTimeout(timeoutId)
    },
    [id, setNodes],
  )

  const handleChange = useCallback(
    (e: any) => {

      const selected_tool_id = e.target.value;

      /** Find selected tools in all tools to save an extra API call */
      const tool = allTools.find((t) => t.original_id === selected_tool_id)
      if (!tool) return

      /** Set name of tool to show as card title */
      setToolName(tool.name);

      /** set selected tool in state for further use */
      setSelectedTool(tool)
      setSchema(tool.parameters_schema || {})

      /** Reset dynamic field values when changing tools */
      const newNodeData = {
        tool_name: selected_tool_id,
        tool_description: tool.description,
        tool_class_name: tool.class_name,
      }

      /** Initialize dynamic fields with default values */
      if (tool.parameters_schema) {
        Object.entries(tool.parameters_schema).forEach(([fieldName, config]: [string, any]) => {
          newNodeData[fieldName] = config.default || ""
        })
      }

      setNodeData(newNodeData)
      debouncedUpdate(newNodeData)
    },
    [allTools, debouncedUpdate],
  )

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      const updatedData = {
        ...nodeData,
        [fieldName]: value,
      }

      setNodeData(updatedData)
      debouncedUpdate(updatedData)
    },
    [nodeData, debouncedUpdate],
  )

  const renderField = useCallback(
    (fieldName: string, config: any) => {
      const fieldValue = nodeData[fieldName] || config.default || ""

      const commonProps = {
        id: `${id}-${fieldName}`,
        name: fieldName,
        required: config.required,
        placeholder: config.description || fieldName,
        value: fieldValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          handleFieldChange(fieldName, e.target.value),
      }

      const fieldType = config.type

      return (
        <div className="grid gap-1" key={fieldName}>
          {fieldType === "textarea" ? (
            <Textarea {...commonProps} className="resize-none" rows={3} placeholder={config.description} />
          ) : fieldType === "number" ? (
            <Input {...commonProps} type="number" placeholder={config.description} />
          ) : (
            <Input {...commonProps} type="text" placeholder={config.description} />
          )}
          {/* {config.description && <p className="text-xs text-muted-foreground mt-1">{config.description}</p>} */}
        </div>
      )
    },
    [id, nodeData, handleFieldChange],
  )

  return (
    <Card className="w-80 shadow-md tool-node">
      <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-500/10 text-orange-500">
            <Wrench className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{toolName}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
            Tool
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
              {/* Tool Selection */}
              <div className="grid gap-1">
                <Label className="text-xs font-medium text-muted-foreground">Select Tool</Label>
                <Select
                  value={nodeData.tool_name || ""}
                  // onValueChange={handleToolSelection}
                  onValueChange={(value) => handleChange({ target: { name: "tool_name", value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTools.map((tool) => (
                      <SelectItem key={tool.numeric_id} value={tool.original_id}>
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tool Description */}
              {selectedTool && (
                <div className="grid gap-1">
                  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{selectedTool.description}</p>
                </div>
              )}

              {/* Dynamic Fields */}
              {Object.entries(schema).length > 0 && (
                <div className="space-y-3">
                  <div className="border-t pt-3">
                    <Label className="text-xs font-medium text-muted-foreground">Parameters</Label>
                  </div>
                  {Object.entries(schema).map(([fieldName, config]) => renderField(fieldName, config))}
                </div>
              )}

              {/* No parameters message */}
              {selectedTool && Object.entries(schema).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">This tool has no configurable parameters.</p>
                </div>
              )}

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

// Memoize the component to prevent unnecessary re-renders
export const ToolNode = memo(ToolNodeComponent)
