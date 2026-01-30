
import React from 'react';
import { FileText, GitBranch, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

const StatusBar: React.FC = () => {
  return (
    <div className="h-6 bg-blue-600 flex items-center px-3 justify-between text-xs font-medium text-white shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <FileText size={12} />
          <span>配置管理器</span>
        </div>
        <div className="flex items-center gap-1">
          <GitBranch size={12} />
          <span>系统配置</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">Linux</span>
        <span>Bash</span>
        <div className="flex items-center gap-1">
          <CheckCircle size={12} />
          <span>已连接</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>10 个配置文件</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
