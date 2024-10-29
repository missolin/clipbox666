import React, { useState } from 'react';
import { Clipboard, Plus } from 'lucide-react';

interface MainInputProps {
  onAddContent: (content: string) => void;
  showNotification: (message: string) => void;
}

export function MainInput({ onAddContent, showNotification }: MainInputProps) {
  const [value, setValue] = useState('');
  const [prefix, setPrefix] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
    } catch (err) {
      showNotification('无法读取剪贴板内容');
    }
  };

  const handleAdd = () => {
    if (!value.trim()) {
      showNotification('请先输入或粘贴内容');
      return;
    }

    const lines = value.split('\n');
    const processedContent = lines
      .map(line => line.trim())
      .filter(line => line)
      .map(line => `${prefix}${line}`)
      .join('\n');

    onAddContent(processedContent);
    setValue('');
  };

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="在此输入或粘贴内容，每行将被分开显示..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-none dark:bg-gray-700 dark:text-gray-200"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handlePaste}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Clipboard className="w-5 h-5" />
            读取剪贴板
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加到临时列表
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          行前缀
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="输入要添加到每行开头的文字..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200"
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          此文字将自动添加到每行的开头
        </p>
      </div>
    </div>
  );
}