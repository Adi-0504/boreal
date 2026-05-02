import { openDB } from '../../db/db';

export const transactionService = {
  async addTransaction(transaction) {
    const db = await openDB();
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.add({
        ...transaction,
        userId,
        createdAt: Date.now()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getTransactions() {
    const db = await openDB();
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const request = store.getAll();
      request.onsuccess = () => {
        const filtered = request.result.filter(tx => tx.userId === userId);
        resolve(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async updateTransaction(transaction) {
    const db = await openDB();
    const userId = localStorage.getItem('boreal_user_id') || 'guest';
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.put({ ...transaction, userId });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteTransaction(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};
