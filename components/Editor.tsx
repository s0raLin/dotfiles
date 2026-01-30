import React, { useState } from 'react';
import { SAMPLE_BASHRC, SAMPLE_GITCONFIG, COMMON_CONFIG_FILES } from '../constants';
import { Save, RotateCcw, Copy, Download, Upload, FileText } from 'lucide-react';

const SyntaxHighlightedCode: React.FC<{ content: string; language: string }> = ({ content, language }) => {
  const lines = content.split('\n');

  const highlightLine = (line: string, lang: string) => {
    let colored = line;
    
    if (lang === 'bash') {
      colored = line
        .replace(/#.*$/g, '<span class="text-green-400 italic">$&</span>') // comments
        .replace(/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|export|alias)\b/g, '<span class="text-purple-400">$1</span>') // keywords
        .replace(/"[^"]*"/g, '<span class="text-yellow-300">$&</span>') // strings
        .replace(/'[^']*'/g, '<span class="text-yellow-300">$&</span>') // strings
        .replace(/\$\w+/g, '<span class="text-blue-400">$&</span>') // variables
        .replace(/\b(echo|cd|ls|mkdir|rm|cp|mv|grep|sed|awk)\b/g, '<span class="text-cyan-400">$1</span>'); // commands
    } else if (lang === 'gitconfig') {
      colored = line
        .replace(/^\s*#.*$/g, '<span class="text-green-400 italic">$&</span>') // comments
        .replace(/^\s*\[[^\]]+\]/g, '<span class="text-purple-400">$&</span>') // sections
        .replace(/^\s*(\w+)\s*=/g, '<span class="text-blue-400">$1</span> =') // keys
        .replace(/=\s*(.+)$/g, '= <span class="text-yellow-300">$1</span>'); // values
    }

    return <span dangerouslySetInnerHTML={{ __html: colored || '&nbsp;' }} />;
  };

  return (
    <div className="flex-1 overflow-auto flex font-mono text-sm leading-relaxed relative bg-slate-900 h-full">
      {/* Line Numbers */}
      <div className="w-12 bg-slate-800 text-slate-500 text-right pr-3 py-4 select-none border-r border-slate-700 shrink-0">
        {lines.map((_, i) => (
          <div key={i} className="min-h-[1.5rem]">{i + 1}</div>
        ))}
      </div>
      {/* Code Content */}
      <div className="flex-1 p-4 text-slate-300 relative">
        <div className="whitespace-pre">
          {lines.map((line, i) => (
            <div key={i} className="min-h-[1.5rem] relative z-10">
              {highlightLine(line, language)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Editor: React.FC = () => {
  const [activeFile, setActiveFile] = useState('bashrc');
  const [isModified, setIsModified] = useState(false);

  const getFileContent = (fileId: string) => {
    switch (fileId) {
      case 'bashrc':
        return { content: SAMPLE_BASHRC, language: 'bash', name: '.bashrc', path: '~/.bashrc' };
      case 'gitconfig':
        return { content: SAMPLE_GITCONFIG, language: 'gitconfig', name: '.gitconfig', path: '~/.gitconfig' };
      default:
        const file = COMMON_CONFIG_FILES.find(f => f.id === fileId);
        return {
          content: `# ${file?.name || 'Unknown file'}\n# 配置文件内容将在这里显示\n\n# 这是一个示例配置文件`,
          language: 'text',
          name: file?.name || 'unknown',
          path: file?.path || ''
        };
    }
  };

  const currentFile = getFileContent(activeFile);

  return (
    <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2 text-sm font-mono text-slate-400">
          <FileText size={16} className="text-slate-500" />
          <span className="text-slate-500">{currentFile.path.split('/').slice(0, -1).join('/')}</span>
          <span className="text-slate-500">/</span>
          <span className="text-white font-bold">{currentFile.name}</span>
          {isModified && <span className="text-orange-400">●</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" 
            title="撤销更改"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" 
            title="复制内容"
          >
            <Copy size={16} />
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1"></div>
          <button 
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" 
            title="导出此文件"
          >
            <Download size={16} />
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-2 ${
              isModified 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            disabled={!isModified}
            onClick={() => setIsModified(false)}
            title={isModified ? "保存到系统" : "无更改"}
          >
            <Save size={14} />
            <span>{isModified ? '保存到系统' : '已保存'}</span>
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div 
        className="flex-1"
        onClick={() => !isModified && setIsModified(true)}
      >
        <SyntaxHighlightedCode 
          content={currentFile.content} 
          language={currentFile.language}
        />
      </div>
      
      {/* Status Bar */}
      <div className="bg-slate-800 px-4 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>行 1, 列 1</span>
          <span>UTF-8</span>
          <span>{currentFile.language.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>文件大小: {Math.floor(currentFile.content.length / 1024 * 100) / 100} KB</span>
          <span>最后修改: 刚刚</span>
        </div>
      </div>
    </main>
  );
};

export default Editor;