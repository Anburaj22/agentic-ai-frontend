'use client';

import React from 'react'
import { Button } from './ui/button'
import PreLoader from './PreLoader'
import { toast } from 'react-toastify';
import { executeWorkflow } from '@/services/WorkflowServices';
import MDEditor from '@uiw/react-md-editor';
import { Copy } from 'lucide-react';

interface propsType {
  isOpen: boolean
  onClose: any
  workflow: any
  workflowId: any
}

interface chatProp {
  message: string,
  from: string
}

const ChatModal = ({isOpen, onClose, workflow, workflowId}: propsType) => {

  if (!isOpen) return null

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [chat, setChat] = React.useState<chatProp[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /**
   * On init: take the value from chat-input and set it into local state
   */
  React.useEffect( () => {
    const nodes = workflow.nodes;
    nodes.forEach( (node: any) => {
      if(node.id.startsWith("chat-input-")) {
        setCurrentMessage(node.data.chat_input);
      }
    })
  }, []);
  React.useEffect(() => {
    autoScrollToBottom();
  }, [chat]);

  /**
   * Handle input field change
   */
  const handleChange = (e: any) => {
    setCurrentMessage( e.target.value );
  }
  
  /**
   * Send message method
   */
  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    if( workflowId === 'new') {
      toast.error('Please save the workflow first');
    } else {
      const newMessage: chatProp = {
        message: currentMessage,
        from: 'user',
      };
      setChat(prev => [...prev, newMessage]);
      setCurrentMessage('');
      runWorkflow(workflowId, currentMessage);
    }
  }

  /**
   * Method to run workflow in chat mode
   */
  const runWorkflow = (workflowId: string, currentMessage: string) => {
    setIsLoading(true);
    const newPayload = {} as {[key: string]: any};
    for (const item of workflow.nodes) {
      if(item.id.startsWith("tool-")) {
        if(item.data.tool_name === 'RagTool') {
          newPayload.file_name = item.data.uploaded_file || '';
          newPayload.prompt = item.data.query || '';
        }
        if(item.data.tool_name === 'PdfSearchTool') {
          newPayload.file_path = item.data.pdf_path || '';
          newPayload.prompt = item.data.query || '';
        }
      }
    }
    executeWorkflow(workflowId, newPayload).then((resp: any) => {
      const newMessage: chatProp = {
        message: resp.data.output,
        from: 'bot',
      };
      setChat(prev => [...prev, newMessage]);
      setIsLoading(false);
    }).catch((err: any) => {
      console.log(err);
      setIsLoading(false);
    });
  }

  /**
   * Copy current response
   */
  const copyCurrentResponse = (message: string) => {
    if (!navigator.clipboard) {
      toast.success('Copied successfully');
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = message;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        console.log("Copied to clipboard (fallback):", message);
      } catch (err) {
        console.error("Fallback: Copy failed", err);
      }
      document.body.removeChild(textArea);
    } else {
      navigator.clipboard.writeText(message)
        .then(() => {
          toast.success('Copied successfully');
        })
        .catch(err => {
          toast.success('Unsupported browser');
        });
    }
  };

  /**
   * Render chat every time when chat is updated
   */
  const renderChat = (value: any, index: any) => {
    return(
      <React.Fragment key={index}>
        <div className={`
          chat
          ${value.from}
          ${value.from === 'bot' ? 'self-start' : 'self-end'}
          ${value.from === 'bot' ? 'bg-blue-500' : 'bg-gray-200'}
          ${value.from === 'bot' ? 'text-white' : 'text-black'}
          px-4 py-2 rounded-2xl max-w-[70%]`
        }>
          { value.from === 'bot' ?
              <div className='bot-wrapper flex flex-col items-end gap-3'>
                <MDEditor.Markdown source={value.message} style={{ whiteSpace: 'pre-wrap', backgroundColor: '#3b82f6', color: '#fff' }}/>
                <Copy className='cursor-pointer' size={18}  onClick={() => copyCurrentResponse(value.message)} />
              </div>
            :
              value.message
          }
        </div>
      </React.Fragment>
    )
  }

  /**
   * Method to autoscroll chat area to bottom
   */
  const autoScrollToBottom = () => {
    const container = containerRef.current;
    if(container && (container.scrollHeight > container.clientHeight) ) {
      // container.scrollTop = container.scrollHeight;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  return(
    <>
      <div id="fullPageModal" className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" style={{zIndex: '999'}}>
        { isLoading ? (<PreLoader color='rose' />) : <></>}
        <div className="bg-white w-[90vw] h-[90vh] rounded-xl shadow-xl relative p-8 flex flex-col">
          
          {/* close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl">
            &times;
          </button>

          {/* Chat area */}
          <div className="chat-wrapper flex-1 overflow-y-auto flex flex-col gap-4 pr-2" ref={containerRef}>
            {chat && chat.length ? (chat.map(renderChat)) : (<></>)}
          </div>

          {/* footer area */}
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={currentMessage}
              onChange={handleChange}
              onKeyDown={(e:any)=>{
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              className="bg-blue hover:bg-blue-dark px-4 py-2 rounded-md text-white"
              disabled={currentMessage.length ? false : true}
              onClick={sendMessage}
            >
              Send
            </Button>
          </div>
        
        </div>
      </div>
    </>
  ); 
}

export default ChatModal;