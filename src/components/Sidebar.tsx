import React, { useState, useEffect } from 'react';
import { X, Trash2, Copy, FolderOpen, Plus, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { storage } from '../utils/storage';

interface SavedContent {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  showNotification: (message: string) => void;
}

export function Sidebar({ isOpen, onClose, userId, showNotification }: SidebarProps) {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (userId && isOpen) {
      const contents = storage.loadContent(userId);
      setSavedContents(contents);
    }
  }, [userId, isOpen]);

  const handleAddContent = () => {
    if (!newContent.trim()) {
      showNotification('请先输入内容');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      name: `剪贴内容 ${new Date().toLocaleString()}`,
      content: newContent,
      timestamp: Date.now()
    };

    storage.saveContent(userId, [newItem, ...savedContents]);
    setSavedContents(prev => [newItem, ...prev]);
    setNewContent('');
    showNotification('已添加到永久存储');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setNewContent(text);
    } catch (err) {
      showNotification('无法读取剪贴板内容');
    }
  };

  const handleCopyItem = async (content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      showNotification('已复制到剪贴板');
    } catch (err) {
      showNotification('复制失败');
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newContents = savedContents.filter(item => item.id !== id);
    storage.saveContent(userId, newContents);
    setSavedContents(newContents);
    showNotification('已删除内容');
  };

  const startEditing = (id: string, currentName: string, currentContent: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingContent(currentContent);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim() || !editingContent.trim()) {
      showNotification('名称和内容不能为空');
      return;
    }

    const newContents = savedContents.map(item => 
      item.id === id 
        ? { ...item, name: editingName.trim(), content: editingContent.trim() } 
        : item
    );
    storage.saveContent(userId, newContents);
    setSavedContents(newContents);
    setEditingId(null);
    setEditingName('');
    setEditingContent('');
    showNotification('已保存修改');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= savedContents.length) return;

    const newContents = [...savedContents];
    [newContents[index], newContents[newIndex]] = [newContents[newIndex], newContents[index]];
    storage.saveContent(userId, newContents);
    setSavedContents(newContents);
    showNotification(direction === 'up' ? '已向上移动' : '已向下移动');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">永久存储</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="输入要永久保存的内容..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 h-24"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handlePaste}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                读取剪贴板
              </button>
              <button
                onClick={handleAddContent}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加到永久存储
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {savedContents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">暂无永久保存的内容</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">添加的内容会永久保存在这里</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedContents.map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      {editingId === item.id ? (
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-200 mb-2"
                            placeholder="输入名称"
                          />
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[60px] dark:bg-gray-800 dark:text-gray-200"
                            placeholder="输入内容"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                            {item.content}
                          </div>
                        </div>
                      )}
                    </div>
                    {!editingId && (
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          title="向上移动"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === savedContents.length - 1}
                          className={`p-1 rounded ${
                            index === savedContents.length - 1 
                              ? 'text-gray-400 dark:text-gray-600' 
                              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          title="向下移动"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(item.id, item.name, item.content)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleCopyItem(item.content, e)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="复制"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}