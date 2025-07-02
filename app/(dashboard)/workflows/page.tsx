"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, Trash2, Workflow, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from 'react-toastify';

import RequireAuth from "@/components/RequireAuth"
import { deleteWorkflow, getWorkflow } from "@/services/WorkflowServices"
import PreLoader from "@/components/PreLoader"
import SettingMenu from "@/components/setting-menu"

export default function WorkflowsPage() {

  const [allWorkflows, setAllWorkflows] = React.useState<any>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect( () => {
    getAllWorkflow();
  }, []);

  const generateRandomColor = () => {
    const colorArr = [
      'orange', 'amber', 'green', 'cyan', 'blue', 'indigo', 'purple'
    ];
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
        // color: 'bg-blue-500/10 text-blue-500',
        color: generateRandomColor(),
        lastEdited: formatDate(item.updated_at),
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

  const showStatus = (status: string) => {
    let html: any = '';
    switch(status) {
      case 'success':
        html = <span className="flex w-3 h-3 bg-green-500 rounded-full"></span>
        break;
      case 'error':
        html = <span className="flex w-3 h-3 bg-red-500 rounded-full"></span>
        break;
      case 'in_progress':
        html = <span className="flex w-3 h-3 bg-yellow-500 rounded-full"></span>
      break;
    }
    return html;
  }

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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow:any, index: any) => (
            <Card className="h-full hover:border-blue hover:shadow-md transition-all" key={index}>
              <CardContent className="p-4">
                <div className="mb-4 flex justify-between">
                  <div className="left flex items-center gap-2">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-md ${workflow.color}`}>
                      <workflow.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-normal text-[15px] max-w-[245px]">
                      <Link
                        className="cursor-pointer truncate block whitespace-nowrap overflow-hidden text-ellipsis"
                        href={`/workflows/${workflow.id}`}
                        key={workflow.id}
                        title={workflow.workflow_name}
                      >
                        {workflow.workflow_name}
                      </Link>
                    </h3>
                  </div>
                  <div className="right">
                    {/* {showStatus(workflow.status)} */}
                  </div>
                  {/* <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {workflow.lastEdited}
                  </div> */}
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
                  <Trash2 className="cursor-pointer" size={16} onClick={ () => handleDelete(workflow.id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RequireAuth>
  )
}
