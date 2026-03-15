import { Booking } from '../models/bookingSchema.js';
import { Provider } from '../models/providerSchema.js';
import { Service } from '../models/serviceSchema.js';
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      providerId,
      serviceId,
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
    } = req.body;
    if (!providerId || !serviceId || !scheduledDate || !startTime || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Fetch service & provider 
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const provider = await Provider.findById(providerId);
    if (!provider || provider.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Provider not available' });
    }

    // Very simple price (later improve with provider pricing, distance, etc.)
    const totalPrice = service.basePrice || 500;

    const booking = await Booking.create({
      customer: customerId,
      provider: providerId,
      service: serviceId,
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
      .sort({ scheduledDate: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};