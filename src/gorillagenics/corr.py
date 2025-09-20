"""
Correlation Engine for Game Script Analysis and Player Correlations.

This module provides correlation analysis between players and game script priors
for different types of game scenarios (shootout, control, neutral).
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Literal
from dataclasses import dataclass


GameScript = Literal["shootout", "control", "neutral", "blowout", "defensive"]


@dataclass
class GameScriptPriors:
    """Data class for game script probability priors."""
    shootout: float = 0.25
    control: float = 0.35
    neutral: float = 0.30
    blowout: float = 0.07
    defensive: float = 0.03


class CorrelationEngine:
    """Engine for calculating player correlations and game script analysis."""
    
    def __init__(self):
        """Initialize correlation engine with default parameters."""
        self.position_correlations = self._initialize_position_correlations()
        self.game_script_multipliers = self._initialize_script_multipliers()
    
    def _initialize_position_correlations(self) -> Dict[str, Dict[str, float]]:
        """Initialize base position correlation matrix."""
        return {
            'QB': {'WR': 0.65, 'TE': 0.45, 'RB': 0.15, 'K': 0.25, 'DST': -0.10},
            'RB': {'QB': 0.15, 'WR': -0.05, 'TE': 0.05, 'RB': -0.15, 'K': 0.10, 'DST': -0.05},
            'WR': {'QB': 0.65, 'WR': -0.10, 'TE': -0.05, 'RB': -0.05, 'K': 0.15, 'DST': -0.10},
            'TE': {'QB': 0.45, 'WR': -0.05, 'TE': -0.10, 'RB': 0.05, 'K': 0.10, 'DST': -0.05},
            'K': {'QB': 0.25, 'WR': 0.15, 'TE': 0.10, 'RB': 0.10, 'K': 0.00, 'DST': 0.05},
            'DST': {'QB': -0.10, 'WR': -0.10, 'TE': -0.05, 'RB': -0.05, 'K': 0.05, 'DST': 0.00}
        }
    
    def _initialize_script_multipliers(self) -> Dict[GameScript, Dict[str, float]]:
        """Initialize game script multipliers for different positions."""
        return {
            'shootout': {'QB': 1.20, 'WR': 1.15, 'TE': 1.10, 'RB': 0.90, 'K': 1.05, 'DST': 0.85},
            'control': {'QB': 0.95, 'WR': 0.90, 'TE': 0.95, 'RB': 1.15, 'K': 0.95, 'DST': 1.10},
            'neutral': {'QB': 1.00, 'WR': 1.00, 'TE': 1.00, 'RB': 1.00, 'K': 1.00, 'DST': 1.00},
            'blowout': {'QB': 0.80, 'WR': 0.85, 'TE': 0.90, 'RB': 1.25, 'K': 0.90, 'DST': 1.15},
            'defensive': {'QB': 0.85, 'WR': 0.80, 'TE': 0.85, 'RB': 0.95, 'K': 0.80, 'DST': 1.30}
        }
    
    def calculate_correlation(
        self,
        player1: Dict[str, str],
        player2: Dict[str, str],
        game_context: Optional[Dict[str, any]] = None
    ) -> float:
        """
        Calculate correlation between two players.
        
        Args:
            player1: First player data (must include 'position' and 'team')
            player2: Second player data (must include 'position' and 'team')
            game_context: Optional game context for additional correlation factors
            
        Returns:
            Correlation coefficient between -1 and 1
        """
        if game_context is None:
            game_context = {}
        
        pos1 = player1.get('position', '')
        pos2 = player2.get('position', '')
        team1 = player1.get('team', '')
        team2 = player2.get('team', '')
        
        # Base position correlation
        base_correlation = self.position_correlations.get(pos1, {}).get(pos2, 0.0)
        
        # Same team boost
        if team1 == team2:
            base_correlation *= 1.5
        else:
            # Different teams - potential negative correlation
            base_correlation *= 0.3
        
        # Game script adjustments
        script = game_context.get('game_script', 'neutral')
        script_factor = self._get_script_correlation_factor(pos1, pos2, script)
        
        # Vegas total adjustments
        total_line = game_context.get('total_line', 45.0)
        total_factor = 1.0 + (total_line - 45.0) * 0.01  # Higher totals increase correlations
        
        final_correlation = base_correlation * script_factor * total_factor
        return np.clip(final_correlation, -1.0, 1.0)
    
    def _get_script_correlation_factor(
        self,
        pos1: str,
        pos2: str,
        script: GameScript
    ) -> float:
        """Get correlation factor based on game script."""
        multipliers = self.game_script_multipliers.get(script, {})
        
        mult1 = multipliers.get(pos1, 1.0)
        mult2 = multipliers.get(pos2, 1.0)
        
        # Positions that both benefit from same script have higher correlation
        if mult1 > 1.0 and mult2 > 1.0:
            return 1.2
        elif mult1 < 1.0 and mult2 < 1.0:
            return 1.1
        else:
            return 0.9
    
    def get_game_script_priors(
        self,
        team_stats: Dict[str, float],
        opponent_stats: Dict[str, float],
        vegas_line: float,
        total_line: float
    ) -> Dict[GameScript, float]:
        """
        Calculate game script probabilities based on team stats and Vegas lines.
        
        Args:
            team_stats: Team statistical data
            opponent_stats: Opponent statistical data
            vegas_line: Point spread
            total_line: Over/under total
            
        Returns:
            Dictionary of game script probabilities
        """
        priors = GameScriptPriors()
        
        # Adjust based on total line
        if total_line > 50:
            # High total favors shootout
            priors.shootout += 0.15
            priors.defensive -= 0.05
            priors.control -= 0.10
        elif total_line < 42:
            # Low total favors defensive/control
            priors.defensive += 0.10
            priors.control += 0.10
            priors.shootout -= 0.15
            priors.neutral -= 0.05
        
        # Adjust based on spread
        spread_magnitude = abs(vegas_line)
        if spread_magnitude > 7:
            # Large spread favors blowout
            priors.blowout += 0.10
            priors.neutral -= 0.05
            priors.control -= 0.05
        
        # Team pace adjustments
        team_pace = team_stats.get('pace', 65.0)
        opp_pace = opponent_stats.get('pace', 65.0)
        avg_pace = (team_pace + opp_pace) / 2
        
        if avg_pace > 68:
            priors.shootout += 0.05
            priors.control -= 0.05
        elif avg_pace < 62:
            priors.control += 0.05
            priors.shootout -= 0.05
        
        # Normalize to ensure probabilities sum to 1
        total_prob = (priors.shootout + priors.control + priors.neutral + 
                     priors.blowout + priors.defensive)
        
        return {
            'shootout': priors.shootout / total_prob,
            'control': priors.control / total_prob,
            'neutral': priors.neutral / total_prob,
            'blowout': priors.blowout / total_prob,
            'defensive': priors.defensive / total_prob
        }
    
    def calculate_lineup_correlation_matrix(
        self,
        lineup_players: List[Dict[str, str]],
        game_context: Dict[str, any]
    ) -> np.ndarray:
        """
        Calculate full correlation matrix for a lineup.
        
        Args:
            lineup_players: List of player dictionaries
            game_context: Game context information
            
        Returns:
            Correlation matrix as numpy array
        """
        n_players = len(lineup_players)
        correlation_matrix = np.eye(n_players)
        
        for i in range(n_players):
            for j in range(i + 1, n_players):
                correlation = self.calculate_correlation(
                    lineup_players[i],
                    lineup_players[j],
                    game_context
                )
                correlation_matrix[i, j] = correlation
                correlation_matrix[j, i] = correlation
        
        return correlation_matrix
    
    def find_optimal_correlations(
        self,
        available_players: pd.DataFrame,
        anchor_player: Dict[str, str],
        max_correlations: int = 3
    ) -> List[Dict[str, any]]:
        """
        Find optimal correlation plays for an anchor player.
        
        Args:
            available_players: DataFrame of available players
            anchor_player: The anchor player to find correlations for
            max_correlations: Maximum number of correlations to return
            
        Returns:
            List of optimal correlation plays with scores
        """
        correlations = []
        
        for _, player in available_players.iterrows():
            player_dict = player.to_dict()
            
            # Skip if same player
            if (player_dict.get('name') == anchor_player.get('name') or
                player_dict.get('id') == anchor_player.get('id')):
                continue
            
            correlation_score = self.calculate_correlation(anchor_player, player_dict)
            
            if correlation_score > 0.1:  # Only consider positive correlations
                correlations.append({
                    'player': player_dict,
                    'correlation_score': correlation_score,
                    'ev_boost': correlation_score * 0.1  # EV boost from correlation
                })
        
        # Sort by correlation score and return top correlations
        correlations.sort(key=lambda x: x['correlation_score'], reverse=True)
        return correlations[:max_correlations]


def pair_correlation_analysis(
    player1_performances: List[float],
    player2_performances: List[float],
    same_game_only: bool = True
) -> Dict[str, float]:
    """
    Analyze historical correlation between two players' performances.
    
    Args:
        player1_performances: Historical performance data for player 1
        player2_performances: Historical performance data for player 2
        same_game_only: Whether to only consider same-game performances
        
    Returns:
        Dictionary containing correlation analysis results
    """
    if len(player1_performances) != len(player2_performances) or len(player1_performances) < 3:
        return {'correlation': 0.0, 'significance': 0.0}
    
    perf1 = np.array(player1_performances)
    perf2 = np.array(player2_performances)
    
    # Calculate Pearson correlation
    correlation = np.corrcoef(perf1, perf2)[0, 1]
    
    # Calculate significance (rough approximation)
    n = len(perf1)
    t_stat = correlation * np.sqrt((n - 2) / (1 - correlation**2)) if abs(correlation) < 1 else 0
    significance = min(1.0, abs(t_stat) / 2.0)  # Simplified significance measure
    
    return {
        'correlation': correlation if not np.isnan(correlation) else 0.0,
        'significance': significance,
        'sample_size': n
    }