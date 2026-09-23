const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'status_change', 'assignment', 'deal_update'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ lead: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

