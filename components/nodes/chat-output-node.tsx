"use client"

import { useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { MessageCircle, ChevronDown, ChevronUp, Trash2, Copy, Settings, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function ChatOutputNode({ data, selected }: NodeProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className={`w-80 shadow-md chat-output-node node-type-chat-output`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-500">
            <MessageCircle className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium">{data.label || "Chat Output"}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20">
            Chat Output
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
                <div className="flex justify-center">
                  <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>
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

      {/* Chat output typically only has inputs */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" />
    </Card>
  )
}
