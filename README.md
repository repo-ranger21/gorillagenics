# Guerillagenics 3‑Pick Builder

A full‑stack DFS + betting analytics engine that builds, evaluates, and tracks 3‑pick slips with bankroll discipline.

🚀 **Features**
- **EV Engine**: Calculates expected value % and win probability for props
- **Role Tagging**: Anchor / Correlation / Low‑Variance classification
- **Correlation Modeling**: Game script priors (shootout, control, neutral)
- **Bankroll Management**: Kelly staking with caps, parlay optimizer
- **Ledger**: Persistent bankroll tracking with auto‑tagging by script + stack
- **Visualization**: Bankroll growth curve, ROI by script/stack


🖥 **CLI Usage**
```bash
# Evaluate a slip
gg3 eval --csv examples/picks.csv --slip "1,4,5" --script BUF_control --stack "Allen+Cook+Achane"

# Suggest top slips
gg3 suggest --csv examples/picks.csv --script shootout --top 5

# Initialize bankroll
gg3 bankroll init --start 1000

# Update results
gg3 bankroll update --slip "1,4,5" --result win

# Show bankroll
gg3 bankroll show

# Visualize bankroll growth
gg3 viz bankroll
```

## 🧪 Testing
Run the test suite with:
```bash
pytest
```
All floating‑point comparisons use `pytest.approx` to avoid precision issues.

## 🏷 Release Hygiene
Since you’ve just resolved a significant merge and test suite improvement, consider tagging a patch release:

```bash
git tag v0.1.1 -m "Patch release: merged EV tests, float precision fixes"
git push origin v0.1.1
```
That way, reviewers can see the evolution from v0.1.0 → v0.1.1.