const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "employee", enum: ["employee", "admin", "user"] },
  status: { type: String, default: "active", enum: ["active", "banned", "inactive"] },
  fitnessScore: { type: Number, default: 78 },
  streakCount: { type: Number, default: 5 },
  lastLogin: { type: Date, default: Date.now },
  postureScore: { type: Number, default: 85 },
  estimatedBMI: { type: Number, default: 22.4 },
  bodyLandmarks: {
    headTilt: { type: Number, default: 2.1 },
    shoulderAlignment: { type: Number, default: 98.4 },
    spineCurvature: { type: Number, default: 94.2 }
  },
  uploadedPhotos: {
    front: { type: String },
    back: { type: String },
    left: { type: String },
    right: { type: String }
  },
  hasCompletedOnboarding: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);