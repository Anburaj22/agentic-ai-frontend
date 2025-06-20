"use client"

import type React from "react"

import { Brain, BookOpen, ListTodo, BarChart3, Wrench, MessageCircle, MessageSquare } from "lucide-react"

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeName: string) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType)
    event.dataTransfer.setData("application/reactflow/name", nodeName)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="grid gap-2">
      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "agent", "New Agent")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 text-blue-500">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Agent</div>
          <div className="text-xs text-muted-foreground">AI agent with specific role</div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "tool", "New Tool")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-500/10 text-orange-500">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Tool</div>
          <div className="text-xs text-muted-foreground">Utility for specific tasks</div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "task", "New Task")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10 text-green-500">
          <ListTodo className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Task</div>
          <div className="text-xs text-muted-foreground">Work to be performed</div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "chat-input", "Chat Input")}
        style={{display: 'none'}}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-500/10 text-cyan-500">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Chat Input</div>
          <div className="text-xs text-muted-foreground">Take input from chat box</div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "chat-output", "Chat Output")}
        style={{display: 'none'}}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-500">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Chat Output</div>
          <div className="text-xs text-muted-foreground">Show output to chatbox</div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-md border border-border bg-card cursor-grab hover:border-crew hover:bg-card/80 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, "result", "New Result")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-500/10 text-amber-500">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium">Result</div>
          <div className="text-xs text-muted-foreground">Show output in sidebar</div>
        </div>
      </div>
    </div>
  )
}
