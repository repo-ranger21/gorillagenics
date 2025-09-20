"""
Gorillagenics: A comprehensive Python CLI package for DFS sports betting analysis and optimization.

This package provides tools for:
- EV calculations and win probability analysis
- Player role tagging and correlation analysis
- Bankroll management with Kelly staking
- Parlay optimization
- Performance visualization and analytics
"""

__version__ = "0.1.0"
__author__ = "GuerillaGenics"

from .ev import calculate_ev, calculate_win_probability
from .roles import tag_player_role, get_role_weights
from .corr import calculate_correlation, get_game_script_priors
from .bankroll import BankrollManager, ParLayOptimizer
from .slip import SlipEvaluator, grade_slip

__all__ = [
    "calculate_ev",
    "calculate_win_probability", 
    "tag_player_role",
    "get_role_weights",
    "calculate_correlation",
    "get_game_script_priors",
    "BankrollManager",
    "ParLayOptimizer",
    "SlipEvaluator",
    "grade_slip",
]