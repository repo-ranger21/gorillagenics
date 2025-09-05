// Health Check Endpoint - Monitor Provider Status
export async function healthRoutes(app, providers) {
  app.get('/api/health', async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      providers: {
        schedule: 'unknown',
        odds: 'unknown', 
        players: 'unknown'
      },
      details: {}
    };

    // Test schedule provider
    try {
      await providers.schedule.getCurrentWeek();
      health.providers.schedule = 'ok';
      health.details.schedule = 'ESPN API accessible';
    } catch (error) {
      health.providers.schedule = 'fail';
      health.details.schedule = error.message;
    }

    // Test odds provider
    try {
      const testOdds = await providers.odds.getGameOdds([]);
      health.providers.odds = Array.isArray(testOdds) ? 'ok' : 'fail';
      health.details.odds = `Returned ${testOdds?.length || 0} odds objects`;
    } catch (error) {
      health.providers.odds = 'fail';
      health.details.odds = error.message;
    }

    // Test players provider
    try {
      const testPlayers = await providers.players.getFeaturedOffense('1'); // Test with ATL
      health.providers.players = testPlayers ? 'ok' : 'fail';
      health.details.players = `Returned ${testPlayers?.players?.length || 0} offensive players`;
    } catch (error) {
      health.providers.players = 'fail';
      health.details.players = error.message;
    }

    // Overall status
    const allOk = Object.values(health.providers).every(status => status === 'ok');
    health.status = allOk ? 'ok' : 'degraded';

    res.status(allOk ? 200 : 503).json(health);
  });
}