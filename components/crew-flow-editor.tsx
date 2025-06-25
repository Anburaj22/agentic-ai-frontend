"use client"

import React from "react"

// import { useState, useCallback, useRef, useEffect } from "react"
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
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { ChatInputNode } from "./nodes/chat-input-node"
import { ChatOutputNode } from "./nodes/chat-output-node"

import ResultSidebar from "./result-sidebar"
import { addWorkflow, executeWorkflow, getWorkflowById, updateWorkflow } from "@/services/WorkflowServices";
import PreLoader from "./PreLoader"
import ChatModal from "./chat-modal"

// const nodeTypes: NodeTypes = {
//   agent: AgentNode,
//   task: TaskNode,
//   knowledge: KnowledgeNode,
//   crew: CrewNode,
//   result: ResultNode,
//   tool: ToolNode,
// }

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
  workflow_description: string,
  nodes: NodeDataUpdate[]
}

function FlowEditor({ workflowId, showHeader = true }: FlowEditorProps) {
  const router = useRouter();
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null)
  const initializedRef = React.useRef(false);

  const { project, screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)
  const [workflow, setWorkflow] = React.useState<WorkflowType>({
    workflow_name: 'New Workflow',
    workflow_description: 'A simple workflow in which agents, tasks and tools works together',
    nodes: []
  });
  const [showResultSidebar, setShowResultSidebar] = React.useState(false);
  const [savedWorkflowId, setSavedWorkflowId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [currentWorkflowName, setCurrentWorkflowName] = React.useState<string>(workflow.workflow_name);
  const [currentWorkflowDesc, setCurrentWorkflowDesc] = React.useState<string>(workflow.workflow_description);
  const [selectedResultNodeId, setSelectedResultNodeId] = React.useState<string | null>(null)
  const [resultSidebarOpen, setResultSidebarOpen] = React.useState(false)
  const [chatModalOpen, setChatModalOpen] = React.useState(false)
  const [output, setOutput] = React.useState<any>();
  const [reactFlowReady, setReactFlowReady] = React.useState(false);
  const [disableRunBtn, setDisableRunBtn] = React.useState<boolean>(false);

  /** Load workflow data based on workflowId */
  React.useEffect(() => {
    if (workflowId && workflowId !== 'new' && reactFlowReady && reactFlowInstance) {
      setIsLoading(true);
      getWorkflowById(workflowId)
        .then((resp: any) => {
          const data = resp.data;
          setWorkflow(data);
          const generatedNodes = transformWorkflow(data);
          const generatedEdges = generateEdgesFromNodes(data);

          setNodes(generatedNodes);
          setEdges(generatedEdges);

          /** Fit the viewport to ensure nodes render in the visible area */
          if (generatedNodes.length > 0) {
            setTimeout(() => {
              reactFlowInstance.fitView({ padding: 0.2 });
            }, 100);
          }
          setIsLoading(false);
        })
        .catch((err: any) => {
          const status = err.response?.status;
          const data = err.response?.data;
          const errorMessage = data?.message || data?.error || 'Something went wrong';
          toast.error(`Error ${status}: ${errorMessage}`);
          setIsLoading(false);
        });
    }
  }, [workflowId, reactFlowReady, reactFlowInstance]);
  
  /** Only works when we upload the file */
  // React.useEffect(() => {
  //   if (workflowId === 'new' && workflow.nodes.length && !initializedRef.current) {
  //     initializedRef.current = true;

  //     const generatedNodes = transformWorkflow(workflow);
  //     setNodes(generatedNodes);

  //     const generatedEdges = generateEdgesFromNodes(workflow);
  //     setEdges(generatedEdges);
  //   }
  // }, [workflowId, workflow]);

  const onConnect = React.useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onNodeClick = React.useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node.id)
  }, [])

  const onPaneClick = React.useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow/type");
    const name = event.dataTransfer.getData("application/reactflow/name");

    /** Disable run button when chat output is added to playground */
    if( type === 'chat-output')
      setDisableRunBtn(true);

    if (!type || !reactFlowWrapper.current) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNodeId = `${type}-${Date.now()}`;
    const isResultNode = type === "result";
    const isChatOutputNode = type === 'chat-output';

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
        ...(isChatOutputNode && {
          chat_output: ""
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
    if (isChatOutputNode) {
    const event = new CustomEvent("chat-output-node-updated", {
      detail: {
        id: newNodeId,
        data: { chat_output: "" },
        position,
      },
    });
    document.dispatchEvent(event);
  }

  }, [screenToFlowPosition, setNodes, showResultSidebar, setShowResultSidebar]);

  const onNodesChangeHandler = React.useCallback(
  (changes: any) => {
    onNodesChange(changes);

    const deletedNodeIds = changes
      .filter((change: any) => change.type === 'remove')
      .map((change: any) => change.id);

    if (deletedNodeIds.length > 0) {
      setWorkflow(prevWorkflow => ({
        ...prevWorkflow,
        nodes: prevWorkflow.nodes.filter(node => !deletedNodeIds.includes(node.id)),
      }));

      setEdges(prevEdges =>
        prevEdges.filter(edge =>
          !deletedNodeIds.includes(edge.source) &&
          !deletedNodeIds.includes(edge.target)
        )
      );

      // Re-enable run button if no chat-output nodes remain
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.filter(n => !deletedNodeIds.includes(n.id));

        const hasChatOutput = updatedNodes.some(n => n.type === 'chat-output');
        if (!hasChatOutput) {
          setDisableRunBtn(false);
        }

        return updatedNodes;
      });
    }
  },
  [onNodesChange, setWorkflow, setEdges, setNodes, setDisableRunBtn]
);


  /** Handle node data updates */
  const handleNodeDataUpdate = React.useCallback((update: NodeDataUpdate, currentEdges: Edge[]) => {
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
  React.useEffect(() => {
    const handleAgentNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("agent-node-updated", handleAgentNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("agent-node-updated", handleAgentNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for tool node update events */
  React.useEffect(() => {
    const handleToolNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("tool-node-updated", handleToolNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("tool-node-updated", handleToolNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for task node update events */
  React.useEffect(() => {
    const handleTaskNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("task-node-updated", handleTaskNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("task-node-updated", handleTaskNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for result node upate events */
  React.useEffect(() => {
    const handleResultNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("result-node-updated", handleResultNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("result-node-updated", handleResultNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for chat input node update event */
  React.useEffect(() => {
    const handleResultNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("chat-input-node-updated", handleResultNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("chat-input-node-updated", handleResultNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  /** Listen for chat output node update event */
  React.useEffect(() => {
    const handleResultNodeUpdated = (event: CustomEvent<NodeDataUpdate>) => {
      handleNodeDataUpdate(event.detail, edges);
    };
    document.addEventListener("chat-output-node-updated", handleResultNodeUpdated as EventListener);
    return () => {
      document.removeEventListener("chat-output-node-updated", handleResultNodeUpdated as EventListener);
    };
  }, [edges, handleNodeDataUpdate]);

  React.useEffect(() => {
    setWorkflow((prevWorkflow) => {
      const updatedNodes = prevWorkflow.nodes.map((node) => {
        const parents = edges
          .filter((e) => e.target === node.id)
          .map((e) => e.source);

        const childs = edges
          .filter((e) => e.source === node.id)
          .map((e) => e.target);

        return {
          ...node,
          parents,
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
    /** First we are checking that workflow is not empty atleast */
    if( workflow.nodes.length > 0 ) {
      setIsLoading(true);

      if(workflowId === 'new') {
        /** Saving new workflow */
        addWorkflow(workflow).then((resp: any) => {
          if(resp && resp.data.id) {
            setIsLoading(false);
            toast.success('Workflow saved successfully');
            setSavedWorkflowId(resp.data.id);
            router.push(`/workflows/${resp.data.id}`);
          }
        }).catch((err: any) => {
          setIsLoading(false);
          const status = err.response.status;
          const data = err.response.data;
          const errorMessage = data.message || data.error || 'Something went wrong';
          toast.error(`Error ${status}: ${errorMessage}`);
        });
      } else {
        /** Update existing workflow */
        if( workflowId ) {
          setIsLoading(true);
          updateWorkflow(workflowId, workflow).then( (resp) => {
            if(resp && resp.data.id) {
              toast.success('Workflow updated successfully');
            }
            setIsLoading(false);
          } ).catch( (err) => {
            setIsLoading(false);
            const status = err.response.status;
            const data = err.response.data;
            const errorMessage = data.message || data.error || 'Something went wrong';
            toast.error(`Error ${status}: ${errorMessage}`);
          } );
        }
      }
    } else {
      toast.error('Unable to save empty workflow');
    }
  }

  const setWorkflowName = (name: string) => {
    setCurrentWorkflowName(name);
    const upWf = {...workflow, workflow_name: name}
    setWorkflow( upWf );
  }

  const setWorkflowDescription = (description: string) => {
    setCurrentWorkflowDesc(description);
    const upWf = {...workflow, workflow_description: description}
    setWorkflow( upWf );
  }

  const runWorkflow = () => {
    const newPayload = {
      prompt: '',
      file_path: '',
    };
    for (const item of workflow.nodes) {
      if (item.data?.pdf_path && 'query' in item.data) {
        newPayload.prompt = item.data.query || prompt;
        newPayload.file_path = item.data.pdf_path;
        break;
      }
    }

    let id;
    if(workflowId !== 'new') {
      id = workflowId;
    } else if(savedWorkflowId !== null) {
      id = savedWorkflowId;
    }
    
    setIsLoading(true);
    if(id) {
      executeWorkflow(id, newPayload).then((resp: any)=> {
        setIsLoading(false);
        if(resp.data.status === 'success') {
          toast.success('Workflow executed successfully, open result and click on "Show Result button"');
          setOutput(resp.data.output);
        }
      }).catch( (err: any) => {
        setIsLoading(false);
        const status = err.response.status;
        const data = err.response.data;
        const errorMessage = data.message || data.error || 'Something went wrong';
        toast.error(`Error ${status}: ${errorMessage}`);
      });
    } else {
      setIsLoading(false);
      toast.error('Need to save the workflow first');
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
      } else if (node.id.startsWith("chat-input-")) {
        type = "chat-input";
      } else if(node.id.startsWith("chat-output-")) {
        type = "chat-output";
      } else {
        type = "unknown";
      }

      let label = "Unnamed";
      if (type === "chat-input") {
        label = "Chat Input";
      } else if (type === "chat-output") {
        label = "Chat Output";
      } else {
        label = node.data.label || node.data.agent_name || node.data.task_name || node.data.tool_name || "Unnamed";
      }

      return {
        id: node.id,
        type,
        position: node.position,
        data: {
          ...node.data, // Preserve all custom fields
          label,
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

  const handleOpenResultSidebar = React.useCallback(() => {
    setResultSidebarOpen(true)
  }, [])

  const handleCloseResultSidebar = React.useCallback(() => {
    setResultSidebarOpen(false)
  }, [])

  const handleOpenChatModal = React.useCallback( () => {
    setChatModalOpen(true);
  }, []);

  const handleCloseChatModal = React.useCallback( () => {
    setChatModalOpen(false);
  }, []);

  /** Memoize nodeTypes to prevent unnecessary re-renders */
  const nodeTypes: NodeTypes = React.useMemo(
    () => ({
      agent: AgentNode,
      task: TaskNode,
      knowledge: KnowledgeNode,
      crew: CrewNode,
      result: (props: any) => <ResultNode {...props} onOpenSidebar={handleOpenResultSidebar} />,
      tool: ToolNode,
      "chat-input": (props: any) => <ChatInputNode {...props} onOpenModal={handleOpenChatModal} />,
      "chat-output": (props: any) => <ChatOutputNode {...props} onOpenModal={handleOpenChatModal} />,
    }), []
  )

  /** Sync latest node positions into workflow state */
  React.useEffect(() => {
    setWorkflow(prev => {
      const updatedNodes = prev.nodes.map((storedNode) => {
        const liveNode = nodes.find(n => n.id === storedNode.id);
        if (liveNode) {
          return {
            ...storedNode,
            position: liveNode.position,
          };
        }
        return storedNode;
      });

      return {
        ...prev,
        nodes: updatedNodes,
      };
    });
  }, [nodes]);

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col h-screen" style={{overflow: 'hidden'}}>
          {showHeader && (
            <CrewHeader
              workflowData={workflow}
              setWorkflow={setWorkflow}
              setWorkflowName={setWorkflowName}
              setWorkflowDescription={setWorkflowDescription}
              saveWorkflow={saveWorkflow}
              runWorkflow={runWorkflow}
              buttonTitle={workflowId === 'new' ? 'Save' : 'Update'}
              disableRunBtn={disableRunBtn}
            />
          )}
          <div
            className={`flex-1 ${showHeader ? "h-[calc(100vh-4rem)]" : "h-screen"} outline-none`}
            ref={reactFlowWrapper}
            style={{ contain: "layout style paint" }}
          >
            {isLoading ? (<PreLoader />) : (<></>)}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeHandler}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onInit={(instance) => {
                setReactFlowInstance(instance);
                setReactFlowReady(true);
              }}
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
        <ResultSidebar
          isOpen={resultSidebarOpen}
          onClose={handleCloseResultSidebar}
          nodeId={selectedResultNodeId}
          output={output}
        />
        <ChatModal
          isOpen={chatModalOpen}
          onClose={handleCloseChatModal}
          workflow={workflow}
          workflowId={workflowId}
        />
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
