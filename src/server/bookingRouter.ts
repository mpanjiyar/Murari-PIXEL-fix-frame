import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface BookingAppointment {
  ticketId: string;
  serviceType: 'pixelfix' | 'pixelframe';
  serviceTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM"
  timezone: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  configuration: Record<string, any>;
  estimatedPrice: number;
  status: 'confirmed' | 'dispatched' | 'completed' | 'cancelled';
  createdAt: string;
  nextSteps: string[];
}

const DATA_DIR = path.join(process.cwd(), 'vault_data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'admin_notifications.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (_) {}
}

// Available Standard Booking Slots for Doorstep Support & Shoots
export const STANDARD_DAILY_SLOTS = [
  { time: '09:30 AM', label: 'Morning Slot', period: 'morning', capacity: 1 },
  { time: '11:00 AM', label: 'Late Morning Slot', period: 'morning', capacity: 1 },
  { time: '01:30 PM', label: 'Early Afternoon Slot', period: 'afternoon', capacity: 1 },
  { time: '03:00 PM', label: 'Mid Afternoon Slot', period: 'afternoon', capacity: 1 },
  { time: '04:30 PM', label: 'Late Afternoon Slot', period: 'afternoon', capacity: 1 },
  { time: '06:00 PM', label: 'Evening Priority Slot', period: 'evening', capacity: 1 },
  { time: '07:30 PM', label: 'Night Consultation Slot', period: 'evening', capacity: 1 },
];

function readBookings(): BookingAppointment[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error('Error reading bookings file:', err);
  }
  return [];
}

function writeBookings(bookings: BookingAppointment[]): boolean {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing bookings file:', err);
    return false;
  }
}

function logBookingNotification(booking: BookingAppointment) {
  try {
    let notifications: any[] = [];
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      try {
        notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')) || [];
      } catch (_) {}
    }

    const nowIso = new Date().toISOString();
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: nowIso,
      timestamp: nowIso,
      type: 'BOOKING_RECEIVED',
      severity: 'INFO',
      title: `New Appointment: ${booking.customerName}`,
      message: `${booking.serviceTitle} on ${booking.date} at ${booking.time}. Contact: ${booking.customerPhone}`,
      relatedOrderId: booking.ticketId,
      referenceId: booking.ticketId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      read: false,
      readAt: null,
      resolvedAt: null,
    };

    notifications.unshift(notif);
    // Keep last 150 notifications
    if (notifications.length > 150) {
      notifications = notifications.slice(0, 150);
    }
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Unable to log notification for booking:', err);
  }
}

export const bookingRouter = Router();

// GET /api/booking/slots?date=YYYY-MM-DD
bookingRouter.get('/slots', (req: Request, res: Response) => {
  try {
    const dateQuery = (req.query.date as string) || '';
    if (!dateQuery || !/^\d{4}-\d{2}-\d{2}$/.test(dateQuery)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid date parameter in YYYY-MM-DD format.',
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const isPastDate = dateQuery < todayDate;

    const allBookings = readBookings();
    const activeDateBookings = allBookings.filter(
      b => b.date === dateQuery && b.status !== 'cancelled'
    );

    // Compute slot availability
    const slots = STANDARD_DAILY_SLOTS.map(slot => {
      const bookedOnThisSlot = activeDateBookings.filter(b => b.time === slot.time);
      const isBooked = bookedOnThisSlot.length >= slot.capacity;
      const isAvailable = !isPastDate && !isBooked;

      return {
        time: slot.time,
        label: slot.label,
        period: slot.period,
        isAvailable,
        isBooked,
        capacity: slot.capacity,
        bookedCount: bookedOnThisSlot.length,
      };
    });

    const hasAnyAvailable = slots.some(s => s.isAvailable);

    return res.json({
      success: true,
      date: dateQuery,
      timezone: 'Asia/Kolkata (IST)',
      isPastDate,
      hasAvailableSlots: hasAnyAvailable,
      slots,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve booking slots.',
    });
  }
});

// POST /api/booking/reserve
bookingRouter.post('/reserve', (req: Request, res: Response) => {
  try {
    const {
      serviceType,
      date,
      time,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      configuration,
      estimatedPrice,
    } = req.body || {};

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({ success: false, error: 'WhatsApp / Phone number is required.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Valid appointment date (YYYY-MM-DD) is required.' });
    }
    if (!time || !time.trim()) {
      return res.status(400).json({ success: false, error: 'An appointment time slot must be selected.' });
    }
    if (!customerAddress || !customerAddress.trim()) {
      return res.status(400).json({ success: false, error: 'Guwahati doorstep area / landmark address is required.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    if (date < todayDate) {
      return res.status(400).json({ success: false, error: 'Cannot book appointment for a past date.' });
    }

    const allBookings = readBookings();

    // Check for double-booking concurrency
    const isConflict = allBookings.some(
      b => b.date === date && b.time.toLowerCase() === time.toLowerCase() && b.status !== 'cancelled'
    );

    if (isConflict) {
      return res.status(409).json({
        success: false,
        error: `Slot "${time}" on ${date} was just booked by another client. Please select another slot.`,
        slotConflict: true,
      });
    }

    const sType = serviceType === 'pixelframe' ? 'pixelframe' : 'pixelfix';
    const sTitle =
      sType === 'pixelframe'
        ? 'Pixel Frame Professional Photography'
        : 'Pixel Fix Doorstep Computer Support';

    const ticketId = `MP-${sType === 'pixelfix' ? 'FIX' : 'PHOTO'}-${Date.now().toString().slice(-5)}`;

    const nextSteps =
      sType === 'pixelfix'
        ? [
            'Our certified technician will call you 30 minutes prior to doorstep arrival.',
            'Please have power adapter and PC cables accessible.',
            'Zero diagnostic charges if issue is unresolvable.',
          ]
        : [
            'Murari will call to discuss event sequence and venue lighting.',
            'High-resolution raw capture and 4K aerial logistics will be prepared.',
            'A booking confirmation summary has been registered in the schedule.',
          ];

    const newBooking: BookingAppointment = {
      ticketId,
      serviceType: sType,
      serviceTitle: sTitle,
      date,
      time,
      timezone: 'Asia/Kolkata (IST)',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerNotes: customerNotes ? customerNotes.trim() : undefined,
      configuration: configuration || {},
      estimatedPrice: Number(estimatedPrice) || (sType === 'pixelfix' ? 499 : 5999),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      nextSteps,
    };

    allBookings.unshift(newBooking);
    writeBookings(allBookings);
    logBookingNotification(newBooking);

    return res.status(201).json({
      success: true,
      booking: newBooking,
      message: `Appointment successfully confirmed with reference ${ticketId}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error while reserving appointment.',
    });
  }
});

// GET /api/booking/all
bookingRouter.get('/all', (req: Request, res: Response) => {
  try {
    const bookings = readBookings();
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
