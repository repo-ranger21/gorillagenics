// ESPN NFL Schedule Adapter - Live Week Detection & Game Fetching
export class ScheduleEspnAdapter {
  constructor() {
    this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  }

  async getCurrentWeek() {
    try {
      const response = await fetch(`${this.baseUrl}/scoreboard`);
      const data = await response.json();
      
      // Extract week from ESPN's current data
      const currentWeek = data.week?.number || 1;
      const season = data.season?.year || 2025;
      
      return { 
        currentWeek: Math.min(18, Math.max(1, currentWeek)),
        season,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('ESPN week detection failed:', error);
      // Fallback calculation
      const seasonStart = new Date('2025-09-04');
      const now = new Date();
      const diffDays = Math.ceil((now - seasonStart) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(18, Math.max(1, Math.floor(diffDays / 7) + 1));
      
      return { currentWeek, season: 2025, calculatedAt: now.toISOString() };
    }
  }

  async getWeekSchedule(week = 1, season = 2025) {
    try {
      const response = await fetch(
        `${this.baseUrl}/scoreboard?dates=${season}&seasontype=2&week=${week}`
      );
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.events?.map(event => this.mapEspnGame(event)).filter(Boolean) || [];
    } catch (error) {
      console.error(`ESPN schedule fetch failed for week ${week}:`, error);
      return [];
    }
  }

  mapEspnGame(espnEvent) {
    try {
      const competition = espnEvent.competitions?.[0];
      if (!competition) return null;

      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      
      if (!awayTeam || !homeTeam) return null;

      // Parse game time
      const startTime = new Date(espnEvent.date);
      const startEt = startTime.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Determine time slot
      const hour = startTime.getHours();
      let timeSlot = 'Sunday Early';
      if (startTime.getDay() === 4) timeSlot = 'Thursday';
      else if (startTime.getDay() === 5) timeSlot = 'Friday';
      else if (startTime.getDay() === 1) timeSlot = 'MNF';
      else if (hour >= 20) timeSlot = 'SNF';
      else if (hour >= 16) timeSlot = 'Sunday Late';

      return {
        id: espnEvent.id,
        week: parseInt(espnEvent.week?.number || 1),
        startTimeISO: espnEvent.date,
        startEt,
        timeSlot,
        status: espnEvent.status?.type?.name || 'scheduled',
        awayTeam: {
          id: awayTeam.team.id,
          name: awayTeam.team.displayName,
          abbr: awayTeam.team.abbreviation,
          logo: awayTeam.team.logo,
          record: awayTeam.records?.[0]?.summary || '0-0'
        },
        homeTeam: {
          id: homeTeam.team.id,
          name: homeTeam.team.displayName,
          abbr: homeTeam.team.abbreviation,
          logo: homeTeam.team.logo,
          record: homeTeam.records?.[0]?.summary || '0-0'
        },
        tv: competition.broadcast?.network || null,
        venue: competition.venue?.fullName || null
      };
    } catch (error) {
      console.error('Failed to map ESPN game:', error);
      return null;
    }
  }
}