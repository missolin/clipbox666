import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { ClipboardItem } from '../types';

interface ItemListProps {
  items: ClipboardItem[];
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  showNotification: (message: string) => void;
}

export function ItemList({ items, onCopy, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1 break-all text-gray-700 dark:text-gray-300">
            {item.content}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(item.content)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="复制"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}