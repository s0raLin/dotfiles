import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Shield } from 'lucide-react';

interface SyntaxHighlightedEditorProps {
  content: string;
  language: string;
  onContentChange: (content: string) => void;
  isReadOnly?: boolean;
}

const SyntaxHighlightedEditor: React.FC<SyntaxHighlightedEditorProps> = ({
  content,
  language,
  onContentChange,
  isReadOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = content.split('\n').length;
    setLineCount(lines);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isReadOnly) {
      onContentChange(e.target.value);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = e.currentTarget.scrollTop;
      highlighterRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // 语言映射，将我们的语言标识符映射到 Prism 支持的语言
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

  // 统一的样式配置
  const editorStyles = {
    fontSize: '14px',
    lineHeight: '1.5rem',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    padding: '16px',
    margin: 0,
    border: 'none',
    outline: 'none',
    tabSize: 2,
  };

  return (
    <div className="flex-1 overflow-hidden flex font-mono text-sm relative bg-slate-900 h-full">
      {/* Line Numbers */}
      <div className="w-12 bg-slate-800 text-slate-500 text-right pr-3 py-4 select-none border-r border-slate-700 shrink-0 overflow-hidden">
        {Array.from({ length: lineCount }, (_, i) => (
          <div 
            key={i} 
            style={{ 
              lineHeight: '1.5rem', 
              fontSize: '14px',
              minHeight: '1.5rem'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax Highlighter (Always visible background) */}
        <div 
          ref={highlighterRef}
          className="absolute inset-0 overflow-auto"
          style={{ pointerEvents: 'none' }}
        >
          <SyntaxHighlighter
            language={highlighterLanguage}
            style={vscDarkPlus}
            customStyle={{
              ...editorStyles,
              background: 'transparent',
            }}
            showLineNumbers={false}
            wrapLines={false}
          >
            {content}
          </SyntaxHighlighter>
        </div>

        {/* Transparent Textarea (Always on top for input) */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          readOnly={isReadOnly}
          className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-slate-300 whitespace-pre selection:bg-blue-500/40 focus:outline-none"
          style={editorStyles}
          spellCheck={false}
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