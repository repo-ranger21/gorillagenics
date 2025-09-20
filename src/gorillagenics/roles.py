"""
Player Role Tagging and Analysis for DFS Optimization.

This module provides functionality to tag players with roles (Anchor, Correlation, Low-Variance)
and calculate role-based weights for portfolio construction.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Literal


PlayerRole = Literal["Anchor", "Correlation", "Low-Variance", "High-Upside", "Value"]


class RoleTagger:
    """Class for tagging players with appropriate roles in DFS lineups."""
    
    def __init__(self):
        """Initialize role tagger with default thresholds."""
        self.role_thresholds = {
            'anchor': {'ev_min': 0.05, 'consistency_min': 0.7, 'price_tier': 'high'},
            'correlation': {'correlation_min': 0.3, 'same_game': True},
            'low_variance': {'consistency_min': 0.8, 'ceiling_floor_ratio': 1.5},
            'high_upside': {'ceiling_percentile': 0.9, 'ev_min': 0.0},
            'value': {'price_tier': 'low', 'ev_min': 0.02}
        }
    
    def tag_player_role(
        self,
        player_data: Dict[str, float],
        game_context: Optional[Dict[str, str]] = None
    ) -> Dict[str, any]:
        """
        Tag a player with appropriate role based on their characteristics.
        
        Args:
            player_data: Dictionary containing player statistics and metrics
            game_context: Optional game context information
            
        Returns:
            Dictionary containing role assignment and confidence
        """
        if game_context is None:
            game_context = {}
        
        roles_scores = self._calculate_role_scores(player_data, game_context)
        
        # Determine primary role
        primary_role = max(roles_scores, key=roles_scores.get)
        primary_confidence = roles_scores[primary_role]
        
        # Determine secondary roles (if any)
        secondary_roles = [
            role for role, score in roles_scores.items() 
            if score > 0.5 and role != primary_role
        ]
        
        return {
            'primary_role': primary_role,
            'primary_confidence': primary_confidence,
            'secondary_roles': secondary_roles,
            'role_scores': roles_scores
        }
    
    def _calculate_role_scores(
        self,
        player_data: Dict[str, float],
        game_context: Dict[str, str]
    ) -> Dict[PlayerRole, float]:
        """Calculate scores for each possible role."""
        scores = {}
        
        # Anchor role scoring
        ev = player_data.get('ev_percentage', 0)
        consistency = player_data.get('consistency', 0.5)
        price_tier = player_data.get('price_tier', 'medium')
        
        anchor_score = 0.0
        if ev >= self.role_thresholds['anchor']['ev_min']:
            anchor_score += 0.4
        if consistency >= self.role_thresholds['anchor']['consistency_min']:
            anchor_score += 0.3
        if price_tier == 'high':
            anchor_score += 0.3
        
        scores['Anchor'] = min(1.0, anchor_score)
        
        # Correlation role scoring
        correlation_score = 0.0
        if player_data.get('team_correlation', 0) >= 0.3:
            correlation_score += 0.5
        if game_context.get('same_game', False):
            correlation_score += 0.3
        if game_context.get('game_script') in ['shootout', 'high_total']:
            correlation_score += 0.2
        
        scores['Correlation'] = min(1.0, correlation_score)
        
        # Low-variance role scoring
        ceiling = player_data.get('ceiling_projection', 0)
        floor = player_data.get('floor_projection', 0)
        ceiling_floor_ratio = ceiling / floor if floor > 0 else 2.0
        
        low_var_score = 0.0
        if consistency >= 0.8:
            low_var_score += 0.5
        if ceiling_floor_ratio <= 1.5:
            low_var_score += 0.3
        if player_data.get('target_share', 0) >= 0.2:
            low_var_score += 0.2
        
        scores['Low-Variance'] = min(1.0, low_var_score)
        
        # High-upside role scoring
        upside_score = 0.0
        if player_data.get('ceiling_percentile', 0.5) >= 0.9:
            upside_score += 0.4
        if ceiling_floor_ratio >= 2.5:
            upside_score += 0.3
        if player_data.get('breakout_potential', 0) >= 0.7:
            upside_score += 0.3
        
        scores['High-Upside'] = min(1.0, upside_score)
        
        # Value role scoring
        value_score = 0.0
        if price_tier == 'low':
            value_score += 0.4
        if ev >= 0.02:
            value_score += 0.3
        if player_data.get('ownership_projection', 0.5) <= 0.1:
            value_score += 0.3
        
        scores['Value'] = min(1.0, value_score)
        
        return scores
    
    def get_role_weights(
        self,
        lineup_roles: List[PlayerRole],
        tournament_type: str = "gpp"
    ) -> Dict[PlayerRole, float]:
        """
        Get optimal weights for different roles based on tournament type.
        
        Args:
            lineup_roles: List of player roles in the lineup
            tournament_type: Type of tournament ("gpp", "cash", "large_field")
            
        Returns:
            Dictionary of role weights
        """
        base_weights = {
            'gpp': {
                'Anchor': 0.25,
                'Correlation': 0.30,
                'Low-Variance': 0.15,
                'High-Upside': 0.25,
                'Value': 0.05
            },
            'cash': {
                'Anchor': 0.35,
                'Correlation': 0.20,
                'Low-Variance': 0.35,
                'High-Upside': 0.05,
                'Value': 0.05
            },
            'large_field': {
                'Anchor': 0.20,
                'Correlation': 0.35,
                'Low-Variance': 0.10,
                'High-Upside': 0.30,
                'Value': 0.05
            }
        }
        
        return base_weights.get(tournament_type, base_weights['gpp'])
    
    def optimize_role_distribution(
        self,
        available_players: pd.DataFrame,
        lineup_size: int = 9,
        tournament_type: str = "gpp"
    ) -> Dict[str, int]:
        """
        Optimize the distribution of roles in a lineup.
        
        Args:
            available_players: DataFrame of available players with role tags
            lineup_size: Size of the lineup
            tournament_type: Tournament type for weight optimization
            
        Returns:
            Dictionary with optimal count for each role
        """
        target_weights = self.get_role_weights([], tournament_type)
        
        # Calculate target counts
        role_counts = {}
        for role, weight in target_weights.items():
            role_counts[role] = max(1, int(lineup_size * weight))
        
        # Adjust for exact lineup size
        total_assigned = sum(role_counts.values())
        if total_assigned != lineup_size:
            # Adjust the largest category
            largest_role = max(role_counts, key=role_counts.get)
            role_counts[largest_role] += (lineup_size - total_assigned)
        
        return role_counts


def analyze_role_correlation(
    player1_data: Dict[str, float],
    player2_data: Dict[str, float],
    game_context: Dict[str, str]
) -> float:
    """
    Analyze correlation between two players for role assignment.
    
    Args:
        player1_data: First player's data
        player2_data: Second player's data
        game_context: Game context information
        
    Returns:
        Correlation score between 0 and 1
    """
    correlation_score = 0.0
    
    # Same team correlation
    if player1_data.get('team') == player2_data.get('team'):
        correlation_score += 0.4
        
        # Position-specific correlations
        pos1 = player1_data.get('position', '')
        pos2 = player2_data.get('position', '')
        
        if pos1 == 'QB' and pos2 in ['WR', 'TE']:
            correlation_score += 0.3
        elif pos1 == 'RB' and pos2 == 'QB':
            correlation_score += 0.1
        elif pos1 in ['WR', 'TE'] and pos2 in ['WR', 'TE']:
            correlation_score += 0.1
    
    # Game script correlation
    script = game_context.get('game_script', 'neutral')
    if script == 'shootout':
        if all(pos in ['QB', 'WR', 'TE'] for pos in [
            player1_data.get('position', ''),
            player2_data.get('position', '')
        ]):
            correlation_score += 0.2
    
    # Opposition correlation (game total)
    if (player1_data.get('team') != player2_data.get('team') and
        game_context.get('total_line', 0) > 50):
        correlation_score += 0.1
    
    return min(1.0, correlation_score)


def role_based_lineup_score(
    lineup_df: pd.DataFrame,
    tournament_type: str = "gpp"
) -> Dict[str, float]:
    """
    Score a lineup based on role distribution and balance.
    
    Args:
        lineup_df: DataFrame containing lineup players with role assignments
        tournament_type: Tournament type for scoring weights
        
    Returns:
        Dictionary containing various lineup scores
    """
    tagger = RoleTagger()
    target_weights = tagger.get_role_weights([], tournament_type)
    
    # Count actual roles in lineup
    actual_roles = lineup_df['primary_role'].value_counts(normalize=True).to_dict()
    
    # Calculate role balance score
    balance_score = 0.0
    for role, target_weight in target_weights.items():
        actual_weight = actual_roles.get(role, 0)
        # Penalize deviation from target
        deviation = abs(target_weight - actual_weight)
        balance_score += max(0, 1 - deviation * 2)
    
    balance_score /= len(target_weights)
    
    # Calculate correlation score
    correlation_players = lineup_df[lineup_df['primary_role'] == 'Correlation']
    correlation_score = len(correlation_players) / len(lineup_df) if len(lineup_df) > 0 else 0
    
    # Calculate total EV
    total_ev = lineup_df['ev_percentage'].sum() if 'ev_percentage' in lineup_df.columns else 0
    
    return {
        'balance_score': balance_score,
        'correlation_score': correlation_score,
        'total_ev': total_ev,
        'overall_score': (balance_score * 0.4 + correlation_score * 0.3 + min(1.0, total_ev / 10) * 0.3)
    }