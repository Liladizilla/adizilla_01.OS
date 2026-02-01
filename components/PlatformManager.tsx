
import React, { useState } from 'react';
import { useOS } from '../OSContext';

const PLATFORMS = [
  { id: 'android', label: 'ANDROID ARM64 (.apk)', icon: '📱' },
  { id: 'ios', label: 'APPLE iOS 17+ (.ipa)', icon: '🍎' },
  { id: 'windows', label: 'MS WINDOWS X64 (.exe)', icon: '🪟' },
  { id: 'linux', label: 'LINUX KERNEL 6+ (.deb)', icon: '🐧' },
  { id: 'mac', label: 'MACOS SONOMA (.dmg)', icon: '💻' }
];

export const PlatformManager: React.FC = () => {
  const { emitEvent } = useOS();
  const [packaging, setPackaging] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleDownload = (platform: string) => {
    setPackaging(platform);
    setLogs([]);
    emitEvent('PLATFORM_BUILD_INIT', 'BRIDGE_SERVICE', { platform });
    
    const buildSteps = [
      "EXTRACTING SYSTEM BLOB...",
      "COMPILING KERNEL WRAPPER...",
      "INJECTING ANDROID MANIFEST...",
      "SIGNING WITH DEBUG_KEY...",
      "OPTIMIZING DEX BYTECODE...",
      "BUILDING APK_PACKAGE..."
    ];

    buildSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${idx}] ${step}`]);
        if (idx === buildSteps.length - 1) {
          setTimeout(() => {
            setPackaging(null);
            emitEvent('PLATFORM_BUILD_READY', 'BRIDGE_SERVICE', { platform, status: 'complete' });
            alert(`ANDROID PACKAGE READY.\n\nNOTE: You can now install this directly on your device by selecting "Add to Home Screen" from your browser menu. Adizilla is configured as a standalone Android Native-Web Bridge.`);
          }, 1000);
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="h-full border-l border-green-900 bg-black/40 p-4 font-mono overflow-y-auto custom-scrollbar">
      <h3 className="text-xs font-bold text-green-700 uppercase mb-4 tracking-widest border-b border-green-900 pb-2">Deploy Host</h3>
      
      {!packaging ? (
        <div className="space-y-3">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => handleDownload(p.id)}
              className="w-full text-left p-3 border border-green-900/40 hover:border-green-400 hover:bg-green-900/10 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="opacity-50 grayscale group-hover:grayscale-0">{p.icon}</span>
                <div>
                  <div className="text-[11px] font-bold text-green-500">{p.label}</div>
                  <div className="text-[9px] text-green-900">SYSTEM ARCH: BINARY_SYNC</div>
                </div>
              </div>
              <div className="text-[9px] text-green-700 font-bold uppercase">[Deploy]</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-[10px] text-green-400 animate-pulse mb-2 uppercase font-black">Building {packaging.toUpperCase()} Image...</div>
          {logs.map((log, i) => (
            <div key={i} className="text-[9px] text-green-700 border-l border-green-900 pl-2 py-0.5">
              {log}
            </div>
          ))}
          <div className="w-full bg-green-900/20 h-1 mt-4 overflow-hidden">
             <div className="bg-green-500 h-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
        </div>
      )}

      <div className="mt-8 p-3 bg-green-900/5 border border-green-900/20 text-[9px] text-green-800 leading-relaxed italic">
        NOTE: ADIZILLA_01 leverages Progressive Web App (PWA) standards to provide an APK-equivalent experience without requiring sideloading. Once "installed," it runs in a standalone process with dedicated hardware access.
      </div>
    </div>
  );
};
