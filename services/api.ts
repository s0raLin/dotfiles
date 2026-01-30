import { ConfigFile, ConfigCategory, SystemInfo } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败',
      };
    }
  }

  // 获取配置分类
  async getCategories(): Promise<APIResponse<ConfigCategory[]>> {
    return this.request<ConfigCategory[]>('/categories');
  }

  // 获取所有配置文件
  async getFiles(): Promise<APIResponse<ConfigFile[]>> {
    return this.request<ConfigFile[]>('/files');
  }

  // 获取单个配置文件内容
  async getFile(id: string): Promise<APIResponse<ConfigFile>> {
    return this.request<ConfigFile>(`/files/${id}`);
  }

  // 更新配置文件内容
  async updateFile(id: string, content: string): Promise<APIResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  // 备份配置文件
  async backupFile(id: string): Promise<APIResponse<{ message: string; backupPath: string }>> {
    return this.request<{ message: string; backupPath: string }>(`/files/${id}/backup`, {
      method: 'POST',
    });
  }

  // 获取系统信息
  async getSystemInfo(): Promise<APIResponse<SystemInfo>> {
    return this.request<SystemInfo>('/system');
  }
}

export const apiService = new ApiService();