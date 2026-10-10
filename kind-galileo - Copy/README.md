# Aura Finance — Melbourne Minimalist Monthly Finance Tracker

A minimalist, high-focus personal finance web application specifically calibrated for living in **Melbourne, Australia (AUD $)**.

---

## ✨ Features

- **Melbourne Living Cost Intelligence (AUD)**:
  - **🏠 Rent + Insurance**: Evaluates 1-bed/studio rental rates in Melbourne (Inner CBD/Southbank vs Middle Brunswick/Footscray vs Outer) plus Victorian contents & Ambulance Vic/health insurance. Implements the 30%–35% net income threshold to prevent VIC rental stress.
  - **🛒 Groceries**: Calibrated to weekly single-adult supermarket baskets across Coles, Woolworths, ALDI, and fresh market shopping (Queen Victoria Market).
  - **✨ Myself (Self-Care & Discretionary)**: Dedicated budget cushion (15%–20%) for Melbourne's café and dining culture (flat whites, brunch, dinner), gym/bouldering, entertainment, and personal care.
  - **💰 Net Savings & Emergency Cushion**: Tracks your monthly net savings rate towards an optimal 20%+ target.

- **Minimalist Monochrome Aesthetic**:
  - High-contrast typography (`Plus Jakarta Sans` & `JetBrains Mono` for tabular figures).
  - Subtle borders, calm neutral zinc/slate palette, soft status badges.
  - Dark mode and light mode toggle with state persistence.

- **Frictionless Monthly Workflow**:
  - Month-to-month navigator with recurring transaction auto-carry (e.g. rent, insurance, Myki, utilities automatically copy to new months).
  - Quick Entry modal with Melbourne presets (`Monthly Rent`, `Contents Insurance`, `Coles`, `Woolies`, `Cafe & Coffee`, `Myki Pass`).
  - Press <kbd>N</kbd> keyboard shortcut to immediately log a transaction.

- **100% Private & Portable**:
  - All data is saved locally on your computer via browser `localStorage`.
  - Instant **CSV Export** (compatible with Excel, Apple Numbers, and Google Sheets).
  - **JSON Backup & Restore** for offline archiving.
  - Zero accounts, zero tracking, zero setup dependencies.

---

## 🚀 How to Run

Double-click [`index.html`](file:///c:/Users/vivek/Documents/antigravity/kind-galileo/index.html) or run in PowerShell:

```powershell
Invoke-Item index.html
```

---

## 📊 Melbourne Benchmark Calibration Matrix

| Category | Recommended Allocation | Melbourne Solo Benchmark (AUD) | Calibration Basis |
| :--- | :--- | :--- | :--- |
| **Rent + Insurance** | 30% – 35% of Net Pay | \$1,850 – \$2,350 / month | Median 1-bed/studio in Melbourne (Brunswick/Fitzroy/CBD) + VIC contents & Ambulance cover |
| **Groceries** | 10% – 13% of Net Pay | \$115 – \$150 / week (\$500 – \$650 / mo) | Single adult basket across Coles, Woolworths, ALDI & Queen Vic Market |
| **Myself (Self-Care)** | 15% – 20% of Net Pay | \$700 – \$1,050 / month | Melbourne coffee culture (\$5.50 flat whites), dining out, gym, entertainment & personal care |
| **Bills & Utilities** | ~5% – 7% of Net Pay | \$250 – \$350 / month | Victorian electricity, gas, water, and Aussie Broadband NBN |
| **Transport** | ~3% – 5% of Net Pay | \$178 / month | Public Transport Victoria (PTV) Zone 1+2 Monthly Commuter Pass |
| **Savings & Buffer** | 20%+ of Net Pay | Remainder | Emergency buffer, Super voluntary contributions, or HISA/ETFs |
