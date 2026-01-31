
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings, Search, Upload, Save, User, Wifi, WifiOff, Download } from 'lucide-react';
import { apiService } from '../services/api';

const TopNavbar: React.FC = () => {
  const { state, actions } = useApp();
  const { systemInfo, isLoading, isModified, fileEditStates, activeFileId } = state;
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计算未保存文件的数量
  const unsavedFilesCount = Object.values(fileEditStates).filter(fileState => fileState.isModified).length + 
                           (isModified && activeFileId && !fileEditStates[activeFileId]?.isModified ? 1 : 0);

  // 检查后端连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/system');
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // 每30秒检查一次
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 实现搜索功能
    console.log('搜索:', searchQuery);
  };

  const handleImportConfig = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('请选择ZIP格式的配置文件');
      return;
    }

    setIsImporting(true);
    try {
      const result = await apiService.importConfigs(file);
      if (result.success) {
        alert(result.data?.message || '导入成功');
        // 刷新数据
        actions.refreshData();
      } else {
        alert('导入失败: ' + result.error);
      }
    } catch (error) {
      alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportConfig = async () => {
    setIsExporting(true);
    try {
      const blob = await apiService.exportConfigs();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linux-configs-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('配置文件导出成功');
    } catch (error) {
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyAll = async () => {
    await actions.saveAllFiles();
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">Linux 配置管理器</h2>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi size={12} className="text-green-500" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    已连接 - {systemInfo?.user}@{systemInfo?.os}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-red-500" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    连接失败 - 请检查后端服务
                  </span>
                </>
              )}
              {unsavedFilesCount > 0 && (
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 ml-2">
                  {unsavedFilesCount} 个文件未保存
                </span>
              )}
              {/* 为加载指示器预留固定空间 */}
              <div className="w-3 h-3 flex items-center justify-center">
                {isLoading && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          <a className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1" href="#">配置文件</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">备份管理</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">系统信息</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">日志</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64 text-slate-900 dark:text-slate-200" 
            placeholder="搜索配置文件..." 
            type="text"
          />
        </form>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button 
            onClick={handleImportConfig}
            disabled={isImporting || !isConnected}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">
              {isImporting ? '导入中...' : '导入配置'}
            </span>
          </button>
          <button 
            onClick={handleExportConfig}
            disabled={isExporting || !isConnected}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span className="hidden sm:inline">
              {isExporting ? '导出中...' : '导出配置'}
            </span>
          </button>
          <button 
            onClick={handleApplyAll}
            disabled={!isConnected || isLoading || unsavedFilesCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            title={unsavedFilesCount > 0 ? `保存 ${unsavedFilesCount} 个未保存的文件 (Ctrl+Shift+S)` : '没有需要保存的文件'}
          >
            <Save size={16} />
            <span className="hidden sm:inline">
              {unsavedFilesCount > 0 ? `保存全部 (${unsavedFilesCount})` : '全部应用'}
            </span>
          </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
          <User className="text-slate-600 dark:text-slate-400" size={20} />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;