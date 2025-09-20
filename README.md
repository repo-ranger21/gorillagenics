# Gorillagenics - DFS Sports Betting Analysis CLI

A comprehensive Python CLI package for DFS (Daily Fantasy Sports) NFL betting analysis and optimization, featuring advanced correlation analysis, Kelly staking, and data-driven pick recommendations.

## Features

- **3-Pick Builder**: Evaluate specific betting slips with EV calculations and win probability analysis
- **Correlation Engine**: Game script priors (shootout, control, neutral) with player correlation analysis
- **Bankroll Optimizer**: Kelly staking with configurable caps and parlay structure recommendations
- **Persistent Ledger**: JSON-based bankroll tracking with auto-updates and win/loss logging
- **Auto-Tagging**: Log slips with game script and stack type for performance analysis
- **Analytics Engine**: Filter ledger by script/stack, compute ROI and win rates
- **Visualization**: Generate bankroll growth curves and ROI charts by script/stack

## Installation

### Prerequisites
- Python 3.8+
- pandas, numpy, click, matplotlib, plotly, jinja2

### Install Dependencies
```bash
pip install pandas numpy click matplotlib plotly jinja2 pytest
```

## Usage

The CLI is accessible via the `gg3` command (when installed) or directly via Python module:

```bash
python -m src.gorillagenics.cli [COMMAND] [OPTIONS]
```

### Basic Commands

#### 1. Evaluate a Betting Slip
```bash
python -m src.gorillagenics.cli eval --csv examples/picks.csv --slip "1,2,3" --script shootout --stack "Allen+Diggs+Kelce" --stake 50
```

**Output:**
```
================================================================================
GORILLAGENICS SLIP EVALUATION
Game Script: SHOOTOUT
Stack: Allen+Diggs+Kelce
Stake: $50.00
================================================================================

#   Player               Prop            Line     Odds     EV%      Role         Prob    
--------------------------------------------------------------------------------
1   Josh Allen           Passing Yards   275.5    1.91     42.8     Anchor       0.75    
2   Stefon Diggs         Receiving Yards 75.5     1.87     24.7     Anchor       0.67    
3   Travis Kelce         Receiving Yards 65.5     1.95     39.0     Anchor       0.71    

================================================================================
SLIP SUMMARY
================================================================================
Individual EV Total: 106.5%
Parlay Probability: 0.355 (35.5%)
Parlay Odds: 6.96
Parlay EV: 147.6%

KELLY STAKING RECOMMENDATION:
Recommended Stake: $50.00
Kelly Percentage: 5.0%
Edge: 1.5%

PARLAY OPTIMIZATION:
Optimal Size: 3 legs
Optimal EV: 147.6%
```

#### 2. Get Optimal Slip Suggestions
```bash
python -m src.gorillagenics.cli suggest --csv examples/picks.csv --script shootout --top 10
```

Analyzes all available picks and suggests the best 3-pick combinations based on EV and correlation.

#### 3. Bankroll Management

**Initialize Bankroll:**
```bash
python -m src.gorillagenics.cli bankroll init --start 1000
```

**Check Status:**
```bash
python -m src.gorillagenics.cli bankroll show
```

**Update with Results:**
```bash
python -m src.gorillagenics.cli bankroll update --slip "slip_shootout_3leg" --result win --payout 347.50
```

**Query Performance:**
```bash
python -m src.gorillagenics.cli bankroll query --script shootout
python -m src.gorillagenics.cli bankroll query --stack "QB+WR"
```

#### 4. Generate Visualizations

**Bankroll Growth Curve:**
```bash
python -m src.gorillagenics.cli viz bankroll --output bankroll_curve.png
```

**ROI Analysis:**
```bash
python -m src.gorillagenics.cli viz roi --by script --output roi_by_script.png
python -m src.gorillagenics.cli viz roi --by stack --output roi_by_stack.png
```

## Project Structure

```
gorillagenics/
├── src/gorillagenics/
│   ├── __init__.py          # Package initialization
│   ├── ev.py               # EV + win probability calculations
│   ├── sigma.py            # Statistical sigma rules
│   ├── roles.py            # Player role tagging (Anchor/Correlation/Low-Variance)
│   ├── corr.py             # Correlation engine + game script priors
│   ├── slip.py             # Slip evaluation + grading
│   ├── bankroll.py         # Bankroll ledger, Kelly staking, parlay optimizer
│   ├── cli.py              # Click-based CLI entrypoint
│   ├── viz.py              # Visualization (bankroll curve, ROI charts)
│   └── templates/
│       └── table.md.j2     # Markdown export template
├── tests/
│   ├── test_ev.py          # EV calculation tests
│   ├── test_roles.py       # Role tagging tests
│   ├── test_corr.py        # Correlation engine tests
│   ├── test_slip.py        # Slip evaluation tests
│   ├── test_bankroll.py    # Bankroll management tests
│   └── test_viz.py         # Visualization tests
├── examples/
│   └── picks.csv           # Sample NFL picks data
├── pyproject.toml          # Package configuration
└── README.md
```

## Data Format

### Input CSV Format
Your picks CSV should include these columns:
```csv
player_name,position,team,prop_type,line,odds,historical_hit_rate,avg_fantasy_points,consistency_score,game_script,price_tier,performance_history
Josh Allen,QB,BUF,Passing Yards,275.5,1.91,0.65,22.5,0.75,control,high,"280,290,265,295,270"
```

### Required Columns:
- `player_name`: Player's full name
- `position`: Position (QB, RB, WR, TE, K, DST)
- `team`: Team abbreviation
- `prop_type`: Type of prop (e.g., "Passing Yards", "Receiving Yards")
- `line`: Betting line value
- `odds`: Decimal odds (e.g., 1.91 for -110)
- `historical_hit_rate`: Historical success rate (0-1)
- `game_script`: Expected game flow ("shootout", "control", "neutral")

## Game Scripts

The system recognizes five game script types:

- **Shootout**: High-scoring, pass-heavy games (boosts QB/WR/TE)
- **Control**: Run-heavy, clock control games (boosts RB)
- **Neutral**: Balanced offensive approach
- **Blowout**: One-sided games favoring the winning team's RB
- **Defensive**: Low-scoring, defense-dominated games

## Player Roles

Players are automatically tagged with roles for optimal lineup construction:

- **Anchor**: High-EV, consistent players (foundation of lineup)
- **Correlation**: Players with positive correlation to anchor (same team QB-WR)
- **Low-Variance**: Consistent, safe players with high floor
- **High-Upside**: Boom-or-bust players with tournament upside
- **Value**: Low-priced players with positive EV

## Kelly Staking

The system uses fractional Kelly staking with these defaults:
- **Kelly Fraction**: 25% of full Kelly (conservative approach)
- **Maximum Stake**: 5% of bankroll per bet
- **Edge Calculation**: (Win Probability × Odds) - 1

## Bankroll Ledger

All betting activity is automatically logged to `~/.gorillagenics/ledger.json`:

```json
{
  "current_balance": 1045.50,
  "ledger": [
    {
      "timestamp": "2024-01-15T14:30:00",
      "slip_id": "slip_shootout_3leg",
      "action": "bet",
      "amount": -50.0,
      "balance_before": 1000.0,
      "balance_after": 950.0,
      "game_script": "shootout",
      "stack_type": "Allen+Diggs+Kelce"
    }
  ]
}
```

## Development

### Running Tests
```bash
python -m pytest tests/ -v
```

### Installing in Development Mode
```bash
pip install -e .
```

### Code Style
The project follows Python best practices:
- Type hints for function parameters and returns
- Comprehensive docstrings
- Error handling with meaningful messages
- Modular design with clear separation of concerns

## Performance Analytics

Query your betting performance with advanced filters:

```bash
# Performance by game script
gg3 bankroll query --script shootout

# Performance by stack type
gg3 bankroll query --stack "QB+WR"

# Visualize ROI trends
gg3 viz roi --by script
```

## Integration with Web App

This CLI package works alongside the existing GuerillaGenics React web application, providing:
- **Web Interface**: Casual users, visual dashboards, real-time data
- **CLI Interface**: Power users, automation, detailed analysis, backtesting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Gorillagenics** - Combining the power of data analysis with the instincts of the jungle for optimal DFS performance.