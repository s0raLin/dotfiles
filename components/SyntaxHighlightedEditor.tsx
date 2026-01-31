import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Shield } from 'lucide-react';

interface SyntaxHighlightedEditorProps {
  content: string;
  language: string;
  onContentChange: (content: string) => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const SyntaxHighlightedEditor: React.FC<SyntaxHighlightedEditorProps> = ({
  content,
  language,
  onContentChange,
  isReadOnly = false,
  onSave,
  onUndo,
  onRedo
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // 处理内容，确保行尾一致性
  const processedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  useEffect(() => {
    const lines = processedContent.split('\n').length;
    setLineCount(lines);
  }, [processedContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isReadOnly) {
      onContentChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;

    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }

    // Ctrl+Z 撤销
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      onUndo?.();
      return;
    }

    // Ctrl+Shift+Z 或 Ctrl+Y 重做
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      onRedo?.();
      return;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = e.currentTarget.scrollTop;
      highlighterRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // 语言映射
  const getLanguageForHighlighter = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'bash': 'bash',
      'gitconfig': 'ini',
      'vim': 'vim',
      'lua': 'lua',
      'json': 'json',
      'yaml': 'yaml',
      'toml': 'toml',
      'text': 'text'
    };
    return languageMap[lang] || 'text';
  };

  const highlighterLanguage = getLanguageForHighlighter(language);

  // 精确的字体设置 - 确保两个元素完全一致
  const fontSettings = {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0px',
    wordSpacing: '0px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textRendering: 'optimizeSpeed' as const,
    fontKerning: 'none' as const,
    fontVariantLigatures: 'none' as const,
    fontFeatureSettings: '"liga" 0, "calt" 0',
  };

  const commonStyles = {
    ...fontSettings,
    padding: '16px',
    margin: 0,
    border: 'none',
    outline: 'none',
    tabSize: 2,
    whiteSpace: 'pre' as const,
    wordWrap: 'normal' as const,
    overflowWrap: 'normal' as const,
    boxSizing: 'border-box' as const,
  };

  return (
    <div className="flex-1 overflow-hidden flex font-mono text-sm relative bg-slate-900 h-full syntax-highlighter-editor">
      {/* Line Numbers */}
      <div className="w-12 bg-slate-800 text-slate-500 text-right pr-3 py-4 select-none border-r border-slate-700 shrink-0 overflow-hidden">
        {Array.from({ length: lineCount }, (_, i) => (
          <div 
            key={i} 
            style={{ 
              ...fontSettings,
              minHeight: '20px',
              lineHeight: '20px'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax Highlighter Background */}
        <div 
          ref={highlighterRef}
          className="absolute inset-0 overflow-auto pointer-events-none"
        >
          <SyntaxHighlighter
            language={highlighterLanguage}
            style={vscDarkPlus}
            customStyle={{
              ...commonStyles,
              background: 'transparent',
              color: '#e2e8f0',
            }}
            showLineNumbers={false}
            wrapLines={false}
            wrapLongLines={false}
            PreTag="div"
            CodeTag="div"
          >
            {processedContent}
          </SyntaxHighlighter>
        </div>

        {/* Textarea Overlay */}
        <textarea
          ref={textareaRef}
          value={processedContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={isReadOnly}
          className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-white selection:bg-blue-500/30 focus:outline-none overflow-auto"
          style={{
            ...commonStyles,
            color: 'transparent',
            caretColor: 'white',
            background: 'transparent',
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
        />

        {/* Read-only indicator */}
        {isReadOnly && (
          <div className="absolute top-2 right-2 bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs flex items-center gap-1 z-10">
            <Shield size={12} />
            只读
          </div>
        )}
      </div>
    </div>
  );
};

export default SyntaxHighlightedEditor;