'use client';

import React from 'react';
import { LogOut, Settings, Sun, Moon, ArrowRightLeft, CodeXml } from 'lucide-react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import CodeModal from './code-modal';

export default function PopoverMenu() {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { logout } = useAuth()
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const [isCodeModalVisible, setIsCodeModalVisible] = React.useState<boolean>(false);
  const [currentWfId, setCurrentWfId] = React.useState<string>('');

  React.useEffect(() => setMounted(true), []);

  // Optional: close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect( () => {
    const wfId = pathname.split('/').filter( str => str )[1];
    setCurrentWfId(wfId);
  }, []);

  const openApiCodeModal = () => {
    setIsCodeModalVisible(true);
    if( currentWfId !== 'new') {
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full transition"
      >
        <Settings className="cursor-pointer spin-on-hover" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1 text-sm text-gray-700 dark:text-gray-200">
            {/* {
              (pathname !== '/workflows/new' && pathname !== '/workflows') && (
                <>
                  <button
                    className='flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800'
                    onClick={ () => openApiCodeModal()}
                  >
                    <CodeXml className='w-4 h-4 mr-2' />
                    API Access
                  </button>
                  <CodeModal isOpen={isCodeModalVisible} setIsOpen={setIsCodeModalVisible} workflowId={currentWfId} />
                </>
              )
            } */}

            {mounted && (
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className='w-4 h-4 mr-2' /> : <Moon className='w-4 h-4 mr-2' />}
                Theme
              </button>
            )}

            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
