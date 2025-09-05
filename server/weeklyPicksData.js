/**
 * Weekly Picks Data - Week 1 2025 NFL Schedule with BioBoost Scores
 */

export const WEEK_1_SCHEDULE = [
  // Thursday, Sept 4
  {
    id: 'week1-dal-phi',
    week: 1,
    date: '2025-09-04',
    time: '8:15 PM',
    timeSlot: 'thursday',
    away: {
      team: 'Dallas Cowboys',
      code: 'DAL',
      emoji: '⭐',
      bioBoost: 82
    },
    home: {
      team: 'Philadelphia Eagles', 
      code: 'PHI',
      emoji: '🦅',
      bioBoost: 88
    },
    spread: -3.5, // PHI favored
    total: 47.5,
    predicted: 'PHI',
    confidence: 'MEDIUM',
    commentary: "🦍 Eagles soaring with that BioBoost juice! Dallas looking a bit rusty after the offseason."
  },

  // Friday, Sept 5 (São Paulo, Brazil)
  {
    id: 'week1-gb-kc',
    week: 1,
    date: '2025-09-05',
    time: '8:15 PM',
    timeSlot: 'friday',
    location: 'São Paulo, Brazil',
    away: {
      team: 'Green Bay Packers',
      code: 'GB', 
      emoji: '🧀',
      bioBoost: 84
    },
    home: {
      team: 'Kansas City Chiefs',
      code: 'KC',
      emoji: '🏹', 
      bioBoost: 84
    },
    spread: -2.5, // KC favored 
    total: 48.5,
    predicted: 'KC',
    confidence: 'LOW',
    commentary: "🍌 Dead even BioBoost battle in Brazil! Chiefs get the nod for home field advantage."
  },

  // Sunday, Sept 7 - 1:00 PM ET
  {
    id: 'week1-car-tb',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM', 
    timeSlot: 'sunday_early',
    away: {
      team: 'Carolina Panthers',
      code: 'CAR',
      emoji: '🐾',
      bioBoost: 71
    },
    home: {
      team: 'Tampa Bay Buccaneers',
      code: 'TB',
      emoji: '🏴‍☠️',
      bioBoost: 79
    },
    spread: -6.5, // TB favored
    total: 44.5,
    predicted: 'TB',
    confidence: 'MEDIUM',
    commentary: "🦍 Bucs firing the cannons! Panthers still finding their roar."
  },

  {
    id: 'week1-cle-cin',
    week: 1,
    date: '2025-09-07', 
    time: '1:00 PM',
    timeSlot: 'sunday_early',
    away: {
      team: 'Cleveland Browns',
      code: 'CLE',
      emoji: '🟤',
      bioBoost: 74
    },
    home: {
      team: 'Cincinnati Bengals',
      code: 'CIN',
      emoji: '🐅',
      bioBoost: 91
    },
    spread: -8.5, // CIN favored
    total: 46.5,
    predicted: 'CIN',
    confidence: 'HIGH',
    commentary: "🍌 Bengal tigers are BANANAS ready! Browns getting mauled in the jungle."
  },

  {
    id: 'week1-buf-mia',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM',
    timeSlot: 'sunday_early', 
    away: {
      team: 'Buffalo Bills',
      code: 'BUF',
      emoji: '🦬',
      bioBoost: 87
    },
    home: {
      team: 'Miami Dolphins',
      code: 'MIA', 
      emoji: '🐬',
      bioBoost: 77
    },
    spread: -4.5, // BUF favored
    total: 49.5,
    predicted: 'BUF',
    confidence: 'MEDIUM',
    commentary: "🦍 Bills stampeding to Miami! Dolphins swimming upstream this week."
  },

  {
    id: 'week1-ind-jax',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM',
    timeSlot: 'sunday_early',
    away: {
      team: 'Indianapolis Colts',
      code: 'IND',
      emoji: '🐎',
      bioBoost: 79
    }, 
    home: {
      team: 'Jacksonville Jaguars',
      code: 'JAX',
      emoji: '🐆',
      bioBoost: 82
    },
    spread: -1.5, // JAX favored
    total: 45.5,
    predicted: 'JAX',
    confidence: 'LOW',
    commentary: "🐒 Jaguars prowling for an upset! Colts galloping into a close one."
  },

  {
    id: 'week1-hou-ne', 
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM',
    timeSlot: 'sunday_early',
    away: {
      team: 'Houston Texans',
      code: 'HOU',
      emoji: '🤠',
      bioBoost: 83
    },
    home: {
      team: 'New England Patriots', 
      code: 'NE',
      emoji: '🏈',
      bioBoost: 75
    },
    spread: -3.5, // HOU favored
    total: 43.5,
    predicted: 'HOU',
    confidence: 'MEDIUM',
    commentary: "🦍 Texans lassoing a W in Foxborough! Patriots dynasty looking dated."
  },

  {
    id: 'week1-ten-ari',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM', 
    timeSlot: 'sunday_early',
    away: {
      team: 'Tennessee Titans',
      code: 'TEN',
      emoji: '⚡',
      bioBoost: 76
    },
    home: {
      team: 'Arizona Cardinals',
      code: 'ARI',
      emoji: '🏹',
      bioBoost: 89
    },
    spread: -7.5, // ARI favored
    total: 46.5,
    predicted: 'ARI',
    confidence: 'HIGH',
    commentary: "🍌 Cardinals flying HIGH in the desert! Titans getting buried in the sand."
  },

  {
    id: 'week1-atl-pit',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM',
    timeSlot: 'sunday_early',
    away: {
      team: 'Atlanta Falcons',
      code: 'ATL',
      emoji: '🦅',
      bioBoost: 78
    },
    home: {
      team: 'Pittsburgh Steelers',
      code: 'PIT', 
      emoji: '🟡⚫',
      bioBoost: 80
    },
    spread: -2.5, // PIT favored
    total: 44.5,
    predicted: 'PIT',
    confidence: 'LOW',
    commentary: "🦍 Steel Curtain barely holding up! Falcons soaring into a nail-biter."
  },

  {
    id: 'week1-nyg-was',
    week: 1,
    date: '2025-09-07',
    time: '1:00 PM',
    timeSlot: 'sunday_early',
    away: {
      team: 'New York Giants',
      code: 'NYG',
      emoji: '🗽',
      bioBoost: 73
    },
    home: {
      team: 'Washington Commanders',
      code: 'WAS',
      emoji: '🪖',
      bioBoost: 86
    },
    spread: -6.5, // WAS favored
    total: 45.5,
    predicted: 'WAS',
    confidence: 'HIGH', 
    commentary: "🦍 Commanders marching to victory! Giants looking more like dwarfs this week."
  },

  // Sunday, Sept 7 - 4:05 PM ET
  {
    id: 'week1-sea-den',
    week: 1,
    date: '2025-09-07',
    time: '4:05 PM',
    timeSlot: 'sunday_late',
    away: {
      team: 'Seattle Seahawks',
      code: 'SEA',
      emoji: '🦅',
      bioBoost: 81
    },
    home: {
      team: 'Denver Broncos',
      code: 'DEN', 
      emoji: '🐎',
      bioBoost: 85
    },
    spread: -2.5, // DEN favored
    total: 47.5,
    predicted: 'DEN',
    confidence: 'MEDIUM',
    commentary: "🍌 Broncos galloping at altitude! Seahawks wings getting clipped in thin air."
  },

  {
    id: 'week1-lv-sf',
    week: 1,
    date: '2025-09-07',
    time: '4:05 PM',
    timeSlot: 'sunday_late', 
    away: {
      team: 'Las Vegas Raiders',
      code: 'LV',
      emoji: '🏴‍☠️',
      bioBoost: 77
    },
    home: {
      team: 'San Francisco 49ers',
      code: 'SF',
      emoji: '🟥',
      bioBoost: 83
    },
    spread: -5.5, // SF favored
    total: 48.5,
    predicted: 'SF',
    confidence: 'MEDIUM',
    commentary: "🦍 Niners gold mining for a W! Raiders treasure map leads to an L."
  },

  // Sunday, Sept 7 - 4:25 PM ET
  {
    id: 'week1-chi-gb',
    week: 1,
    date: '2025-09-07',
    time: '4:25 PM',
    timeSlot: 'sunday_late',
    away: {
      team: 'Chicago Bears',
      code: 'CHI',
      emoji: '🐻',
      bioBoost: 80
    },
    home: {
      team: 'Green Bay Packers',
      code: 'GB',
      emoji: '🧀',
      bioBoost: 84
    },
    spread: -3.5, // GB favored 
    total: 46.5,
    predicted: 'GB',
    confidence: 'MEDIUM',
    commentary: "🧀 Cheese heads melting the Bears! NFC North rivalry heating up in Lambeau."
  },

  {
    id: 'week1-det-lar',
    week: 1,
    date: '2025-09-07',
    time: '4:25 PM',
    timeSlot: 'sunday_late',
    away: {
      team: 'Detroit Lions',
      code: 'DET',
      emoji: '🦁',
      bioBoost: 86
    },
    home: {
      team: 'Los Angeles Rams',
      code: 'LAR',
      emoji: '🐏',
      bioBoost: 78
    },
    spread: -4.5, // DET favored
    total: 49.5,
    predicted: 'DET', 
    confidence: 'MEDIUM',
    commentary: "🦍 Lions roaring loud in LA! Rams getting sheered by Motor City mayhem."
  },

  // Sunday Night Football - 8:20 PM ET
  {
    id: 'week1-nyj-buf',
    week: 1,
    date: '2025-09-07', 
    time: '8:20 PM',
    timeSlot: 'snf',
    away: {
      team: 'New York Jets',
      code: 'NYJ',
      emoji: '✈️',
      bioBoost: 79
    },
    home: {
      team: 'Buffalo Bills',
      code: 'BUF',
      emoji: '🦬', 
      bioBoost: 87
    },
    spread: -6.5, // BUF favored
    total: 47.5,
    predicted: 'BUF',
    confidence: 'MEDIUM',
    commentary: "🍌 Bills stampeding under the lights! Jets flying into turbulence in primetime."
  },

  // Monday Night Football - Sept 8 - 8:15 PM ET
  {
    id: 'week1-lac-min',
    week: 1,
    date: '2025-09-08',
    time: '8:15 PM',
    timeSlot: 'mnf',
    away: {
      team: 'Los Angeles Chargers', 
      code: 'LAC',
      emoji: '⚡',
      bioBoost: 82
    },
    home: {
      team: 'Minnesota Vikings',
      code: 'MIN',
      emoji: '🟣',
      bioBoost: 76
    },
    spread: -3.5, // LAC favored
    total: 48.5,
    predicted: 'LAC',
    confidence: 'MEDIUM',
    commentary: "🦍 Chargers sparking up Monday night! Vikings sailing into stormy seas."
  }
];

export const TIME_SLOT_NAMES = {
  'thursday': 'Thursday Night Football',
  'friday': 'International Game',
  'sunday_early': 'Sunday Early Games',
  'sunday_late': 'Sunday Late Games', 
  'snf': 'Sunday Night Football',
  'mnf': 'Monday Night Football'
};

export const TIME_SLOT_ORDER = ['thursday', 'friday', 'sunday_early', 'sunday_late', 'snf', 'mnf'];

export default {
  WEEK_1_SCHEDULE,
  TIME_SLOT_NAMES,
  TIME_SLOT_ORDER
};