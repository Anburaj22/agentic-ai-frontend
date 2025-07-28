"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, Trash2, Workflow, Wrench, Copy, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from 'react-toastify';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import RequireAuth from "@/components/RequireAuth"
import { deleteWorkflow, getWorkflow } from "@/services/WorkflowServices"
import PreLoader from "@/components/PreLoader"
import SettingMenu from "@/components/setting-menu"
import CloneModal from "@/components/clone-modal"

export default function WorkflowsPage() {

  const [allWorkflows, setAllWorkflows] = React.useState<any>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAdmin, setIsAdmin] = React.useState<string | null>('');
  const [showInfoIndex, setShowInfoIndex] = React.useState<number | null>();
  const [showCloneModal, setShowCloneModal] = React.useState<boolean>(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<string>('');

  React.useEffect( () => {
    getAllWorkflow();
    setIsAdmin(localStorage.getItem('is_agentic_admin'));
  }, []);

  const generateRandomColor = () => {
    const colorArr = ['orange', 'amber', 'green', 'cyan', 'blue', 'indigo'];
    const randomIndex = Math.floor(Math.random() * colorArr.length);
    const color = colorArr[randomIndex];
    return `bg-${color}-500/10 text-${color}-500`;
  }

  const getAllWorkflow = () => {
    setIsLoading(true);
    getWorkflow().then((resp: any) => {
      const updatedData = resp.data.map((item: any) => ({
        ...item,
        icon: Workflow,
        color: generateRandomColor(),
        createdAt: formatDate(item.created_at),
        editedAt: formatDate(item.updated_at),
        agents: getTypeCount(item, 'agent'),
        tasks: getTypeCount(item, 'task'),
        status: 'success'
      }));
      setAllWorkflows(updatedData);
      setIsLoading(false);
    }).catch((err: any) => {
      const status = err.response.status;
      const data = err.response.data;
      const errorMessage = data.message || data.error || 'Something went wrong';
      toast.error(`Error ${status}: ${errorMessage}`);
      setIsLoading(false);
    });
  }

  const getTypeCount = (obj: any, key: any) => {
    return obj.nodes.filter((node: any) => typeof node.id === 'string' && node.id.startsWith(`${key}-`)).length;
  }

  const filteredWorkflows = allWorkflows.filter(
    (workflow: any) =>
      workflow.workflow_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  const handleDelete = (id: string) => {
    if(confirm('Confirm delete?')) {
      deleteWorkflow(id).then( (resp: any) => {
        toast.success(resp.data.message);
        getAllWorkflow();
      } ).catch( (err: any) => {
        const status = err.response.status;
        const data = err.response.data;
        const errorMessage = data.message || data.error || 'Something went wrong';
        toast.error(`Error ${status}: ${errorMessage}`);
      } );
    }
  }

  const cloneWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setShowCloneModal(true);
  }

  return (
    <RequireAuth>
      {isLoading ? (<PreLoader />) : (<></>)}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search workflows..."
                className="w-64 pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SettingMenu />
            <CloneModal
              isOpen={showCloneModal}
              manageModal={setShowCloneModal}
              selectedWorkflow={selectedWorkflowId}
              title="Clone Workflow"
              buttonLabel="Clone"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow:any, index: any) => (
            <Card className="h-full hover:border-blue hover:shadow-md relative" key={index}>
              <div className="wrapper relative">
                <CardContent className="p-4">
                  <div className="title mb-4 flex justify-between">
                    <div className="left flex gap-2 items-center w-[calc(100%_-_6%)]">
                      <div className={`rounded-md ${workflow.color} p-2`}>
                        <workflow.icon className="h-5 w-5" />
                      </div>
                      <Link
                        className="cursor-pointer font-normal text-[15px] truncate overflow-hidden whitespace-nowrap"
                        href={`/workflows/${workflow.id}`}
                        key={workflow.id}
                        title={workflow.workflow_name}
                      >
                        {workflow.workflow_name}
                      </Link>
                    </div>
                    <div className="right z-50 w-[6%]">
                      <Info
                        className={`cursor-pointer ${showInfoIndex === index  ? 'text-white' : 'text-black'} dark:text-white`}
                        size={16}
                        onMouseEnter={() => setShowInfoIndex(index)}
                        onMouseLeave={() => setShowInfoIndex(null)}
                      />
                    </div>
                  </div>
                  <p
                    className="text-xs text-muted-foreground mb-4 description"
                    style={{
                      maxHeight: 'calc(1em * 5)',
                      height: 'calc(1em * 5)'
                    }}
                  >
                    {workflow.workflow_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="flex items-center gap-1 font-thin">
                        <Users className="h-3 w-3" />
                        <span>{workflow.agents} Agents</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 font-thin">
                        <Wrench className="h-3 w-3" />
                        <span>{workflow.tasks} Tasks</span>
                      </Badge>
                    </div>
                    <div className="icon-group flex gap-2">
                      <Copy className="cursor-pointer" size={16} onClick={() => cloneWorkflow(workflow.id)}></Copy>
                      {isAdmin === 'true' && (<Trash2 className="cursor-pointer" size={16} onClick={ () => handleDelete(workflow.id)} />)}
                    </div>
                  </div>
                </CardContent>
                {showInfoIndex === index && (
                  <div className="workflow-info p-4 text-sm absolute top-0 w-full h-full bg-blue text-white rounded-lg">
                    <p>
                      <span className="title font-bold">Created at: &nbsp;</span>
                      <span className="detail">{(workflow.createdAt)}</span>
                    </p>
                    <p>
                      <span className="title font-bold">Updated at: &nbsp;</span>
                      <span className="detail">{(workflow.editedAt)}</span>
                    </p>
                    <p>
                      <span className="title font-bold">Created by: &nbsp;</span>
                      <span className="detail">-</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>

          ))}
        </div>
      </div>
    </RequireAuth>
  )
}
