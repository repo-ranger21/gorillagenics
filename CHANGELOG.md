# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-09-20
### Added
- **Core Modules**
  - `ev.py`: Expected value % and win probability engine
  - `sigma.py`: Stat-type sigma rules for prop evaluation
  - `roles.py`: Role tagging (Anchor, Correlation, Low-Variance)
  - `corr.py`: Game script correlation priors
  - `slip.py`: Slip evaluation and grading
  - `bankroll.py`: Kelly staking, parlay optimizer, and bankroll ledger
  - `cli.py`: Click-based CLI entrypoint (`gg3`)
  - `viz.py`: Visualization layer (bankroll curve, ROI by script)
  - `templates/`: Markdown export templates

- **Project Infrastructure**
  - `pyproject.toml` with dependencies and CLI entrypoint
  - `.replit` config for Node + Python hybrid environment
  - `examples/picks.csv` sample dataset
  - `tests/` suite for bankroll, EV, correlation, and roles
  - `.github/workflows/ci.yml` for automated linting and pytest

### Features
- CLI commands for evaluating slips, suggesting picks, tracking bankroll, and visualizing performance
- Persistent bankroll ledger with auto-tagging by game script and stack type
- Queryable history and ROI analysis
- Visualization of bankroll growth and ROI by script/stack
- Ready for CI integration and packaging

### Notes
- This is the **initial public release** of Guerillagenics 3‑Pick Builder.
- Sets the foundation for a full-stack DFS analytics engine with bankroll discipline, correlation modeling, and visualization.