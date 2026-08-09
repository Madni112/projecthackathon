const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 'Classic', 'Standard', 'Premium'
  originalPrice: { type: Number, required: true }, // 5, 10, 50
  currentPrice: { type: String, default: 'FREE' },
  isFree: { type: Boolean, default: true },
  advancements: [{ type: String }],
  badge: { type: String },
  popular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
