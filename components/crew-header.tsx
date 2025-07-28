"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Save, Play, Download, Upload } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import { usePathname } from "next/navigation"

import SettingMenu from "./setting-menu"

interface CrewHeaderProps {
  workflowData?: any
  setWorkflow?: any
  setWorkflowName?: any
  setWorkflowDescription?: any
  saveWorkflow: any
  runWorkflow: any
  buttonTitle: string
  disableRunBtn: boolean
  disableUploadBtn: boolean
  setIsFileUploaded: any
}

export function CrewHeader({
  workflowData,
  setWorkflow,
  setWorkflowName,
  setWorkflowDescription,
  saveWorkflow,
  runWorkflow,
  buttonTitle,
  disableRunBtn,
  disableUploadBtn,
  setIsFileUploaded
}: CrewHeaderProps) {

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const pathname = usePathname();

  const wfType = pathname.split('/').pop();

  React.useEffect( () => {
    if (workflowData) {
      if (workflowData.workflow_name)
        setName(workflowData.workflow_name);
      if (workflowData.workflow_description)
        setDescription(workflowData.workflow_description);
    }
  }, [workflowData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if(name === 'workflow_name') {
      setName(value);
      setWorkflowName(value);
    }
    if(name === 'workflow_description') {
      if(value.length <= 150) {
        setDescription(value);
        setWorkflowDescription(value);
      }
    }
  }

  const exportWorkflow = () => {
    if(workflowData.nodes.length) {
      const fileName = `${workflowData.workflow_name}.json`;
      const jsonStr = JSON.stringify(workflowData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      toast.error('Unable to export empty workflow');
    }
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    
    if (file) {
      if( file.type === "application/json" ) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          if( text ) {
            const json = JSON.parse(text);

            const requiredKeys = ['nodes', 'workflow_name', 'workflow_description'];
            const hasAllKeys = requiredKeys.every(key => key in json);
            if(hasAllKeys) {
              setFileContent(json);
            } else {
              toast.error('Workflow schema not found');
            }
          } else {
            toast.error('Corrupt or invalid JSON file found');
          }
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a valid workflow JSON file');
      }
    } else {
      toast.error('File upload error');
    }
  }

  React.useEffect( () => {
    if(fileContent) {
      setIsFileUploaded(true);
      setWorkflow(fileContent);
    }
  }, [fileContent]);

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  }

  return (
    // className="h-16 border-b flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    <header
      className="flex justify-between border-b items-center px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{zIndex: '999'}}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        
        <Separator orientation="vertical" className="h-6" />
        
        <form className="flex gap-2" action="">
          <div className="form-group">
            <Input
              name='workflow_name'
              className="w-60 bg-background"
              value={name}
              placeholder="Workflow Name"
              onChange={handleInputChange}
            />
            {/* <p className="text-red-600 text-[10px] mt-1">Required</p> */}
          </div>
          <div className="form-group">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    name='workflow_description'
                    className="w-60 bg-background"
                    value={description}
                    placeholder="Workflow Description"
                    onChange={handleInputChange}
                  />
                </TooltipTrigger>
                <TooltipContent>Only 150 characters allowed</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* <p className="text-red-600 text-[10px] mt-1">Required</p> */}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1">
        
        {wfType !== 'new' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={exportWorkflow}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Flow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {wfType === 'new' && (
          <>
            <input className="hidden" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleUploadButtonClick} disabled={disableUploadBtn}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Import Flow
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        <Button className="bg-blue hover:bg-blue-dark" onClick={runWorkflow} disabled={disableRunBtn}>
          <Play /> Run
        </Button>
        
        <Button className="bg-blue hover:bg-blue-dark" onClick={saveWorkflow} >
          <Save /> {buttonTitle}
        </Button>
  
        <SettingMenu />
      </div>

    </header>
  )
}
