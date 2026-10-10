/**
 * Aura Finance — Storage Engine
 * Manages LocalStorage persistence, clean initialization (no sample data),
 * and JSON / CSV export & import.
 */

const STORAGE_KEY = 'aura_finance_data_v2'; // v2 for clean state without sample data

class FinanceStorage {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      // Clear out legacy v1 sample data if it exists
      if (localStorage.getItem('aura_finance_data_v1')) {
        localStorage.removeItem('aura_finance_data_v1');
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure no sample entries leaked in
        if (parsed && parsed.months) {
          Object.keys(parsed.months).forEach(mKey => {
            if (Array.isArray(parsed.months[mKey].entries)) {
              parsed.months[mKey].entries = parsed.months[mKey].entries.filter(
                e => !e.id || !e.id.toString().startsWith('sample_')
              );
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
    return this.createInitialData();
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
  }

  getSettings() {
    return this.data.settings;
  }

  saveSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
  }

  getMonthEntries(monthKey) {
    if (!this.data.months[monthKey]) {
      // Copy recurring entries from previous months if any exist
      const recurring = this._findRecurringEntries();
      this.data.months[monthKey] = {
        entries: recurring.map(item => ({
          ...item,
          id: 'rec_' + Math.random().toString(36).substr(2, 9),
          date: `${monthKey}-01`
        }))
      };
      this.saveData();
    }
    return this.data.months[monthKey].entries || [];
  }

  _findRecurringEntries() {
    const recurringMap = new Map();
    Object.values(this.data.months).forEach(month => {
      (month.entries || []).forEach(e => {
        if (e.isRecurring) {
          recurringMap.set(e.description + '_' + e.category, e);
        }
      });
    });
    return Array.from(recurringMap.values());
  }

  addEntry(monthKey, entry) {
    if (!this.data.months[monthKey]) {
      this.data.months[monthKey] = { entries: [] };
    }
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...entry
    };
    this.data.months[monthKey].entries.unshift(newEntry);
    this.saveData();
    return newEntry;
  }

  deleteEntry(monthKey, entryId) {
    if (!this.data.months[monthKey]) return false;
    this.data.months[monthKey].entries = this.data.months[monthKey].entries.filter(e => e.id !== entryId);
    this.saveData();
    return true;
  }

  clearAllEntries() {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.data.months = {
      [currentMonthKey]: { entries: [] }
    };
    this.saveData();
  }

  exportToJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `aura_finance_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  }

  importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings && parsed.months) {
        this.data = parsed;
        this.saveData();
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON file', e);
    }
    return false;
  }

  exportMonthToCSV(monthKey) {
    const entries = this.getMonthEntries(monthKey);
    const headers = ["Date", "Type", "Category", "Description", "Amount (AUD)", "Recurring"];
    const rows = entries.map(e => [
      e.date,
      e.type,
      e.category,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.isRecurring ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_finance_${monthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  createInitialData() {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Completely clean initial data — zero sample records
    return {
      settings: {
        theme: 'light',
        netMonthlyIncome: 5200, // Median single net income baseline in Melbourne
        housingZone: 'middle',
        groceryProfile: 'balanced',
        rentCapPercent: 33
      },
      months: {
        [currentMonthKey]: {
          entries: [] // Clean empty slate!
        }
      }
    };
  }
}

// Global instance
window.FinanceStorage = FinanceStorage;
