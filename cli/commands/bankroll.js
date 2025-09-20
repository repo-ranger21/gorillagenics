const { Command } = require('commander');
const bankrollManager = require('../../utils/bankroll/manager');

const bankrollCommand = new Command('bankroll')
  .description('Bankroll management commands');

// Initialize bankroll
bankrollCommand
  .command('init')
  .description('Initialize bankroll with starting amount')
  .requiredOption('--start <amount>', 'Starting bankroll amount', parseFloat)
  .action(async (options) => {
    try {
      await bankrollManager.initialize(options.start);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

// Show bankroll status
bankrollCommand
  .command('show')
  .description('Show current bankroll and transaction history')
  .option('--limit <number>', 'Limit number of recent entries to show', parseInt, 10)
  .action(async (options) => {
    try {
      const status = await bankrollManager.getStatus();
      
      console.log('\n💰 BANKROLL STATUS');
      console.log('==================');
      console.log(`Current Balance: $${status.currentBalance}`);
      console.log(`Starting Balance: $${status.startingBalance}`);
      console.log(`Total Profit/Loss: ${status.currentBalance >= status.startingBalance ? '+' : ''}$${status.currentBalance - status.startingBalance}`);
      console.log(`Total Bets: ${status.totalBets}`);
      console.log(`Wins: ${status.totalWins} | Losses: ${status.totalLosses}`);
      if (status.totalBets > 0) {
        console.log(`Win Rate: ${((status.totalWins / status.totalBets) * 100).toFixed(1)}%`);
      }
      
      console.log('\n📊 RECENT TRANSACTIONS');
      console.log('======================');
      
      const recentEntries = status.entries.slice(-options.limit);
      recentEntries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const time = new Date(entry.timestamp).toLocaleTimeString();
        
        if (entry.type === 'initialization') {
          console.log(`${date} ${time} | INIT | Starting bankroll: $${entry.amount}`);
        } else if (entry.type === 'bet_recommendation') {
          console.log(`${date} ${time} | BET  | Slip: ${entry.slip} | Stake: $${entry.recommendedStake} | Status: ${entry.status.toUpperCase()}`);
          if (entry.script) console.log(`                    | Script: ${entry.script} | Stack: ${entry.stack || 'N/A'}`);
        } else if (entry.type === 'bet_settlement') {
          const profitStr = entry.profit >= 0 ? `+$${entry.profit}` : `-$${Math.abs(entry.profit)}`;
          console.log(`${date} ${time} | ${entry.result.toUpperCase().padEnd(4)} | Slip: ${entry.slip} | P/L: ${profitStr} | Balance: $${entry.balance}`);
        }
      });
      
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

// Update bet result
bankrollCommand
  .command('update')
  .description('Update bet result and adjust bankroll')
  .requiredOption('--slip <slip>', 'Slip identifier (e.g., "1,4,5")')
  .requiredOption('--result <result>', 'Bet result: win or loss')
  .option('--amount <amount>', 'Specific profit/loss amount (optional)', parseFloat)
  .action(async (options) => {
    try {
      await bankrollManager.updateBetResult(options.slip, options.result, options.amount);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

// Query history
bankrollCommand
  .command('query')
  .description('Query bankroll history with filters')
  .option('--script <script>', 'Filter by game script')
  .option('--stack <stack>', 'Filter by player stack')
  .option('--type <type>', 'Filter by entry type (bet_recommendation, bet_settlement)')
  .option('--result <result>', 'Filter by result (win, loss)')
  .option('--limit <number>', 'Limit number of results', parseInt, 50)
  .action(async (options) => {
    try {
      const filters = {};
      if (options.script) filters.script = options.script;
      if (options.stack) filters.stack = options.stack;
      if (options.type) filters.type = options.type;
      if (options.result) filters.result = options.result;
      if (options.limit) filters.limit = options.limit;
      
      const results = await bankrollManager.queryHistory(filters);
      
      console.log('\n🔍 QUERY RESULTS');
      console.log('================');
      console.log(`Current Balance: $${results.summary.currentBalance}`);
      console.log(`Entries Found: ${results.summary.totalEntries}`);
      
      if (results.entries.length === 0) {
        console.log('\nNo entries found matching the specified filters.');
        return;
      }
      
      console.log('\n📊 FILTERED TRANSACTIONS');
      console.log('=========================');
      
      results.entries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const time = new Date(entry.timestamp).toLocaleTimeString();
        
        if (entry.type === 'bet_recommendation') {
          console.log(`${date} ${time} | BET  | Slip: ${entry.slip} | Stake: $${entry.recommendedStake} | Status: ${entry.status.toUpperCase()}`);
          if (entry.script) console.log(`                    | Script: ${entry.script} | Stack: ${entry.stack || 'N/A'}`);
        } else if (entry.type === 'bet_settlement') {
          const profitStr = entry.profit >= 0 ? `+$${entry.profit}` : `-$${Math.abs(entry.profit)}`;
          console.log(`${date} ${time} | ${entry.result.toUpperCase().padEnd(4)} | Slip: ${entry.slip} | P/L: ${profitStr} | Balance: $${entry.balance}`);
        }
      });
      
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

module.exports = bankrollCommand;