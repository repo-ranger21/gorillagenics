"""Tests for player role tagging module."""

import pytest
import pandas as pd
from src.gorillagenics.roles import RoleTagger, analyze_role_correlation, role_based_lineup_score


class TestRoleTagger:
    """Test cases for role tagging functionality."""
    
    @pytest.fixture
    def role_tagger(self):
        """Create role tagger instance."""
        return RoleTagger()
    
    def test_tag_anchor_role(self, role_tagger):
        """Test tagging a player as anchor role."""
        player_data = {
            'ev_percentage': 8.0,
            'consistency': 0.8,
            'price_tier': 'high'
        }
        
        result = role_tagger.tag_player_role(player_data)
        
        assert result['primary_role'] == 'Anchor'
        assert result['primary_confidence'] > 0.5
    
    def test_tag_correlation_role(self, role_tagger):
        """Test tagging a player as correlation role."""
        player_data = {
            'team_correlation': 0.4,
            'ev_percentage': 3.0,
            'consistency': 0.6
        }
        game_context = {
            'same_game': True,
            'game_script': 'shootout'
        }
        
        result = role_tagger.tag_player_role(player_data, game_context)
        
        assert result['primary_role'] == 'Correlation'
    
    def test_tag_low_variance_role(self, role_tagger):
        """Test tagging a player as low-variance role."""
        player_data = {
            'consistency': 0.85,
            'ceiling_projection': 20.0,
            'floor_projection': 15.0,
            'target_share': 0.25,
            'ev_percentage': 2.0
        }
        
        result = role_tagger.tag_player_role(player_data)
        
        assert result['primary_role'] == 'Low-Variance'
    
    def test_tag_high_upside_role(self, role_tagger):
        """Test tagging a player as high-upside role."""
        player_data = {
            'ceiling_percentile': 0.95,
            'ceiling_projection': 30.0,
            'floor_projection': 8.0,
            'breakout_potential': 0.8
        }
        
        result = role_tagger.tag_player_role(player_data)
        
        assert result['primary_role'] == 'High-Upside'
    
    def test_tag_value_role(self, role_tagger):
        """Test tagging a player as value role."""
        player_data = {
            'price_tier': 'low',
            'ev_percentage': 5.0,
            'ownership_projection': 0.08
        }
        
        result = role_tagger.tag_player_role(player_data)
        
        assert result['primary_role'] == 'Value'
    
    def test_get_role_weights_gpp(self, role_tagger):
        """Test role weights for GPP tournaments."""
        weights = role_tagger.get_role_weights([], "gpp")
        
        assert sum(weights.values()) == 1.0
        assert weights['High-Upside'] > weights['Low-Variance']  # GPP favors upside
    
    def test_get_role_weights_cash(self, role_tagger):
        """Test role weights for cash games."""
        weights = role_tagger.get_role_weights([], "cash")
        
        assert sum(weights.values()) == 1.0
        assert weights['Low-Variance'] > weights['High-Upside']  # Cash favors safety
    
    def test_optimize_role_distribution(self, role_tagger):
        """Test optimizing role distribution for lineup."""
        # Create sample dataframe
        data = {
            'player_name': ['Player A', 'Player B', 'Player C', 'Player D'],
            'primary_role': ['Anchor', 'Correlation', 'Low-Variance', 'Value']
        }
        df = pd.DataFrame(data)
        
        distribution = role_tagger.optimize_role_distribution(df, lineup_size=9, tournament_type="gpp")
        
        assert sum(distribution.values()) == 9
        assert all(count >= 0 for count in distribution.values())


def test_analyze_role_correlation():
    """Test role correlation analysis between two players."""
    player1 = {'team': 'BUF', 'position': 'QB'}
    player2 = {'team': 'BUF', 'position': 'WR'}
    game_context = {'game_script': 'shootout'}
    
    correlation = analyze_role_correlation(player1, player2, game_context)
    
    assert 0.0 <= correlation <= 1.0
    assert correlation > 0.5  # Same team QB-WR should have high correlation


def test_role_based_lineup_score():
    """Test lineup scoring based on role distribution."""
    lineup_data = {
        'primary_role': ['Anchor', 'Correlation', 'Low-Variance', 'High-Upside', 'Value'],
        'ev_percentage': [8.0, 5.0, 3.0, 12.0, 6.0],
        'player_name': ['A', 'B', 'C', 'D', 'E']
    }
    df = pd.DataFrame(lineup_data)
    
    scores = role_based_lineup_score(df, "gpp")
    
    assert 'balance_score' in scores
    assert 'correlation_score' in scores
    assert 'total_ev' in scores
    assert 'overall_score' in scores
    assert 0.0 <= scores['overall_score'] <= 1.0