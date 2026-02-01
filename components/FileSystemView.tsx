
import React, { useState } from 'react';
import { useOS } from '../OSContext';

const DIRECTORIES = ['/identity', '/income', '/automation', '/knowledge', '/creative', '/logs'];

export const FileSystemView: React.FC = () => {
  const { fileSystem } = useOS();
  const [selectedDir, setSelectedDir] = useState<string>(DIRECTORIES[0]);

  return (
    <div className="h-full flex border-l border-green-900 bg-black/20 text-[11px] font-mono">
      <div className="w-32 border-r border-green-900/30 py-4">
        <h4 className="px-3 mb-2 text-green-800 uppercase text-[9px]">Logical Containers</h4>
        {DIRECTORIES.map(dir => (
          <button
            key={dir}
            onClick={() => setSelectedDir(dir)}
            className={`w-full text-left px-3 py-1.5 transition-colors ${
              selectedDir === dir ? 'bg-green-900/30 text-green-400' : 'text-green-800 hover:text-green-600'
            }`}
          >
            {dir}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="mb-2 text-green-800 uppercase text-[9px]">ENTRIES in {selectedDir}</h4>
        <div className="space-y-4">
          {(fileSystem[selectedDir] || []).slice().reverse().map((entry, idx) => (
            <div key={idx} className="border border-green-900/20 p-2 bg-black/40">
              <div className="flex justify-between text-[9px] text-gray-600 mb-1">
                <span>V.{entry.version}</span>
                <span>{new Date(entry.timestamp).toISOString()}</span>
              </div>
              <div className="text-green-500 whitespace-pre-wrap break-all">
                {entry.content}
              </div>
            </div>
          ))}
          {(!fileSystem[selectedDir] || fileSystem[selectedDir].length === 0) && (
            <div className="text-gray-700 italic">No entries found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
