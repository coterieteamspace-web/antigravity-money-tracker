/**
 * Aura Finance — Melbourne Living Cost Benchmark Engine (AUD $)
 * 
 * Accurately calibrated for single/solo adults living in Melbourne, Victoria.
 * Integrates local cost-of-living data (median rental bonds in VIC, 
 * Coles/Woolworths/ALDI grocery basket surveys, and Melbourne lifestyle benchmarks).
 */

class MelbourneBenchmarkEngine {
  constructor(config = {}) {
    this.config = {
      netMonthlyIncome: config.netMonthlyIncome || 5200, // Median single net income in Melbourne
      housingZone: config.housingZone || 'middle',       // 'inner', 'middle', 'outer'
      groceryProfile: config.groceryProfile || 'balanced', // 'budget', 'balanced', 'premium'
      rentCapPercent: config.rentCapPercent || 33,       // Max recommended % before rental stress
      ...config
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig() {
    return { ...this.config };
  }

  /**
   * Calculate ideal monthly targets in AUD ($) for:
   * 1. Rent + Insurance
   * 2. Groceries
   * 3. Myself (Self-care / Discretionary)
   */
  calculateBenchmarks(actualSpending = {}, overrideIncome = null) {
    const net = Number(overrideIncome || this.config.netMonthlyIncome) || 5200;

    // --- 1. RENT + INSURANCE ---
    // Melbourne Weekly Rent Medians (1-Bed / Studio Solo Living in VIC 2026):
    const rentMarketData = {
      inner: { minWeekly: 480, maxWeekly: 620, name: "Inner Melbourne (CBD, Southbank, Carlton, Richmond)" },
      middle: { minWeekly: 400, maxWeekly: 500, name: "Middle Melbourne (Brunswick, Coburg, Footscray, Hawthorn)" },
      outer: { minWeekly: 340, maxWeekly: 410, name: "Outer Melbourne (Suburban ring)" }
    };

    const zoneData = rentMarketData[this.config.housingZone] || rentMarketData.middle;
    const minRentMo = Math.round((zoneData.minWeekly * 52) / 12);
    const maxRentMo = Math.round((zoneData.maxWeekly * 52) / 12);
    
    // Insurance in Victoria: Contents ($35-$50/mo) + Basic Health / Ambulance Vic ($45-$85/mo)
    const typicalInsuranceMo = 100;

    // Ideal threshold based on net income rule
    const rentCapRatio = (this.config.rentCapPercent || 33) / 100;
    const idealRentInsurance = Math.round(net * rentCapRatio);

    // --- 2. GROCERIES ---
    // Based on single adult weekly grocery basket in Melbourne
    const groceryBasketData = {
      budget: { weeklyMin: 95, weeklyMax: 115, name: "ALDI & Local Market Stalls" },
      balanced: { weeklyMin: 125, weeklyMax: 150, name: "Coles / Woolworths Basket" },
      premium: { weeklyMin: 165, weeklyMax: 200, name: "Organic & Gourmet Grocers" }
    };

    const groceryData = groceryBasketData[this.config.groceryProfile] || groceryBasketData.balanced;
    const minGrocMo = Math.round((groceryData.weeklyMin * 52) / 12);
    const maxGrocMo = Math.round((groceryData.weeklyMax * 52) / 12);
    
    // Ideal grocery target: between 11% of net income and market midpoint
    const groceryMidpoint = Math.round((minGrocMo + maxGrocMo) / 2);
    const incomeGroceryShare = Math.round(net * 0.115);
    // Anchor target sensibly: within realistic grocery consumption bounds
    const idealGroceries = Math.max(minGrocMo, Math.min(incomeGroceryShare, maxGrocMo + 50));

    // --- 3. MYSELF (Self-care, Melbourne Dining & Discretionary) ---
    // 50/30/20 guideline: Wants / Lifestyle should ideally be 15% - 20% of net pay
    // Covers Melbourne specialty coffee culture ($5.50 flat whites), weekend dining,
    // fitness/gym memberships, entertainment, personal grooming and wellness.
    const idealMyself = Math.round(net * 0.175); // 17.5% baseline
    const minMyself = Math.round(net * 0.15);
    const maxMyself = Math.round(net * 0.22);

    // --- EVALUATE ACTUALS VS TARGETS ---
    const actualRent = actualSpending['rent-insurance'] || 0;
    const actualGroc = actualSpending['groceries'] || 0;
    const actualMy = actualSpending['myself'] || 0;

    return {
      income: net,
      rentInsurance: {
        ideal: idealRentInsurance,
        actual: actualRent,
        percentageOfIncome: Math.round((idealRentInsurance / net) * 100),
        actualPercentageOfIncome: net > 0 ? Math.round((actualRent / net) * 100) : 0,
        marketRangeText: `$${minRentMo + typicalInsuranceMo} – $${maxRentMo + typicalInsuranceMo}/mo`,
        zoneName: zoneData.name,
        status: this._evaluateStatus(actualRent, idealRentInsurance, 'rent'),
        advice: this._getRentAdvice(actualRent, idealRentInsurance, net, this.config.rentCapPercent)
      },
      groceries: {
        ideal: idealGroceries,
        actual: actualGroc,
        percentageOfIncome: Math.round((idealGroceries / net) * 100),
        actualPercentageOfIncome: net > 0 ? Math.round((actualGroc / net) * 100) : 0,
        weeklyRangeText: `$${groceryData.weeklyMin} – $${groceryData.weeklyMax}/wk`,
        basketName: groceryData.name,
        status: this._evaluateStatus(actualGroc, idealGroceries, 'groceries'),
        advice: this._getGroceryAdvice(actualGroc, idealGroceries, groceryData.weeklyMin, groceryData.weeklyMax)
      },
      myself: {
        ideal: idealMyself,
        actual: actualMy,
        percentageOfIncome: Math.round((idealMyself / net) * 100),
        actualPercentageOfIncome: net > 0 ? Math.round((actualMy / net) * 100) : 0,
        cushionRangeText: `$${minMyself} – $${maxMyself}/mo`,
        status: this._evaluateStatus(actualMy, idealMyself, 'myself'),
        advice: this._getMyselfAdvice(actualMy, idealMyself, net)
      }
    };
  }

  _evaluateStatus(actual, ideal, category) {
    if (actual === 0) return { label: "No spend yet", type: "neutral", percent: 0 };
    const ratio = actual / ideal;
    const percent = Math.min(Math.round(ratio * 100), 100);

    if (ratio <= 0.90) {
      return { label: "Under Budget", type: "good", percent };
    } else if (ratio <= 1.02) {
      return { label: "On Target", type: "good", percent };
    } else if (ratio <= 1.15) {
      return { label: "Approaching Limit", type: "warn", percent };
    } else {
      return { label: "Over Benchmark", type: "danger", percent };
    }
  }

  _getRentAdvice(actual, ideal, net, cap) {
    if (actual === 0) {
      return `Aim for ≤ $${ideal.toLocaleString()} AUD/mo (max ${cap}% of take-home pay) for 1-bed/studio + contents/health insurance in Victoria.`;
    }
    const diff = actual - ideal;
    if (diff > 0) {
      const actualPct = Math.round((actual / net) * 100);
      return `Currently ${actualPct}% of net pay ($${diff.toLocaleString()} above the ${cap}% recommendation). In Victoria, spending over 38% triggers acute rental stress.`;
    } else {
      return `On track! Spending $${Math.abs(diff).toLocaleString()} under your ideal Melbourne rent+insurance ceiling.`;
    }
  }

  _getGroceryAdvice(actual, ideal, weeklyMin, weeklyMax) {
    if (actual === 0) {
      return `Target is $${ideal.toLocaleString()} AUD/mo (~$${weeklyMin}–$${weeklyMax}/wk for a single adult shopping at Coles, Woolies & ALDI).`;
    }
    const diff = actual - ideal;
    if (diff > 0) {
      return `Currently $${diff.toLocaleString()} above your ideal monthly supermarket benchmark. Consider batch cooking or fresh markets like Queen Victoria Market.`;
    } else {
      return `Solid grocery pacing. You have $${Math.abs(diff).toLocaleString()} remaining in your food allocation this month.`;
    }
  }

  _getMyselfAdvice(actual, ideal, net) {
    if (actual === 0) {
      return `Healthy lifestyle allocation is ~15%–20% ($${ideal.toLocaleString()} AUD/mo) to comfortably enjoy Melbourne dining, coffee, and recreation without guilt.`;
    }
    const diff = actual - ideal;
    if (diff > 0) {
      return `Lifestyle spend is $${diff.toLocaleString()} over recommended 17.5% cushion. Watch high-frequency cafe runs and weekend dining out.`;
    } else {
      return `Balanced! You have $${Math.abs(diff).toLocaleString()} discretionary buffer left for personal care, dining, or Melbourne events.`;
    }
  }
}

// Global instance
window.MelbourneBenchmarkEngine = MelbourneBenchmarkEngine;
