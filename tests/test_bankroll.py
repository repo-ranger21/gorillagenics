"""Tests for bankroll management module."""

import pytest
import tempfile
import os
from datetime import datetime
from src.gorillagenics.bankroll import BankrollManager, ParLayOptimizer, BankrollEntry


class TestBankrollManager:
    """Test cases for bankroll management."""
    
    @pytest.fixture
    def temp_ledger(self):
        """Create temporary ledger file."""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            yield f.name
        os.unlink(f.name)
    
    def test_initialize_bankroll(self, temp_ledger):
        """Test bankroll initialization."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        
        assert manager.current_balance == 1000.0
        assert len(manager.ledger) == 1
        assert manager.ledger[0].action == "initialize"
    
    def test_kelly_stake_calculation(self, temp_ledger):
        """Test Kelly criterion stake calculation."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        
        result = manager.calculate_kelly_stake(
            win_probability=0.6,
            decimal_odds=2.0,
            kelly_fraction=0.25
        )
        
        assert 'kelly_stake' in result
        assert 'recommended_stake' in result
        assert result['kelly_stake'] > 0
        assert result['edge'] > 0  # Should have positive edge
    
    def test_log_bet(self, temp_ledger):
        """Test logging a bet."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        
        entry = manager.log_bet("test_slip_1", 50.0, "shootout", "QB+WR")
        
        assert manager.current_balance == 950.0
        assert entry.slip_id == "test_slip_1"
        assert entry.amount == -50.0
        assert entry.game_script == "shootout"
    
    def test_log_result_win(self, temp_ledger):
        """Test logging a winning bet result."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        manager.log_bet("test_slip_1", 50.0)
        
        entry = manager.log_result("test_slip_1", "win", 95.0)
        
        assert manager.current_balance == 1045.0  # 1000 - 50 + 95
        assert entry.action == "win"
        assert entry.amount == 95.0
    
    def test_bankroll_summary(self, temp_ledger):
        """Test bankroll summary calculation."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        manager.log_bet("slip_1", 50.0)
        manager.log_result("slip_1", "win", 95.0)
        manager.log_bet("slip_2", 30.0)
        manager.log_result("slip_2", "loss", 0.0)
        
        summary = manager.get_bankroll_summary()
        
        assert summary['current_balance'] == 1015.0  # 1000 - 50 + 95 - 30
        assert summary['total_bets'] == 2
        assert summary['winning_bets'] == 1
        assert summary['losing_bets'] == 1
        assert summary['win_rate'] == 50.0
    
    def test_query_ledger(self, temp_ledger):
        """Test ledger querying with filters."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(1000.0)
        manager.log_bet("slip_1", 50.0, "shootout", "QB+WR")
        manager.log_bet("slip_2", 30.0, "control", "RB+DEF")
        
        shootout_entries = manager.query_ledger(game_script="shootout")
        control_entries = manager.query_ledger(game_script="control")
        
        assert len(shootout_entries) == 1
        assert len(control_entries) == 1
        assert shootout_entries[0].game_script == "shootout"
    
    def test_insufficient_bankroll(self, temp_ledger):
        """Test handling of insufficient bankroll."""
        manager = BankrollManager(temp_ledger)
        manager.initialize_bankroll(100.0)
        
        with pytest.raises(ValueError):
            manager.log_bet("big_bet", 150.0)


class TestParLayOptimizer:
    """Test cases for parlay optimization."""
    
    @pytest.fixture
    def manager_with_bankroll(self):
        """Create manager with initialized bankroll."""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            manager = BankrollManager(f.name)
            manager.initialize_bankroll(1000.0)
            yield manager
        os.unlink(f.name)
    
    def test_optimize_parlay_size(self, manager_with_bankroll):
        """Test parlay size optimization."""
        optimizer = ParLayOptimizer(manager_with_bankroll)
        
        probabilities = [0.6, 0.55, 0.65, 0.5]
        odds = [1.91, 2.0, 1.85, 2.1]
        
        result = optimizer.optimize_parlay_size(probabilities, odds, max_legs=3)
        
        assert 'optimal_size' in result
        assert 'optimal_ev' in result
        assert 'recommended_picks' in result
        assert result['optimal_size'] <= 3
        assert len(result['recommended_picks']) == result['optimal_size']
    
    def test_parlay_structure_recommendation(self, manager_with_bankroll):
        """Test parlay structure recommendation."""
        import pandas as pd
        
        optimizer = ParLayOptimizer(manager_with_bankroll)
        
        picks_data = pd.DataFrame({
            'win_probability': [0.6, 0.55, 0.65],
            'odds': [1.91, 2.0, 1.85],
            'player_name': ['Player A', 'Player B', 'Player C']
        })
        
        recommendation = optimizer.recommend_parlay_structure(
            picks_data, budget=100.0, risk_tolerance="medium"
        )
        
        assert 'parlay_optimization' in recommendation
        assert 'recommended_stake' in recommendation
        assert recommendation['recommended_stake'] <= 100.0