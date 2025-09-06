// Top 5 Weekly DFS Picks Service - GuerillaGenics Scoring Algorithm
import { ScheduleEspnAdapter } from '../adapters/scheduleEspn.js';
import { OddsTheOddsApiAdapter } from '../adapters/oddsTheOddsApi.js';
import { livePlayerService } from './live-player-service.js';
import { storage } from '../storage.js';

export class TopFiveService {
  constructor() {
    this.scheduleAdapter = new ScheduleEspnAdapter();
    this.oddsAdapter = new OddsTheOddsApiAdapter(process.env.ODDS_API_KEY);
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.offensivePositions = new Set(['QB', 'RB', 'WR', 'TE']);
  }

  async getTopFivePicks(week = 'auto') {
    try {
      const cacheKey = `top5_week_${week}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        return cached.data;
      }

      // Get current week if auto
      let currentWeek = week;
      if (week === 'auto') {
        const weekData = await this.scheduleAdapter.getCurrentWeek();
        currentWeek = weekData.currentWeek;
      }

      // Fetch all required data
      const [schedule, odds] = await Promise.all([
        this.scheduleAdapter.getWeekSchedule(currentWeek),
        this.oddsAdapter.getGameOdds()
      ]);

      // Build candidate pool from all teams playing this week
      const playingTeams = this.extractPlayingTeams(schedule);
      const candidates = await this.buildCandidatePool(playingTeams);

      // Score and rank all candidates
      const scoredCandidates = this.scoreAllCandidates(candidates, schedule, odds);

      // Select Top 5 with diversity rules
      const topFive = this.selectTopFiveWithDiversity(scoredCandidates);

      const result = {
        week: currentWeek,
        picks: topFive,
        generatedAt: new Date().toISOString(),
        totalCandidates: candidates.length
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Top Five service error:', error);
      return this.getFallbackTopFive(week);
    }
  }

  extractPlayingTeams(schedule) {
    const teams = new Set();
    schedule.forEach(game => {
      teams.add(game.homeTeam.id);
      teams.add(game.awayTeam.id);
    });
    return Array.from(teams);
  }

  async buildCandidatePool(teamIds) {
    try {
      // Get all current NFL players from the same source as the main platform
      const allPlayers = await livePlayerService.refreshPlayerData();
      
      // Filter to only offensive positions and playing teams
      const candidates = allPlayers.filter(player => {
        return (
          this.offensivePositions.has(player.position) && 
          teamIds.some(teamId => this.matchesTeam(player.team, teamId))
        );
      }).map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        team: player.team,
        teamId: this.findTeamId(player.team, teamIds),
        roleTag: this.getRoleTag(player.position),
        experience: 3, // Default experience
        injuryStatus: 'Healthy', // Default status
        headshotUrl: this.getPlayerHeadshot(player.id)
      }));

      console.log(`✅ Built candidate pool with ${candidates.length} offensive players`);
      return candidates;
    } catch (error) {
      console.error('Failed to build candidate pool:', error);
      return [];
    }
  }

  validateOffensiveOnly(players) {
    const defensivePositions = new Set([
      'LB', 'CB', 'S', 'DL', 'EDGE', 'DE', 'DT', 'DB', 'K', 'P', 'LS', 
      'OLB', 'ILB', 'SS', 'FS', 'NT', 'OT', 'G', 'C' // Added O-line positions for safety
    ]);

    return players.filter(player => {
      if (defensivePositions.has(player.position)) {
        console.warn(`Filtering out non-offensive player: ${player.name} (${player.position})`);
        return false;
      }
      return this.offensivePositions.has(player.position);
    });
  }

  scoreAllCandidates(candidates, schedule, odds) {
    return candidates.map(player => {
      const gameContext = this.findPlayerGame(player, schedule);
      const gameOdds = odds.find(o => o.gameId === gameContext?.id);
      
      const ggScore = this.calculateGGScore(player, gameContext, gameOdds);
      const confidence = this.calculateConfidence(ggScore);
      const commentary = this.generateCommentary(player, gameContext, gameOdds);

      return {
        playerId: player.id,
        name: player.name,
        teamAbbr: player.team, // Use the player's actual team from live data
        position: player.position,
        matchup: gameContext ? this.formatMatchup(gameContext, player.teamId) : `${player.team} vs TBD`,
        kickoffEt: gameContext ? this.formatKickoffTime(gameContext.startTimeISO) : 'TBD',
        slate: gameContext ? (gameContext.timeSlot === 'SNF' || gameContext.timeSlot === 'MNF' || gameContext.timeSlot === 'Thursday' ? 'Prime' : 'Main') : 'Main',
        ggScore,
        confidence,
        commentary,
        headshotUrl: player.headshotUrl,
        gameTotal: gameOdds?.total || 0,
        sortKey: ggScore + (gameContext?.timeSlot === 'Main' ? 0.1 : 0) // Tie-breaker preference
      };
    }).sort((a, b) => b.sortKey - a.sortKey);
  }

  calculateGGScore(player, gameContext, gameOdds) {
    let score = 50; // Base score

    // Positional premiums
    const positionBonus = {
      'QB': 12,
      'WR': 10,
      'RB': 9,
      'TE': 7
    };
    score += positionBonus[player.position] || 0;

    // Usage/popularity proxy (from fantasy relevance)
    if (player.roleTag) {
      const roleBonus = {
        'QB1': 10,
        'RB1': 8,
        'RB2': 5,
        'WR1': 8,
        'WR2': 5,
        'TE1': 6
      };
      score += roleBonus[player.roleTag] || 3;
    }

    // Experience bonus
    if (player.experience > 3) {
      score += Math.min(player.experience, 8);
    }

    // Environment bonus (game total percentile)
    if (gameOdds?.total) {
      const totalBonus = Math.min(10, Math.floor((gameOdds.total - 40) / 4));
      score += Math.max(0, totalBonus);
    }

    // Injury status penalties
    if (player.injuryStatus) {
      const injuryPenalty = {
        'Questionable': -8,
        'Doubtful': -25,
        'Out': -100 // Should be filtered out, but safety net
      };
      score += injuryPenalty[player.injuryStatus] || 0;
    }

    // Prime time bonus
    if (gameContext?.timeSlot === 'SNF' || gameContext?.timeSlot === 'MNF') {
      score += 3;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateConfidence(ggScore) {
    if (ggScore >= 80) return Math.min(95, 80 + Math.floor((ggScore - 80) / 2));
    if (ggScore >= 65) return 65 + Math.floor((ggScore - 65) / 2);
    return Math.max(45, 55 + Math.floor((ggScore - 50) / 3));
  }

  generateCommentary(player, gameContext, gameOdds) {
    const templates = {
      'QB': [
        'Tempo + deep shots → ceiling within reach',
        'Pass volume spike expected in shootout script',
        'Pocket presence vs pressure → leverage confirmed'
      ],
      'WR': [
        'Alpha target share vs soft boundary — bananas incoming',
        'Route precision + red-zone looks = explosive upside',
        'Separation skills meet high-volume passing attack'
      ],
      'RB': [
        'Workhorse + goal-line equity — juice is ripe',
        'Ground game script + passing down work = ceiling',
        'Fresh legs + game flow → volume accumulation'
      ],
      'TE': [
        'Seam leverage vs zone — red-zone paws ready',
        'Mismatch hunting in slot + goal-line targets',
        'Safety valve role + red-zone size = steady floor'
      ]
    };

    const positionTemplates = templates[player.position] || ['Solid play expected'];
    const randomIndex = Math.floor(Math.random() * positionTemplates.length);
    let commentary = positionTemplates[randomIndex];

    // Add game total context if high
    if (gameOdds?.total > 48) {
      commentary += ' (High total = 🔥)';
    }

    return commentary + '.';
  }

  selectTopFiveWithDiversity(scoredCandidates) {
    const selected = [];
    const teamCounts = new Map();
    const positionCounts = new Map();

    for (const candidate of scoredCandidates) {
      // Diversity rules
      const currentTeamCount = teamCounts.get(candidate.teamAbbr) || 0;
      const currentPositionCount = positionCounts.get(candidate.position) || 0;

      // Max 2 players per team, max 2 per position (except WR can have 2)
      if (currentTeamCount >= 2) continue;
      if (currentPositionCount >= 2 && candidate.position !== 'WR') continue;
      if (candidate.position === 'WR' && currentPositionCount >= 2) continue;

      selected.push(candidate);
      teamCounts.set(candidate.teamAbbr, currentTeamCount + 1);
      positionCounts.set(candidate.position, currentPositionCount + 1);

      if (selected.length >= 5) break;
    }

    return selected;
  }

  findPlayerGame(player, schedule) {
    return schedule.find(game => 
      game.homeTeam.id === player.teamId || game.awayTeam.id === player.teamId
    );
  }

  getTeamAbbr(teamId, schedule) {
    for (const game of schedule) {
      if (game.homeTeam.id === teamId) return game.homeTeam.abbr;
      if (game.awayTeam.id === teamId) return game.awayTeam.abbr;
    }
    return 'UNK';
  }

  formatMatchup(game, playerTeamId) {
    if (game.homeTeam.id === playerTeamId) {
      return `${game.awayTeam.abbr} @ ${game.homeTeam.abbr}`;
    } else {
      return `${game.awayTeam.abbr} @ ${game.homeTeam.abbr}`;
    }
  }

  formatKickoffTime(startTimeISO) {
    const date = new Date(startTimeISO);
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' ET';
  }

  matchesTeam(playerTeam, scheduleTeamId) {
    // Simple team matching - you may need to enhance this mapping
    const teamMappings = {
      'BUF': ['2'], 'MIA': ['15'], 'NE': ['17'], 'NYJ': ['20'],
      'BAL': ['33'], 'CIN': ['4'], 'CLE': ['5'], 'PIT': ['23'],
      'HOU': ['34'], 'IND': ['11'], 'JAX': ['30'], 'TEN': ['10'],
      'DEN': ['7'], 'KC': ['12'], 'LV': ['13'], 'LAC': ['24'],
      'DAL': ['6'], 'NYG': ['19'], 'PHI': ['21'], 'WAS': ['28'],
      'CHI': ['3'], 'DET': ['8'], 'GB': ['9'], 'MIN': ['16'],
      'ATL': ['1'], 'CAR': ['29'], 'NO': ['18'], 'TB': ['27'],
      'ARI': ['22'], 'LAR': ['14'], 'SF': ['25'], 'SEA': ['26']
    };
    
    return teamMappings[playerTeam]?.includes(scheduleTeamId.toString()) || false;
  }

  findTeamId(playerTeam, teamIds) {
    // Find the corresponding team ID from schedule
    return teamIds.find(id => this.matchesTeam(playerTeam, id)) || teamIds[0];
  }

  getRoleTag(position) {
    return `${position}1`; // Simplified role tagging
  }

  getPlayerHeadshot(playerId) {
    return `https://a.espncdn.com/i/headshots/nfl/players/full/${playerId}.png`;
  }

  getFallbackTopFive(week) {
    return {
      week: typeof week === 'number' ? week : 1,
      picks: [],
      generatedAt: new Date().toISOString(),
      totalCandidates: 0,
      fallback: true
    };
  }
}