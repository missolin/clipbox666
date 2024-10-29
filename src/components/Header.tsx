import React from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg"
        title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleTheme}
        className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg"
        title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
      <button
        onClick={logout}
        className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900 shadow-lg"
        title="退出登录"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}