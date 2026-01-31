import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Save, RotateCcw, Copy, Download, FileText, Shield, AlertCircle, Undo, Redo } from 'lucide-react';
import SyntaxHighlightedEditor from './SyntaxHighlightedEditor';

const Editor: React.FC = () => {
  const { state, actions } = useApp();
  const { activeFileId, activeFileContent, files, isModified, isLoading, error, undoHistory, redoHistory } = state;
  
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const activeFile = files.find(f => f.id === activeFileId);

  const getLanguageFromFile = (fileName: string): string => {
    if (fileName.includes('bashrc') || fileName.includes('zshrc') || fileName.includes('profile')) {
      return 'bash';
    }
    if (fileName.includes('gitconfig')) {
      return 'gitconfig';
    }
    if (fileName.includes('vimrc')) {
      return 'vim';
    }
    if (fileName.includes('.lua')) {
      return 'lua';
    }
    if (fileName.includes('.json')) {
      return 'json';
    }
    return 'text';
  };

  const handleSave = async () => {
    if (activeFileId && isModified) {
      await actions.saveFile();
    }
  };

  const handleBackup = async () => {
    if (activeFileId) {
      await actions.backupFile(activeFileId);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFileContent);
      // 可以添加一个临时的成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleRevert = () => {
    actions.revertChanges();
  };

  const handleUndo = () => {
    actions.undo();
  };

  const handleRedo = () => {
    actions.redo();
  };

  // 添加全局键盘快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 只在编辑器有焦点或者没有其他输入元素有焦点时处理
      const activeElement = document.activeElement as HTMLElement;
      const isInputElement = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' ||
                           activeElement?.contentEditable === 'true';

      if (!isInputElement && activeFileId) {
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
          e.preventDefault();
          handleSave();
          return;
        }

        // Ctrl+Shift+S 保存全部
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          actions.saveAllFiles();
          return;
        }

        // Ctrl+Z 撤销
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
          return;
        }

        // Ctrl+Shift+Z 或 Ctrl+Y 重做
        if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
          e.preventDefault();
          handleRedo();
          return;
        }

        // Ctrl+Shift+R 撤销所有更改
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          e.preventDefault();
          handleRevert();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeFileId, isModified]);

  // 添加页面关闭前的提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 检查是否有任何未保存的更改
      const hasUnsavedChanges = isModified || Object.values(state.fileEditStates).some(fileState => fileState.isModified);
      
      if (hasUnsavedChanges) {
        e.preventDefault();
        return '您有未保存的更改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModified, state.fileEditStates]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (!activeFile) {
    return (
      <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">选择一个配置文件开始编辑</p>
            <p className="text-sm">从左侧边栏选择要查看或编辑的配置文件</p>
          </div>
        </div>
      </main>
    );
  }

  const language = getLanguageFromFile(activeFile.name);
  const isSystemFile = activeFile.path.startsWith('/etc/');

  return (
    <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
      {/* Error Banner */}
      {showError && error && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button 
            onClick={() => setShowError(false)}
            className="ml-auto hover:bg-red-700 px-2 py-1 rounded"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
          <FileText size={16} className="text-slate-500" />
          <span className="text-slate-500">{activeFile.path.split('/').slice(0, -1).join('/')}</span>
          <span className="text-slate-500">/</span>
          <span className="text-white font-bold">{activeFile.name}</span>
          {isModified && <span className="text-orange-400">●</span>}
          {isSystemFile && (
            <div className="flex items-center gap-1 bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs">
              <Shield size={12} />
              系统文件
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUndo}
            disabled={undoHistory.length === 0 || isLoading}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="撤销 (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button 
            onClick={handleRedo}
            disabled={redoHistory.length === 0 || isLoading}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo size={16} />
          </button>
          <button 
            onClick={handleRevert}
            disabled={isLoading}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="重置到原始状态 (Ctrl+Shift+R)"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" 
            title="复制内容"
          >
            <Copy size={16} />
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1"></div>
          <button 
            onClick={handleBackup}
            disabled={isLoading}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50" 
            title="创建备份"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={handleSave}
            disabled={!isModified || isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-2 min-w-[100px] ${
              isModified && !isLoading
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            title={isModified ? "保存到系统 (Ctrl+S)" : "无更改"}
          >
            <Save size={14} />
            <span className="whitespace-nowrap">
              {isLoading ? '保存中...' : isModified ? '保存到系统' : '已保存'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !activeFileContent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400">加载中...</div>
          </div>
        ) : (
          <SyntaxHighlightedEditor
            content={activeFileContent}
            language={language}
            onContentChange={actions.updateFileContent}
            onSave={handleSave}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isReadOnly={isSystemFile && !activeFile.path.startsWith(process.env.HOME || '~')}
          />
        )}
      </div>
      
      {/* Status Bar */}
      <div className="bg-slate-800 px-4 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>行 {activeFileContent.split('\n').length}</span>
          <span>UTF-8</span>
          <span>{language.toUpperCase()}</span>
          {activeFile.isSymlink && (
            <span className="text-purple-400">符号链接</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>文件大小: {formatFileSize(activeFile.size)}</span>
          <span>最后修改: {formatDate(activeFile.lastModified)}</span>
          {activeFile.backupExists && (
            <span className="text-green-400">有备份</span>
          )}
        </div>
      </div>
    </main>
  );
};

export default Editor;