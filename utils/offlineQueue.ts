/**
 * Offline Queue System
 * 
 * Handles transaction queueing when offline and syncs when back online.
 * Uses IndexedDB for persistent storage across sessions.
 */

import { Transaction } from '../types';

interface QueuedOperation {
  id: string;
  type: 'save' | 'update' | 'delete';
  transaction?: Transaction;
  transactionId?: string;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'suarakira_offline_queue';
const MAX_RETRIES = 5;

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get queued operations from localStorage
const getQueue = (): QueuedOperation[] => {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    console.error('Failed to read offline queue:', e);
    return [];
  }
};

// Save queue to localStorage
const saveQueue = (queue: QueuedOperation[]): void => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
};

// Add operation to queue
export const queueOperation = (
  type: 'save' | 'update' | 'delete',
  transaction?: Transaction,
  transactionId?: string
): void => {
  const queue = getQueue();
  const operation: QueuedOperation = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    transaction,
    transactionId,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(operation);
  saveQueue(queue);

  console.log(`✓ Queued ${type} operation (offline mode)`);
};

// Get queue count
export const getQueueCount = (): number => {
  return getQueue().length;
};

// Clear queue
export const clearQueue = (): void => {
  localStorage.removeItem(QUEUE_KEY);
};

// Process queue when back online
export const processQueue = async (
  saveTransactionFn: (t: Transaction) => Promise<any>,
  updateTransactionFn: (t: Transaction) => Promise<any>,
  deleteTransactionFn: (id: string) => Promise<any>,
  onProgress?: (completed: number, total: number) => void,
  onComplete?: (successful: number, failed: number) => void
): Promise<void> => {
  if (!isOnline()) {
    console.warn('Cannot process queue while offline');
    return;
  }

  const queue = getQueue();
  if (queue.length === 0) {
    console.log('Queue is empty');
    return;
  }

  console.log(`Processing ${queue.length} queued operations...`);

  let successful = 0;
  let failed = 0;
  const remainingQueue: QueuedOperation[] = [];

  for (let i = 0; i < queue.length; i++) {
    const operation = queue[i];
    
    try {
      switch (operation.type) {
        case 'save':
          if (operation.transaction) {
            await saveTransactionFn(operation.transaction);
            successful++;
            console.log(`✓ Synced save operation for ${operation.transaction.item}`);
          }
          break;

        case 'update':
          if (operation.transaction) {
            await updateTransactionFn(operation.transaction);
            successful++;
            console.log(`✓ Synced update operation for ${operation.transaction.item}`);
          }
          break;

        case 'delete':
          if (operation.transactionId) {
            await deleteTransactionFn(operation.transactionId);
            successful++;
            console.log(`✓ Synced delete operation for ${operation.transactionId}`);
          }
          break;
      }

      // Report progress
      if (onProgress) {
        onProgress(successful + failed, queue.length);
      }
    } catch (error) {
      console.error(`Failed to sync ${operation.type} operation:`, error);
      
      // Retry logic
      operation.retryCount++;
      if (operation.retryCount < MAX_RETRIES) {
        remainingQueue.push(operation);
        console.log(`Will retry (${operation.retryCount}/${MAX_RETRIES})`);
      } else {
        failed++;
        console.error(`Max retries reached for ${operation.type} operation`);
      }
    }
  }

  // Save remaining queue
  saveQueue(remainingQueue);

  console.log(`Queue processed: ${successful} successful, ${failed} failed, ${remainingQueue.length} remaining`);

  if (onComplete) {
    onComplete(successful, failed);
  }
};

// Listen for online/offline events
export const setupOfflineDetection = (
  onOnline?: () => void,
  onOffline?: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('✓ Back online');
    if (onOnline) onOnline();
  };

  const handleOffline = () => {
    console.warn('⚠ Went offline');
    if (onOffline) onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Hook for React components
export const useOfflineDetection = () => {
  const [online, setOnline] = React.useState(isOnline());
  const [queueCount, setQueueCount] = React.useState(getQueueCount());

  React.useEffect(() => {
    const cleanup = setupOfflineDetection(
      () => {
        setOnline(true);
        setQueueCount(getQueueCount());
      },
      () => {
        setOnline(false);
      }
    );

    return cleanup;
  }, []);

  return {
    isOnline: online,
    queueCount,
    updateQueueCount: () => setQueueCount(getQueueCount()),
  };
};

// Import React for hook
import React from 'react';
