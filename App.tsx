
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
        <TopNavbar />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Editor />
            <StatusBar />
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
