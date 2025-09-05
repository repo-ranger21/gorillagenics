// GuerillaGenics Week 1 NFL 2025-26 Season Data
// Spreads and totals from BetMGM as of Aug 28 2025

const week1Games = [
  // Thursday, Sept 4
  {
    id: "week1-dal-phi",
    date: "2025-09-04",
    time: "20:15", // 8:15 PM ET
    timeSlot: "Thursday",
    awayTeam: {
      name: "Dallas Cowboys",
      abbreviation: "DAL",
      spread: "+7",
      spreadValue: 7
    },
    homeTeam: {
      name: "Philadelphia Eagles", 
      abbreviation: "PHI",
      spread: "-7",
      spreadValue: -7
    },
    overUnder: 46.5,
    moneyline: {
      away: "+280",
      home: "-350"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Friday, Sept 5 (São Paulo, Brazil)
  {
    id: "week1-kc-lac",
    date: "2025-09-05",
    time: "21:15", // 9:15 PM ET
    timeSlot: "Friday",
    awayTeam: {
      name: "Kansas City Chiefs",
      abbreviation: "KC", 
      spread: "-3",
      spreadValue: -3
    },
    homeTeam: {
      name: "Los Angeles Chargers",
      abbreviation: "LAC",
      spread: "+3", 
      spreadValue: 3
    },
    overUnder: 44.5,
    location: "São Paulo, Brazil",
    moneyline: {
      away: "-160",
      home: "+135"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Sunday, Sept 7 — 1:00 PM ET
  {
    id: "week1-tb-atl",
    date: "2025-09-07",
    time: "13:00", // 1:00 PM ET
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Tampa Bay Buccaneers",
      abbreviation: "TB",
      spread: "-1.5",
      spreadValue: -1.5
    },
    homeTeam: {
      name: "Atlanta Falcons",
      abbreviation: "ATL", 
      spread: "+1.5",
      spreadValue: 1.5
    },
    overUnder: 48.5,
    moneyline: {
      away: "-125",
      home: "+105"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-cin-cle",
    date: "2025-09-07",
    time: "13:00",
    timeSlot: "Sunday Early", 
    awayTeam: {
      name: "Cincinnati Bengals",
      abbreviation: "CIN",
      spread: "-6",
      spreadValue: -6
    },
    homeTeam: {
      name: "Cleveland Browns",
      abbreviation: "CLE",
      spread: "+6",
      spreadValue: 6
    },
    overUnder: 48.0,
    moneyline: {
      away: "-275",
      home: "+220"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-mia-ind",
    date: "2025-09-07", 
    time: "13:00",
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Miami Dolphins",
      abbreviation: "MIA",
      spread: "+1.5",
      spreadValue: 1.5
    },
    homeTeam: {
      name: "Indianapolis Colts",
      abbreviation: "IND",
      spread: "-1.5", 
      spreadValue: -1.5
    },
    overUnder: 45.5,
    moneyline: {
      away: "+105",
      home: "-125"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-car-jax",
    date: "2025-09-07",
    time: "13:00",
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Carolina Panthers",
      abbreviation: "CAR",
      spread: "+3",
      spreadValue: 3
    },
    homeTeam: {
      name: "Jacksonville Jaguars",
      abbreviation: "JAX", 
      spread: "-3",
      spreadValue: -3
    },
    overUnder: 45.5,
    moneyline: {
      away: "+140",
      home: "-170"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-lv-ne",
    date: "2025-09-07",
    time: "13:00",
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Las Vegas Raiders",
      abbreviation: "LV",
      spread: "+3",
      spreadValue: 3
    },
    homeTeam: {
      name: "New England Patriots",
      abbreviation: "NE",
      spread: "-3",
      spreadValue: -3
    },
    overUnder: 41.5,
    moneyline: {
      away: "+140",
      home: "-170"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-ari-no",
    date: "2025-09-07",
    time: "13:00", 
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Arizona Cardinals",
      abbreviation: "ARI",
      spread: "-6",
      spreadValue: -6
    },
    homeTeam: {
      name: "New Orleans Saints",
      abbreviation: "NO",
      spread: "+6",
      spreadValue: 6
    },
    overUnder: 42.5,
    moneyline: {
      away: "-275",
      home: "+220"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-pit-nyj",
    date: "2025-09-07",
    time: "13:00",
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "Pittsburgh Steelers", 
      abbreviation: "PIT",
      spread: "-3",
      spreadValue: -3
    },
    homeTeam: {
      name: "New York Jets",
      abbreviation: "NYJ",
      spread: "+3",
      spreadValue: 3
    },
    overUnder: 38.5,
    moneyline: {
      away: "-160",
      home: "+135"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-nyg-was",
    date: "2025-09-07",
    time: "13:00",
    timeSlot: "Sunday Early",
    awayTeam: {
      name: "New York Giants",
      abbreviation: "NYG",
      spread: "+6",
      spreadValue: 6
    },
    homeTeam: {
      name: "Washington Commanders",
      abbreviation: "WAS", 
      spread: "-6",
      spreadValue: -6
    },
    overUnder: 45.5,
    moneyline: {
      away: "+220",
      home: "-275"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Sunday, Sept 7 — 4:05 PM ET
  {
    id: "week1-ten-den",
    date: "2025-09-07",
    time: "16:05", // 4:05 PM ET
    timeSlot: "Sunday Late",
    awayTeam: {
      name: "Tennessee Titans",
      abbreviation: "TEN",
      spread: "+7.5",
      spreadValue: 7.5
    },
    homeTeam: {
      name: "Denver Broncos",
      abbreviation: "DEN",
      spread: "-7.5",
      spreadValue: -7.5
    },
    overUnder: 42.5,
    moneyline: {
      away: "+300",
      home: "-380"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-sf-sea",
    date: "2025-09-07",
    time: "16:05",
    timeSlot: "Sunday Late",
    awayTeam: {
      name: "San Francisco 49ers",
      abbreviation: "SF",
      spread: "-2.5",
      spreadValue: -2.5
    },
    homeTeam: {
      name: "Seattle Seahawks", 
      abbreviation: "SEA",
      spread: "+2.5",
      spreadValue: 2.5
    },
    overUnder: 44.5,
    moneyline: {
      away: "-140",
      home: "+115"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Sunday, Sept 7 — 4:25 PM ET
  {
    id: "week1-det-gb",
    date: "2025-09-07",
    time: "16:25", // 4:25 PM ET
    timeSlot: "Sunday Late",
    awayTeam: {
      name: "Detroit Lions",
      abbreviation: "DET",
      spread: "+1.5",
      spreadValue: 1.5
    },
    homeTeam: {
      name: "Green Bay Packers",
      abbreviation: "GB",
      spread: "-1.5",
      spreadValue: -1.5
    },
    overUnder: 47.5,
    moneyline: {
      away: "+105",
      home: "-125"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  {
    id: "week1-hou-lar",
    date: "2025-09-07",
    time: "16:25",
    timeSlot: "Sunday Late",
    awayTeam: {
      name: "Houston Texans",
      abbreviation: "HOU",
      spread: "+2.5",
      spreadValue: 2.5
    },
    homeTeam: {
      name: "Los Angeles Rams",
      abbreviation: "LAR",
      spread: "-2.5", 
      spreadValue: -2.5
    },
    overUnder: 44.5,
    moneyline: {
      away: "+115",
      home: "-140"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Sunday Night Football — 8:20 PM ET
  {
    id: "week1-bal-buf",
    date: "2025-09-07",
    time: "20:20", // 8:20 PM ET
    timeSlot: "SNF",
    awayTeam: {
      name: "Baltimore Ravens",
      abbreviation: "BAL",
      spread: "+1.5",
      spreadValue: 1.5
    },
    homeTeam: {
      name: "Buffalo Bills",
      abbreviation: "BUF",
      spread: "-1.5",
      spreadValue: -1.5
    },
    overUnder: 52.5,
    moneyline: {
      away: "+105",
      home: "-125"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  },

  // Monday Night Football — Sept 8 — 8:15 PM ET
  {
    id: "week1-min-chi",
    date: "2025-09-08",
    time: "20:15", // 8:15 PM ET
    timeSlot: "MNF",
    awayTeam: {
      name: "Minnesota Vikings",
      abbreviation: "MIN",
      spread: "-1.5",
      spreadValue: -1.5
    },
    homeTeam: {
      name: "Chicago Bears",
      abbreviation: "CHI",
      spread: "+1.5",
      spreadValue: 1.5
    },
    overUnder: 43.5,
    moneyline: {
      away: "-125",
      home: "+105"
    },
    bioBoost: {
      score: null,
      recommendation: null,
      confidence: null
    }
  }
];

const timeSlots = [
  "All",
  "Thursday", 
  "Friday",
  "Sunday Early",
  "Sunday Late",
  "SNF",
  "MNF"
];

export {
  week1Games,
  timeSlots
};