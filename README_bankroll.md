# 🦍 Gorillagenics Bankroll Management Module

Advanced bankroll management and staking strategies for biometric-enhanced sports betting.

## Features

### 📊 Kelly Criterion Implementation
- **Optimal Kelly Staking**: Calculates optimal fraction of bankroll to risk per pick
- **Risk Management**: Configurable risk tolerance (half-Kelly, quarter-Kelly, etc.)
- **Safety Caps**: Maximum stake limits to protect against overbetting
- **Expected Value Calculations**: Precise EV computation for informed decisions

### 🧬 Biometric Enhancement
- **Player Metric Integration**: Enhances pick probabilities using biometric data
- **BioBoost Score Impact**: Adjusts probabilities based on player wellness metrics
- **Injury Status Weighting**: Automatic probability adjustments for injury reports
- **Weather Condition Analysis**: Environmental factor considerations

### 🎯 Parlay Strategy Recommendations
- **Correlation Analysis**: Detects relationships between picks
- **Optimal Parlay Structure**: Recommends straights, 2-leg, or 3-leg parlays
- **EV-Based Decisions**: Parlay recommendations based on average expected value
- **Risk-Adjusted Strategies**: Accounts for correlation risk in multi-leg bets

### 📋 Output Formats
- **JSON API Ready**: Structured data for applications
- **Notion-Compatible**: Markdown tables for documentation
- **Performance Tracking**: Built-in analytics and ROI calculations

## Installation

```bash
npm install
```

## Quick Start

```javascript
const BankrollManager = require('./backend_utils_bankrollManager');

// Initialize with $1000 bankroll
const bankrollManager = new BankrollManager({
  bankroll: 1000,
  riskTolerance: 0.5,  // Half-Kelly
  kellyCap: 0.05,      // 5% max per pick
  minStake: 10
});

// Example picks
const picks = [
  {
    player: "Josh Allen",
    market: "Over 265.5 Passing Yards",
    odds: 1.9,
    winProbability: 0.62,
    ev: 0.22
  }
];

// Get recommendation
const recommendation = bankrollManager.processPicksRecommendation(picks);
console.log(recommendation);
```

## Example Output

```json
{
  "bankroll": 1000,
  "risk_tolerance": 0.5,
  "kelly_cap": 0.05,
  "parlay_recommendation": "2-leg parlay",
  "picks": [
    {
      "player": "Josh Allen",
      "market": "Over 265.5 Passing Yards",
      "odds": 1.9,
      "ev": 0.38,
      "recommended_stake": 50
    }
  ]
}
```

## Demo

Run the interactive demo:

```bash
node examples_bankrollDemo.js
```

## API Reference

### BankrollManager Class

#### Constructor Options
- `bankroll` (number): Starting bankroll amount
- `riskTolerance` (number): Risk multiplier (0.5 = half-Kelly)
- `kellyCap` (number): Maximum fraction per pick (0.05 = 5%)
- `minStake` (number): Minimum stake amount

#### Key Methods

##### `calculateKellyFraction(odds, winProbability)`
Calculates optimal Kelly fraction for a bet.

**Parameters:**
- `odds` (number): Decimal odds (e.g., 1.9 for -110)
- `winProbability` (number): Estimated win probability (0-1)

**Returns:** Kelly fraction (0-1)

##### `calculateStake(pick)`
Calculates recommended stake with risk management.

**Parameters:**
- `pick` (object): Pick with odds, winProbability, and ev

**Returns:** Stake recommendation object

##### `processPicksRecommendation(picks)`
Processes multiple picks for optimal bankroll allocation.

**Parameters:**
- `picks` (array): Array of pick objects

**Returns:** Complete bankroll recommendation

##### `generateNotionMarkdown(recommendation)`
Generates Notion-ready markdown table.

**Parameters:**
- `recommendation` (object): Bankroll recommendation

**Returns:** Markdown formatted string

### PickBuilderService Class

Enhanced service that integrates player metrics with bankroll management.

#### Key Methods

##### `createEnhancedPick(pickData)`
Creates a pick enhanced with biometric data.

##### `processBankrollRecommendation(rawPicks)`
Processes picks with biometric enhancement and bankroll analysis.

## Integration Examples

### With Existing Player Metrics

```javascript
const PickBuilderService = require('./backend_services_pickBuilder');

const pickBuilder = new PickBuilderService({
  bankroll: 1000,
  riskTolerance: 0.5,
  kellyCap: 0.05
});

const rawPicks = [
  {
    player: "Josh Allen",
    market: "Over 265.5 Passing Yards",
    odds: 1.9,
    baseProbability: 0.62
  }
];

const recommendation = await pickBuilder.processBankrollRecommendation(rawPicks);
```

### With Database Storage

```javascript
const Pick = require('./backend_models_Pick');

// Save picks to database
const savedPicks = await pickBuilder.savePicks(enhancedPicks);

// Get performance analytics
const stats = await Pick.getPerformanceStats();
console.log(`Win Rate: ${stats[0].winRate * 100}%`);
console.log(`ROI: ${stats[0].roi * 100}%`);
```

## Risk Management Features

### Kelly Criterion Protection
- **Fractional Kelly**: Reduces risk with configurable tolerance
- **Kelly Capping**: Prevents excessive stakes on high-value bets
- **Minimum Stakes**: Ensures viable bet sizes

### Correlation Analysis
- **Same Team Detection**: Identifies correlated picks
- **Game-Based Correlation**: Analyzes picks within same games
- **Parlay Recommendations**: Suggests optimal bet structures

### Biometric Risk Factors
- **Injury Impact**: Probability adjustments for player health
- **Weather Conditions**: Environmental performance factors
- **Wellness Metrics**: BioBoost score integration

## Testing

Run the test suite:

```bash
node tests_bankrollManager.test.js
```

## File Structure

```
gorillagenics/
├── backend_utils_bankrollManager.js     # Core bankroll management
├── backend_services_pickBuilder.js      # Enhanced pick service
├── backend_models_Pick.js               # Pick data model
├── examples_bankrollDemo.js             # Interactive demo
├── tests_bankrollManager.test.js        # Test suite
└── README_bankroll.md                   # This documentation
```

## Advanced Features

### Performance Tracking
- Win rate analysis
- ROI calculations
- Stake tracking
- EV validation

### Risk Analytics
- Bankroll utilization monitoring
- Risk level assessment
- Correlation impact analysis
- Kelly deviation tracking

### Output Formats
- JSON for APIs
- Markdown for documentation
- CSV for spreadsheets
- Database-ready objects

## Best Practices

### Risk Management
1. Start with conservative risk tolerance (0.25-0.5)
2. Set reasonable Kelly caps (3-5%)
3. Monitor bankroll utilization (<20%)
4. Avoid highly correlated parlays

### Pick Selection
1. Require minimum EV threshold (5%+)
2. Verify player metric confidence (75%+)
3. Consider injury status impact
4. Account for weather conditions

### Bankroll Updates
1. Update bankroll after each session
2. Recalibrate risk settings quarterly
3. Track performance metrics
4. Adjust strategy based on results

## Integration with Existing Modules

### Player Metrics
The module seamlessly integrates with existing player metric scrapers:
- Social media biometric extraction
- Injury report processing
- Weather condition analysis
- Performance score calculations

### Data Pipeline
Fits into the existing scraping and processing pipeline:
1. **Data Collection**: Existing scrapers gather player data
2. **Metric Calculation**: BioBoost scores and wellness metrics
3. **Pick Enhancement**: Biometric probability adjustments
4. **Bankroll Analysis**: Kelly criterion and stake recommendations
5. **Output Generation**: JSON/Markdown formatted results

## License

MIT License - See LICENSE file for details.

## Support

For questions or issues, please refer to the repository documentation or create an issue.