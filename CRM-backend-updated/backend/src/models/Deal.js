const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    stage: {
      type: String,
      enum: ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'discovery',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expectedCloseDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ lead: 1 });

module.exports = mongoose.model('Deal', dealSchema);

