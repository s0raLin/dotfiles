import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ConfigFile, ConfigCategory, SystemInfo } from '../types';
import { apiService } from '../services/api';

interface FileEditState {
  content: string;
  originalContent: string;
  undoHistory: string[];
  redoHistory: string[];
  isModified: boolean;
}

interface AppState {
  categories: ConfigCategory[];
  files: ConfigFile[];
  systemInfo: SystemInfo | null;
  activeFileId: string | null;
  activeFileContent: string;
  isLoading: boolean;
  error: string | null;
  isModified: boolean;
  undoHistory: string[];
  redoHistory: string[];
  originalContent: string;
  fileEditStates: { [fileId: string]: FileEditState };
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
  | { type: 'UPDATE_FILE_IN_LIST'; payload: ConfigFile }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'PUSH_TO_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'REVERT_CHANGES' }
  | { type: 'SAVE_FILE_SUCCESS' }
  | { type: 'SAVE_FILE_STATE'; payload: { fileId: string } }
  | { type: 'RESTORE_FILE_STATE'; payload: { fileId: string } }
  | { type: 'CLEAR_FILE_STATE'; payload: { fileId: string } };

const initialState: AppState = {
  categories: [],
  files: [],
  systemInfo: null,
  activeFileId: null,
  activeFileContent: '',
  isLoading: false,
  error: null,
  isModified: false,
  undoHistory: [],
  redoHistory: [],
  originalContent: '',
  fileEditStates: {},
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
      // 检查是否有已保存的编辑状态
      const savedState = state.fileEditStates[action.payload.id];
      if (savedState) {
        return {
          ...state,
          activeFileId: action.payload.id,
          activeFileContent: savedState.content,
          originalContent: savedState.originalContent,
          isModified: savedState.isModified,
          undoHistory: savedState.undoHistory,
          redoHistory: savedState.redoHistory,
        };
      } else {
        return {
          ...state,
          activeFileId: action.payload.id,
          activeFileContent: action.payload.content,
          originalContent: action.payload.content,
          isModified: false,
          undoHistory: [],
          redoHistory: [],
        };
      }
    case 'SET_FILE_CONTENT':
      const newIsModified = state.originalContent !== action.payload;
      return {
        ...state,
        activeFileContent: action.payload,
        isModified: newIsModified,
        redoHistory: [], // 清空重做历史
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
    case 'PUSH_TO_HISTORY':
      return {
        ...state,
        undoHistory: [...state.undoHistory.slice(-49), action.payload], // 保持最多50个历史记录
      };
    case 'UNDO':
      if (state.undoHistory.length === 0) return state;
      const previousContent = state.undoHistory[state.undoHistory.length - 1];
      return {
        ...state,
        activeFileContent: previousContent,
        isModified: state.originalContent !== previousContent,
        undoHistory: state.undoHistory.slice(0, -1),
        redoHistory: [state.activeFileContent, ...state.redoHistory.slice(0, 49)],
      };
    case 'REDO':
      if (state.redoHistory.length === 0) return state;
      const nextContent = state.redoHistory[0];
      return {
        ...state,
        activeFileContent: nextContent,
        isModified: state.originalContent !== nextContent,
        undoHistory: [...state.undoHistory, state.activeFileContent],
        redoHistory: state.redoHistory.slice(1),
      };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        undoHistory: [],
        redoHistory: [],
      };
    case 'REVERT_CHANGES':
      return {
        ...state,
        activeFileContent: state.originalContent,
        isModified: false,
        undoHistory: [],
        redoHistory: [],
      };
    case 'SAVE_FILE_SUCCESS':
      return {
        ...state,
        originalContent: state.activeFileContent,
        isModified: false,
        undoHistory: [],
        redoHistory: [],
      };
    case 'SAVE_FILE_STATE':
      if (!state.activeFileId) return state;
      return {
        ...state,
        fileEditStates: {
          ...state.fileEditStates,
          [action.payload.fileId]: {
            content: state.activeFileContent,
            originalContent: state.originalContent,
            undoHistory: state.undoHistory,
            redoHistory: state.redoHistory,
            isModified: state.isModified,
          },
        },
      };
    case 'RESTORE_FILE_STATE':
      const restoredState = state.fileEditStates[action.payload.fileId];
      if (!restoredState) return state;
      return {
        ...state,
        activeFileContent: restoredState.content,
        originalContent: restoredState.originalContent,
        undoHistory: restoredState.undoHistory,
        redoHistory: restoredState.redoHistory,
        isModified: restoredState.isModified,
      };
    case 'CLEAR_FILE_STATE':
      const newFileEditStates = { ...state.fileEditStates };
      delete newFileEditStates[action.payload.fileId];
      return {
        ...state,
        fileEditStates: newFileEditStates,
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
    saveAllFiles: () => Promise<void>;
    backupFile: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
    undo: () => void;
    redo: () => void;
    revertChanges: () => void;
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
      // 保存当前文件的编辑状态（包括未保存的更改）
      if (state.activeFileId) {
        dispatch({ type: 'SAVE_FILE_STATE', payload: { fileId: state.activeFileId } });
      }

      // 检查是否已有该文件的编辑状态
      const existingState = state.fileEditStates[id];
      if (existingState) {
        // 如果有保存的状态，直接恢复
        dispatch({
          type: 'SET_ACTIVE_FILE',
          payload: { id, content: existingState.originalContent },
        });
        dispatch({ type: 'RESTORE_FILE_STATE', payload: { fileId: id } });
        return;
      }

      // 如果没有保存的状态，从服务器加载
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
      // 在更新内容前，将当前内容推入历史记录
      if (state.activeFileContent !== content) {
        dispatch({ type: 'PUSH_TO_HISTORY', payload: state.activeFileContent });
      }
      dispatch({ type: 'SET_FILE_CONTENT', payload: content });
    },

    saveFile: async () => {
      if (!state.activeFileId) return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.updateFile(state.activeFileId, state.activeFileContent);
      if (response.success) {
        dispatch({ type: 'SAVE_FILE_SUCCESS' });
        // 清除该文件的编辑状态
        dispatch({ type: 'CLEAR_FILE_STATE', payload: { fileId: state.activeFileId } });
        // 刷新文件列表以更新修改时间等信息
        await actions.loadFiles();
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || '保存文件失败' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    },

    saveAllFiles: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const filesToSave: Array<{ id: string; content: string }> = [];
        
        // 收集当前活动文件（如果有修改）
        if (state.activeFileId && state.isModified) {
          filesToSave.push({
            id: state.activeFileId,
            content: state.activeFileContent
          });
        }
        
        // 收集所有有未保存更改的文件
        Object.entries(state.fileEditStates).forEach(([fileId, fileState]) => {
          if (fileState.isModified && fileId !== state.activeFileId) {
            filesToSave.push({
              id: fileId,
              content: fileState.content
            });
          }
        });
        
        if (filesToSave.length === 0) {
          dispatch({ type: 'SET_ERROR', payload: '没有需要保存的文件' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // 并行保存所有文件
        const savePromises = filesToSave.map(async ({ id, content }) => {
          const response = await apiService.updateFile(id, content);
          return { id, success: response.success, error: response.error };
        });
        
        const results = await Promise.all(savePromises);
        
        // 检查保存结果
        const failedSaves = results.filter(result => !result.success);
        
        if (failedSaves.length > 0) {
          const errorMessage = `保存失败的文件: ${failedSaves.map(f => f.id).join(', ')}`;
          dispatch({ type: 'SET_ERROR', payload: errorMessage });
        } else {
          // 所有文件保存成功，清除编辑状态
          if (state.activeFileId && state.isModified) {
            dispatch({ type: 'SAVE_FILE_SUCCESS' });
            dispatch({ type: 'CLEAR_FILE_STATE', payload: { fileId: state.activeFileId } });
          }
          
          // 清除所有已保存文件的编辑状态
          results.forEach(({ id }) => {
            if (id !== state.activeFileId) {
              dispatch({ type: 'CLEAR_FILE_STATE', payload: { fileId: id } });
            }
          });
          
          // 刷新文件列表
          await actions.loadFiles();
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: '保存文件时发生错误' });
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

    undo: () => {
      dispatch({ type: 'UNDO' });
    },

    redo: () => {
      dispatch({ type: 'REDO' });
    },

    revertChanges: () => {
      if (state.activeFileId) {
        dispatch({ type: 'REVERT_CHANGES' });
        // 清除该文件的编辑状态
        dispatch({ type: 'CLEAR_FILE_STATE', payload: { fileId: state.activeFileId } });
      }
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