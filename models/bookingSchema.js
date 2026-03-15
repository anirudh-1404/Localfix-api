import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 60,
  },
  address: {
    type: String,
    required: true,
  },
  city: String,
  area: String,
  pincode: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'wallet'],
    default: 'cash',
  },
  customerNotes: {
    type: String,
    maxlength: 500,
  },
  providerRemarks: String,
  adminRemarks: String,
  cancelledBy: {
    type: String,
    enum: ['customer', 'provider', 'admin', null],
  },
  cancellationReason: String,
}, {
  timestamps: true,
});
bookingSchema.index({ provider: 1, scheduledDate: 1, startTime: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);