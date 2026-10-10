/**
 * Aura Finance — UI View Renderer & Component Controller
 */

class FinanceUI {
  constructor() {
    this.categoryDefinitions = {
      'rent-insurance': { name: 'Rent + Insurance', icon: '🏠', isCoreBenchmark: true },
      'groceries': { name: 'Groceries', icon: '🛒', isCoreBenchmark: true },
      'myself': { name: 'Myself (Self-Care & Fun)', icon: '✨', isCoreBenchmark: true },
      'utilities': { name: 'Bills & Utilities', icon: '⚡', isCoreBenchmark: false },
      'transport': { name: 'Transport (Myki, Fuel)', icon: '🚆', isCoreBenchmark: false },
      'other': { name: 'Other Expenses', icon: '📦', isCoreBenchmark: false },
      // Granular Income Sources
      'income-salary': { name: 'Base Salary / Wages', icon: '💼', isIncome: true },
      'income-sidehustle': { name: 'Side Hustle / Freelance', icon: '🚀', isIncome: true },
      'income-investments': { name: 'Investments & HISA', icon: '📈', isIncome: true },
      'income-other': { name: 'Other Income', icon: '💰', isIncome: true },
      'income': { name: 'Income Stream', icon: '💼', isIncome: true }
    };
  }

  formatAUD(amount, includeCents = true) {
    const num = Number(amount) || 0;
    return '$' + num.toLocaleString('en-AU', {
      minimumFractionDigits: includeCents ? 2 : 0,
      maximumFractionDigits: includeCents ? 2 : 0
    });
  }

  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
      }
    } catch (e) {}
    return dateString;
  }

  renderMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    const label = date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
    document.getElementById('current-month-label').textContent = label;
  }

  renderOverview(totals, savingsRate) {
    document.getElementById('total-income-val').textContent = this.formatAUD(totals.income);
    document.getElementById('total-expense-val').textContent = this.formatAUD(totals.expense);
    
    const netElem = document.getElementById('net-balance-val');
    netElem.textContent = this.formatAUD(totals.net);
    if (totals.net < 0) {
      netElem.classList.add('text-danger');
    } else {
      netElem.classList.remove('text-danger');
    }

    // Income count
    const incFootnote = document.getElementById('income-sources-count');
    incFootnote.textContent = `${totals.incomeCount} stream${totals.incomeCount === 1 ? '' : 's'} recorded`;

    // Expense ratio
    const expRatio = totals.income > 0 ? Math.round((totals.expense / totals.income) * 100) : 0;
    document.getElementById('expense-ratio-val').textContent = `${expRatio}% of monthly income`;

    // Savings badge
    const badge = document.getElementById('savings-rate-badge');
    badge.textContent = `${savingsRate}% saved`;
    badge.className = 'status-pill';
    
    const healthText = document.getElementById('financial-health-status');
    if (savingsRate >= 20) {
      badge.classList.add('status-pill-good');
      healthText.textContent = 'Excellent savings buffer (> 20% target met)';
    } else if (savingsRate >= 10) {
      badge.classList.add('status-pill-warn');
      healthText.textContent = 'Moderate savings rate. On healthy baseline.';
    } else if (savingsRate >= 0) {
      badge.classList.add('status-pill-neutral');
      healthText.textContent = 'Tight buffer. Minimal monthly cushion.';
    } else {
      badge.classList.add('status-pill-danger');
      healthText.textContent = 'Outflows exceeding income this cycle.';
    }
  }

  renderMelbourneBenchmarks(benchmarks) {
    // 1. Rent + Insurance
    const r = benchmarks.rentInsurance;
    document.getElementById('actual-rent-insurance').textContent = this.formatAUD(r.actual, false);
    document.getElementById('ideal-rent-insurance').textContent = this.formatAUD(r.ideal, false);
    document.getElementById('pct-rent-insurance').textContent = `${r.percentageOfIncome}% of net pay`;
    document.getElementById('market-rent-insurance').textContent = r.marketRangeText;
    document.getElementById('advice-rent-insurance').textContent = r.advice;

    const progRent = document.getElementById('prog-rent-insurance');
    const rentPercent = Math.min(Math.round((r.actual / (r.ideal || 1)) * 100), 100);
    progRent.style.width = `${rentPercent}%`;
    this._applyProgressBarTone(progRent, r.status.type);

    const badgeRent = document.getElementById('badge-rent-insurance');
    badgeRent.textContent = r.status.label;
    badgeRent.className = `benchmark-status-badge status-${r.status.type}`;

    // 2. Groceries
    const g = benchmarks.groceries;
    document.getElementById('actual-groceries').textContent = this.formatAUD(g.actual, false);
    document.getElementById('ideal-groceries').textContent = this.formatAUD(g.ideal, false);
    document.getElementById('pct-groceries').textContent = `${g.percentageOfIncome}% of net pay`;
    document.getElementById('market-groceries').textContent = `${g.weeklyRangeText} (${g.basketName})`;
    document.getElementById('advice-groceries').textContent = g.advice;

    const progGroc = document.getElementById('prog-groceries');
    const grocPercent = Math.min(Math.round((g.actual / (g.ideal || 1)) * 100), 100);
    progGroc.style.width = `${grocPercent}%`;
    this._applyProgressBarTone(progGroc, g.status.type);

    const badgeGroc = document.getElementById('badge-groceries');
    badgeGroc.textContent = g.status.label;
    badgeGroc.className = `benchmark-status-badge status-${g.status.type}`;

    // 3. Myself
    const m = benchmarks.myself;
    document.getElementById('actual-myself').textContent = this.formatAUD(m.actual, false);
    document.getElementById('ideal-myself').textContent = this.formatAUD(m.ideal, false);
    document.getElementById('pct-myself').textContent = `${m.percentageOfIncome}% of net pay`;
    document.getElementById('market-myself').textContent = m.cushionRangeText;
    document.getElementById('advice-myself').textContent = m.advice;

    const progSelf = document.getElementById('prog-myself');
    const selfPercent = Math.min(Math.round((m.actual / (m.ideal || 1)) * 100), 100);
    progSelf.style.width = `${selfPercent}%`;
    this._applyProgressBarTone(progSelf, m.status.type);

    const badgeSelf = document.getElementById('badge-myself');
    badgeSelf.textContent = m.status.label;
    badgeSelf.className = `benchmark-status-badge status-${m.status.type}`;
  }

  _applyProgressBarTone(element, statusType) {
    element.classList.remove('fill-warn', 'fill-danger');
    if (statusType === 'warn') {
      element.classList.add('fill-warn');
    } else if (statusType === 'danger') {
      element.classList.add('fill-danger');
    }
  }

  renderCategoryCards(categoryTotals, benchmarks) {
    const container = document.getElementById('category-cards-container');
    container.innerHTML = '';

    const expenseCategoriesToRender = [
      'rent-insurance',
      'groceries',
      'myself',
      'utilities',
      'transport',
      'other'
    ];

    // 1. Render Expense Categories
    expenseCategoriesToRender.forEach(catKey => {
      const def = this.categoryDefinitions[catKey];
      const data = categoryTotals[catKey] || { total: 0, count: 0 };
      
      let idealTarget = null;
      if (catKey === 'rent-insurance') idealTarget = benchmarks.rentInsurance.ideal;
      if (catKey === 'groceries') idealTarget = benchmarks.groceries.ideal;
      if (catKey === 'myself') idealTarget = benchmarks.myself.ideal;

      const card = document.createElement('div');
      card.className = 'category-row-card';

      let targetHtml = '';
      let progressPercent = 0;
      if (idealTarget) {
        targetHtml = `<span class="cat-target-inline">/ target ${this.formatAUD(idealTarget, false)}</span>`;
        progressPercent = Math.min(Math.round((data.total / idealTarget) * 100), 100);
      }

      card.innerHTML = `
        <div class="cat-header">
          <div class="cat-title-wrap">
            <span>${def.icon}</span>
            <span class="cat-name">${def.name}</span>
            <span class="cat-item-count">(${data.count})</span>
          </div>
          <div class="cat-totals">
            <span class="cat-spent">${this.formatAUD(data.total)}</span>
            ${targetHtml}
          </div>
        </div>
        ${idealTarget ? `
          <div class="cat-progress-mini">
            <div class="cat-progress-mini-fill" style="width: ${progressPercent}%;"></div>
          </div>
        ` : ''}
      `;
      container.appendChild(card);
    });

    // 2. Render Income Categories (if any income is recorded)
    const incomeKeys = ['income-salary', 'income-sidehustle', 'income-investments', 'income-other', 'income'];
    const activeIncomeKeys = incomeKeys.filter(k => categoryTotals[k] && categoryTotals[k].total > 0);

    if (activeIncomeKeys.length > 0) {
      const separator = document.createElement('div');
      separator.style.cssText = 'font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.06em; margin-top: 14px; margin-bottom: 2px;';
      separator.textContent = 'Income Streams';
      container.appendChild(separator);

      activeIncomeKeys.forEach(catKey => {
        const def = this.categoryDefinitions[catKey] || { name: 'Income', icon: '💼' };
        const data = categoryTotals[catKey];

        const card = document.createElement('div');
        card.className = 'category-row-card';
        card.style.borderLeft = '3px solid #10b981';

        card.innerHTML = `
          <div class="cat-header">
            <div class="cat-title-wrap">
              <span>${def.icon}</span>
              <span class="cat-name">${def.name}</span>
              <span class="cat-item-count">(${data.count})</span>
            </div>
            <div class="cat-totals">
              <span class="cat-spent entry-amount-pos">+${this.formatAUD(data.total)}</span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  }

  renderLedger(entries, filterCategory = 'ALL', onDelete) {
    const tbody = document.getElementById('ledger-table-body');
    const emptyState = document.getElementById('ledger-empty-state');
    tbody.innerHTML = '';

    let filtered = entries;
    if (filterCategory === 'INCOME') {
      filtered = entries.filter(e => e.type === 'income' || (e.category && e.category.startsWith('income')));
    } else if (filterCategory === 'EXPENSES') {
      filtered = entries.filter(e => e.type !== 'income' && !(e.category && e.category.startsWith('income')));
    } else if (filterCategory !== 'ALL') {
      filtered = entries.filter(e => e.category === filterCategory);
    }

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    filtered.forEach(entry => {
      const tr = document.createElement('tr');
      const isIncome = entry.type === 'income' || (entry.category && entry.category.startsWith('income'));
      const catDef = this.categoryDefinitions[entry.category] || { name: entry.category, icon: '•' };

      tr.innerHTML = `
        <td>${this.formatDate(entry.date)}</td>
        <td class="entry-desc-cell">
          <span>${entry.description}</span>
          ${entry.isRecurring ? '<span class="recurring-icon" title="Recurring Monthly Bill">↻</span>' : ''}
        </td>
        <td>
          <span class="entry-cat-tag ${isIncome ? 'entry-cat-tag-income' : ''}">
            ${catDef.icon} ${catDef.name}
          </span>
        </td>
        <td class="text-right ${isIncome ? 'entry-amount-pos' : 'entry-amount-neg'}">
          ${isIncome ? '+' : '-'}${this.formatAUD(entry.amount)}
        </td>
        <td class="text-right actions-th">
          <button class="row-action-btn delete-entry-btn" data-id="${entry.id}" title="Delete entry" aria-label="Delete entry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      tr.querySelector('.delete-entry-btn').addEventListener('click', () => {
        if (confirm(`Delete "${entry.description}"?`)) {
          onDelete(entry.id);
        }
      });

      tbody.appendChild(tr);
    });
  }
}

// Global instance
window.FinanceUI = FinanceUI;
