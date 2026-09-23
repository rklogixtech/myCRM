const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String, trim: true },
    source: { type: String, enum: ['website', 'referral', 'social', 'email', 'call', 'other'], default: 'other' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String },
    dealValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);

