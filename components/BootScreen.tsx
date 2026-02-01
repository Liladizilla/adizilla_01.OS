
import React, { useState, useEffect } from 'react';

const BOOT_LOGS = [
  "ADIZILLA_01 [RELEASE v4.5.2-LTS]",
  "CHECKING BIOS INTEGRITY...",
  "CPU 0: AUTHENTIC GENUINE INTEL(R) @ 3.40GHZ",
  "CPU 1: AUTHENTIC GENUINE INTEL(R) @ 3.40GHZ",
  "MEMORY: 65536MB TOTAL OK",
  "USB DEVICES: 4 HID, 1 STORAGE",
  "PCIe 0: NETWORK ADAPTER [UP]",
  "PCIe 1: NEURAL INTERFACE [UP]",
  "MAPPING LOGICAL FILE SYSTEM...",
  "ATTACHING EVENT BUS [PORT 8001]...",
  "STARTING PROCESS MANAGER...",
  "CONNECTING REAL-TIME INTELLIGENCE LAYER...",
  "BOOTING CROSS-PLATFORM BRIDGE...",
  "SYSTEM INTEGRITY: 100% [OPTIMAL]",
  "WELCOME TO THE DESERT OF THE REAL."
];

export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < BOOT_LOGS.length) {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, BOOT_LOGS[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 150 + 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(onComplete, 1200);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#020202] flex items-center justify-center p-8 z-[1000]">
      <div className="w-full max-w-3xl text-[11px] font-mono leading-relaxed overflow-hidden">
        {logs.map((log, i) => (
          <div key={i} className="mb-0.5 flex">
            <span className="text-green-950 mr-4 shrink-0 font-bold">0x{i.toString(16).toUpperCase().padStart(4, '0')}</span>
            <span className={`uppercase font-bold ${log.includes('INTEGRITY') || log.includes('REAL') ? 'text-green-400' : 'text-green-700'}`}>
              {log}
            </span>
          </div>
        ))}
        {currentIndex < BOOT_LOGS.length && (
          <div className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1 shadow-[0_0_10px_#00ff41]"></div>
        )}
      </div>
    </div>
  );
};
