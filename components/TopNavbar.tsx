
import React from 'react';
import { Settings, Search, Upload, Save, User } from 'lucide-react';

const TopNavbar: React.FC = () => {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">Linux 配置管理器</h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">已连接到系统配置</span>
            </div>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          <a className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1" href="#">配置文件</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">备份管理</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">系统信息</a>
          <a className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">日志</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64 text-slate-900 dark:text-slate-200" 
            placeholder="搜索配置文件..." 
            type="text"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-all">
            <Upload size={16} />
            <span className="hidden sm:inline">导入配置</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-600/20">
            <Save size={16} />
            <span className="hidden sm:inline">全部应用</span>
          </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
          <User className="text-slate-600 dark:text-slate-400" size={20} />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
