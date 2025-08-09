'use client'

import { Editor } from '@monaco-editor/react'
import { useState } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'python', 
  height = '400px' 
}: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true)

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    wordWrap: 'on' as const,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    padding: { top: 16, bottom: 16 },
    contextmenu: true,
    bracketPairColorization: {
      enabled: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showVariables: true,
      showClasses: true,
      showModules: true
    }
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading editor...</span>
          </div>
        </div>
      )}
      
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-light"
        options={editorOptions}
        onMount={() => setIsLoading(false)}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      />
    </div>
  )
} 