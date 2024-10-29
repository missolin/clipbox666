import { storage } from './storage';

const MAINTENANCE_INTERVAL = 12 * 60 * 60 * 1000; // 12小时检查一次
const STORAGE_WARNING_THRESHOLD = 80; // 80% 存储警告阈值
const MAX_ITEMS_PER_USER = 1000; // 每个用户最大条目数
const BACKUP_KEY = 'clipboard_backup';
const LAST_MAINTENANCE_KEY = 'last_maintenance';
const LAST_BACKUP_KEY = 'last_backup';

export const maintenance = {
  async performMaintenance() {
    try {
      await Promise.all([
        this.cleanupStorage(),
        this.optimizePerformance(),
        this.createBackup(),
        this.validateData()
      ]);
      
      localStorage.setItem(LAST_MAINTENANCE_KEY, Date.now().toString());
      console.log('维护完成');
    } catch (error) {
      console.error('维护失败:', error);
    }
  },

  async cleanupStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const { usage, quota } = await navigator.storage.estimate();
        if (usage && quota) {
          const usagePercent = (usage / quota) * 100;
          if (usagePercent > STORAGE_WARNING_THRESHOLD) {
            // 清理超出限制的数据
            const users = storage.getUsers();
            Object.keys(users).forEach(userId => {
              const contents = storage.loadContent(userId);
              if (contents.length > MAX_ITEMS_PER_USER) {
                // 保留最新的数据
                const trimmedContents = contents
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, MAX_ITEMS_PER_USER);
                storage.saveContent(userId, trimmedContents);
              }
            });
          }
        }
      } catch (error) {
        console.error('存储清理失败:', error);
      }
    }
  },

  optimizePerformance() {
    try {
      const users = storage.getUsers();
      Object.keys(users).forEach(userId => {
        const contents = storage.loadContent(userId);
        if (contents.length > 0) {
          // 优化数据结构，移除可能的重复项
          const optimizedContents = Array.from(
            new Map(contents.map(item => [item.id, item])).values()
          );
          // 按时间戳排序
          optimizedContents.sort((a, b) => b.timestamp - a.timestamp);
          storage.saveContent(userId, optimizedContents);
        }
      });
    } catch (error) {
      console.error('性能优化失败:', error);
    }
  },

  createBackup() {
    try {
      const backup = {
        timestamp: Date.now(),
        users: storage.getUsers(),
        contents: {} as Record<string, any>
      };

      // 备份所有用户数据
      Object.keys(backup.users).forEach(userId => {
        backup.contents[userId] = storage.loadContent(userId);
      });

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      localStorage.setItem(LAST_BACKUP_KEY, Date.now().toString());
    } catch (error) {
      console.error('备份创建失败:', error);
    }
  },

  validateData() {
    try {
      const users = storage.getUsers();
      let needsRestore = false;

      Object.keys(users).forEach(userId => {
        const contents = storage.loadContent(userId);
        
        // 验证数据完整性
        const isValid = contents.every(item => 
          item && 
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.content === 'string' &&
          typeof item.timestamp === 'number'
        );

        if (!isValid) {
          needsRestore = true;
        }
      });

      if (needsRestore) {
        this.restoreFromBackup();
      }
    } catch (error) {
      console.error('数据验证失败:', error);
      this.restoreFromBackup();
    }
  },

  restoreFromBackup() {
    try {
      const backupData = localStorage.getItem(BACKUP_KEY);
      if (!backupData) return;

      const backup = JSON.parse(backupData);
      
      // 恢复用户数据
      Object.entries(backup.users).forEach(([userId, user]) => {
        storage.saveUser(userId, (user as any).passwordHash);
      });

      // 恢复剪贴板内容
      Object.entries(backup.contents).forEach(([userId, contents]) => {
        storage.saveContent(userId, contents as any);
      });

      console.log('数据已从备份恢复');
    } catch (error) {
      console.error('备份恢复失败:', error);
    }
  },

  startAutoMaintenance() {
    // 检查是否需要执行维护
    const lastMaintenance = localStorage.getItem(LAST_MAINTENANCE_KEY);
    const now = Date.now();
    
    if (!lastMaintenance || now - parseInt(lastMaintenance) > MAINTENANCE_INTERVAL) {
      this.performMaintenance();
    }

    // 设置定期维护
    setInterval(() => {
      this.performMaintenance();
    }, MAINTENANCE_INTERVAL);
  }
};