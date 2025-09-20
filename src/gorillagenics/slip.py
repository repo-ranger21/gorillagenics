"""
Slip Evaluation and Grading for DFS Betting Analysis.

This module provides functionality to evaluate betting slips, grade results,
and track performance across different slip types and game scripts.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Literal
from dataclasses import dataclass, asdict
from datetime import datetime
import json


SlipResult = Literal["win", "loss", "push", "pending"]
SlipType = Literal["single", "parlay", "teaser", "round_robin"]


@dataclass
class Pick:
    """Individual pick within a slip."""
    player_name: str
    prop_type: str
    line: float
    odds: float
    actual_result: Optional[float] = None
    result: Optional[SlipResult] = None


@dataclass
class Slip:
    """Betting slip containing one or more picks."""
    slip_id: str
    picks: List[Pick]
    slip_type: SlipType
    total_odds: float
    stake: float
    game_script: Optional[str] = None
    stack_description: Optional[str] = None
    timestamp: Optional[datetime] = None
    overall_result: Optional[SlipResult] = None
    payout: Optional[float] = None


class SlipEvaluator:
    """Class for evaluating and grading betting slips."""
    
    def __init__(self):
        """Initialize slip evaluator."""
        self.evaluation_history: List[Slip] = []
    
    def evaluate_slip(
        self,
        picks_data: List[Dict[str, any]],
        slip_type: SlipType = "parlay",
        stake: float = 1.0,
        game_script: Optional[str] = None,
        stack_description: Optional[str] = None
    ) -> Slip:
        """
        Evaluate a betting slip before placing.
        
        Args:
            picks_data: List of pick dictionaries
            slip_type: Type of betting slip
            stake: Bet stake amount
            game_script: Game script tag
            stack_description: Description of the stack
            
        Returns:
            Slip object with evaluation metrics
        """
        # Convert picks data to Pick objects
        picks = []
        for pick_data in picks_data:
            pick = Pick(
                player_name=pick_data['player_name'],
                prop_type=pick_data['prop_type'],
                line=pick_data['line'],
                odds=pick_data['odds']
            )
            picks.append(pick)
        
        # Calculate total odds
        total_odds = self._calculate_total_odds(picks, slip_type)
        
        # Create slip
        slip = Slip(
            slip_id=self._generate_slip_id(),
            picks=picks,
            slip_type=slip_type,
            total_odds=total_odds,
            stake=stake,
            game_script=game_script,
            stack_description=stack_description,
            timestamp=datetime.now()
        )
        
        return slip
    
    def _calculate_total_odds(
        self,
        picks: List[Pick],
        slip_type: SlipType
    ) -> float:
        """Calculate total odds for a slip based on type."""
        if slip_type == "single":
            return picks[0].odds if picks else 1.0
        elif slip_type == "parlay":
            total_odds = 1.0
            for pick in picks:
                total_odds *= pick.odds
            return total_odds
        elif slip_type == "teaser":
            # Simplified teaser calculation (would need more complex logic)
            base_odds = 1.0
            for pick in picks:
                base_odds *= (pick.odds * 0.8)  # Reduce odds for teaser
            return base_odds
        else:
            return 1.0
    
    def _generate_slip_id(self) -> str:
        """Generate unique slip ID."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"slip_{timestamp}_{np.random.randint(1000, 9999)}"
    
    def grade_slip(
        self,
        slip: Slip,
        results: List[Dict[str, any]]
    ) -> Slip:
        """
        Grade a slip with actual results.
        
        Args:
            slip: The slip to grade
            results: List of actual results for each pick
            
        Returns:
            Updated slip with grading results
        """
        graded_picks = []
        all_win = True
        any_push = False
        
        for i, pick in enumerate(slip.picks):
            if i < len(results):
                result_data = results[i]
                actual_result = result_data.get('actual_result')
                
                # Grade individual pick
                if actual_result is None:
                    pick_result = "pending"
                elif actual_result == pick.line:
                    pick_result = "push"
                    any_push = True
                elif actual_result > pick.line:
                    pick_result = "win"
                else:
                    pick_result = "loss"
                    all_win = False
                
                # Update pick
                pick.actual_result = actual_result
                pick.result = pick_result
            else:
                all_win = False
                pick.result = "pending"
            
            graded_picks.append(pick)
        
        # Determine overall slip result
        if any([p.result == "pending" for p in graded_picks]):
            overall_result = "pending"
        elif any_push and slip.slip_type == "parlay":
            # Parlay push rules (simplified)
            if all_win or (all([p.result in ["win", "push"] for p in graded_picks])):
                overall_result = "push"
            else:
                overall_result = "loss"
        elif all_win or all([p.result in ["win", "push"] for p in graded_picks]):
            overall_result = "win"
        else:
            overall_result = "loss"
        
        # Calculate payout
        if overall_result == "win":
            payout = slip.stake * slip.total_odds
        elif overall_result == "push":
            payout = slip.stake
        else:
            payout = 0.0
        
        # Update slip
        slip.picks = graded_picks
        slip.overall_result = overall_result
        slip.payout = payout
        
        return slip
    
    def calculate_slip_ev(
        self,
        slip: Slip,
        win_probabilities: List[float]
    ) -> Dict[str, float]:
        """
        Calculate expected value for a slip.
        
        Args:
            slip: The slip to evaluate
            win_probabilities: Win probabilities for each pick
            
        Returns:
            Dictionary containing EV metrics
        """
        if len(win_probabilities) != len(slip.picks):
            raise ValueError("Win probabilities must match number of picks")
        
        if slip.slip_type == "parlay":
            # Parlay probability is product of individual probabilities
            parlay_prob = np.prod(win_probabilities)
        else:
            # Single bet
            parlay_prob = win_probabilities[0] if win_probabilities else 0.0
        
        expected_return = parlay_prob * slip.total_odds * slip.stake
        expected_value = expected_return - slip.stake
        ev_percentage = (expected_value / slip.stake) * 100 if slip.stake > 0 else 0
        
        return {
            'expected_value': expected_value,
            'ev_percentage': ev_percentage,
            'win_probability': parlay_prob,
            'expected_return': expected_return,
            'implied_probability': 1 / slip.total_odds
        }
    
    def slip_to_dict(self, slip: Slip) -> Dict[str, any]:
        """Convert slip to dictionary for serialization."""
        slip_dict = asdict(slip)
        
        # Convert datetime to string
        if slip_dict['timestamp']:
            slip_dict['timestamp'] = slip_dict['timestamp'].isoformat()
        
        return slip_dict
    
    def dict_to_slip(self, slip_dict: Dict[str, any]) -> Slip:
        """Convert dictionary back to slip object."""
        # Convert timestamp back to datetime
        if slip_dict.get('timestamp'):
            slip_dict['timestamp'] = datetime.fromisoformat(slip_dict['timestamp'])
        
        # Convert picks
        picks = []
        for pick_data in slip_dict['picks']:
            pick = Pick(**pick_data)
            picks.append(pick)
        
        slip_dict['picks'] = picks
        return Slip(**slip_dict)


def grade_slip(
    slip_data: Dict[str, any],
    results: List[Dict[str, any]]
) -> Dict[str, any]:
    """
    Convenience function to grade a slip from dictionary data.
    
    Args:
        slip_data: Slip data as dictionary
        results: Results data for grading
        
    Returns:
        Graded slip as dictionary
    """
    evaluator = SlipEvaluator()
    
    # Convert to slip object
    slip = evaluator.dict_to_slip(slip_data)
    
    # Grade the slip
    graded_slip = evaluator.grade_slip(slip, results)
    
    # Convert back to dictionary
    return evaluator.slip_to_dict(graded_slip)


def analyze_slip_performance(
    slips: List[Slip],
    group_by: str = "game_script"
) -> pd.DataFrame:
    """
    Analyze performance of multiple slips grouped by specified criteria.
    
    Args:
        slips: List of graded slips
        group_by: Field to group by ("game_script", "slip_type", "stack_description")
        
    Returns:
        DataFrame with performance analysis
    """
    if not slips:
        return pd.DataFrame()
    
    # Convert slips to DataFrame
    slip_data = []
    for slip in slips:
        if slip.overall_result is not None:  # Only include graded slips
            profit_loss = (slip.payout or 0) - slip.stake
            slip_data.append({
                'slip_id': slip.slip_id,
                'game_script': slip.game_script,
                'slip_type': slip.slip_type,
                'stack_description': slip.stack_description,
                'stake': slip.stake,
                'payout': slip.payout or 0,
                'profit_loss': profit_loss,
                'result': slip.overall_result,
                'roi': (profit_loss / slip.stake * 100) if slip.stake > 0 else 0
            })
    
    if not slip_data:
        return pd.DataFrame()
    
    df = pd.DataFrame(slip_data)
    
    # Group analysis
    if group_by in df.columns:
        grouped = df.groupby(group_by).agg({
            'slip_id': 'count',
            'stake': 'sum',
            'payout': 'sum',
            'profit_loss': ['sum', 'mean'],
            'roi': 'mean'
        }).round(2)
        
        # Flatten column names
        grouped.columns = ['_'.join(col).strip() for col in grouped.columns.values]
        
        # Add win rate
        win_rates = df[df['result'] == 'win'].groupby(group_by).size() / df.groupby(group_by).size()
        grouped['win_rate'] = (win_rates * 100).round(1)
        
        return grouped.reset_index()
    
    return df