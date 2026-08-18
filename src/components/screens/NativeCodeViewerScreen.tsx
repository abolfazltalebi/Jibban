import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, FileCode, Shield } from 'lucide-react';
import { ANDROID_NATIVE_FILES } from '../../nativeCode/androidCode';

export const NativeCodeViewerScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState(ANDROID_NATIVE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 pb-24 text-[#e4e4e7]">
      {/* Header (Sophisticated Dark) */}
      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 space-y-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/15 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#fafafa]">کدهای Native اندروید (React Native CLI)</h3>
            <p className="text-[11px] text-zinc-500">
              ماژول‌های BroadcastReceiver و Notifee جهت استخراج پیامک در پس‌زمینه
            </p>
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ANDROID_NATIVE_FILES.map((file) => (
          <button
            key={file.fileName}
            onClick={() => setSelectedFile(file)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border cursor-pointer ${
              selectedFile.fileName === file.fileName
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
            }`}
          >
            {file.fileName}
          </button>
        ))}
      </div>

      {/* Code Container */}
      <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Top toolbar */}
        <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-zinc-300 font-bold">{selectedFile.path}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-700 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی کد'}</span>
          </button>
        </div>

        {/* Description */}
        <div className="p-3 bg-zinc-900/50 border-b border-zinc-800/80 text-xs text-zinc-400 leading-relaxed">
          {selectedFile.description}
        </div>

        {/* Code body */}
        <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[500px] select-all bg-zinc-950">
          <code>{selectedFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
