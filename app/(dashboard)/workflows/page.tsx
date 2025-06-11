"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FlowerIcon as FlowIcon, Search, Calendar, Users, Trash2, ChartNetwork } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from 'react-toastify';

import RequireAuth from "@/components/RequireAuth"
import { deleteWorkflow, getWorkflow } from "@/services/WorkflowServices"
import PreLoader from "@/components/PreLoader"

export default function WorkflowsPage() {

  const [allWorkflows, setAllWorkflows] = React.useState<any>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect( () => {
    getAllWorkflow();
  }, []);

  const getAllWorkflow = () => {
    setIsLoading(true);
    getWorkflow().then((resp: any) => {
      const updatedData = resp.data.map((item: any) => ({
        ...item,
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        icon: ChartNetwork,
        color: 'bg-blue-500/10 text-blue-500',
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

  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredWorkflows = allWorkflows.filter(
    (workflow: any) =>
      workflow.workflow_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()),
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
          <div className="flex items-center">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow:any, index: any) => (
            <Card className="h-full hover:border-blue hover:shadow-md transition-all" key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${workflow.color}`}>
                    <workflow.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {workflow.lastEdited}
                  </div>
                </div>
                <h3 className="text-xl font-normal mb-2">
                  <Link className="cursor-pointer" href={`/workflows/${workflow.id}`} key={workflow.id}>
                    {workflow.workflow_name}
                  </Link>
                </h3>
                <p className="text-xs text-muted-foreground mb-4">{workflow.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {showStatus(workflow.status)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{workflow.agents} Agents</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FlowIcon className="h-3 w-3" />
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
