"""Tests for correlation engine module."""

import pytest
import numpy as np
from src.gorillagenics.corr import CorrelationEngine, pair_correlation_analysis, GameScriptPriors


class TestCorrelationEngine:
    """Test cases for correlation engine."""
    
    @pytest.fixture
    def correlation_engine(self):
        """Create correlation engine instance."""
        return CorrelationEngine()
    
    def test_qb_wr_same_team_correlation(self, correlation_engine):
        """Test QB-WR correlation on same team."""
        player1 = {'position': 'QB', 'team': 'BUF'}
        player2 = {'position': 'WR', 'team': 'BUF'}
        
        correlation = correlation_engine.calculate_correlation(player1, player2)
        
        assert correlation > 0.5  # Should be strongly positive
    
    def test_different_team_correlation(self, correlation_engine):
        """Test correlation between players on different teams."""
        player1 = {'position': 'QB', 'team': 'BUF'}
        player2 = {'position': 'QB', 'team': 'MIA'}
        
        correlation = correlation_engine.calculate_correlation(player1, player2)
        
        assert correlation < 0.2  # Should be low or negative
    
    def test_game_script_priors_high_total(self, correlation_engine):
        """Test game script priors with high total."""
        team_stats = {'pace': 68.0}
        opponent_stats = {'pace': 66.0}
        
        priors = correlation_engine.get_game_script_priors(
            team_stats, opponent_stats, vegas_line=3.0, total_line=52.0
        )
        
        assert sum(priors.values()) == pytest.approx(1.0, rel=1e-3)
        assert priors['shootout'] > 0.3  # High total should favor shootout
    
    def test_game_script_priors_low_total(self, correlation_engine):
        """Test game script priors with low total."""
        team_stats = {'pace': 62.0}
        opponent_stats = {'pace': 60.0}
        
        priors = correlation_engine.get_game_script_priors(
            team_stats, opponent_stats, vegas_line=1.0, total_line=40.0
        )
        
        assert sum(priors.values()) == pytest.approx(1.0, rel=1e-3)
        assert priors['defensive'] > 0.1  # Low total should favor defensive
    
    def test_lineup_correlation_matrix(self, correlation_engine):
        """Test correlation matrix calculation for lineup."""
        lineup_players = [
            {'position': 'QB', 'team': 'BUF'},
            {'position': 'WR', 'team': 'BUF'},
            {'position': 'RB', 'team': 'MIA'}
        ]
        game_context = {'game_script': 'neutral'}
        
        matrix = correlation_engine.calculate_lineup_correlation_matrix(lineup_players, game_context)
        
        assert matrix.shape == (3, 3)
        assert np.allclose(np.diag(matrix), 1.0)  # Diagonal should be 1
        assert np.allclose(matrix, matrix.T)  # Should be symmetric
    
    def test_find_optimal_correlations(self, correlation_engine):
        """Test finding optimal correlation plays."""
        import pandas as pd
        
        anchor_player = {'position': 'QB', 'team': 'BUF', 'name': 'Josh Allen'}
        
        available_players = pd.DataFrame({
            'position': ['WR', 'WR', 'TE'],
            'team': ['BUF', 'MIA', 'BUF'],
            'name': ['Stefon Diggs', 'Tyreek Hill', 'Dawson Knox'],
            'id': ['1', '2', '3']
        })
        
        correlations = correlation_engine.find_optimal_correlations(
            available_players, anchor_player, max_correlations=2
        )
        
        assert len(correlations) <= 2
        if correlations:
            assert all('correlation_score' in corr for corr in correlations)
            assert correlations[0]['correlation_score'] >= correlations[-1]['correlation_score']


def test_pair_correlation_analysis():
    """Test pair correlation analysis with historical data."""
    player1_performances = [20, 18, 25, 22, 19, 24, 21, 17, 23, 20]
    player2_performances = [15, 13, 18, 16, 14, 17, 15, 12, 17, 14]
    
    result = pair_correlation_analysis(player1_performances, player2_performances)
    
    assert 'correlation' in result
    assert 'significance' in result
    assert 'sample_size' in result
    assert -1.0 <= result['correlation'] <= 1.0
    assert result['sample_size'] == 10


def test_pair_correlation_insufficient_data():
    """Test pair correlation with insufficient data."""
    player1_performances = [20, 18]
    player2_performances = [15, 13]
    
    result = pair_correlation_analysis(player1_performances, player2_performances)
    
    assert result['correlation'] == 0.0
    assert result['significance'] == 0.0