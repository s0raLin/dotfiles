import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ConfigFile, ConfigCategory, SystemInfo } from '../types';
import { apiService } from '../services/api';

interface AppState {
  categories: ConfigCategory[];
  files: ConfigFile[];
  systemInfo: SystemInfo | null;
  activeFileId: string | null;
  activeFileContent: string;
  isLoading: boolean;
  error: string | null;
  isModified: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: ConfigCategory[] }
  | { type: 'SET_FILES'; payload: ConfigFile[] }
  | { type: 'SET_SYSTEM_INFO'; payload: SystemInfo }
  | { type: 'SET_ACTIVE_FILE'; payload: { id: string; content: string } }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'SET_MODIFIED'; payload: boolean }
  | { type: 'UPDATE_FILE_IN_LIST'; payload: ConfigFile };

const initialState: AppState = {
  categories: [],
  files: [],
  systemInfo: null,
  activeFileId: null,
  activeFileContent: '',
  isLoading: false,
  error: null,
  isModified: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_SYSTEM_INFO':
      return { ...state, systemInfo: action.payload };
    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFileId: action.payload.id,
        activeFileContent: action.payload.content,
        isModified: false,
      };
    case 'SET_FILE_CONTENT':
      return {
        ...state,
        activeFileContent: action.payload,
        isModified: state.activeFileContent !== action.payload,
      };
    case 'SET_MODIFIED':
      return { ...state, isModified: action.payload };
    case 'UPDATE_FILE_IN_LIST':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id ? action.payload : file
        ),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  actions: {
    loadCategories: () => Promise<void>;
    loadFiles: () => Promise<void>;
    loadSystemInfo: () => Promise<void>;
    selectFile: (id: string) => Promise<void>;
    updateFileContent: (content: string) => void;
    saveFile: () => Promise<void>;
    backupFile: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    loadCategories: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '加载分类失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    loadFiles: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getFiles();
      if (response.success && response.data) {
        dispatch({ type: 'SET_FILES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '加载文件列表失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    loadSystemInfo: async () => {
      const response = await apiService.getSystemInfo();
      if (response.success && response.data) {
        dispatch({ type: 'SET_SYSTEM_INFO', payload: response.data });
      }
    },

    selectFile: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getFile(id);
      if (response.success && response.data) {
        dispatch({
          type: 'SET_ACTIVE_FILE',
          payload: { id, content: response.data.content || '' },
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '加载文件内容失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    updateFileContent: (content: string) => {
      dispatch({ type: 'SET_FILE_CONTENT', payload: content });
    },

    saveFile: async () => {
      if (!state.activeFileId) return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.updateFile(state.activeFileId, state.activeFileContent);
      if (response.success) {
        dispatch({ type: 'SET_MODIFIED', payload: false });
        // 刷新文件列表以更新修改时间等信息
        await actions.loadFiles();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '保存文件失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    backupFile: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.backupFile(id);
      if (response.success) {
        // 刷新文件列表以更新备份状态
        await actions.loadFiles();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '创建备份失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    refreshData: async () => {
      await Promise.all([
        actions.loadCategories(),
        actions.loadFiles(),
        actions.loadSystemInfo(),
      ]);
    },
  };

  // 初始化数据加载
  useEffect(() => {
    actions.refreshData();
  }, []);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}