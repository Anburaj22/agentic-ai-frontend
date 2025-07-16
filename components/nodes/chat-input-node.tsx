"use client"

import React from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { MessageSquare, ChevronDown, ChevronUp, Trash2, Copy, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface propType extends NodeProps {
  input: any
}

export function ChatInputNode({ id, data, selected, input }: propType) {

  const [isOpen, setIsOpen] = React.useState(false)
  const { setNodes } = useReactFlow();

  const [nodeData, setNodeData] = React.useState({
    chat_input: data?.chat_input ?? input ?? ''
  })

  React.useEffect(() => {
    if (data) {
      const updatedData = {
        chat_input: data?.chat_input ?? input ?? ''
      };

      setNodeData(updatedData);

      // Dispatch initial data update to workflow
      const event = new CustomEvent("chat-input-node-updated", {
        detail: {
          id,
          data: updatedData,
          position: {
            x: data?.position?.x || 0,
            y: data?.position?.y || 0
          }
        }
      });

      document.dispatchEvent(event);
    }
  }, []);


  const handleChange = (e: any) => {
    if(e.target) {
      const {name, value} = e.target;

      const updatedData = { ...nodeData, [name]: value };
      setNodeData(updatedData);

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            // Create a custom event with all the node data
            const event = new CustomEvent("chat-input-node-updated", {
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
    <Card className={`w-80 shadow-md chat-input-node node-type-chat-input`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-500/10 text-cyan-500">
            <MessageSquare className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{data.label || "Chat Input"}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20">
            Chat Input
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
            <div className="space-y-3 pt-2">
              <div className="grid gap-1">
                <Label htmlFor="input" className="text-xs font-medium text-muted-foreground">
                  Input
                </Label>
                <Input
                  id="input"
                  name="chat_input"
                  placeholder="Enter your message..."
                  value={nodeData.chat_input}
                  onChange={handleChange}
                  className="w-full nodrag"
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

      {/* Chat input typically only has outputs */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" />
    </Card>
  )
}
