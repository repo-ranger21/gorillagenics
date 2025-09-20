const fs = require('fs').promises;
const path = require('path');

/**
 * Bankroll management system for GuerillaGenics
 * Provides persistent JSON-based ledger for tracking bankroll, bets, and performance
 */

class BankrollManager {
  constructor() {
    this.ledgerFile = path.join(__dirname, '../../logs/bankroll_ledger.json');
    this.configFile = path.join(__dirname, '../../logs/bankroll_config.json');
  }

  /**
   * Initialize a new bankroll with starting amount
   */
  async initialize(startAmount) {
    try {
      // Check if bankroll already exists
      try {
        await fs.access(this.ledgerFile);
        throw new Error('Bankroll already initialized. Use "gg3 bankroll show" to view current status.');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      const initialEntry = {
        id: this.generateId(),
        type: 'initialization',
        timestamp: new Date().toISOString(),
        balance: startAmount,
        amount: startAmount,
        description: 'Initial bankroll setup'
      };

      const initialLedger = {
        startingBalance: startAmount,
        currentBalance: startAmount,
        totalWins: 0,
        totalLosses: 0,
        totalBets: 0,
        created: new Date().toISOString(),
        entries: [initialEntry]
      };

      // Create logs directory if it doesn't exist
      await fs.mkdir(path.dirname(this.ledgerFile), { recursive: true });
      
      await fs.writeFile(this.ledgerFile, JSON.stringify(initialLedger, null, 2));
      
      console.log(`✅ Bankroll initialized with $${startAmount}`);
      return initialLedger;
    } catch (error) {
      console.error('❌ Failed to initialize bankroll:', error.message);
      throw error;
    }
  }

  /**
   * Get current bankroll status and history
   */
  async getStatus() {
    try {
      const ledgerData = await fs.readFile(this.ledgerFile, 'utf8');
      return JSON.parse(ledgerData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Bankroll not initialized. Run "gg3 bankroll init --start <amount>" first.');
      }
      throw error;
    }
  }

  /**
   * Add a bet recommendation entry to the ledger (from eval command)
   */
  async logBetRecommendation(betData) {
    try {
      const ledger = await this.getStatus();
      
      const entry = {
        id: this.generateId(),
        type: 'bet_recommendation',
        timestamp: new Date().toISOString(),
        slip: betData.slip,
        script: betData.script,
        stack: betData.stack,
        recommendedStake: betData.recommendedStake,
        bankrollUsed: betData.bankrollUsed,
        riskPercentage: betData.riskPercentage,
        expectedValue: betData.expectedValue,
        correlation: betData.correlation,
        roleTags: betData.roleTags,
        status: 'pending',
        balance: ledger.currentBalance // Balance doesn't change on recommendation
      };

      ledger.entries.push(entry);
      
      // Keep only last 1000 entries
      if (ledger.entries.length > 1000) {
        ledger.entries = ledger.entries.slice(-1000);
      }

      await fs.writeFile(this.ledgerFile, JSON.stringify(ledger, null, 2));
      
      console.log(`📝 Logged bet recommendation for slip: ${betData.slip}`);
      return entry;
    } catch (error) {
      console.error('❌ Failed to log bet recommendation:', error.message);
      throw error;
    }
  }

  /**
   * Update bet result (win/loss) and adjust bankroll
   */
  async updateBetResult(slip, result, amount = null) {
    try {
      const ledger = await this.getStatus();
      
      // Find the pending bet for this slip
      const pendingBet = ledger.entries
        .filter(entry => entry.type === 'bet_recommendation' && entry.slip === slip && entry.status === 'pending')
        .pop(); // Get the most recent one

      if (!pendingBet) {
        throw new Error(`No pending bet found for slip: ${slip}`);
      }

      let profit = 0;
      let newBalance = ledger.currentBalance;

      if (result.toLowerCase() === 'win') {
        // If amount not provided, use recommended stake as profit (assuming even odds)
        profit = amount || pendingBet.recommendedStake;
        newBalance += profit;
        ledger.totalWins++;
      } else if (result.toLowerCase() === 'loss') {
        // Loss amount is negative
        profit = -(amount || pendingBet.recommendedStake);
        newBalance += profit; // profit is negative, so this subtracts
        ledger.totalLosses++;
      } else {
        throw new Error('Result must be "win" or "loss"');
      }

      // Update the pending bet
      pendingBet.status = result.toLowerCase();
      pendingBet.actualResult = result.toLowerCase();
      pendingBet.profit = profit;
      pendingBet.settledAt = new Date().toISOString();

      // Add a settlement entry
      const settlementEntry = {
        id: this.generateId(),
        type: 'bet_settlement',
        timestamp: new Date().toISOString(),
        slip: slip,
        result: result.toLowerCase(),
        profit: profit,
        balance: newBalance,
        linkedBetId: pendingBet.id,
        description: `Bet ${result.toLowerCase()} - ${slip}`
      };

      ledger.entries.push(settlementEntry);
      ledger.currentBalance = newBalance;
      ledger.totalBets++;

      await fs.writeFile(this.ledgerFile, JSON.stringify(ledger, null, 2));
      
      console.log(`✅ Updated bet result: ${slip} - ${result.toUpperCase()}`);
      console.log(`💰 Profit/Loss: ${profit >= 0 ? '+' : ''}$${profit}`);
      console.log(`💳 New balance: $${newBalance}`);
      
      return settlementEntry;
    } catch (error) {
      console.error('❌ Failed to update bet result:', error.message);
      throw error;
    }
  }

  /**
   * Query ledger history with filters
   */
  async queryHistory(filters = {}) {
    try {
      const ledger = await this.getStatus();
      let entries = [...ledger.entries];

      // Apply filters
      if (filters.script) {
        entries = entries.filter(entry => entry.script === filters.script);
      }

      if (filters.stack) {
        entries = entries.filter(entry => entry.stack === filters.stack);
      }

      if (filters.type) {
        entries = entries.filter(entry => entry.type === filters.type);
      }

      if (filters.result) {
        entries = entries.filter(entry => entry.result === filters.result);
      }

      if (filters.limit) {
        entries = entries.slice(-filters.limit);
      }

      return {
        summary: {
          currentBalance: ledger.currentBalance,
          startingBalance: ledger.startingBalance,
          totalBets: ledger.totalBets,
          totalWins: ledger.totalWins,
          totalLosses: ledger.totalLosses,
          totalEntries: entries.length
        },
        entries: entries
      };
    } catch (error) {
      console.error('❌ Failed to query history:', error.message);
      throw error;
    }
  }

  /**
   * Generate unique ID for entries
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Calculate recommended stake based on Kelly Criterion or fixed percentage
   */
  calculateRecommendedStake(bankroll, riskPercentage, expectedValue = null) {
    // For now, use simple percentage-based staking
    // Could be enhanced with Kelly Criterion if odds and probabilities are provided
    return Math.round(bankroll * (riskPercentage / 100));
  }
}

// Create singleton instance
const bankrollManager = new BankrollManager();

module.exports = {
  initialize: (amount) => bankrollManager.initialize(amount),
  getStatus: () => bankrollManager.getStatus(),
  logBetRecommendation: (betData) => bankrollManager.logBetRecommendation(betData),
  updateBetResult: (slip, result, amount) => bankrollManager.updateBetResult(slip, result, amount),
  queryHistory: (filters) => bankrollManager.queryHistory(filters),
  calculateRecommendedStake: (bankroll, risk, ev) => bankrollManager.calculateRecommendedStake(bankroll, risk, ev),
  BankrollManager
};