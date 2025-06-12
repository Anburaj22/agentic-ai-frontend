import React from "react";
import { X } from "lucide-react"
import './result-sidebar.css';
import MDEditor from '@uiw/react-md-editor';

interface ResultSidebarProps {
  isOpen: boolean
  onClose: (val: boolean) => void
  nodeId: any,
  output: any
}

const ResultSidebar = ({isOpen, onClose, nodeId, output}: ResultSidebarProps) => {

  if (!isOpen) return null

  return (
    <>
      <div className={`result-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="title-bar">
          <div className="title">
            <span>Result</span>
          </div>
          <div className="close-logo" style={{cursor: 'pointer'}}>
            <X onClick={() => onClose(false)} />
          </div>
        </div>
        <div className="response-content">
          {
            output ?
              (<MDEditor.Markdown source={output} style={{ whiteSpace: 'pre-wrap' }} />) :
              (<>Nothing to show here</>)
          }
        </div>
      </div>
    </>
  )
}
export default ResultSidebar