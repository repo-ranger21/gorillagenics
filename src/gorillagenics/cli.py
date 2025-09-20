"""
Command Line Interface for Gorillagenics.

This module provides the main CLI entrypoint with all the specified commands
for evaluating picks, managing bankroll, and generating visualizations.
"""

import click
import pandas as pd
import json
from typing import Dict, List, Optional
from pathlib import Path

from .ev import batch_ev_calculation, evaluate_pick_ev
from .roles import RoleTagger
from .corr import CorrelationEngine
from .bankroll import BankrollManager, ParLayOptimizer
from .slip import SlipEvaluator, grade_slip as grade_slip_func
from .sigma import SigmaAnalyzer
from .viz import BankrollVisualizer, generate_roi_chart


@click.group()
@click.version_option(version="0.1.0", prog_name="gg3")
def main():
    """Gorillagenics 3-Pick Builder and Bankroll Optimizer."""
    pass


@main.command()
@click.option('--csv', required=True, help='Path to picks CSV file')
@click.option('--slip', required=True, help='Comma-separated pick indices (e.g., "1,2,3")')
@click.option('--script', default='neutral', help='Game script (shootout, control, neutral)')
@click.option('--stack', help='Stack description (e.g., "Allen+Cook+Achane")')
@click.option('--stake', default=1.0, type=float, help='Bet stake amount')
def eval(csv: str, slip: str, script: str, stack: Optional[str], stake: float):
    """Evaluate a specific slip with EV calculations and bankroll recommendations."""
    try:
        # Load picks data
        picks_df = pd.read_csv(csv)
        
        # Parse slip indices
        slip_indices = [int(idx.strip()) - 1 for idx in slip.split(',')]  # Convert to 0-based
        
        if any(idx >= len(picks_df) or idx < 0 for idx in slip_indices):
            click.echo(f"Error: Invalid pick indices. CSV has {len(picks_df)} picks.")
            return
        
        # Get selected picks
        selected_picks = picks_df.iloc[slip_indices]
        
        # Initialize managers
        bankroll_manager = BankrollManager()
        slip_evaluator = SlipEvaluator()
        role_tagger = RoleTagger()
        correlation_engine = CorrelationEngine()
        
        # Display header
        click.echo("\n" + "="*80)
        click.echo(f"GORILLAGENICS SLIP EVALUATION")
        click.echo(f"Game Script: {script.upper()}")
        click.echo(f"Stack: {stack or 'N/A'}")
        click.echo(f"Stake: ${stake:.2f}")
        click.echo("="*80)
        
        # Evaluate each pick
        total_ev = 0.0
        pick_probabilities = []
        pick_odds = []
        
        click.echo(f"\n{'#':<3} {'Player':<20} {'Prop':<15} {'Line':<8} {'Odds':<8} {'EV%':<8} {'Role':<12} {'Prob':<8}")
        click.echo("-" * 80)
        
        for i, (idx, pick) in enumerate(zip(slip_indices, selected_picks.iterrows())):
            _, pick_data = pick
            
            # Get odds (assume decimal odds column exists)
            odds = pick_data.get('odds', 2.0)
            pick_odds.append(odds)
            
            # Calculate EV
            ev_result = evaluate_pick_ev(
                pick_data.to_dict(),
                odds,
                {'script': script}
            )
            
            pick_probabilities.append(ev_result['win_probability'])
            total_ev += ev_result['ev_percentage']
            
            # Get role
            role_result = role_tagger.tag_player_role(pick_data.to_dict())
            role = role_result['primary_role']
            
            # Display pick info
            click.echo(f"{idx+1:<3} {pick_data.get('player_name', 'Unknown'):<20} "
                      f"{pick_data.get('prop_type', 'Unknown'):<15} "
                      f"{pick_data.get('line', 0):<8} "
                      f"{odds:<8.2f} "
                      f"{ev_result['ev_percentage']:<8.1f} "
                      f"{role:<12} "
                      f"{ev_result['win_probability']:<8.2f}")
        
        # Calculate parlay probability and EV
        parlay_prob = 1.0
        for prob in pick_probabilities:
            parlay_prob *= prob
        
        parlay_odds = 1.0
        for odds in pick_odds:
            parlay_odds *= odds
        
        parlay_ev = (parlay_prob * parlay_odds - 1) * 100
        
        # Kelly staking recommendation
        kelly_result = bankroll_manager.calculate_kelly_stake(
            parlay_prob,
            parlay_odds,
            kelly_fraction=0.25
        )
        
        # Parlay optimizer
        parlay_optimizer = ParLayOptimizer(bankroll_manager)
        parlay_rec = parlay_optimizer.optimize_parlay_size(
            pick_probabilities,
            pick_odds
        )
        
        # Display summary
        click.echo("\n" + "="*80)
        click.echo("SLIP SUMMARY")
        click.echo("="*80)
        click.echo(f"Individual EV Total: {total_ev:.1f}%")
        click.echo(f"Parlay Probability: {parlay_prob:.3f} ({parlay_prob*100:.1f}%)")
        click.echo(f"Parlay Odds: {parlay_odds:.2f}")
        click.echo(f"Parlay EV: {parlay_ev:.1f}%")
        
        click.echo(f"\nKELLY STAKING RECOMMENDATION:")
        click.echo(f"Recommended Stake: ${kelly_result['recommended_stake']:.2f}")
        click.echo(f"Kelly Percentage: {kelly_result['kelly_percentage']:.1f}%")
        click.echo(f"Edge: {kelly_result['edge']:.1f}%")
        
        click.echo(f"\nPARLAY OPTIMIZATION:")
        click.echo(f"Optimal Size: {parlay_rec['optimal_size']} legs")
        click.echo(f"Optimal EV: {parlay_rec['optimal_ev']*100:.1f}%")
        
        # Auto-log to ledger if user confirms
        if click.confirm("\nLog this slip to bankroll ledger?"):
            slip_id = f"slip_{script}_{len(slip_indices)}leg"
            bankroll_manager.log_bet(
                slip_id=slip_id,
                stake_amount=stake,
                game_script=script,
                stack_type=stack,
                notes=f"3-pick slip: {slip}"
            )
            click.echo(f"✓ Logged to ledger with ID: {slip_id}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@main.command()
@click.option('--csv', required=True, help='Path to picks CSV file')
@click.option('--script', default='neutral', help='Game script filter')
@click.option('--top', default=10, type=int, help='Number of top suggestions')
def suggest(csv: str, script: str, top: int):
    """Suggest optimal 3-pick slips by EV and correlation."""
    try:
        # Load picks data
        picks_df = pd.read_csv(csv)
        
        # Filter by game script if specified
        if 'game_script' in picks_df.columns and script != 'neutral':
            picks_df = picks_df[picks_df['game_script'] == script]
        
        if len(picks_df) < 3:
            click.echo("Error: Need at least 3 picks for suggestions.")
            return
        
        # Calculate EV for all picks
        ev_df = batch_ev_calculation(picks_df)
        
        # Initialize engines
        correlation_engine = CorrelationEngine()
        role_tagger = RoleTagger()
        
        # Generate combinations (simplified - top picks only for performance)
        top_picks = ev_df.nlargest(min(20, len(ev_df)), 'ev_ev_percentage')
        
        suggestions = []
        
        # Simple combination generation (could be optimized)
        for i in range(len(top_picks)):
            for j in range(i+1, len(top_picks)):
                for k in range(j+1, len(top_picks)):
                    pick1 = top_picks.iloc[i]
                    pick2 = top_picks.iloc[j]
                    pick3 = top_picks.iloc[k]
                    
                    # Calculate combination metrics
                    combo_ev = pick1['ev_ev_percentage'] + pick2['ev_ev_percentage'] + pick3['ev_ev_percentage']
                    
                    # Calculate correlations
                    corr12 = correlation_engine.calculate_correlation(
                        pick1.to_dict(), pick2.to_dict(), {'game_script': script}
                    )
                    corr13 = correlation_engine.calculate_correlation(
                        pick1.to_dict(), pick3.to_dict(), {'game_script': script}
                    )
                    corr23 = correlation_engine.calculate_correlation(
                        pick2.to_dict(), pick3.to_dict(), {'game_script': script}
                    )
                    
                    avg_correlation = (corr12 + corr13 + corr23) / 3
                    
                    # Combined score
                    score = combo_ev + (avg_correlation * 10)  # Weight correlation
                    
                    suggestions.append({
                        'picks': [i, j, k],
                        'players': [pick1.get('player_name', ''), pick2.get('player_name', ''), pick3.get('player_name', '')],
                        'ev_total': combo_ev,
                        'avg_correlation': avg_correlation,
                        'score': score
                    })
        
        # Sort by score and get top suggestions
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        top_suggestions = suggestions[:top]
        
        # Display suggestions
        click.echo(f"\nTOP {top} SLIP SUGGESTIONS FOR {script.upper()} SCRIPT")
        click.echo("="*100)
        click.echo(f"{'#':<3} {'Players':<45} {'Total EV':<10} {'Avg Corr':<10} {'Score':<8}")
        click.echo("-" * 100)
        
        for i, suggestion in enumerate(top_suggestions, 1):
            players_str = " + ".join(suggestion['players'][:3])[:44]
            click.echo(f"{i:<3} {players_str:<45} "
                      f"{suggestion['ev_total']:<10.1f} "
                      f"{suggestion['avg_correlation']:<10.3f} "
                      f"{suggestion['score']:<8.1f}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@main.group()
def bankroll():
    """Bankroll management commands."""
    pass


@bankroll.command()
@click.option('--start', required=True, type=float, help='Starting bankroll amount')
def init(start: float):
    """Initialize bankroll ledger."""
    try:
        manager = BankrollManager()
        manager.initialize_bankroll(start)
        click.echo(f"✓ Bankroll initialized with ${start:.2f}")
    except ValueError as e:
        click.echo(f"Error: {str(e)}")


@bankroll.command()
@click.option('--slip', required=True, help='Slip ID')
@click.option('--result', required=True, type=click.Choice(['win', 'loss', 'push']))
@click.option('--payout', default=0.0, type=float, help='Payout amount (for wins)')
def update(slip: str, result: str, payout: float):
    """Update bankroll with bet result."""
    try:
        manager = BankrollManager()
        entry = manager.log_result(slip, result, payout)
        
        summary = manager.get_bankroll_summary()
        click.echo(f"✓ Updated slip {slip}: {result}")
        click.echo(f"New balance: ${summary['current_balance']:.2f}")
        click.echo(f"Total P&L: ${summary['total_profit_loss']:.2f}")
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@bankroll.command()
def show():
    """Show current bankroll status."""
    try:
        manager = BankrollManager()
        summary = manager.get_bankroll_summary()
        
        click.echo("\nBANKROLL SUMMARY")
        click.echo("="*50)
        click.echo(f"Current Balance: ${summary['current_balance']:.2f}")
        click.echo(f"Starting Balance: ${summary['starting_balance']:.2f}")
        click.echo(f"Total P&L: ${summary['total_profit_loss']:.2f}")
        click.echo(f"ROI: {summary['roi']:.1f}%")
        click.echo(f"Total Bets: {summary['total_bets']}")
        click.echo(f"Win Rate: {summary['win_rate']:.1f}%")
        click.echo(f"Total Wagered: ${summary['total_bet']:.2f}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@bankroll.command()
@click.option('--script', help='Filter by game script')
@click.option('--stack', help='Filter by stack type')
def query(script: Optional[str], stack: Optional[str]):
    """Query bankroll ledger with filters."""
    try:
        manager = BankrollManager()
        entries = manager.query_ledger(game_script=script, stack_type=stack)
        
        if not entries:
            click.echo("No entries found matching filters.")
            return
        
        # Calculate performance for filtered entries
        bets = [e for e in entries if e.action == 'bet']
        wins = [e for e in entries if e.action == 'win']
        losses = [e for e in entries if e.action == 'loss']
        
        total_bet = sum(abs(e.amount) for e in bets)
        total_won = sum(e.amount for e in wins)
        total_lost = sum(abs(e.amount) for e in bets if e.slip_id in [w.slip_id for w in losses])
        
        click.echo(f"\nQUERY RESULTS")
        click.echo("="*50)
        if script:
            click.echo(f"Game Script: {script}")
        if stack:
            click.echo(f"Stack Type: {stack}")
        click.echo(f"Total Bets: {len(bets)}")
        click.echo(f"Wins: {len(wins)}")
        click.echo(f"Losses: {len(losses)}")
        click.echo(f"Win Rate: {len(wins)/len(bets)*100:.1f}%" if bets else "0%")
        click.echo(f"Total Bet: ${total_bet:.2f}")
        click.echo(f"Total Won: ${total_won:.2f}")
        click.echo(f"Net P&L: ${total_won - total_bet:.2f}")
        click.echo(f"ROI: {((total_won - total_bet) / total_bet * 100):.1f}%" if total_bet > 0 else "0%")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@main.group()
def viz():
    """Visualization commands."""
    pass


@viz.command()
@click.option('--output', default='bankroll_curve.png', help='Output filename')
def bankroll(output: str):
    """Generate bankroll growth curve visualization."""
    try:
        from .viz import BankrollVisualizer
        
        manager = BankrollManager()
        visualizer = BankrollVisualizer(manager)
        
        filepath = visualizer.plot_bankroll_curve(output)
        click.echo(f"✓ Bankroll curve saved to: {filepath}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


@viz.command()
@click.option('--by', default='script', type=click.Choice(['script', 'stack']), help='Group ROI by script or stack')
@click.option('--output', default='roi_chart.png', help='Output filename')
def roi(by: str, output: str):
    """Generate ROI chart by script or stack type."""
    try:
        from .viz import generate_roi_chart
        
        manager = BankrollManager()
        
        # Group ledger entries
        if by == 'script':
            grouped_data = {}
            for entry in manager.ledger:
                if entry.game_script and entry.action in ['win', 'loss']:
                    if entry.game_script not in grouped_data:
                        grouped_data[entry.game_script] = {'wins': 0, 'losses': 0, 'total_bet': 0, 'total_won': 0}
                    
                    if entry.action == 'win':
                        grouped_data[entry.game_script]['wins'] += 1
                        grouped_data[entry.game_script]['total_won'] += entry.amount
                    else:
                        grouped_data[entry.game_script]['losses'] += 1
                        # Find corresponding bet
                        bet_entry = next((e for e in manager.ledger 
                                        if e.slip_id == entry.slip_id and e.action == 'bet'), None)
                        if bet_entry:
                            grouped_data[entry.game_script]['total_bet'] += abs(bet_entry.amount)
        
        # Calculate ROI for each group
        roi_data = {}
        for group, data in grouped_data.items():
            if data['total_bet'] > 0:
                roi = ((data['total_won'] - data['total_bet']) / data['total_bet']) * 100
                roi_data[group] = roi
        
        filepath = generate_roi_chart(roi_data, output, by)
        click.echo(f"✓ ROI chart saved to: {filepath}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")


if __name__ == '__main__':
    main()