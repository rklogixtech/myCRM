const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['call', 'email', 'meeting', 'task'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

followupSchema.index({ lead: 1 });
followupSchema.index({ assignedTo: 1 });
followupSchema.index({ dueDate: 1 });
followupSchema.index({ completed: 1 });

module.exports = mongoose.model('Followup', followupSchema);

