"""
Expected Value (EV) and Win Probability Calculations for DFS Picks.

This module provides functions to calculate expected value percentages and win probabilities
for individual picks and combinations of picks based on various statistical factors.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union


def calculate_ev(
    pick_odds: float,
    win_probability: float,
    stake: float = 1.0
) -> Dict[str, float]:
    """
    Calculate expected value for a pick.
    
    Args:
        pick_odds: Decimal odds for the pick (e.g., 1.91 for -110)
        win_probability: Estimated win probability (0-1)
        stake: Bet stake amount
        
    Returns:
        Dictionary containing EV, EV percentage, and other metrics
    """
    expected_return = win_probability * pick_odds * stake
    expected_loss = (1 - win_probability) * stake
    ev = expected_return - stake
    ev_percentage = (ev / stake) * 100 if stake > 0 else 0
    
    return {
        'ev': ev,
        'ev_percentage': ev_percentage,
        'expected_return': expected_return,
        'expected_loss': expected_loss,
        'roi': ev_percentage
    }


def calculate_win_probability(
    player_stats: Dict[str, float],
    game_script: str = "neutral",
    matchup_factors: Optional[Dict[str, float]] = None
) -> float:
    """
    Calculate win probability based on player stats and game context.
    
    Args:
        player_stats: Dictionary of relevant player statistics
        game_script: Type of game script ("shootout", "control", "neutral")
        matchup_factors: Additional matchup-specific factors
        
    Returns:
        Win probability as a float between 0 and 1
    """
    if matchup_factors is None:
        matchup_factors = {}
    
    # Base probability from historical performance
    base_prob = player_stats.get('hit_rate', 0.45)
    
    # Game script adjustments
    script_adjustments = {
        'shootout': 1.15,
        'control': 0.95,
        'neutral': 1.0
    }
    
    script_multiplier = script_adjustments.get(game_script, 1.0)
    
    # Apply matchup factors
    matchup_multiplier = 1.0
    for factor, value in matchup_factors.items():
        if factor == 'weather':
            matchup_multiplier *= (1 + value * 0.1)
        elif factor == 'pace':
            matchup_multiplier *= (1 + value * 0.05)
        elif factor == 'defense_rank':
            # Lower rank (better defense) reduces probability
            matchup_multiplier *= (1 - value * 0.02)
    
    # Calculate final probability with bounds
    final_prob = base_prob * script_multiplier * matchup_multiplier
    return np.clip(final_prob, 0.05, 0.95)


def calculate_parlay_probability(
    individual_probabilities: List[float],
    correlation_matrix: Optional[np.ndarray] = None
) -> float:
    """
    Calculate probability for a parlay considering correlations.
    
    Args:
        individual_probabilities: List of win probabilities for each pick
        correlation_matrix: Optional correlation matrix between picks
        
    Returns:
        Parlay win probability
    """
    if correlation_matrix is None:
        # Independent events
        return np.prod(individual_probabilities)
    
    # Apply correlation adjustments (simplified model)
    base_prob = np.prod(individual_probabilities)
    
    # Positive correlations increase parlay probability
    avg_correlation = np.mean(correlation_matrix[np.triu_indices_from(correlation_matrix, k=1)])
    correlation_adjustment = 1 + (avg_correlation * 0.1)
    
    return np.clip(base_prob * correlation_adjustment, 0.001, 0.999)


def evaluate_pick_ev(
    pick_data: Dict[str, Union[str, float]],
    odds: float,
    game_context: Optional[Dict[str, str]] = None
) -> Dict[str, float]:
    """
    Comprehensive EV evaluation for a single pick.
    
    Args:
        pick_data: Dictionary containing pick information
        odds: Decimal odds for the pick
        game_context: Optional game context information
        
    Returns:
        Dictionary with comprehensive EV metrics
    """
    if game_context is None:
        game_context = {}
    
    # Extract player stats
    player_stats = {
        'hit_rate': pick_data.get('historical_hit_rate', 0.45),
        'avg_points': pick_data.get('avg_fantasy_points', 15.0),
        'consistency': pick_data.get('consistency_score', 0.7)
    }
    
    # Calculate win probability
    win_prob = calculate_win_probability(
        player_stats,
        game_context.get('script', 'neutral'),
        game_context.get('matchup_factors', {})
    )
    
    # Calculate EV metrics
    ev_metrics = calculate_ev(odds, win_prob)
    
    # Add additional metrics
    ev_metrics.update({
        'win_probability': win_prob,
        'implied_probability': 1 / odds,
        'value_rating': win_prob - (1 / odds),
        'confidence': player_stats['consistency']
    })
    
    return ev_metrics


def batch_ev_calculation(
    picks_df: pd.DataFrame,
    odds_column: str = 'odds',
    include_correlations: bool = False
) -> pd.DataFrame:
    """
    Calculate EV for multiple picks in batch.
    
    Args:
        picks_df: DataFrame containing pick data
        odds_column: Name of column containing odds
        include_correlations: Whether to include correlation analysis
        
    Returns:
        DataFrame with EV calculations added
    """
    results = picks_df.copy()
    
    ev_metrics = []
    for _, row in picks_df.iterrows():
        pick_data = row.to_dict()
        odds = row[odds_column]
        
        # Get game context if available
        game_context = {}
        if 'game_script' in row:
            game_context['script'] = row['game_script']
        
        ev_result = evaluate_pick_ev(pick_data, odds, game_context)
        ev_metrics.append(ev_result)
    
    # Add EV metrics to results
    ev_df = pd.DataFrame(ev_metrics)
    for col in ev_df.columns:
        results[f'ev_{col}'] = ev_df[col]
    
    return results