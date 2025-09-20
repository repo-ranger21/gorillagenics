const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  // Player and game information
  player: { type: String, required: true },
  playerId: { type: String, index: true },
  team: { type: String, maxlength: 3 },
  opponent: { type: String, maxlength: 3 },
  game: { type: String }, // e.g., "LAR_vs_DET_W1"
  
  // Market details
  market: { type: String, required: true }, // e.g., "Over 265.5 Passing Yards"
  marketType: { 
    type: String, 
    enum: ['passing_yards', 'rushing_yards', 'receiving_yards', 'touchdowns', 'receptions', 'other'],
    default: 'other'
  },
  line: { type: Number }, // The line (e.g., 265.5)
  overUnder: { type: String, enum: ['over', 'under'] },
  
  // Odds and probability
  odds: { type: Number, required: true, min: 1.01 }, // Decimal odds
  impliedProbability: { type: Number, min: 0, max: 1 }, // Bookmaker implied probability
  estimatedProbability: { type: Number, min: 0, max: 1 }, // Our estimated probability
  winProbability: { type: Number, min: 0, max: 1 }, // Final probability used for calculations
  
  // Expected value and confidence
  expectedValue: { type: Number }, // EV as decimal (e.g., 0.22 for 22%)
  confidence: { type: Number, min: 0, max: 100 }, // Confidence in the pick
  
  // Bankroll recommendations
  kellyFraction: { type: Number, min: 0, max: 1 },
  adjustedKellyFraction: { type: Number, min: 0, max: 1 },
  recommendedStake: { type: Number, min: 0 },
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Low-Medium', 'Medium', 'Medium-High', 'High']
  },
  
  // Biometric factors (linking to PlayerMetric)
  bioBoostScore: { type: Number, min: 0, max: 100 },
  sleepScore: { type: Number, min: 0, max: 100 },
  recoveryScore: { type: Number, min: 0, max: 100 },
  injuryStatus: { 
    type: String, 
    enum: ['Healthy', 'Probable', 'Questionable', 'Doubtful', 'Out']
  },
  
  // Weather and environmental factors
  weatherTags: [{ 
    type: String, 
    enum: ['high_heat', 'freezing', 'high_humidity', 'wet_conditions', 'windy', 'snow'] 
  }],
  
  // Meta information
  week: { type: Number, min: 1, max: 18 },
  season: { type: Number, default: new Date().getFullYear() },
  date: { type: Date, default: Date.now },
  gameTime: { type: Date },
  
  // Source and tracking
  source: { 
    type: String, 
    enum: ['manual', 'scraper', 'api', 'analysis'],
    default: 'manual'
  },
  bookmaker: { type: String }, // e.g., "DraftKings", "FanDuel"
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'active', 'won', 'lost', 'void', 'cancelled'],
    default: 'pending'
  },
  result: { type: Number }, // Actual result (e.g., 287 yards for passing yards)
  payout: { type: Number }, // Actual payout if won
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  index: { player: 1, date: -1 },
  index: { week: 1, season: 1 },
  index: { status: 1, gameTime: 1 }
});

// Virtual for calculating actual stake ROI
PickSchema.virtual('roi').get(function() {
  if (this.status === 'won' && this.payout && this.recommendedStake) {
    return ((this.payout - this.recommendedStake) / this.recommendedStake) * 100;
  }
  if (this.status === 'lost' && this.recommendedStake) {
    return -100;
  }
  return null;
});

// Method to update pick with result
PickSchema.methods.updateResult = function(actualResult, payout = null) {
  this.result = actualResult;
  this.updatedAt = new Date();
  
  // Determine win/loss based on market type
  let won = false;
  if (this.overUnder === 'over') {
    won = actualResult > this.line;
  } else if (this.overUnder === 'under') {
    won = actualResult < this.line;
  }
  
  this.status = won ? 'won' : 'lost';
  
  if (won && payout) {
    this.payout = payout;
  }
  
  return this.save();
};

// Static method to get picks for bankroll analysis
PickSchema.statics.getPicksForAnalysis = function(filters = {}) {
  const query = { status: 'pending', ...filters };
  return this.find(query)
    .sort({ gameTime: 1, createdAt: -1 })
    .populate('playerId', 'playerName position team');
};

// Static method to get performance analytics
PickSchema.statics.getPerformanceStats = function(filters = {}) {
  return this.aggregate([
    { $match: { status: { $in: ['won', 'lost'] }, ...filters } },
    {
      $group: {
        _id: null,
        totalPicks: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
        totalStaked: { $sum: '$recommendedStake' },
        totalPayout: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$payout', 0] } },
        avgEV: { $avg: '$expectedValue' },
        avgKelly: { $avg: '$kellyFraction' }
      }
    },
    {
      $project: {
        totalPicks: 1,
        wins: 1,
        losses: { $subtract: ['$totalPicks', '$wins'] },
        winRate: { $divide: ['$wins', '$totalPicks'] },
        totalStaked: 1,
        totalPayout: 1,
        netProfit: { $subtract: ['$totalPayout', '$totalStaked'] },
        roi: { 
          $cond: [
            { $gt: ['$totalStaked', 0] },
            { $divide: [{ $subtract: ['$totalPayout', '$totalStaked'] }, '$totalStaked'] },
            0
          ]
        },
        avgEV: 1,
        avgKelly: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Pick', PickSchema);