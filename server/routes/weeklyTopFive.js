// Weekly Top 5 API Route
import { TopFiveService } from '../services/topFiveService.js';

const topFiveService = new TopFiveService();

export async function handleTopFiveRequest(req, res) {
  try {
    const week = req.query.week || 'auto';
    const result = await topFiveService.getTopFivePicks(week);
    
    res.json(result);
  } catch (error) {
    console.error('Top Five API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate Top 5 picks',
      fallback: true,
      picks: [] 
    });
  }
}

export async function handleHealthCheck(req, res) {
  try {
    // Quick health check for all data sources
    const health = {
      schedule: 'ok',
      odds: 'ok', 
      players: 'ok',
      timestamp: new Date().toISOString()
    };

    // Test schedule adapter
    try {
      await topFiveService.scheduleAdapter.getCurrentWeek();
    } catch (error) {
      health.schedule = 'fail';
    }

    // Test odds adapter (if API key available)
    if (process.env.ODDS_API_KEY) {
      try {
        await topFiveService.oddsAdapter.getGameOdds();
      } catch (error) {
        health.odds = 'fail';
      }
    } else {
      health.odds = 'no_key';
    }

    // Test players adapter
    try {
      await topFiveService.playersAdapter.getAllPlayers();
    } catch (error) {
      health.players = 'fail';
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
}