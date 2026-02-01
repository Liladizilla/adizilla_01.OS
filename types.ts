
export enum ProcessState {
  RUNNING = 'RUNNING',
  SLEEPING = 'SLEEPING',
  WAITING = 'WAITING',
  FAILED = 'FAILED',
  DEGRADED = 'DEGRADED'
}

export enum PermissionLevel {
  USER = 'USER',
  DAEMON = 'DAEMON',
  SYSTEM = 'SYSTEM'
}

export interface SystemProcess {
  id: string;
  parentId?: string;
  name: string;
  state: ProcessState;
  weight: number; // CPU Abstraction (0-100)
  memory: number; // RAM Abstraction (0-100)
  lastUpdate: number;
  permission: PermissionLevel;
}

export interface SystemEvent {
  id: string;
  timestamp: number;
  type: string;
  source: string;
  payload: any;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

export interface FileEntry {
  path: string;
  content: string;
  version: number;
  timestamp: number;
}

export interface StateSnapshot {
  id: string;
  label: string;
  timestamp: number;
  processes: SystemProcess[];
  fileSystem: Record<string, FileEntry[]>;
}

export interface SystemState {
  booted: boolean;
  shadowMode: boolean;
  ghostMode: boolean; // Behavior shift vs UI disguise
  processes: SystemProcess[];
  events: SystemEvent[];
  fileSystem: Record<string, FileEntry[]>;
  notifications: string[];
  snapshots: StateSnapshot[];
  integrityScore: number;
  permissionContext: PermissionLevel;
}
