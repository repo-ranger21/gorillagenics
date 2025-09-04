const mongoose = require('mongoose');

const PlayerMetricSchema = new mongoose.Schema({
  playerName: { type: String, required: true, index: true },
  playerId: { type: String, index: true },
  position: { type: String, enum: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'LB', 'DB', 'DL'] },
  team: { type: String, maxlength: 3 },
  date: { type: Date, required: true, index: true },
  week: { type: Number, min: 1, max: 18 },
  season: { type: Number, default: new Date().getFullYear() },
  sleepScore: { type: Number, min: 0, max: 100 },
  recoveryScore: { type: Number, min: 0, max: 100 },
  hydrationLevel: { type: Number, min: 0, max: 100 },
  testosteroneProxy: { type: Number, min: 0, max: 100 },
  cortisolProxy: { type: String, enum: ['Low', 'Normal', 'High'] },
  hrvScore: { type: Number, min: 0, max: 100 },
  injuryRecoveryDays: { type: Number, min: 0, default: 0 },
  injuryType: { type: String },
  injuryStatus: { type: String, enum: ['Healthy', 'Probable', 'Questionable', 'Doubtful', 'Out'] },
  performanceScore: { type: Number, min: 0, max: 100 },
  bioBoostScore: { type: Number, min: 0, max: 100 },
  bioBoostComponents: { type: mongoose.Schema.Types.Mixed },
  confidence: { type: Number, min: 0, max: 100 },
  weatherTags: [{ type: String, enum: ['high_heat', 'freezing', 'high_humidity', 'wet_conditions', 'windy', 'snow'] }],
  hydrationAlert: { type: Boolean, default: false },
  sources: [{
    type: { type: String, enum: ['nflfastR', 'NFL.com', 'Instagram', 'Twitter', 'WHOOP', 'Oura', 'Manual'] },
    url: String, scrapedAt: Date,
    confidence: { type: Number, min: 0, max: 100, default: 75 }
  }],
  commentary: { type: String, maxlength: 200 },
  mascotReaction: { type: String, enum: ['Flex', 'Chest-Thump', 'Banana-Toss', 'Chip-Toss', 'Victory-Dance', 'Alert', 'Caution'] },
  juiceWatchAlerts: [{
    type: { type: String, enum: ['spike', 'dip', 'milestone', 'weather', 'injury'] },
    message: String,
    triggeredAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PlayerMetricSchema.index({ playerName: 1, date: -1 });
PlayerMetricSchema.index({ bioBoostScore: -1 });
PlayerMetricSchema.index({ week: 1, season: 1 });
PlayerMetricSchema.index({ 'sources.type': 1 });

PlayerMetricSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.date >= oneDayAgo;
});

PlayerMetricSchema.statics.findLatestForPlayer = function(playerName) {
  return this.findOne({ playerName }).sort({ date: -1 }).exec();
};

PlayerMetricSchema.statics.getBioBoostLeaderboard = function(limit = 10) {
  return this.aggregate([
    { $match: { bioBoostScore: { $exists: true }, date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: {
      _id: '$playerName',
      latestScore: { $max: '$bioBoostScore' },
      latestDate: { $max: '$date' },
      avgScore: { $avg: '$bioBoostScore' },
      position: { $first: '$position' },
      team: { $first: '$team' },
      commentary: { $first: '$commentary' }
    }},
    { $sort: { latestScore: -1 }},
    { $limit: limit }
  ]);
};

PlayerMetricSchema.methods.checkJuiceWatchThreshold = function() {
  const threshold = 15;
  const oneDayAgo = new Date(this.date.getTime() - 24 * 60 * 60 * 1000);
  return this.constructor.findOne({
    playerName: this.playerName,
    date: { $gte: oneDayAgo, $lt: this.date }
  }).then(previousMetric => {
    if (previousMetric && this.bioBoostScore - previousMetric.bioBoostScore > threshold) {
      this.juiceWatchAlerts.push({
        type: 'spike',
        message: `🚨 JUICE WATCH: ${this.playerName} BioBoost spiked +${this.bioBoostScore - previousMetric.bioBoostScore} points!`,
        triggeredAt: new Date()
      });
      return true;
    }
    return false;
  });
};

PlayerMetricSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PlayerMetric', PlayerMetricSchema);