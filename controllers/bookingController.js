import { Booking } from '../models/bookingSchema.js';
import { Provider } from '../models/providerSchema.js';
import { Service, Problem } from '../models/serviceSchema.js';
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      providerId,
      problemIds, // Now expecting an array of Problem IDs
      scheduledDate,
      startTime,
      address,
      city,
      area,
      pincode,
      contactName,
      contactNumber,
      customerNotes,
      paymentMethod = 'cash',
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    if (!problemIds || !Array.isArray(problemIds) || problemIds.length === 0 || !scheduledDate || !startTime || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields (problemIds array, date, time, address)' });
    }

    // 1. Fetch all Problems
    const problems = await Problem.find({ _id: { $in: problemIds } }).populate('service');
    if (problems.length !== problemIds.length) {
      return res.status(404).json({ success: false, message: 'One or more problem/service items not found' });
    }

    // Ensure all problems belong to the same service category (optional but recommended)
    const serviceIds = [...new Set(problems.map(p => p.service._id.toString()))];
    if (serviceIds.length > 1) {
      return res.status(400).json({ success: false, message: 'All items must belong to the same service category' });
    }

    const actualServiceId = problems[0].service._id;
    const totalPrice = problems.reduce((sum, p) => sum + p.price, 0);

    // 2. Handle Provider Assignment
    let finalProviderId = providerId;
    
    // If no providerId provided, find an approved one for this service category
    if (!finalProviderId) {
      const fallbackProvider = await Provider.findOne({ 
        primaryService: actualServiceId, 
        status: 'approved' 
      });
      
      if (!fallbackProvider) {
        return res.status(400).json({ 
          success: false, 
          message: 'No approved providers available for this service category yet.' 
        });
      }
      finalProviderId = fallbackProvider._id;
    } else {
      // If providerId was provided, verify it
      const provider = await Provider.findById(finalProviderId);
      if (!provider || provider.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Selected provider is not available or approved' });
      }
    }

    const booking = await Booking.create({
      customer: customerId,
      provider: finalProviderId,
      service: actualServiceId,
      problemItems: problemIds,
      scheduledDate: new Date(scheduledDate),
      startTime,
      address,
      city,
      area,
      pincode,
      contactName: contactName || req.user.name,
      contactNumber: contactNumber || '',
      customerNotes,
      paymentMethod,
      totalPrice,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    });


    res.status(201).json({
      success: true,
      message: 'Booking created successfully (pending confirmation)',
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('provider', 'businessName ownerName phone')
      .populate('service', 'name basePrice')
      .populate('problemItems', 'title price description')
      .sort({ scheduledDate: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('provider', 'businessName ownerName phone')
      .populate('service', 'name basePrice')
      .populate('problemItems', 'title price description')
      .sort({ createdAt: -1 });
 
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
 
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
 
    // Guard: Only customer can cancel their own booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
 
    // Guard: Can only cancel if still pending (before provider accepts)
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel a booking that is already ${booking.status}` 
      });
    }
 
    booking.status = 'cancelled';
    booking.cancelledBy = 'customer';
    await booking.save();
 
    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};