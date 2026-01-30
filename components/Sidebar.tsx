
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ConfigCategory, ConfigFile } from '../types';
import { Terminal, FileText, GitBranch, Key, Settings, Package, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

const iconMap = {
  Terminal,
  FileText,
  GitBranch,
  Key,
  Settings,
  Package
};

const CategorySection: React.FC<{
  category: ConfigCategory;
  files: ConfigFile[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
}> = ({ category, files, activeFileId, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || FileText;
  
  return (
    <div className="mb-4">
      <div 
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div className={`w-3 h-3 rounded ${category.color}`}>
          <IconComponent size={12} className="text-white m-0.5" />
        </div>
        <span className="text-sm font-medium">{category.name}</span>
        <span className="text-xs text-slate-500 ml-auto">({files.length})</span>
      </div>
      
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeFileId === file.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={14} className="text-slate-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono truncate">{file.name}</div>
                <div className="text-xs text-slate-500 truncate">{file.path}</div>
              </div>
              {file.isSymlink && (
                <div className="w-2 h-2 rounded-full bg-purple-400" title="Symbolic Link" />
              )}
              {file.backupExists && (
                <div className="w-2 h-2 rounded-full bg-green-400" title="Backup Available" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { state, actions } = useApp();
  const { categories, files, systemInfo, activeFileId, isLoading } = state;

  const handleRefresh = () => {
    actions.refreshData();
  };

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-blue-500" />
          <h2 className="text-base font-semibold">文件浏览器</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">配置文件</span>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-500">加载中...</div>
          </div>
        ) : (
          categories.map(category => {
            const categoryFiles = files.filter(file => file.category === category.id);
            return (
              <CategorySection
                key={category.id}
                category={category}
                files={categoryFiles}
                activeFileId={activeFileId}
                onFileSelect={actions.selectFile}
              />
            );
          })
        )}
      </div>

      <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">系统信息</span>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-slate-400">用户目录</p>
            <p className="text-xs font-mono truncate text-slate-600 dark:text-slate-300">
              {systemInfo?.homeDir || '~/'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Shell</p>
            <p className="text-xs font-mono truncate text-slate-600 dark:text-slate-300">
              {systemInfo?.shell || '/bin/bash'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">用户</p>
            <p className="text-xs font-mono truncate text-slate-600 dark:text-slate-300">
              {systemInfo?.user || 'user'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">配置总数</p>
            <p className="text-xs font-mono truncate text-slate-600 dark:text-slate-300">
              {files.length} 个文件
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
