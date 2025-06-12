import { X } from "lucide-react"
import './result-sidebar.css';

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
          {output ? output : ''}
        </div>
      </div>
    </>
  )
}
export default ResultSidebar