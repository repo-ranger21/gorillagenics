"""
Visualization Module for Bankroll and Performance Analytics.

This module provides visualization capabilities for bankroll growth curves,
ROI analysis by script/stack, and other performance metrics using matplotlib and plotly.
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path


class BankrollVisualizer:
    """Visualizer for bankroll and performance analytics."""
    
    def __init__(self, bankroll_manager):
        """
        Initialize visualizer with bankroll manager.
        
        Args:
            bankroll_manager: BankrollManager instance
        """
        self.bankroll_manager = bankroll_manager
        self.output_dir = Path.cwd() / "visualizations"
        self.output_dir.mkdir(exist_ok=True)
    
    def plot_bankroll_curve(
        self,
        filename: str = "bankroll_curve.png",
        use_plotly: bool = False
    ) -> str:
        """
        Generate bankroll growth curve visualization.
        
        Args:
            filename: Output filename
            use_plotly: Whether to use Plotly (True) or Matplotlib (False)
            
        Returns:
            Path to saved visualization file
        """
        if not self.bankroll_manager.ledger:
            raise ValueError("No bankroll data available for visualization")
        
        # Prepare data
        dates = []
        balances = []
        
        for entry in self.bankroll_manager.ledger:
            dates.append(entry.timestamp)
            balances.append(entry.balance_after)
        
        if use_plotly:
            return self._plot_bankroll_plotly(dates, balances, filename)
        else:
            return self._plot_bankroll_matplotlib(dates, balances, filename)
    
    def _plot_bankroll_matplotlib(
        self,
        dates: List[datetime],
        balances: List[float],
        filename: str
    ) -> str:
        """Create bankroll curve using Matplotlib."""
        plt.figure(figsize=(12, 8))
        
        # Main plot
        plt.plot(dates, balances, linewidth=2, color='#1f77b4', label='Bankroll')
        
        # Add markers for wins/losses
        wins = []
        losses = []
        win_dates = []
        loss_dates = []
        
        for entry in self.bankroll_manager.ledger:
            if entry.action == 'win':
                wins.append(entry.balance_after)
                win_dates.append(entry.timestamp)
            elif entry.action == 'loss':
                losses.append(entry.balance_after)
                loss_dates.append(entry.timestamp)
        
        if wins:
            plt.scatter(win_dates, wins, color='green', s=50, alpha=0.7, label='Wins', zorder=5)
        if losses:
            plt.scatter(loss_dates, losses, color='red', s=50, alpha=0.7, label='Losses', zorder=5)
        
        # Styling
        plt.title('Bankroll Growth Curve', fontsize=16, fontweight='bold')
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Bankroll ($)', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Format x-axis dates
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
        plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=max(1, len(dates)//10)))
        plt.xticks(rotation=45)
        
        # Add summary stats
        if balances:
            start_balance = balances[0]
            end_balance = balances[-1]
            total_return = ((end_balance - start_balance) / start_balance) * 100 if start_balance > 0 else 0
            
            plt.text(0.02, 0.98, f'Total Return: {total_return:.1f}%', 
                    transform=plt.gca().transAxes, verticalalignment='top',
                    bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        
        plt.tight_layout()
        
        # Save file
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(filepath)
    
    def _plot_bankroll_plotly(
        self,
        dates: List[datetime],
        balances: List[float],
        filename: str
    ) -> str:
        """Create bankroll curve using Plotly."""
        fig = go.Figure()
        
        # Main bankroll line
        fig.add_trace(go.Scatter(
            x=dates,
            y=balances,
            mode='lines',
            name='Bankroll',
            line=dict(width=3, color='#1f77b4'),
            hovertemplate='<b>Date:</b> %{x}<br><b>Balance:</b> $%{y:.2f}<extra></extra>'
        ))
        
        # Add win/loss markers
        wins = []
        losses = []
        win_dates = []
        loss_dates = []
        
        for entry in self.bankroll_manager.ledger:
            if entry.action == 'win':
                wins.append(entry.balance_after)
                win_dates.append(entry.timestamp)
            elif entry.action == 'loss':
                losses.append(entry.balance_after)
                loss_dates.append(entry.timestamp)
        
        if wins:
            fig.add_trace(go.Scatter(
                x=win_dates,
                y=wins,
                mode='markers',
                name='Wins',
                marker=dict(color='green', size=8),
                hovertemplate='<b>Win</b><br><b>Date:</b> %{x}<br><b>Balance:</b> $%{y:.2f}<extra></extra>'
            ))
        
        if losses:
            fig.add_trace(go.Scatter(
                x=loss_dates,
                y=losses,
                mode='markers',
                name='Losses',
                marker=dict(color='red', size=8),
                hovertemplate='<b>Loss</b><br><b>Date:</b> %{x}<br><b>Balance:</b> $%{y:.2f}<extra></extra>'
            ))
        
        # Layout
        fig.update_layout(
            title='Bankroll Growth Curve',
            xaxis_title='Date',
            yaxis_title='Bankroll ($)',
            hovermode='x unified',
            template='plotly_white',
            width=1000,
            height=600
        )
        
        # Save file
        filepath = self.output_dir / filename.replace('.png', '.html')
        fig.write_html(str(filepath))
        
        return str(filepath)
    
    def plot_performance_heatmap(
        self,
        filename: str = "performance_heatmap.png"
    ) -> str:
        """
        Generate performance heatmap by game script and time period.
        
        Args:
            filename: Output filename
            
        Returns:
            Path to saved visualization file
        """
        # Group entries by script and date
        performance_data = {}
        
        for entry in self.bankroll_manager.ledger:
            if entry.action in ['win', 'loss'] and entry.game_script:
                date_key = entry.timestamp.strftime('%Y-%m-%d')
                script = entry.game_script
                
                if script not in performance_data:
                    performance_data[script] = {}
                if date_key not in performance_data[script]:
                    performance_data[script][date_key] = {'wins': 0, 'losses': 0}
                
                if entry.action == 'win':
                    performance_data[script][date_key]['wins'] += 1
                else:
                    performance_data[script][date_key]['losses'] += 1
        
        if not performance_data:
            raise ValueError("No performance data available for heatmap")
        
        # Create DataFrame for heatmap
        heatmap_data = []
        for script, dates in performance_data.items():
            for date, stats in dates.items():
                total = stats['wins'] + stats['losses']
                win_rate = stats['wins'] / total if total > 0 else 0
                heatmap_data.append({
                    'script': script,
                    'date': date,
                    'win_rate': win_rate,
                    'total_bets': total
                })
        
        df = pd.DataFrame(heatmap_data)
        
        if df.empty:
            raise ValueError("No data available for heatmap")
        
        # Create pivot table
        pivot_table = df.pivot(index='script', columns='date', values='win_rate')
        
        # Create heatmap
        plt.figure(figsize=(15, 8))
        plt.imshow(pivot_table.values, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
        plt.colorbar(label='Win Rate')
        
        # Labels
        plt.title('Performance Heatmap by Script and Date', fontsize=16, fontweight='bold')
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Game Script', fontsize=12)
        
        # Set ticks
        plt.xticks(range(len(pivot_table.columns)), pivot_table.columns, rotation=45)
        plt.yticks(range(len(pivot_table.index)), pivot_table.index)
        
        plt.tight_layout()
        
        # Save file
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(filepath)


def generate_roi_chart(
    roi_data: Dict[str, float],
    filename: str = "roi_chart.png",
    group_by: str = "script"
) -> str:
    """
    Generate ROI bar chart by specified grouping.
    
    Args:
        roi_data: Dictionary with group names as keys and ROI percentages as values
        filename: Output filename
        group_by: What the data is grouped by (for labeling)
        
    Returns:
        Path to saved visualization file
    """
    if not roi_data:
        raise ValueError("No ROI data provided")
    
    # Create bar chart
    plt.figure(figsize=(12, 8))
    
    groups = list(roi_data.keys())
    roi_values = list(roi_data.values())
    
    # Color bars based on positive/negative ROI
    colors = ['green' if roi > 0 else 'red' for roi in roi_values]
    
    bars = plt.bar(groups, roi_values, color=colors, alpha=0.7)
    
    # Add value labels on bars
    for bar, value in zip(bars, roi_values):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + (1 if height > 0 else -3),
                f'{value:.1f}%', ha='center', va='bottom' if height > 0 else 'top',
                fontweight='bold')
    
    # Styling
    plt.title(f'ROI by {group_by.title()}', fontsize=16, fontweight='bold')
    plt.xlabel(group_by.title(), fontsize=12)
    plt.ylabel('ROI (%)', fontsize=12)
    plt.grid(True, alpha=0.3, axis='y')
    plt.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    
    # Rotate x-axis labels if needed
    if len(max(groups, key=len)) > 8:
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    # Save file
    output_dir = Path.cwd() / "visualizations"
    output_dir.mkdir(exist_ok=True)
    filepath = output_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    return str(filepath)


def generate_ev_vs_hitrate_scatter(
    picks_data: pd.DataFrame,
    filename: str = "ev_vs_hitrate.png"
) -> str:
    """
    Generate scatter plot of EV vs Hit Rate.
    
    Args:
        picks_data: DataFrame containing pick data with EV and hit rate columns
        filename: Output filename
        
    Returns:
        Path to saved visualization file
    """
    if 'ev_percentage' not in picks_data.columns or 'hit_rate' not in picks_data.columns:
        raise ValueError("DataFrame must contain 'ev_percentage' and 'hit_rate' columns")
    
    plt.figure(figsize=(10, 8))
    
    # Create scatter plot
    plt.scatter(picks_data['hit_rate'], picks_data['ev_percentage'], 
               alpha=0.6, s=60, c='blue', edgecolors='black', linewidth=0.5)
    
    # Add trend line
    z = np.polyfit(picks_data['hit_rate'], picks_data['ev_percentage'], 1)
    p = np.poly1d(z)
    plt.plot(picks_data['hit_rate'], p(picks_data['hit_rate']), "r--", alpha=0.8, linewidth=2)
    
    # Styling
    plt.title('Expected Value vs Hit Rate', fontsize=16, fontweight='bold')
    plt.xlabel('Hit Rate', fontsize=12)
    plt.ylabel('EV Percentage (%)', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Add quadrant lines
    plt.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    plt.axvline(x=0.5, color='black', linestyle='-', alpha=0.5)
    
    # Add quadrant labels
    plt.text(0.7, max(picks_data['ev_percentage']) * 0.8, 'High Hit Rate\nPositive EV', 
            ha='center', va='center', fontsize=10, 
            bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.7))
    
    plt.tight_layout()
    
    # Save file
    output_dir = Path.cwd() / "visualizations"
    output_dir.mkdir(exist_ok=True)
    filepath = output_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    return str(filepath)


def plot_bankroll_curve(ledger_csv: str, output: str = "bankroll_growth.png") -> str:
    """
    Plot bankroll growth over time from a CSV ledger.
    
    Args:
        ledger_csv: Path to CSV file with columns [date, bankroll]
        output: Output filename for the plot
        
    Returns:
        Path to saved visualization file
    """
    # Load CSV data
    try:
        df = pd.read_csv(ledger_csv)
    except FileNotFoundError:
        raise ValueError(f"CSV file not found: {ledger_csv}")
    except Exception as e:
        raise ValueError(f"Error reading CSV file: {str(e)}")
    
    # Validate required columns
    if 'date' not in df.columns or 'bankroll' not in df.columns:
        raise ValueError("CSV must contain 'date' and 'bankroll' columns")
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Sort by date
    df = df.sort_values('date')
    
    # Create plot
    plt.figure(figsize=(12, 8))
    plt.plot(df['date'], df['bankroll'], linewidth=2, color='#1f77b4', marker='o', markersize=4)
    
    # Styling
    plt.title('Bankroll Growth Over Time', fontsize=16, fontweight='bold')
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Bankroll ($)', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Format x-axis dates
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%m/%d/%Y'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=max(1, len(df)//10)))
    plt.xticks(rotation=45)
    
    # Add summary stats
    if len(df) > 0:
        start_balance = df['bankroll'].iloc[0]
        end_balance = df['bankroll'].iloc[-1]
        total_return = ((end_balance - start_balance) / start_balance) * 100 if start_balance > 0 else 0
        
        plt.text(0.02, 0.98, f'Total Return: {total_return:.1f}%', 
                transform=plt.gca().transAxes, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    
    # Save file
    output_dir = Path.cwd() / "visualizations"
    output_dir.mkdir(exist_ok=True)
    filepath = output_dir / output
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    return str(filepath)


def plot_roi_by_script(ledger_csv: str, output: str = "roi_by_script.png") -> str:
    """
    Plot ROI grouped by game script from a CSV ledger.
    
    Args:
        ledger_csv: Path to CSV file with columns [script, stake, return]
        output: Output filename for the plot
        
    Returns:
        Path to saved visualization file
    """
    # Load CSV data
    try:
        df = pd.read_csv(ledger_csv)
    except FileNotFoundError:
        raise ValueError(f"CSV file not found: {ledger_csv}")
    except Exception as e:
        raise ValueError(f"Error reading CSV file: {str(e)}")
    
    # Validate required columns
    required_cols = ['script', 'stake', 'return']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"CSV must contain columns {required_cols}. Missing: {missing_cols}")
    
    # Calculate ROI by script
    roi_by_script = {}
    
    for script in df['script'].unique():
        script_data = df[df['script'] == script]
        total_stake = script_data['stake'].sum()
        total_return = script_data['return'].sum()
        
        if total_stake > 0:
            roi = ((total_return - total_stake) / total_stake) * 100
            roi_by_script[script] = roi
    
    if not roi_by_script:
        raise ValueError("No valid ROI data found in CSV")
    
    # Create bar chart
    plt.figure(figsize=(12, 8))
    
    scripts = list(roi_by_script.keys())
    roi_values = list(roi_by_script.values())
    
    # Color bars based on positive/negative ROI
    colors = ['green' if roi > 0 else 'red' for roi in roi_values]
    
    bars = plt.bar(scripts, roi_values, color=colors, alpha=0.7)
    
    # Add value labels on bars
    for bar, value in zip(bars, roi_values):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + (1 if height > 0 else -3),
                f'{value:.1f}%', ha='center', va='bottom' if height > 0 else 'top',
                fontweight='bold')
    
    # Styling
    plt.title('ROI by Game Script', fontsize=16, fontweight='bold')
    plt.xlabel('Game Script', fontsize=12)
    plt.ylabel('ROI (%)', fontsize=12)
    plt.grid(True, alpha=0.3, axis='y')
    plt.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    
    # Rotate x-axis labels if needed
    if len(max(scripts, key=len)) > 8:
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    # Save file
    output_dir = Path.cwd() / "visualizations"
    output_dir.mkdir(exist_ok=True)
    filepath = output_dir / output
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    return str(filepath)


def create_correlation_matrix_heatmap(
    correlation_matrix: np.ndarray,
    player_names: List[str],
    filename: str = "correlation_matrix.png"
) -> str:
    """
    Create correlation matrix heatmap visualization.
    
    Args:
        correlation_matrix: Correlation matrix as numpy array
        player_names: List of player names for labeling
        filename: Output filename
        
    Returns:
        Path to saved visualization file
    """
    plt.figure(figsize=(10, 8))
    
    # Create heatmap
    im = plt.imshow(correlation_matrix, cmap='RdBu_r', vmin=-1, vmax=1)
    plt.colorbar(im, label='Correlation Coefficient')
    
    # Add labels
    plt.title('Player Correlation Matrix', fontsize=16, fontweight='bold')
    plt.xticks(range(len(player_names)), player_names, rotation=45, ha='right')
    plt.yticks(range(len(player_names)), player_names)
    
    # Add correlation values as text
    for i in range(len(player_names)):
        for j in range(len(player_names)):
            plt.text(j, i, f'{correlation_matrix[i, j]:.2f}', 
                    ha='center', va='center', 
                    color='white' if abs(correlation_matrix[i, j]) > 0.5 else 'black')
    
    plt.tight_layout()
    
    # Save file
    output_dir = Path.cwd() / "visualizations"
    output_dir.mkdir(exist_ok=True)
    filepath = output_dir / filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close()
    
    return str(filepath)