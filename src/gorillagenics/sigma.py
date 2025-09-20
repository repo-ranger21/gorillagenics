"""
Statistical Sigma Rules for DFS Pick Analysis.

This module implements various statistical rules and thresholds for identifying
high-value picks based on standard deviation analysis and historical performance.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple


class SigmaAnalyzer:
    """Analyzer for statistical sigma-based pick evaluation."""
    
    def __init__(self, lookback_games: int = 10):
        """
        Initialize sigma analyzer.
        
        Args:
            lookback_games: Number of recent games to analyze
        """
        self.lookback_games = lookback_games
    
    def calculate_player_sigma(
        self,
        player_performances: List[float],
        prop_line: float
    ) -> Dict[str, float]:
        """
        Calculate sigma statistics for a player's performance relative to prop line.
        
        Args:
            player_performances: List of recent performance values
            prop_line: The betting line/prop value
            
        Returns:
            Dictionary containing sigma statistics
        """
        if len(player_performances) < 3:
            return {'sigma': 0.0, 'z_score': 0.0, 'hit_rate': 0.0}
        
        performances = np.array(player_performances[-self.lookback_games:])
        
        # Calculate basic statistics
        mean_performance = np.mean(performances)
        std_performance = np.std(performances)
        
        # Z-score relative to prop line
        z_score = (mean_performance - prop_line) / std_performance if std_performance > 0 else 0
        
        # Hit rate over prop line
        hit_rate = np.mean(performances >= prop_line)
        
        # Sigma rating (distance from mean in standard deviations)
        sigma = abs(z_score)
        
        return {
            'sigma': sigma,
            'z_score': z_score,
            'hit_rate': hit_rate,
            'mean_performance': mean_performance,
            'std_performance': std_performance,
            'consistency': 1 / (1 + std_performance) if std_performance > 0 else 1.0
        }
    
    def identify_sigma_plays(
        self,
        picks_df: pd.DataFrame,
        sigma_threshold: float = 1.5
    ) -> pd.DataFrame:
        """
        Identify high-sigma plays from a DataFrame of picks.
        
        Args:
            picks_df: DataFrame containing pick data
            sigma_threshold: Minimum sigma value for flagging
            
        Returns:
            DataFrame with sigma analysis added
        """
        results = picks_df.copy()
        
        sigma_metrics = []
        for _, row in picks_df.iterrows():
            # Extract performance history (assuming it's in a list format)
            performances = row.get('performance_history', [])
            prop_line = row.get('prop_line', 0)
            
            if isinstance(performances, str):
                # Handle comma-separated string format
                try:
                    performances = [float(x.strip()) for x in performances.split(',')]
                except:
                    performances = []
            
            sigma_stats = self.calculate_player_sigma(performances, prop_line)
            sigma_metrics.append(sigma_stats)
        
        # Add sigma metrics
        sigma_df = pd.DataFrame(sigma_metrics)
        for col in sigma_df.columns:
            results[f'sigma_{col}'] = sigma_df[col]
        
        # Flag high-sigma plays
        results['is_sigma_play'] = results['sigma_sigma'] >= sigma_threshold
        
        return results
    
    def trend_analysis(
        self,
        player_performances: List[float],
        games_window: int = 5
    ) -> Dict[str, float]:
        """
        Analyze performance trends over recent games.
        
        Args:
            player_performances: List of recent performance values
            games_window: Window size for trend analysis
            
        Returns:
            Dictionary containing trend metrics
        """
        if len(player_performances) < games_window:
            return {'trend_slope': 0.0, 'trend_strength': 0.0, 'momentum': 0.0}
        
        recent_performances = np.array(player_performances[-games_window:])
        x = np.arange(len(recent_performances))
        
        # Calculate trend slope using linear regression
        if len(recent_performances) > 1:
            slope, intercept = np.polyfit(x, recent_performances, 1)
            
            # Calculate R-squared for trend strength
            y_pred = slope * x + intercept
            ss_res = np.sum((recent_performances - y_pred) ** 2)
            ss_tot = np.sum((recent_performances - np.mean(recent_performances)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            # Momentum: recent game performance vs window average
            momentum = recent_performances[-1] - np.mean(recent_performances[:-1])
        else:
            slope = 0.0
            r_squared = 0.0
            momentum = 0.0
        
        return {
            'trend_slope': slope,
            'trend_strength': r_squared,
            'momentum': momentum
        }


def apply_volume_sigma(
    target_volume: float,
    historical_volumes: List[float],
    line_volume: float
) -> Dict[str, float]:
    """
    Apply sigma analysis specifically for volume-based props (rushing yards, receiving yards, etc.).
    
    Args:
        target_volume: Target volume for the prop
        historical_volumes: Historical volume performances
        line_volume: The betting line for volume
        
    Returns:
        Volume-specific sigma metrics
    """
    if len(historical_volumes) < 3:
        return {'volume_sigma': 0.0, 'volume_confidence': 0.0}
    
    volumes = np.array(historical_volumes)
    
    # Calculate volume consistency
    mean_volume = np.mean(volumes)
    std_volume = np.std(volumes)
    
    # Volume sigma relative to line
    volume_sigma = abs(mean_volume - line_volume) / std_volume if std_volume > 0 else 0
    
    # Confidence based on consistency and sample size
    volume_confidence = min(1.0, len(volumes) / 10) * (1 / (1 + std_volume / mean_volume)) if mean_volume > 0 else 0
    
    return {
        'volume_sigma': volume_sigma,
        'volume_confidence': volume_confidence,
        'volume_consistency': 1 / (1 + std_volume / mean_volume) if mean_volume > 0 else 0
    }


def ceiling_floor_analysis(
    player_performances: List[float],
    percentiles: List[float] = [10, 25, 75, 90]
) -> Dict[str, float]:
    """
    Analyze ceiling and floor potential for a player.
    
    Args:
        player_performances: Historical performance data
        percentiles: Percentiles to calculate for ceiling/floor analysis
        
    Returns:
        Ceiling and floor metrics
    """
    if len(player_performances) < 5:
        return {f'p{p}': 0.0 for p in percentiles}
    
    performances = np.array(player_performances)
    
    results = {}
    for p in percentiles:
        results[f'p{p}'] = np.percentile(performances, p)
    
    # Additional ceiling/floor metrics
    results['ceiling_gap'] = results.get('p90', 0) - results.get('p75', 0)
    results['floor_gap'] = results.get('p25', 0) - results.get('p10', 0)
    results['range_ratio'] = (results.get('p90', 0) - results.get('p10', 0)) / np.mean(performances) if np.mean(performances) > 0 else 0
    
    return results