
import React from 'react';
import { useOS } from '../OSContext';
import { ProcessState } from '../types';

export const Dashboard: React.FC = () => {
  const { processes, events, notifications, integrityScore, ghostMode } = useOS();

  const activeProcesses = processes.filter(p => p.state === ProcessState.RUNNING);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-full overflow-hidden relative transition-opacity duration-1000 ${ghostMode ? 'opacity-40 grayscale contrast-125' : 'opacity-100'}`}>
      {/* HUD Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500 opacity-20"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500 opacity-20"></div>

      {/* Left Column: Metrics */}
      <div className="space-y-4 flex flex-col">
        <div className="border border-green-900 bg-black/60 p-3 glow-border relative">
          <div className="absolute -top-1 -left-1 text-[8px] bg-green-900 text-black px-1 font-bold">INTEGRITY_INDEX</div>
          <h3 className="text-xs uppercase text-green-500/80 mb-3 tracking-widest font-bold">Core Health</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-green-700 uppercase">System Integrity</span>
            <span className={`text-xs font-bold ${integrityScore < 70 ? 'text-amber-500' : 'text-green-400'}`}>{integrityScore.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-green-900/20 h-2 overflow-hidden border border-green-900/30">
            <div 
              className={`h-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,255,65,0.5)] ${integrityScore < 50 ? 'bg-red-500' : integrityScore < 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${integrityScore}%` }}
            ></div>
          </div>
          
          <div className="mt-4 grid grid-cols-5 gap-2">
            {processes.map((p) => (
              <div 
                key={p.id} 
                title={`${p.name}: ${p.state}`}
                className={`h-6 border border-green-900/40 relative group ${
                  p.state === ProcessState.FAILED ? 'bg-red-900/60 border-red-500 shadow-[0_0_5px_red]' : 
                  p.state === ProcessState.DEGRADED ? 'bg-amber-900/40 border-amber-500' :
                  p.state === ProcessState.RUNNING ? 'bg-green-500/10' : 'bg-transparent'
                }`}
              >
                {p.state === ProcessState.RUNNING && <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/90 text-[7px] p-1 pointer-events-none uppercase">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-green-900 bg-black/60 p-3 flex-1 overflow-hidden flex flex-col glow-border relative">
          <div className="absolute -top-1 -left-1 text-[8px] bg-green-900 text-black px-1 font-bold">CRIT_BUFFER</div>
          <h3 className="text-xs uppercase text-green-500/80 mb-3 tracking-widest font-bold">Fault History</h3>
          <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-[9px] text-green-900/40 italic py-2">No active hardware faults.</div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="text-[10px] border-l-2 border-amber-600 pl-3 py-1 bg-amber-950/10 mb-1 leading-tight">
                  <span className="text-amber-500 opacity-80 uppercase font-black block text-[8px] mb-0.5">Alert detected:</span>
                  {n}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panels: Events */}
      <div className="md:col-span-2 border border-green-900 bg-black/60 p-3 flex flex-col overflow-hidden glow-border relative">
        <div className="absolute -top-1 -left-1 text-[8px] bg-green-900 text-black px-1 font-bold">NEURAL_BUS_V4</div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase text-green-500/80 tracking-widest font-bold">Bus Transmission</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
               <span className="text-[9px] text-green-700 font-bold uppercase">Sync Stable</span>
            </div>
            <div className="text-[9px] text-green-900 font-bold">{events.length} PKTS</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar text-[10px] leading-tight">
          {events.slice().reverse().map(e => (
            <div key={e.id} className="group flex gap-3 items-center py-1 border-b border-green-900/10 hover:bg-green-500/5">
              <span className="text-green-900/60 shrink-0 font-mono text-[9px] w-14">[{new Date(e.timestamp).toLocaleTimeString([], { hour12: false, minute:'2-digit', second:'2-digit' })}]</span>
              <span className={`shrink-0 uppercase font-black px-1 min-w-[70px] text-center ${
                e.severity === 'critical' ? 'bg-red-950 text-red-400' : 
                e.severity === 'high' ? 'text-amber-500' : 
                e.severity === 'medium' ? 'text-green-400' : 'text-green-900'
              }`}>
                {e.type.slice(0, 15)}
              </span>
              <span className="text-green-200/60 truncate flex-1 font-mono tracking-tighter">{JSON.stringify(e.payload)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
