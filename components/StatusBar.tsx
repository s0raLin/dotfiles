
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { FileText, GitBranch, Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const StatusBar: React.FC = () => {
  const { state } = useApp();
  const { systemInfo, files, activeFileId, isModified, isLoading, error } = state;

  const activeFile = files.find(f => f.id === activeFileId);
  const modifiedFilesCount = files.filter(f => f.lastModified > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

  return (
    <div className="h-6 bg-blue-600 flex items-center px-3 justify-between text-xs font-medium text-white shrink-0 select-none">
      <div className="flex items-center gap-4">
        {activeFile && (
          <div className="flex items-center gap-1">
            <FileText size={12} />
            <span>{activeFile.name}</span>
            {isModified && <span className="text-orange-300">●</span>}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1 text-red-300">
            <AlertCircle size={12} />
            <span>错误</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">{systemInfo?.os || 'Linux'}</span>
        <span>{systemInfo?.shell?.split('/').pop() || 'Bash'}</span>
        
        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>处理中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-1 text-red-300">
            <WifiOff size={12} />
            <span>连接失败</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CheckCircle size={12} />
            <span>已连接</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>{files.length} 个配置文件</span>
        </div>
        
        {modifiedFilesCount > 0 && (
          <div className="flex items-center gap-1 text-orange-300">
            <Clock size={12} />
            <span>{modifiedFilesCount} 个最近修改</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
