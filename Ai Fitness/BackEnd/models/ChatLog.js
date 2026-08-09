const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userQuery: { type: String, required: true },
  aiResponse: { type: String, required: true },
  isHarmful: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  tokensUsed: { type: Number, default: 45 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
