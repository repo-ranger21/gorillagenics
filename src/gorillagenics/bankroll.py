"""
Bankroll Management with Kelly Staking and Parlay Optimization.

This module provides comprehensive bankroll management including Kelly criterion staking,
parlay optimization, and persistent ledger tracking with JSON storage.
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
import os
from dataclasses import dataclass, asdict


@dataclass
class BankrollEntry:
    """Single entry in the bankroll ledger."""
    timestamp: datetime
    slip_id: str
    action: str  # 'bet', 'win', 'loss', 'push'
    amount: float
    balance_before: float
    balance_after: float
    game_script: Optional[str] = None
    stack_type: Optional[str] = None
    notes: Optional[str] = None


class BankrollManager:
    """Manager for bankroll tracking and Kelly staking calculations."""
    
    def __init__(self, ledger_path: Optional[str] = None):
        """
        Initialize bankroll manager.
        
        Args:
            ledger_path: Path to ledger file (defaults to ~/.gorillagenics/ledger.json)
        """
        if ledger_path is None:
            home_dir = Path.home()
            self.ledger_dir = home_dir / ".gorillagenics"
            self.ledger_path = self.ledger_dir / "ledger.json"
        else:
            self.ledger_path = Path(ledger_path)
            self.ledger_dir = self.ledger_path.parent
        
        # Ensure directory exists
        self.ledger_dir.mkdir(exist_ok=True)
        
        # Initialize ledger
        self.ledger: List[BankrollEntry] = []
        self.current_balance = 0.0
        self.load_ledger()
    
    def initialize_bankroll(self, starting_amount: float) -> None:
        """
        Initialize bankroll with starting amount.
        
        Args:
            starting_amount: Initial bankroll amount
        """
        if self.ledger:
            raise ValueError("Bankroll already initialized. Use update methods instead.")
        
        entry = BankrollEntry(
            timestamp=datetime.now(),
            slip_id="INITIAL",
            action="initialize",
            amount=starting_amount,
            balance_before=0.0,
            balance_after=starting_amount,
            notes="Initial bankroll setup"
        )
        
        self.ledger.append(entry)
        self.current_balance = starting_amount
        self.save_ledger()
    
    def calculate_kelly_stake(
        self,
        win_probability: float,
        decimal_odds: float,
        bankroll: Optional[float] = None,
        kelly_fraction: float = 0.25,
        max_stake_percentage: float = 0.05
    ) -> Dict[str, float]:
        """
        Calculate optimal Kelly stake size.
        
        Args:
            win_probability: Estimated win probability (0-1)
            decimal_odds: Decimal odds for the bet
            bankroll: Current bankroll (uses current if None)
            kelly_fraction: Fraction of Kelly to use (default 25%)
            max_stake_percentage: Maximum stake as percentage of bankroll
            
        Returns:
            Dictionary containing stake calculations
        """
        if bankroll is None:
            bankroll = self.current_balance
        
        if bankroll <= 0:
            return {'kelly_stake': 0.0, 'recommended_stake': 0.0, 'kelly_percentage': 0.0}
        
        # Kelly formula: f = (bp - q) / b
        # where f = fraction of bankroll to bet, b = odds-1, p = win prob, q = loss prob
        b = decimal_odds - 1
        p = win_probability
        q = 1 - win_probability
        
        if b <= 0 or p <= 0:
            kelly_percentage = 0.0
        else:
            kelly_percentage = (b * p - q) / b
        
        # Apply Kelly fraction (typically 25% of full Kelly)
        fractional_kelly = kelly_percentage * kelly_fraction
        
        # Cap at maximum stake percentage
        final_kelly_percentage = min(fractional_kelly, max_stake_percentage)
        final_kelly_percentage = max(0.0, final_kelly_percentage)  # No negative stakes
        
        kelly_stake = bankroll * final_kelly_percentage
        
        return {
            'kelly_stake': kelly_stake,
            'recommended_stake': kelly_stake,
            'kelly_percentage': final_kelly_percentage * 100,
            'full_kelly_percentage': kelly_percentage * 100,
            'edge': (win_probability * decimal_odds) - 1
        }
    
    def log_bet(
        self,
        slip_id: str,
        stake_amount: float,
        game_script: Optional[str] = None,
        stack_type: Optional[str] = None,
        notes: Optional[str] = None
    ) -> BankrollEntry:
        """
        Log a bet placement.
        
        Args:
            slip_id: Unique slip identifier
            stake_amount: Amount being bet
            game_script: Game script tag
            stack_type: Stack type description
            notes: Additional notes
            
        Returns:
            BankrollEntry for the logged bet
        """
        if stake_amount > self.current_balance:
            raise ValueError(f"Insufficient bankroll: {stake_amount} > {self.current_balance}")
        
        entry = BankrollEntry(
            timestamp=datetime.now(),
            slip_id=slip_id,
            action="bet",
            amount=-stake_amount,
            balance_before=self.current_balance,
            balance_after=self.current_balance - stake_amount,
            game_script=game_script,
            stack_type=stack_type,
            notes=notes
        )
        
        self.ledger.append(entry)
        self.current_balance -= stake_amount
        self.save_ledger()
        
        return entry
    
    def log_result(
        self,
        slip_id: str,
        result: str,
        payout: float = 0.0,
        notes: Optional[str] = None
    ) -> BankrollEntry:
        """
        Log a bet result.
        
        Args:
            slip_id: Slip identifier
            result: Result type ('win', 'loss', 'push')
            payout: Payout amount (0 for loss)
            notes: Additional notes
            
        Returns:
            BankrollEntry for the logged result
        """
        entry = BankrollEntry(
            timestamp=datetime.now(),
            slip_id=slip_id,
            action=result,
            amount=payout,
            balance_before=self.current_balance,
            balance_after=self.current_balance + payout,
            notes=notes
        )
        
        self.ledger.append(entry)
        self.current_balance += payout
        self.save_ledger()
        
        return entry
    
    def get_bankroll_summary(self) -> Dict[str, any]:
        """Get comprehensive bankroll summary."""
        if not self.ledger:
            return {'current_balance': 0.0, 'total_bets': 0, 'total_winnings': 0.0}
        
        # Calculate metrics
        bets = [entry for entry in self.ledger if entry.action == 'bet']
        wins = [entry for entry in self.ledger if entry.action == 'win']
        losses = [entry for entry in self.ledger if entry.action == 'loss']
        
        total_bet = sum(abs(entry.amount) for entry in bets)
        total_winnings = sum(entry.amount for entry in wins)
        
        starting_balance = self.ledger[0].balance_after if self.ledger[0].action == 'initialize' else 0
        
        return {
            'current_balance': self.current_balance,
            'starting_balance': starting_balance,
            'total_profit_loss': self.current_balance - starting_balance,
            'total_bet': total_bet,
            'total_winnings': total_winnings,
            'total_bets': len(bets),
            'winning_bets': len(wins),
            'losing_bets': len(losses),
            'win_rate': len(wins) / len(bets) * 100 if bets else 0,
            'roi': ((self.current_balance - starting_balance) / starting_balance * 100) if starting_balance > 0 else 0
        }
    
    def query_ledger(
        self,
        game_script: Optional[str] = None,
        stack_type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[BankrollEntry]:
        """
        Query ledger with filters.
        
        Args:
            game_script: Filter by game script
            stack_type: Filter by stack type
            date_from: Start date filter
            date_to: End date filter
            
        Returns:
            Filtered list of ledger entries
        """
        filtered_entries = self.ledger.copy()
        
        if game_script:
            filtered_entries = [e for e in filtered_entries if e.game_script == game_script]
        
        if stack_type:
            filtered_entries = [e for e in filtered_entries if e.stack_type == stack_type]
        
        if date_from:
            filtered_entries = [e for e in filtered_entries if e.timestamp >= date_from]
        
        if date_to:
            filtered_entries = [e for e in filtered_entries if e.timestamp <= date_to]
        
        return filtered_entries
    
    def save_ledger(self) -> None:
        """Save ledger to JSON file."""
        ledger_data = []
        for entry in self.ledger:
            entry_dict = asdict(entry)
            entry_dict['timestamp'] = entry.timestamp.isoformat()
            ledger_data.append(entry_dict)
        
        with open(self.ledger_path, 'w') as f:
            json.dump({
                'current_balance': self.current_balance,
                'ledger': ledger_data
            }, f, indent=2)
    
    def load_ledger(self) -> None:
        """Load ledger from JSON file."""
        if not self.ledger_path.exists():
            return
        
        try:
            with open(self.ledger_path, 'r') as f:
                data = json.load(f)
            
            self.current_balance = data.get('current_balance', 0.0)
            
            self.ledger = []
            for entry_data in data.get('ledger', []):
                entry_data['timestamp'] = datetime.fromisoformat(entry_data['timestamp'])
                entry = BankrollEntry(**entry_data)
                self.ledger.append(entry)
        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Warning: Could not load ledger: {e}")
            self.ledger = []
            self.current_balance = 0.0


class ParLayOptimizer:
    """Optimizer for parlay construction and recommendations."""
    
    def __init__(self, bankroll_manager: BankrollManager):
        """
        Initialize parlay optimizer.
        
        Args:
            bankroll_manager: BankrollManager instance
        """
        self.bankroll_manager = bankroll_manager
    
    def optimize_parlay_size(
        self,
        pick_probabilities: List[float],
        pick_odds: List[float],
        max_legs: int = 6
    ) -> Dict[str, any]:
        """
        Optimize parlay size for maximum expected value.
        
        Args:
            pick_probabilities: Win probabilities for each pick
            pick_odds: Odds for each pick
            max_legs: Maximum number of parlay legs
            
        Returns:
            Dictionary with optimization results
        """
        if len(pick_probabilities) != len(pick_odds):
            raise ValueError("Probabilities and odds lists must be same length")
        
        best_ev = -float('inf')
        best_combination = []
        best_size = 0
        
        # Test different parlay sizes
        for size in range(1, min(max_legs + 1, len(pick_probabilities) + 1)):
            # Simple greedy selection - take best EV picks
            combined_data = list(zip(pick_probabilities, pick_odds))
            # Sort by individual EV
            combined_data.sort(key=lambda x: x[0] * x[1] - 1, reverse=True)
            
            selected_probs = [x[0] for x in combined_data[:size]]
            selected_odds = [x[1] for x in combined_data[:size]]
            
            # Calculate parlay probability and odds
            parlay_prob = np.prod(selected_probs)
            parlay_odds = np.prod(selected_odds)
            
            # Calculate EV
            ev = parlay_prob * parlay_odds - 1
            
            if ev > best_ev:
                best_ev = ev
                best_combination = list(range(size))  # Indices of selected picks
                best_size = size
        
        return {
            'optimal_size': best_size,
            'optimal_ev': best_ev,
            'recommended_picks': best_combination,
            'parlay_probability': np.prod([pick_probabilities[i] for i in best_combination]),
            'parlay_odds': np.prod([pick_odds[i] for i in best_combination])
        }
    
    def recommend_parlay_structure(
        self,
        available_picks: pd.DataFrame,
        budget: float,
        risk_tolerance: str = "medium"
    ) -> Dict[str, any]:
        """
        Recommend parlay structure based on available picks and risk tolerance.
        
        Args:
            available_picks: DataFrame of available picks with EV and probability data
            budget: Available budget for betting
            risk_tolerance: Risk tolerance level ("low", "medium", "high")
            
        Returns:
            Parlay structure recommendations
        """
        risk_configs = {
            'low': {'max_legs': 3, 'min_prob': 0.6, 'kelly_fraction': 0.1},
            'medium': {'max_legs': 4, 'min_prob': 0.5, 'kelly_fraction': 0.25},
            'high': {'max_legs': 6, 'min_prob': 0.4, 'kelly_fraction': 0.4}
        }
        
        config = risk_configs.get(risk_tolerance, risk_configs['medium'])
        
        # Filter picks by minimum probability
        qualified_picks = available_picks[
            available_picks.get('win_probability', 0) >= config['min_prob']
        ]
        
        if len(qualified_picks) == 0:
            return {'recommendation': 'No qualifying picks available'}
        
        # Get probabilities and odds
        probabilities = qualified_picks.get('win_probability', []).tolist()
        odds = qualified_picks.get('odds', []).tolist()
        
        if not probabilities or not odds:
            return {'recommendation': 'Insufficient data for optimization'}
        
        # Optimize parlay
        optimization = self.optimize_parlay_size(
            probabilities,
            odds,
            config['max_legs']
        )
        
        # Calculate recommended stake using Kelly
        if optimization['optimal_ev'] > 0:
            kelly_calc = self.bankroll_manager.calculate_kelly_stake(
                optimization['parlay_probability'],
                optimization['parlay_odds'],
                kelly_fraction=config['kelly_fraction']
            )
            recommended_stake = min(kelly_calc['recommended_stake'], budget)
        else:
            recommended_stake = 0.0
        
        return {
            'parlay_optimization': optimization,
            'recommended_stake': recommended_stake,
            'risk_config': config,
            'qualified_picks_count': len(qualified_picks)
        }