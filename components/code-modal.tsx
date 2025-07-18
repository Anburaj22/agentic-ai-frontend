'use client';

import React from 'react'
import { X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface propsType {
  isOpen: boolean;
  setIsOpen: any;
  workflowId: string;
}

const CodeModal = ({isOpen, setIsOpen, workflowId}: propsType) => {

  if (!isOpen) return null


  const tabList = ['JavaScript', 'Python', 'CUrl'];
  const disabledTab = 'Disabled';

  const [dynamicPayload, setDynamicPayload] = React.useState<any>({});
  const [apiUrl, setApiUrl] = React.useState<string>(`https://dev.agentic-ai.apexon-genesys.com/workflows/${workflowId}/run`);
  const [activeTab, setActiveTab] = React.useState('JavaScript');

  React.useEffect( () => {
    const raw = localStorage.getItem('payload') || '{}';
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      setDynamicPayload(formatted);
    } catch {
      setDynamicPayload('{}');
    }
  }, []);

  const handleTabClick = (tab: string) => {
    if (tab !== disabledTab) {
      setActiveTab(tab);
    }
  };

  const closeCodeModal = () => {
    setIsOpen(false);
  }

  return (
    <>
      <div
        id="fullPageModal"
        className="h-screen fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      >
        <div className="bg-white bg-white rounded-xl relative p-2 w-3/4">
          <div className="header">
            <div className="close-btn flex justify-end">
              <X className="cursor-pointer" onClick={closeCodeModal} />
            </div>
          </div>
          <div className="body">

            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
              {tabList.map((tab, index) => (
                <li className="me-2 ${tab}" key={tab}>
                  <button
                    onClick={() => handleTabClick(tab)}
                    className={`inline-block p-4 rounded-t-lg 
                          ${
                            activeTab === tab
                              ? "text-blue-600 bg-gray-100 active dark:bg-gray-800 dark:text-blue-500"
                              : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                          }`}
                    disabled={tab !== 'JavaScript' ? true : false}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>

            <div className="panel p-4 bg-white dark:bg-gray-900">
              {activeTab === "JavaScript" && (
                <div className='panelJs'>
                  <MDEditor.Markdown
                    style={{whiteSpace: 'pre-wrap'}}
                    source={`
\`\`\`javascript
const url = '${apiUrl}';
const payload = ${dynamicPayload};
const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`
`}
                    />
                </div>
              )}
              {activeTab === "Python" && (
                <div>Python code space</div>
              )}
              {activeTab === "CUrl" && (
                <div>CUrl code space</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodeModal;