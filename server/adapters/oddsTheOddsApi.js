// The Odds API Adapter - Live NFL Betting Lines
export class OddsTheOddsApiAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.the-odds-api.com/v4';
    this.sport = 'americanfootball_nfl';
    this.lineMovementCache = new Map(); // Track line changes
  }

  async getGameOdds(gameIds = []) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${this.sport}/odds?` +
        `apiKey=${this.apiKey}&` +
        `regions=us&` +
        `markets=spreads,totals,h2h&` +
        `oddsFormat=american&` +
        `dateFormat=iso`
      );

      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`);
      }

      const data = await response.json();
      const currentTime = new Date().toISOString();
      
      return data.map(game => this.mapOddsData(game, currentTime)).filter(Boolean);
    } catch (error) {
      console.error('Odds API fetch failed:', error);
      return [];
    }
  }

  mapOddsData(oddsGame, currentTime) {
    try {
      // Find the best/consensus bookmaker (use DraftKings as primary, FanDuel as fallback)
      const bookmaker = oddsGame.bookmakers?.find(b => 
        ['draftkings', 'fanduel', 'betmgm'].includes(b.key)
      ) || oddsGame.bookmakers?.[0];

      if (!bookmaker) return null;

      // Extract spreads
      const spreadMarket = bookmaker.markets?.find(m => m.key === 'spreads');
      const spread = this.extractSpread(spreadMarket);

      // Extract totals
      const totalsMarket = bookmaker.markets?.find(m => m.key === 'totals');
      const total = this.extractTotal(totalsMarket);

      // Extract moneylines
      const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
      const moneylines = this.extractMoneylines(h2hMarket, oddsGame);

      // Calculate line movement
      const lineMove = this.calculateLineMovement(oddsGame.id, spread, total);

      const oddsSnapshot = {
        gameId: oddsGame.id,
        sport: oddsGame.sport_key,
        commenceTime: oddsGame.commence_time,
        homeTeam: oddsGame.home_team,
        awayTeam: oddsGame.away_team,
        spread: {
          home: spread?.home || 0,
          away: spread?.away || 0
        },
        total: total || 0,
        moneylineHome: moneylines?.home || 0,
        moneylineAway: moneylines?.away || 0,
        lastUpdatedISO: currentTime,
        bookmaker: bookmaker.title,
        lineMove: {
          spreadΔ: lineMove.spreadΔ,
          totalΔ: lineMove.totalΔ,
          since: lineMove.since
        }
      };

      // Store for line movement tracking
      this.lineMovementCache.set(oddsGame.id, {
        spread: spread,
        total: total,
        timestamp: currentTime
      });

      return oddsSnapshot;
    } catch (error) {
      console.error('Failed to map odds data:', error);
      return null;
    }
  }

  extractSpread(spreadMarket) {
    if (!spreadMarket?.outcomes) return null;
    
    const homeOutcome = spreadMarket.outcomes.find(o => 
      o.name === spreadMarket.last_update_home_team
    );
    const awayOutcome = spreadMarket.outcomes.find(o => 
      o.name !== spreadMarket.last_update_home_team
    );

    return {
      home: parseFloat(homeOutcome?.point || 0),
      away: parseFloat(awayOutcome?.point || 0)
    };
  }

  extractTotal(totalsMarket) {
    if (!totalsMarket?.outcomes) return null;
    
    const overOutcome = totalsMarket.outcomes.find(o => o.name === 'Over');
    return parseFloat(overOutcome?.point || 0);
  }

  extractMoneylines(h2hMarket, oddsGame) {
    if (!h2hMarket?.outcomes) return null;

    const homeOutcome = h2hMarket.outcomes.find(o => o.name === oddsGame.home_team);
    const awayOutcome = h2hMarket.outcomes.find(o => o.name === oddsGame.away_team);

    return {
      home: parseInt(homeOutcome?.price || 0),
      away: parseInt(awayOutcome?.price || 0)
    };
  }

  calculateLineMovement(gameId, currentSpread, currentTotal) {
    const previous = this.lineMovementCache.get(gameId);
    
    if (!previous) {
      return { spreadΔ: 0, totalΔ: 0, since: null };
    }

    const spreadΔ = currentSpread ? 
      (currentSpread.home - (previous.spread?.home || 0)) : 0;
    const totalΔ = currentTotal ? 
      (currentTotal - (previous.total || 0)) : 0;

    return {
      spreadΔ: Math.round(spreadΔ * 10) / 10, // Round to 1 decimal
      totalΔ: Math.round(totalΔ * 10) / 10,
      since: previous.timestamp
    };
  }

  isStaleOdds(lastUpdatedISO, maxAgeMinutes = 10) {
    const lastUpdate = new Date(lastUpdatedISO);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    return diffMinutes > maxAgeMinutes;
  }
}