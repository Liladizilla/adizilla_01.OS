
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SystemState, SystemProcess, ProcessState, SystemEvent, FileEntry, PermissionLevel, StateSnapshot } from './types';
import { intelligence } from './services/intelligenceService';

interface OSContextType extends SystemState {
  dispatch: (action: OSAction) => void;
  emitEvent: (type: string, source: string, payload: any, severity?: SystemEvent['severity']) => void;
  toggleShadowMode: () => void;
  toggleGhostMode: () => void;
  toggleWindowedMode: () => void;
  setBooted: (val: boolean) => void;
  elevate: (password: string) => boolean;
}

type OSAction = 
  | { type: 'UPDATE_PROCESS'; payload: Partial<SystemProcess> & { id: string } }
  | { type: 'KILL_PROCESS'; payload: { id: string, force?: boolean } }
  | { type: 'START_PROCESS'; payload: Omit<SystemProcess, 'id' | 'lastUpdate'> }
  | { type: 'WRITE_FILE'; payload: { path: string, content: string } }
  | { type: 'TAKE_SNAPSHOT'; payload: string }
  | { type: 'ROLLBACK'; payload: string }
  | { type: 'SET_PERMISSION'; payload: PermissionLevel };

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [booted, setBooted] = useState(false);
  const [shadowMode, setShadowMode] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [windowedMode, setWindowedMode] = useState(false);
  const [permissionContext, setPermissionContext] = useState<PermissionLevel>(PermissionLevel.USER);
  const [processes, setProcesses] = useState<SystemProcess[]>([
    { id: 'kernel', name: 'CORE_KERNEL', state: ProcessState.RUNNING, weight: 5, memory: 12, lastUpdate: Date.now(), permission: PermissionLevel.SYSTEM },
    { id: 'bus', name: 'EVENT_BUS', state: ProcessState.RUNNING, weight: 2, memory: 4, lastUpdate: Date.now(), permission: PermissionLevel.SYSTEM },
    { id: 'intel', name: 'INTEL_AUDITOR', state: ProcessState.RUNNING, weight: 15, memory: 30, lastUpdate: Date.now(), permission: PermissionLevel.DAEMON },
    { id: 'auto', name: 'AUTO_DAEMON', state: ProcessState.RUNNING, weight: 8, memory: 10, lastUpdate: Date.now(), permission: PermissionLevel.DAEMON },
  ]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [fileSystem, setFileSystem] = useState<Record<string, FileEntry[]>>({
    '/identity': [{ path: '/identity', content: 'ADIZILLA_01_ROOT', version: 1, timestamp: Date.now() }],
    '/logs': [],
    '/snapshots': []
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const [integrityScore, setIntegrityScore] = useState(100);

  const emitEvent = useCallback((type: string, source: string, payload: any, severity: SystemEvent['severity'] = 'low') => {
    const newEvent: SystemEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      source,
      payload,
      severity
    };
    setEvents(prev => [...prev.slice(-150), newEvent]);
    
    if (severity === 'critical' || severity === 'high') {
      setNotifications(prev => [`[${severity.toUpperCase()}] ${type}: ${payload.message || 'System anomaly detected'}`, ...prev.slice(0, 4)]);
    }
  }, []);

  useEffect(() => {
    const failed = processes.filter(p => p.state === ProcessState.FAILED).length;
    const degraded = processes.filter(p => p.state === ProcessState.DEGRADED).length;
    const score = Math.max(0, 100 - (failed * 15) - (degraded * 5));
    setIntegrityScore(score);

    if (score < 50) {
      emitEvent('INTEGRITY_COMPROMISED', 'WATCHDOG', { score }, 'critical');
    }
  }, [processes, emitEvent]);

  const dispatch = useCallback((action: OSAction) => {
    switch (action.type) {
      case 'UPDATE_PROCESS':
        setProcesses(prev => prev.map(p => p.id === action.payload.id ? { ...p, ...action.payload, lastUpdate: Date.now() } : p));
        break;
      case 'KILL_PROCESS':
        const target = processes.find(p => p.id === action.payload.id);
        if (target && target.permission === PermissionLevel.SYSTEM && permissionContext !== PermissionLevel.SYSTEM) {
          emitEvent('ACCESS_DENIED', 'KERNEL', { action: 'KILL', target: target.id }, 'high');
          return;
        }
        setProcesses(prev => prev.filter(p => p.id !== action.payload.id && p.parentId !== action.payload.id));
        emitEvent('PROCESS_TERMINATED', 'PROCESS_MGR', { pid: action.payload.id });
        break;
      case 'START_PROCESS':
        const newProc: SystemProcess = {
          ...action.payload,
          id: Math.random().toString(36).substr(2, 9),
          lastUpdate: Date.now()
        };
        setProcesses(prev => [...prev, newProc]);
        emitEvent('PROCESS_STARTED', 'PROCESS_MGR', { pid: newProc.id, name: newProc.name });
        break;
      case 'TAKE_SNAPSHOT':
        const snapshot: StateSnapshot = {
          id: Math.random().toString(36).substr(2, 5),
          label: action.payload,
          timestamp: Date.now(),
          processes: [...processes],
          fileSystem: { ...fileSystem }
        };
        setSnapshots(prev => [...prev, snapshot]);
        emitEvent('SNAPSHOT_CREATED', 'STATE_MGR', { id: snapshot.id, label: action.payload });
        break;
      case 'ROLLBACK':
        const snap = snapshots.find(s => s.id === action.payload);
        if (snap) {
          setProcesses(snap.processes);
          setFileSystem(snap.fileSystem);
          emitEvent('ROLLBACK_EXECUTED', 'STATE_MGR', { id: snap.id }, 'high');
        }
        break;
      case 'SET_PERMISSION':
        setPermissionContext(action.payload);
        break;
      case 'WRITE_FILE':
        const { path, content } = action.payload;
        setFileSystem(prev => {
          const versions = prev[path] || [];
          return { ...prev, [path]: [...versions, { path, content, version: versions.length + 1, timestamp: Date.now() }] };
        });
        emitEvent('FILE_WRITE', 'FS_DAEMON', { path });
        break;
    }
  }, [processes, snapshots, fileSystem, permissionContext, emitEvent]);

  const toggleShadowMode = () => setShadowMode(prev => !prev);
  const toggleGhostMode = () => {
    setGhostMode(prev => !prev);
    emitEvent('GHOST_MODE_TOGGLE', 'KERNEL', { active: !ghostMode }, 'info');
  };
  const toggleWindowedMode = () => {
    setWindowedMode(prev => !prev);
    emitEvent('ENV_SHIFT', 'KERNEL', { mode: !windowedMode ? 'NATIVE_WINDOWS' : 'WEB_SHELL' }, 'info');
  };

  const elevate = (pw: string) => {
    if (pw === 'root7701') {
      dispatch({ type: 'SET_PERMISSION', payload: PermissionLevel.SYSTEM });
      emitEvent('USER_ELEVATED', 'AUTH', { level: 'SYSTEM' }, 'medium');
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!booted || ghostMode) return;
    const interval = setInterval(async () => {
      if (events.length > 20) {
        const analysis = await intelligence.analyzeEvents(events.slice(-15));
        emitEvent('INTEL_AUDIT_COMPLETE', 'INTEL_AUDITOR', { summary: analysis }, 'info');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [booted, events, ghostMode, emitEvent]);

  useEffect(() => {
    if (!booted) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.98) {
        const targets = processes.filter(p => p.id !== 'kernel');
        const unlucky = targets[Math.floor(Math.random() * targets.length)];
        if (unlucky) {
          dispatch({ type: 'UPDATE_PROCESS', payload: { id: unlucky.id, state: ProcessState.DEGRADED } });
          emitEvent('PROCESS_DEGRADED', 'AUTO_DAEMON', { pid: unlucky.id }, 'medium');
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [booted, processes, dispatch, emitEvent]);

  return (
    <OSContext.Provider value={{
      booted, shadowMode, ghostMode, windowedMode, processes, events, fileSystem, notifications, snapshots, integrityScore, permissionContext,
      dispatch, emitEvent, toggleShadowMode, toggleGhostMode, toggleWindowedMode, setBooted, elevate
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be used within OSProvider');
  return context;
};
