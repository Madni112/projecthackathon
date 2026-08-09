const mongoose = require('mongoose');

const CustomPlanTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  goal: { type: String, required: true },
  description: { type: String },
  dailyCalories: { type: Number, default: 2200 },
  protein: { type: Number, default: 160 },
  carbs: { type: Number, default: 220 },
  fats: { type: Number, default: 65 },
  diagnosisMatch: { type: String, default: 'None / Healthy' },
  allergiesExcluded: [{ type: String }],
  workoutSplitType: { type: String, default: 'Gym (Full Equipment Split)' },
  meals: [{
    name: { type: String },
    items: [{ type: String }],
    calories: { type: Number },
    time: { type: String }
  }],
  createdBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomPlanTemplate', CustomPlanTemplateSchema);
