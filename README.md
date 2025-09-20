# gorillagenics

A biometric DFS betting application with CLI tools for bankroll management and bet evaluation.

## CLI Usage

The `gg3` command-line tool provides bankroll management and betting slip evaluation functionality.

### Installation

```bash
npm install
npm link  # Optional: Install globally for system-wide access
```

### Bankroll Management

#### Initialize Bankroll
```bash
gg3 bankroll init --start 1000
```
Starts a new bankroll with the specified amount ($1,000 in this example).

#### View Bankroll Status
```bash
gg3 bankroll show
```
Displays current balance, profit/loss, win rate, and recent transaction history.

#### Update Bet Results
```bash
gg3 bankroll update --slip "1,4,5" --result win
gg3 bankroll update --slip "1,4,5" --result loss
```
Records the outcome of a bet and updates the bankroll balance.

#### Query History
```bash
# Filter by game script
gg3 bankroll query --script "BUF_control"

# Filter by player stack
gg3 bankroll query --stack "Allen+Cook+Achane"

# Filter by result type
gg3 bankroll query --result win

# Limit results
gg3 bankroll query --limit 5
```

### Bet Evaluation

#### Evaluate Betting Slips
```bash
gg3 eval --csv picks.csv --slip "1,4,5" --script BUF_control --bankroll 1000 --risk 0.5
```

**Parameters:**
- `--csv`: CSV file containing pick data with columns: id, player, prop, line, odds
- `--slip`: Comma-separated list of pick IDs to include in the slip
- `--script`: Game script identifier (e.g., "BUF_control")
- `--bankroll`: Current bankroll amount to use for stake calculation
- `--risk`: Risk percentage as decimal (0.5 = 50%)

**Output:**
- Expected Value calculation
- Correlation analysis
- Role tags and stack composition
- Recommended stake amount
- Automatic logging to bankroll ledger

### CSV Format

The picks CSV file should have the following format:

```csv
id,player,prop,line,odds
1,Josh Allen,Passing Yards,275.5,-110
4,Stefon Diggs,Receiving Yards,85.5,-115
5,James Cook,Rushing Yards,65.5,-105
```

### Features

- **Persistent Ledger**: All bankroll data stored in JSON format (`logs/bankroll_ledger.json`)
- **Auto-Updates**: Bankroll adjusts automatically when logging wins/losses
- **History Tracking**: Complete transaction history with timestamps and metadata
- **Query Functionality**: Filter and search historical data
- **Auto-Tagging**: Game scripts and player stacks automatically tagged
- **Risk Management**: Kelly Criterion and percentage-based staking recommendations

## Backend Components

The backend includes various data scraping utilities for NFL stats, injury reports, social metrics, and weather data. See the individual backend files for more details.