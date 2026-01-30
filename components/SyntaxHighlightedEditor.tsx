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
  const [lineCount, setLineCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

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
    const highlighter = document.getElementById('syntax-highlighter');
    if (highlighter) {
      highlighter.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
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

  return (
    <div className="flex-1 overflow-hidden flex font-mono text-sm leading-relaxed relative bg-slate-900 h-full">
      {/* Line Numbers */}
      <div className="w-12 bg-slate-800 text-slate-500 text-right pr-3 py-4 select-none border-r border-slate-700 shrink-0 overflow-hidden">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="min-h-[1.5rem] leading-6">{i + 1}</div>
        ))}
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax Highlighter (Background) */}
        <div 
          id="syntax-highlighter"
          className={`absolute inset-0 overflow-auto ${isEditing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          style={{ pointerEvents: 'none' }}
        >
          <SyntaxHighlighter
            language={highlighterLanguage}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '16px',
              background: 'transparent',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
            showLineNumbers={false}
            wrapLines={false}
          >
            {content}
          </SyntaxHighlighter>
        </div>

        {/* Textarea (Foreground when editing) */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={isReadOnly}
          className={`absolute inset-0 w-full h-full p-4 resize-none outline-none font-mono text-sm leading-6 whitespace-pre ${
            isEditing ? 'bg-slate-900 text-slate-300' : 'bg-transparent text-transparent caret-slate-300'
          } transition-all duration-200`}
          style={{ 
            tabSize: 2,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
          spellCheck={false}
        />

        {/* Read-only indicator */}
        {isReadOnly && (
          <div className="absolute top-2 right-2 bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs flex items-center gap-1">
            <Shield size={12} />
            只读
          </div>
        )}
      </div>
    </div>
  );
};

export default SyntaxHighlightedEditor;