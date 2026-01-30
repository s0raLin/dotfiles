
export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  category: string; // 改为字符串类型，与后端API一致
  description: string;
  lastModified: Date;
  size: number;
  isSymlink: boolean;
  backupExists: boolean;
  content?: string;
}

export interface ConfigCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface ConfigBackup {
  id: string;
  configFileId: string;
  timestamp: Date;
  description: string;
  size: number;
}

export interface SystemInfo {
  os: string;
  kernel: string;
  shell: string;
  homeDir: string;
  user: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isModified?: boolean;
}

export type ViewMode = 'list' | 'grid' | 'tree';
export type SortBy = 'name' | 'modified' | 'size' | 'category';
