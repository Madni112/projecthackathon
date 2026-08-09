const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance'], default: 'Muscle Building' },
  planType: { type: String, enum: ['Home', 'Gym'], default: 'Gym' },
  allergies: [{ type: String }],
  dietPlan: {
    dailyCalories: { type: Number, default: 2200 },
    macros: {
      protein: { type: Number, default: 160 },
      carbs: { type: Number, default: 220 },
      fats: { type: Number, default: 60 }
    },
    meals: [{
      name: { type: String },
      items: [{ type: String }],
      calories: { type: Number },
      time: { type: String }
    }]
  },
  workoutPlan: {
    weeklySplit: [{
      day: { type: String },
      title: { type: String },
      exercises: [{
        name: { type: String },
        sets: { type: Number },
        reps: { type: String },
        notes: { type: String }
      }]
    }]
  },
  isOverridden: { type: Boolean, default: false },
  overriddenBy: { type: String },
  adminNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', PlanSchema);
