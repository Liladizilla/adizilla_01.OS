
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../OSContext';
import { ProcessState, PermissionLevel } from '../types';

export const TerminalShell: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['ADIZILLA_01 [CORE_SHELL] READY.', 'Type "help" for a list of system operations.']);
  const { processes, snapshots, integrityScore, permissionContext, dispatch, emitEvent, elevate, toggleGhostMode } = useOS();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addLog = (msg: string | string[]) => {
    if (Array.isArray(msg)) setHistory(prev => [...prev, ...msg]);
    else setHistory(prev => [...prev, msg]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const raw = input.trim();
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    setHistory(prev => [...prev, `root@adizilla:~# ${raw}`]);

    switch (cmd) {
      case 'help':
        addLog([
          'SYSTEM COMMANDS:',
          '  ps              - List active process tree',
          '  kill [id]       - Terminate process node',
          '  nodes           - System health summary',
          '  apk             - Initiate Android Build sequence',
          '  ghost           - Toggle system ghost behavior',
          '  sudo [cmd]      - Elevate permission context',
          '  snap take [msg] - Create system state snapshot',
          '  clear           - Wipe console history'
        ]);
        break;
      case 'apk':
        addLog([
          'INITIATING ANDROID BINARY BUILD...',
          'TARGET: ARM64-V8A',
          'STATUS: RUNNING (SEE DEPLOY_HOST PANEL)'
        ]);
        emitEvent('BUILD_REQUEST', 'SHELL', { platform: 'android' });
        break;
      case 'ps':
        const tree = processes.map(p => `  ${p.parentId ? ' └─ ' : ''}${p.id.padEnd(8)} | ${p.name.padEnd(14)} | ${p.state.padEnd(10)} | ${p.permission}`);
        addLog(['PROCESS_TREE:', ...tree]);
        break;
      case 'nodes':
        addLog([
          `INTEGRITY_SCORE: ${integrityScore}%`,
          `ACTIVE_NODES:    ${processes.filter(p => p.state === ProcessState.RUNNING).length}`,
          `UPLINK_STATUS:   NOMINAL`
        ]);
        break;
      case 'ghost':
        toggleGhostMode();
        addLog('Ghost mode toggled. Network behavior adjusted.');
        break;
      case 'kill':
        if (!args[0]) addLog('Usage: kill [id]');
        else dispatch({ type: 'KILL_PROCESS', payload: { id: args[0] } });
        break;
      case 'sudo':
        if (!args[0]) addLog('Usage: sudo [password]');
        else {
          const success = elevate(args[0]);
          addLog(success ? 'PERMISSION ELEVATED TO SYSTEM_LEVEL.' : 'AUTH FAILURE. LOGGING ATTEMPT.');
        }
        break;
      case 'snap':
        if (args[0] === 'take') {
          dispatch({ type: 'TAKE_SNAPSHOT', payload: args.slice(1).join(' ') || 'manual' });
        } else if (args[0] === 'restore') {
          dispatch({ type: 'ROLLBACK', payload: args[1] });
        } else {
          addLog(['SNAPSHOT_LIST:', ...snapshots.map(s => `  ${s.id} | ${s.label} | ${new Date(s.timestamp).toLocaleTimeString()}`)]);
        }
        break;
      case 'clear':
        setHistory([]);
        break;
      default:
        addLog(`COMMAND_NOT_FOUND: ${cmd}. Type "help" for options.`);
    }

    setInput('');
  };

  return (
    <div className="h-full flex flex-col font-mono text-[11px] bg-black/80 border-t border-green-900/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {history.map((line, i) => (
          <div key={i} className={`${line.includes('root@') ? 'text-green-400' : 'text-green-700/80'} whitespace-pre-wrap`}>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="flex items-center p-2 bg-black border-t border-green-900/30">
        <span className="text-green-500 mr-2 opacity-70">root@adizilla:~#</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-500"
          placeholder="input command..."
          spellCheck={false}
        />
        <div className="text-[9px] text-green-900 font-bold ml-2">CTX: {permissionContext}</div>
      </form>
    </div>
  );
};
