/**
 * Aura Finance — Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Services
  const storage = new window.FinanceStorage();
  const ui = new window.FinanceUI();
  const settings = storage.getSettings();
  const calculator = new window.MelbourneBenchmarkEngine(settings);

  // Apply saved theme
  if (settings.theme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }

  // Current Month State
  let currentDate = new Date();
  let currentMonthKey = getCurrentMonthKey(currentDate);

  function getCurrentMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // Form Elements for Hero Centered Console
  const heroForm = document.getElementById('hero-entry-form');
  const heroAmountInput = document.getElementById('hero-amount-input');
  const heroCategorySelect = document.getElementById('hero-category-select');
  const heroDescInput = document.getElementById('hero-desc-input');
  const heroDateInput = document.getElementById('hero-date-input');
  const heroRecurringCheckbox = document.getElementById('hero-recurring-checkbox');
  const heroTypeHidden = document.getElementById('hero-entry-type');
  const heroBtnExpense = document.getElementById('hero-btn-expense');
  const heroBtnIncome = document.getElementById('hero-btn-income');
  const heroChipsContainer = document.getElementById('hero-chips-container');
  const heroSubmitBtnText = document.getElementById('hero-submit-btn-text');

  // Categories markup
  const EXPENSE_CATEGORIES_HTML = `
    <optgroup label="Melbourne Targets">
      <option value="rent-insurance" selected>🏠 Rent + Insurance</option>
      <option value="groceries">🛒 Groceries</option>
      <option value="myself">✨ Myself (Self-Care & Fun)</option>
    </optgroup>
    <optgroup label="Other Living Buckets">
      <option value="utilities">⚡ Bills & Utilities</option>
      <option value="transport">🚆 Transport (Myki, Fuel)</option>
      <option value="other">📦 Other Expenses</option>
    </optgroup>
  `;

  const INCOME_CATEGORIES_HTML = `
    <optgroup label="Income Streams">
      <option value="income-salary" selected>💼 Base Salary / Wages</option>
      <option value="income-sidehustle">🚀 Side Hustle / Freelance</option>
      <option value="income-investments">📈 Investments & HISA Interest</option>
      <option value="income-other">💰 Other Income</option>
    </optgroup>
  `;

  const EXPENSE_PRESETS = [
    { desc: 'Monthly Rent', cat: 'rent-insurance', label: '🏠 Rent (1-Bed)' },
    { desc: 'Contents Insurance', cat: 'rent-insurance', label: '🛡️ Contents Insurance' },
    { desc: 'Coles Groceries', cat: 'groceries', label: '🛒 Coles' },
    { desc: 'Woolworths Fresh', cat: 'groceries', label: '🥦 Woolies' },
    { desc: 'Cafe & Flat White', cat: 'myself', label: '☕ Cafe / Flat White' },
    { desc: 'Dining Out / Dinner', cat: 'myself', label: '🍷 Dining Out' },
    { desc: 'Myki Monthly Pass', cat: 'transport', label: '🚆 Myki Pass' }
  ];

  const INCOME_PRESETS = [
    { desc: 'Primary Salary (Fortnightly)', cat: 'income-salary', label: '💼 Fortnightly Salary' },
    { desc: 'Primary Salary (Monthly)', cat: 'income-salary', label: '💼 Monthly Salary' },
    { desc: 'Side Hustle Gig', cat: 'income-sidehustle', label: '🚀 Side Hustle' },
    { desc: 'Freelance Client Project', cat: 'income-sidehustle', label: '💻 Freelance' },
    { desc: 'High-Interest Savings (HISA)', cat: 'income-investments', label: '📈 HISA Interest' },
    { desc: 'ATO Tax Return', cat: 'income-other', label: '🧾 Tax Return' }
  ];

  // Set default date for hero form
  function resetHeroDate() {
    const today = new Date();
    const todayKey = getCurrentMonthKey(today);
    if (todayKey === currentMonthKey) {
      heroDateInput.value = today.toISOString().slice(0, 10);
    } else {
      heroDateInput.value = `${currentMonthKey}-01`;
    }
  }
  resetHeroDate();

  // Render Presets Chips
  function renderHeroPresets(type) {
    if (!heroChipsContainer) return;
    heroChipsContainer.innerHTML = '';
    const presets = type === 'income' ? INCOME_PRESETS : EXPENSE_PRESETS;
    
    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hero-chip';
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        heroDescInput.value = p.desc;
        heroCategorySelect.value = p.cat;
        heroAmountInput.focus();
      });
      heroChipsContainer.appendChild(btn);
    });
  }

  // Switch Hero Type (Expense / Income)
  function setHeroType(type) {
    heroTypeHidden.value = type;
    if (type === 'income') {
      heroBtnIncome.classList.add('active');
      heroBtnExpense.classList.remove('active');
      heroCategorySelect.innerHTML = INCOME_CATEGORIES_HTML;
      heroCategorySelect.value = 'income-salary';
      heroDescInput.placeholder = 'e.g. Fortnightly pay, Freelance client, Tutoring, uBank interest...';
      if (heroSubmitBtnText) heroSubmitBtnText.textContent = 'Record Income';
      renderHeroPresets('income');
    } else {
      heroBtnExpense.classList.add('active');
      heroBtnIncome.classList.remove('active');
      heroCategorySelect.innerHTML = EXPENSE_CATEGORIES_HTML;
      heroCategorySelect.value = 'rent-insurance';
      heroDescInput.placeholder = 'e.g. Coles shop, Brunswick rent, Lune flat white...';
      if (heroSubmitBtnText) heroSubmitBtnText.textContent = 'Record Expense';
      renderHeroPresets('expense');
    }
  }

  heroBtnExpense.addEventListener('click', () => setHeroType('expense'));
  heroBtnIncome.addEventListener('click', () => setHeroType('income'));

  // Initialize presets for default Expense view
  setHeroType('expense');

  // Handle Hero Form Submission
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amountVal = parseFloat(heroAmountInput.value);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid amount.');
      heroAmountInput.focus();
      return;
    }

    const type = heroTypeHidden.value;
    const cat = heroCategorySelect.value || (type === 'income' ? 'income-salary' : 'other');
    const desc = heroDescInput.value.trim();
    const dateVal = heroDateInput.value;
    const isRecurring = heroRecurringCheckbox.checked;

    const targetMonthKey = dateVal.slice(0, 7);

    storage.addEntry(targetMonthKey, {
      type: type,
      category: cat,
      description: desc,
      amount: amountVal,
      date: dateVal,
      isRecurring: isRecurring
    });

    // Reset inputs
    heroAmountInput.value = '';
    heroDescInput.value = '';
    heroRecurringCheckbox.checked = false;

    // Refresh view
    if (targetMonthKey === currentMonthKey) {
      refreshView();
    } else {
      currentMonthKey = targetMonthKey;
      currentDate = new Date(dateVal);
      refreshView();
    }

    heroAmountInput.focus();
  });

  // Refresh entire UI
  function refreshView() {
    ui.renderMonthLabel(currentMonthKey);
    resetHeroDate();
    const entries = storage.getMonthEntries(currentMonthKey);

    // Calculate Totals
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    const categoryTotals = {};

    entries.forEach(entry => {
      const amt = Number(entry.amount) || 0;
      const isIncome = entry.type === 'income' || (entry.category && entry.category.startsWith('income'));
      const cat = entry.category || (isIncome ? 'income-salary' : 'other');

      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, count: 0 };
      }
      categoryTotals[cat].total += amt;
      categoryTotals[cat].count += 1;

      if (isIncome) {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpense += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

    // Overview Cards
    ui.renderOverview({
      income: totalIncome,
      expense: totalExpense,
      net: netBalance,
      incomeCount: incomeCount
    }, savingsRate);

    // Spending in 3 Core Melbourne Buckets
    const currentActualSpending = {
      'rent-insurance': categoryTotals['rent-insurance'] ? categoryTotals['rent-insurance'].total : 0,
      'groceries': categoryTotals['groceries'] ? categoryTotals['groceries'].total : 0,
      'myself': categoryTotals['myself'] ? categoryTotals['myself'].total : 0
    };

    // Calculate Melbourne Benchmarks (adapt to entered income if positive)
    const effectiveIncome = totalIncome > 0 ? totalIncome : null;
    const benchmarks = calculator.calculateBenchmarks(currentActualSpending, effectiveIncome);
    ui.renderMelbourneBenchmarks(benchmarks);

    // Category Cards
    ui.renderCategoryCards(categoryTotals, benchmarks);

    // Ledger
    const filterSelect = document.getElementById('ledger-category-filter');
    const activeFilter = filterSelect ? filterSelect.value : 'ALL';
    ui.renderLedger(entries, activeFilter, (idToDelete) => {
      storage.deleteEntry(currentMonthKey, idToDelete);
      refreshView();
    });
  }

  // --- MONTH NAVIGATION ---
  document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    currentMonthKey = getCurrentMonthKey(currentDate);
    refreshView();
  });

  document.getElementById('next-month-btn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentMonthKey = getCurrentMonthKey(currentDate);
    refreshView();
  });

  document.getElementById('today-btn').addEventListener('click', () => {
    currentDate = new Date();
    currentMonthKey = getCurrentMonthKey(currentDate);
    refreshView();
  });

  // --- LEDGER FILTER ---
  document.getElementById('ledger-category-filter').addEventListener('change', (e) => {
    const entries = storage.getMonthEntries(currentMonthKey);
    ui.renderLedger(entries, e.target.value, (idToDelete) => {
      storage.deleteEntry(currentMonthKey, idToDelete);
      refreshView();
    });
  });

  // --- THEME TOGGLE ---
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      storage.saveSettings({ theme: 'light' });
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      storage.saveSettings({ theme: 'dark' });
    }
  });

  // --- DATA BACKUP & EXPORT DROPDOWN ---
  const dataMenuBtn = document.getElementById('data-menu-btn');
  const dataDropdown = document.getElementById('data-dropdown');

  dataMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dataDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    dataDropdown.classList.add('hidden');
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    storage.exportMonthToCSV(currentMonthKey);
  });

  document.getElementById('export-json-btn').addEventListener('click', () => {
    storage.exportToJSON();
  });

  document.getElementById('import-json-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = storage.importFromJSON(event.target.result);
      if (success) {
        calculator.updateConfig(storage.getSettings());
        refreshView();
        alert('Data successfully restored from backup.');
      } else {
        alert('Failed to parse backup JSON file. Please check file format.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (confirm('Clear all entries in this month? This cannot be undone.')) {
      storage.clearAllEntries();
      refreshView();
    }
  });

  // --- STORAGE INFO MODAL ---
  const storageModal = document.getElementById('storage-modal');
  document.getElementById('storage-info-btn').addEventListener('click', () => {
    storageModal.classList.remove('hidden');
  });
  document.getElementById('close-storage-modal-btn').addEventListener('click', () => {
    storageModal.classList.add('hidden');
  });
  document.getElementById('close-storage-btn').addEventListener('click', () => {
    storageModal.classList.add('hidden');
  });

  // --- BENCHMARK SETTINGS MODAL ---
  const benchModal = document.getElementById('benchmark-modal');
  const benchForm = document.getElementById('benchmark-form');
  const benchIncomeInput = document.getElementById('bench-income-input');
  const benchZoneSelect = document.getElementById('bench-zone-select');
  const benchGrocerySelect = document.getElementById('bench-grocery-style');
  const benchRentCapSelect = document.getElementById('bench-rent-cap');

  function openBenchmarkModal() {
    const cfg = calculator.getConfig();
    benchIncomeInput.value = cfg.netMonthlyIncome;
    benchZoneSelect.value = cfg.housingZone;
    benchGrocerySelect.value = cfg.groceryProfile;
    benchRentCapSelect.value = cfg.rentCapPercent;
    benchModal.classList.remove('hidden');
    benchIncomeInput.focus();
  }

  document.getElementById('calculator-toggle-btn').addEventListener('click', openBenchmarkModal);
  document.getElementById('edit-benchmark-params-btn').addEventListener('click', openBenchmarkModal);
  document.getElementById('close-benchmark-modal-btn').addEventListener('click', () => benchModal.classList.add('hidden'));
  document.getElementById('cancel-benchmark-btn').addEventListener('click', () => benchModal.classList.add('hidden'));

  benchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newIncome = parseFloat(benchIncomeInput.value);
    if (isNaN(newIncome) || newIncome <= 0) {
      alert('Please enter a valid net monthly income.');
      return;
    }

    const updated = {
      netMonthlyIncome: newIncome,
      housingZone: benchZoneSelect.value,
      groceryProfile: benchGrocerySelect.value,
      rentCapPercent: parseInt(benchRentCapSelect.value, 10)
    };

    calculator.updateConfig(updated);
    storage.saveSettings(updated);
    benchModal.classList.add('hidden');
    refreshView();
  });

  // --- KEYBOARD SHORTCUTS ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      benchModal.classList.add('hidden');
      storageModal.classList.add('hidden');
      dataDropdown.classList.add('hidden');
    }
    // Press '/' or 'N' to focus amount input when not already typing
    if ((e.key === '/' || e.key === 'n' || e.key === 'N') && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      heroAmountInput.focus();
    }
  });

  // Initial Render & autofocus amount
  refreshView();
  heroAmountInput.focus();
});
