const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number },
  waterIntakeMl: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  workoutCompleted: { type: Boolean, default: false },
  mealsTracked: { type: Number, default: 0 },
  streakCount: { type: Number, default: 1 },
  photos: {
    front: { type: String },
    back: { type: String },
    left: { type: String },
    right: { type: String }
  },
  aiInsight: { type: String }
});

module.exports = mongoose.model('Progress', ProgressSchema);
