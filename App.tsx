
import React, { useEffect, useState } from 'react';
import { OSProvider, useOS } from './OSContext';
import { BootScreen } from './components/BootScreen';
import { Dashboard } from './components/Dashboard';
import { TerminalShell } from './components/TerminalShell';
import { FileSystemView } from './components/FileSystemView';
import { CalculatorDisguise } from './components/CalculatorDisguise';
import { PlatformManager } from './components/PlatformManager';

const MainUI: React.FC = () => {
  const { booted, shadowMode, ghostMode, setBooted, toggleShadowMode, permissionContext } = useOS();
  const [activeTab, setActiveTab] = useState<'fs' | 'deploy'>('fs');

  useEffect(() => {
    const handler = () => toggleShadowMode();
    window.addEventListener('toggle-shadow', handler);
    return () => window.removeEventListener('toggle-shadow', handler);
  }, [toggleShadowMode]);

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  if (shadowMode) {
    return <CalculatorDisguise onUnlock={toggleShadowMode} />;
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-all duration-1000 ${ghostMode ? 'bg-[#000500]' : 'bg-[#020202]'} selection:bg-green-500 selection:text-black`}>
      {/* Header / Sys Bar */}
      <header className={`h-10 border-b border-green-900 flex items-center justify-between px-4 text-[10px] uppercase font-bold transition-colors ${ghostMode ? 'text-green-900 bg-black' : 'text-green-500 bg-black/80'} backdrop-blur-sm z-50`}>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${ghostMode ? 'bg-green-900' : 'bg-green-500'}`}></span>
            <span className="tracking-[0.2em]">{ghostMode ? 'GHOST_OS_ACTIVE' : 'ADIZILLA_01 [V4.5.2]'}</span>
          </div>
          {!ghostMode && (
            <div className="hidden sm:flex gap-4 text-green-900">
              <span>UPLINK: ACTIVE</span>
              <span>NODES: 12</span>
              <span>CTX: {permissionContext}</span>
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <span className={`px-2 py-0.5 border ${ghostMode ? 'border-green-950 text-green-950' : 'border-green-900 text-green-700 bg-green-900/10'}`}>
            SYS_TIME: {new Date().toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`h-[55%] border-b border-green-900 relative transition-all ${ghostMode ? 'bg-black' : ''}`}>
             {!ghostMode && <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff41 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>}
            <Dashboard />
          </div>
          <div className="flex-1">
            <TerminalShell />
          </div>
        </div>
        
        {/* Sidebar with Tabs */}
        <div className={`w-80 border-l border-green-900 hidden lg:flex flex-col transition-all ${ghostMode ? 'bg-black border-green-950' : 'bg-black/40'}`}>
          <div className="flex border-b border-green-900">
            <button 
              onClick={() => setActiveTab('fs')} 
              className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'fs' ? 'bg-green-900/30 text-green-400' : 'text-green-900 hover:text-green-700'}`}
            >
              Logical FS
            </button>
            <button 
              onClick={() => setActiveTab('deploy')} 
              className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'deploy' ? 'bg-green-900/30 text-green-400' : 'text-green-900 hover:text-green-700'}`}
            >
              Deploy Host
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'fs' ? <FileSystemView /> : <PlatformManager />}
          </div>
        </div>
      </div>

      {/* Footer / Status */}
      <footer className="h-8 bg-black border-t border-green-900 flex items-center px-4 text-[9px] text-green-900 justify-between font-bold">
        <div className="flex gap-4 items-center">
          <span className="text-green-700/50">HASH: ffe9...8a1</span>
          <span className="w-1 h-3 bg-green-900/30"></span>
          <span>COMPAT_ENGINE: {ghostMode ? 'STEALTH' : 'OPTIMAL'}</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="cursor-pointer hover:text-green-400 transition-colors border border-green-900/50 px-2 uppercase" onClick={toggleShadowMode}>[Engage Shadow_Mode]</span>
          <span className="text-green-500 uppercase tracking-widest opacity-80">{ghostMode ? 'Low Profile Enabled' : 'Integrity: Optimal'}</span>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <OSProvider>
      <MainUI />
    </OSProvider>
  );
};

export default App;
