"use client"

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import { AppSidebar } from "./app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CrewHeader } from "./crew-header"
import { AgentNode } from "./nodes/agent-node"
import { TaskNode } from "./nodes/task-node"
import { KnowledgeNode } from "./nodes/knowledge-node"
import { CrewNode } from "./nodes/crew-node"
import { ResultNode } from "./nodes/result-node"
import { ToolNode } from "./nodes/tool-node"
import { CustomEdge } from "./edges/custom-edge"
import { initialNodes, initialEdges } from "@/lib/initial-flow"

import ResultSidebar from "./result-sidebar"
import { addWorkflow, executeWorkflow, getWorkflowById } from "@/services/WorkflowServices";

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  task: TaskNode,
  knowledge: KnowledgeNode,
  crew: CrewNode,
  result: ResultNode,
  tool: ToolNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

interface FlowEditorProps {
  workflowId?: string
  showHeader?: boolean
}

interface NodeDataUpdate {
  id: string,
  data: {
    agent_name?: string,
    agent_role?: string,
    agent_goal?: string,
    agent_backstory?: string,
    agent_model?: string,
    agent_temprature?: string | number,
    agent_iteration?: string | number,
    agent_delegation?: boolean,
    agent_verbose?: boolean,
    agent_cache?: boolean,
    [key: string]: any
  },
  position: {
    x: number,
    y: number
  },
  parents?: string[],
  childs?: string[]
}

interface WorkflowType {
  workflow_name: string,
  nodes: NodeDataUpdate[]
}

function FlowEditor({ workflowId, showHeader = true }: FlowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const { project, screenToFlowPosition } = useReactFlow()
  const [workflow, setWorkflow] = useState<WorkflowType>({workflow_name: 'New Workflow', nodes: []});
  const [showResultSidebar, setShowResultSidebar] = React.useState(false);
  const [savedWorkflowId, setSavedWorkflowId] = React.useState(null);
  const [workflowName, setWorkflowName] = React.useState('');

  /** Load workflow data based on workflowId */
  useEffect(() => {
    if (workflowId) {
      /** Need to get workflow by its id */
      if( workflowId !== 'new') {
        getWorkflowById(workflowId).then( (resp: any) => {
          /** Set name of workflow */
          const updatedWorkflow = {
            ...workflow,
            workflow_name: resp.workflow_name
          };
          setWorkflow(updatedWorkflow);

          /** Parse respose to get nodes */
          const generatedNodes = transformWorkflow(resp);
          setNodes(generatedNodes);
          /** Parse respose to get edged */
          const generatedEdges = generateEdgesFromNodes(resp);
          setEdges(generatedEdges);
        } ).catch( (err: any) => {
          console.log(err);
        } );
      }
    }
  }, [workflowId])

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow/type");
    const name = event.dataTransfer.getData("application/reactflow/name");
    if (!type || !reactFlowWrapper.current) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNodeId = `${type}-${Date.now()}`;
    const isResultNode = type === "result";

    const newNode = {
      id: newNodeId,
      type,
      position,
      data: {
        label: name || `New ${type}`,
        ...(isResultNode && {
          showResultSidebar,
          setShowResultSidebar,
          result_output: ""
        }),
      },
      className: `${type}-node`,
    };

    setNodes((nds) => nds.concat(newNode));

    if (isResultNode) {
      const event = new CustomEvent("result-node-updated", {
        detail: {
          id: newNodeId,
          data: { result_output: "" },
          position,
        },
      });
      document.dispatchEvent(event);
    }

  }, [screenToFlowPosition, setNodes, showResultSidebar, setShowResultSidebar]);

  /** Handle keyboard events for deleting nodes */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        /** Get selected nodes */
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length === 0)
          return

        /** Get IDs of selected nodes */
        const selectedNodeIds = selectedNodes.map((node) => node.id)

        /** Remove selected nodes */
        setNodes((nodes) => nodes.filter((node) => !selectedNodeIds.includes(node.id)))

        /** Remove edges connected to deleted nodes */
        setEdges((edges) =>
          edges.filter((edge) => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)),
        )
      }
    }

    // Add event listener
    document.addEventListener("keydown", handleKeyDown)

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [nodes, setNodes, setEdges])

  /** Handle node data updates */
  const handleNodeDataUpdate = useCallback((update: NodeDataUpdate, currentEdges: Edge[]) => {
    setWorkflow((prevWorkflow) => {
      const parents = currentEdges
        .filter(edge => edge.target === update.id)
        .map(edge => edge.source);

      const childs = currentEdges
        .filter(edge => edge.source === update.id)
        .map(edge => edge.target);

      const enrichedNode: NodeDataUpdate = {
        ...update,
        parents,
        childs,
      };

      const existingIndex = prevWorkflow.nodes.findIndex((node) => node.id === update.id);
      let updatedNodes;

      if (existingIndex !== -1) {
        updatedNodes = [...prevWorkflow.nodes];
        updatedNodes[existingIndex] = enrichedNode;
      } else {
        updatedNodes = [...prevWorkflow.nodes, enrichedNode];
      }

      return {
        ...prevWorkflow,
        nodes: updatedNodes,
      };
    });
  }, []);

  /** Listen for agent node update events */
  useEffect(() => {
    const handleAgentNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("agent-node-updated", handleAgentNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("agent-node-updated", handleAgentNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for tool node update events */
  useEffect(() => {
    const handleToolNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("tool-node-updated", handleToolNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("tool-node-updated", handleToolNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for task node update events */
  useEffect(() => {
    const handleTaskNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("task-node-updated", handleTaskNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("task-node-updated", handleTaskNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for result node upate events */
  useEffect(() => {
    const handleResultNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("result-node-updated", handleResultNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("result-node-updated", handleResultNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  useEffect(() => {
    setWorkflow((prevWorkflow) => {
      const updatedNodes = prevWorkflow.nodes.map((node) => {
        const source = edges
          .filter((e) => e.target === node.id)
          .map((e) => e.source);

        const childs = edges
          .filter((e) => e.source === node.id)
          .map((e) => e.target);

        return {
          ...node,
          source,
          childs,
        };
      });

      return {
        ...prevWorkflow,
        nodes: updatedNodes,
      };
    });
  }, [edges]);

  const saveWorkflow = () => {
    addWorkflow(workflow).then((resp: any) => {
      if(resp && resp.id) {
        alert(`workflow created successfully - ${resp.id}`);
        setSavedWorkflowId(resp.id);
      }
    }).catch((err: any) => {
      console.log(err);
    });
  }

  const runWorkflow = () => {
    let id;
    if(workflowId !== 'new') {
      id = workflowId;
    } else if(savedWorkflowId !== null) {
      id = savedWorkflowId;
    }
    if(id) {
      /** Call the api to run workflow */
      executeWorkflow(id)
    } else {
      alert('Please save the workflow first');
    }
  }

  const transformWorkflow = (workflow: any) => {
    const { nodes } = workflow;
    return nodes.map((node: any) => {
      let type = "";

      if (node.id.startsWith("agent-")) {
        type = "agent";
      } else if (node.id.startsWith("task-")) {
        type = "task";
      } else if (node.id.startsWith("tool-")) {
        type = "tool";
      } else if (node.id.startsWith("result-")) {
        type = "result";
      } else if (node.id.startsWith("crew-")) {
        type = "crew";
      } else if (node.id.startsWith("knowledge-")) {
        type = "knowledge";
      } else {
        type = "unknown";
      }

      return {
        id: node.id,
        type,
        position: node.position,
        data: {
          ...node.data, // Preserve all custom fields
          label: node.data.label || node.data.agent_name || node.data.task_name || node.data.tool_name || "Unnamed",
          ...(type === "result" && {
            showResultSidebar: true,
            setShowResultSidebar: () => {}, // optionally reuse state setter if needed
          }),
        },
        className: `${type}-node`,
      };
    });
  };

  const generateEdgesFromNodes = (workflow: any) => {
    const edges: any = [];
    workflow.nodes.forEach((node: any) => {
      if (node.childs && node.childs.length > 0) {
        node.childs.forEach((childId: any) => {
          edges.push({
            id: `e-${node.id}-${childId}`,
            source: node.id,
            target: childId,
            type: "custom",
            animated: true,
          });
        });
      }
    });

    return edges;
  }

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col h-screen">
          {showHeader && (
            <CrewHeader
              workflowData={workflow}
              saveWorkflow={saveWorkflow}
              runWorkflow={runWorkflow}
              // workflowName
              // setWorkflowName
            />
          )}
          <div className={`flex-1 ${showHeader ? "h-[calc(100vh-4rem)]" : "h-screen"}`} ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onInit={setReactFlowInstance}
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{
                type: "custom",
                animated: true,
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }} // Set default viewport
              style={{ backgroundColor: "#F7F9FB" }}
            >
              <Background gap={12} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
        <ResultSidebar isOpen={showResultSidebar} onClose={setShowResultSidebar}></ResultSidebar>
      </SidebarProvider>
    </div>
  )
}

export function CrewFlowEditor({ workflowId, showHeader = true }: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditor workflowId={workflowId} showHeader={showHeader} />
    </ReactFlowProvider>
  )
}
