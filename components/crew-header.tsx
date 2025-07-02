"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Save, Play, Download, Upload, Share2, Undo, Redo } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"

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
}: CrewHeaderProps) {

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const json = JSON.parse(text);
      setFileContent(json);
    };
    reader.readAsText(file);
  }

  React.useEffect( () => {
    if(fileContent) {
      setWorkflow(fileContent);
    }
  }, [fileContent]);

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <header
      className="h-16 border-b flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{zIndex: '999'}}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <Input
          placeholder="Untitled Flow"
          className="w-60 h-9 bg-background"
          name='workflow_name'
          value={name}
          onChange={handleInputChange}
        />
        <div className="input-wrapper flex flex-col">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  placeholder="Untitled Description"
                  className="w-60 h-9 bg-background"
                  name='workflow_description'
                  value={description}
                  onChange={handleInputChange}
                />
              </TooltipTrigger>
              <TooltipContent>Only 150 characters allowed</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" disabled={true}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" disabled={true}>
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-2" /> */}

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

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" disabled={true}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Flow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="bg-blue hover:bg-blue-dark" onClick={runWorkflow} disabled={disableRunBtn}>
          <Play /> Run
        </Button>
        <Button className="bg-blue hover:bg-blue-dark" onClick={saveWorkflow} >
          <Save /> {buttonTitle}
        </Button>
      </div>

      <SettingMenu />
    </header>
  )
}
