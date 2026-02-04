type QueuedRequest = {
  execute: () => Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
};

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private activeCount = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.queue.push({
        execute,
        resolve: () => {},
        reject,
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.activeCount++;

    try {
      await item.execute();
    } finally {
      this.activeCount--;

      this.processQueue();
    }
  }

  clear() {
    this.queue = [];
  }

  getStats() {
    return {
      active: this.activeCount,
      queued: this.queue.length,
    };
  }
}

export const layerPreviewQueue = new RequestQueue(3);
