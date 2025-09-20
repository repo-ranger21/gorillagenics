const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const bankrollManager = require('../../utils/bankroll/manager');

const evalCommand = new Command('eval')
  .description('Evaluate betting slips and log recommendations to bankroll');

evalCommand
  .command('slip', { isDefault: true })
  .description('Evaluate a betting slip with specified parameters')
  .requiredOption('--csv <file>', 'CSV file with picks data')
  .requiredOption('--slip <slip>', 'Slip identifier (e.g., "1,4,5")')
  .requiredOption('--script <script>', 'Game script name (e.g., "BUF_control")')
  .requiredOption('--bankroll <amount>', 'Bankroll amount to use', parseFloat)
  .requiredOption('--risk <percentage>', 'Risk percentage (0.0-1.0)', parseFloat)
  .action(async (options) => {
    try {
      console.log('\n🏈 EVALUATING BETTING SLIP');
      console.log('===========================');
      
      // Parse slip picks
      const slipPicks = options.slip.split(',').map(id => parseInt(id.trim()));
      console.log(`Slip: ${options.slip}`);
      console.log(`Script: ${options.script}`);
      console.log(`Bankroll: $${options.bankroll}`);
      console.log(`Risk: ${(options.risk * 100).toFixed(1)}%`);
      
      // Load CSV data
      let picksData = [];
      try {
        const csvContent = await fs.readFile(options.csv, 'utf8');
        picksData = parseCSV(csvContent);
        console.log(`✅ Loaded ${picksData.length} picks from ${options.csv}`);
      } catch (error) {
        throw new Error(`Failed to load CSV file: ${error.message}`);
      }
      
      // Filter picks for the slip
      const slipData = picksData.filter(pick => slipPicks.includes(pick.id));
      
      if (slipData.length === 0) {
        throw new Error(`No picks found for slip IDs: ${options.slip}`);
      }
      
      console.log(`\n📋 SLIP PICKS (${slipData.length} selections):`);
      slipData.forEach(pick => {
        console.log(`  ${pick.id}: ${pick.player} ${pick.prop} ${pick.line} (${pick.odds || 'N/A'})`);
      });
      
      // Calculate evaluation metrics
      const evaluation = calculateSlipEvaluation(slipData, options.script);
      
      console.log('\n📊 EVALUATION RESULTS:');
      console.log('======================');
      console.log(`Expected Value: ${evaluation.expectedValue >= 0 ? '+' : ''}${evaluation.expectedValue.toFixed(2)}%`);
      console.log(`Correlation Score: ${evaluation.correlation.toFixed(2)}/10`);
      console.log(`Role Tags: ${evaluation.roleTags.join(', ')}`);
      
      // Calculate recommended stake
      const recommendedStake = bankrollManager.calculateRecommendedStake(
        options.bankroll, 
        options.risk * 100, 
        evaluation.expectedValue
      );
      
      console.log(`\n💰 STAKING RECOMMENDATION:`);
      console.log(`==========================`);
      console.log(`Recommended Stake: $${recommendedStake}`);
      console.log(`Risk Percentage: ${(options.risk * 100).toFixed(1)}%`);
      
      // Create player stack name
      const playerStack = slipData.map(pick => pick.player.split(' ').pop()).join('+');
      
      // Log to bankroll
      const betData = {
        slip: options.slip,
        script: options.script,
        stack: playerStack,
        recommendedStake: recommendedStake,
        bankrollUsed: options.bankroll,
        riskPercentage: options.risk * 100,
        expectedValue: evaluation.expectedValue,
        correlation: evaluation.correlation,
        roleTags: evaluation.roleTags
      };
      
      await bankrollManager.logBetRecommendation(betData);
      
      console.log('\n✅ Evaluation complete and logged to bankroll');
      console.log(`📝 Use "gg3 bankroll update --slip "${options.slip}" --result win/loss" to record the outcome`);
      
    } catch (error) {
      console.error('❌ Evaluation failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Parse CSV content into structured data
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const picks = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const pick = {};
    
    headers.forEach((header, index) => {
      pick[header] = values[index] || '';
    });
    
    // Ensure we have required fields
    pick.id = parseInt(pick.id) || i;
    pick.player = pick.player || pick.name || `Player ${i}`;
    pick.prop = pick.prop || pick.market || 'Unknown Prop';
    pick.line = pick.line || pick.target || 'N/A';
    pick.odds = pick.odds || pick.price || null;
    
    picks.push(pick);
  }
  
  return picks;
}

/**
 * Calculate slip evaluation metrics
 * This is a simplified version - in a real implementation, this would integrate
 * with the existing scraping infrastructure and player metrics
 */
function calculateSlipEvaluation(slipData, script) {
  // Mock evaluation logic - replace with actual analytics
  const numPicks = slipData.length;
  
  // Calculate expected value (simplified)
  let totalEV = 0;
  slipData.forEach(pick => {
    // Mock EV calculation based on pick data
    const mockEV = Math.random() * 10 - 5; // Random EV between -5% and +5%
    totalEV += mockEV;
  });
  const avgEV = totalEV / numPicks;
  
  // Calculate correlation (simplified)
  const correlation = Math.max(1, 10 - numPicks); // Lower correlation with more picks
  
  // Generate role tags based on props and script
  const roleTags = generateRoleTags(slipData, script);
  
  return {
    expectedValue: avgEV,
    correlation: correlation,
    roleTags: roleTags
  };
}

/**
 * Generate role tags based on picks and script
 */
function generateRoleTags(slipData, script) {
  const tags = [];
  
  // Add script tag
  tags.push(`Script:${script}`);
  
  // Analyze pick types
  const propTypes = slipData.map(pick => pick.prop.toLowerCase());
  
  if (propTypes.some(prop => prop.includes('pass') || prop.includes('yards'))) {
    tags.push('Passing');
  }
  if (propTypes.some(prop => prop.includes('rush') || prop.includes('carries'))) {
    tags.push('Rushing');
  }
  if (propTypes.some(prop => prop.includes('rec') || prop.includes('catch'))) {
    tags.push('Receiving');
  }
  if (propTypes.some(prop => prop.includes('td') || prop.includes('touchdown'))) {
    tags.push('Scoring');
  }
  
  // Add correlation indicator
  if (slipData.length > 3) {
    tags.push('High-Correlation');
  } else {
    tags.push('Low-Correlation');
  }
  
  return tags;
}

module.exports = evalCommand;