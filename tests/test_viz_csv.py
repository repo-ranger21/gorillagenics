"""
Tests for CSV-based visualization functions.
"""

import pytest
import pandas as pd
import tempfile
import os
from pathlib import Path

from src.gorillagenics.viz import plot_bankroll_curve, plot_roi_by_script


class TestCSVVisualization:
    """Test CSV-based visualization functions."""
    
    def test_plot_bankroll_curve_success(self):
        """Test successful bankroll curve plotting from CSV."""
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write("date,bankroll\n")
            f.write("2024-01-01,1000\n")
            f.write("2024-01-02,1050\n")
            f.write("2024-01-03,1025\n")
            csv_path = f.name
        
        try:
            # Test the function
            output_path = plot_bankroll_curve(csv_path, "test_bankroll.png")
            
            # Verify output file exists
            assert os.path.exists(output_path)
            assert "test_bankroll.png" in output_path
            
            # Clean up output file
            if os.path.exists(output_path):
                os.remove(output_path)
                
        finally:
            # Clean up CSV file
            os.unlink(csv_path)
    
    def test_plot_bankroll_curve_missing_columns(self):
        """Test bankroll curve with missing required columns."""
        # Create CSV with wrong columns
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write("wrong,columns\n")
            f.write("2024-01-01,1000\n")
            csv_path = f.name
        
        try:
            with pytest.raises(ValueError, match="CSV must contain 'date' and 'bankroll' columns"):
                plot_bankroll_curve(csv_path, "test.png")
        finally:
            os.unlink(csv_path)
    
    def test_plot_bankroll_curve_file_not_found(self):
        """Test bankroll curve with non-existent file."""
        with pytest.raises(ValueError, match="CSV file not found"):
            plot_bankroll_curve("/nonexistent/file.csv", "test.png")
    
    def test_plot_roi_by_script_success(self):
        """Test successful ROI by script plotting from CSV."""
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write("script,stake,return\n")
            f.write("shootout,100,150\n")
            f.write("control,100,120\n")
            f.write("neutral,100,110\n")
            f.write("shootout,50,75\n")
            csv_path = f.name
        
        try:
            # Test the function
            output_path = plot_roi_by_script(csv_path, "test_roi.png")
            
            # Verify output file exists
            assert os.path.exists(output_path)
            assert "test_roi.png" in output_path
            
            # Clean up output file
            if os.path.exists(output_path):
                os.remove(output_path)
                
        finally:
            # Clean up CSV file
            os.unlink(csv_path)
    
    def test_plot_roi_by_script_missing_columns(self):
        """Test ROI by script with missing required columns."""
        # Create CSV with missing columns
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write("script,stake\n")  # missing 'return' column
            f.write("shootout,100\n")
            csv_path = f.name
        
        try:
            with pytest.raises(ValueError, match="CSV must contain columns.*Missing.*return"):
                plot_roi_by_script(csv_path, "test.png")
        finally:
            os.unlink(csv_path)
    
    def test_plot_roi_by_script_no_valid_data(self):
        """Test ROI by script with no valid ROI data."""
        # Create CSV with zero stakes
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write("script,stake,return\n")
            f.write("shootout,0,150\n")  # stake = 0, invalid for ROI
            csv_path = f.name
        
        try:
            with pytest.raises(ValueError, match="No valid ROI data found in CSV"):
                plot_roi_by_script(csv_path, "test.png")
        finally:
            os.unlink(csv_path)
    
    def test_plot_roi_by_script_file_not_found(self):
        """Test ROI by script with non-existent file."""
        with pytest.raises(ValueError, match="CSV file not found"):
            plot_roi_by_script("/nonexistent/file.csv", "test.png")