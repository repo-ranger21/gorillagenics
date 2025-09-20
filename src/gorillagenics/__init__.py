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
from .roles import RoleTagger, analyze_role_correlation
from .corr import CorrelationEngine, pair_correlation_analysis
from .bankroll import BankrollManager, ParLayOptimizer
from .slip import SlipEvaluator, grade_slip
from .sigma import SigmaAnalyzer

__all__ = [
    "calculate_ev",
    "calculate_win_probability", 
    "RoleTagger",
    "analyze_role_correlation",
    "CorrelationEngine",
    "pair_correlation_analysis",
    "BankrollManager",
    "ParLayOptimizer",
    "SlipEvaluator",
    "grade_slip",
    "SigmaAnalyzer",
]