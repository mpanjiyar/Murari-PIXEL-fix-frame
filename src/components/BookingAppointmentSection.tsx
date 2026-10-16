import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Laptop,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Check,
  Copy,
  Map as MapIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';
import WhatsAppIcon from './WhatsAppIcon';
import CoverageMap, { LOCALITY_DATA } from './CoverageMap';

interface BookingAppointmentSectionProps {
  currentTheme?: 'light' | 'normal' | 'mono' | string;
  triggerToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  contactPhoneIt?: string;
  contactPhonePhotos?: string;
}

interface SlotInfo {
  time: string;
  label: string;
  period: string;
  isAvailable: boolean;
  isBooked: boolean;
}

interface ConfirmedBookingData {
  ticketId: string;
  serviceTitle: string;
  serviceType: string;
  date: string;
  time: string;
  timezone: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  estimatedPrice: number;
  nextSteps: string[];
}

export const BookingAppointmentSection: React.FC<BookingAppointmentSectionProps> = ({
  currentTheme = 'dark',
  triggerToast = () => {},
  contactPhoneIt = '8638875231',
  contactPhonePhotos = '9864361940',
}) => {
  const isLight = currentTheme === 'light';

  // 1. Service Selection State
  const [serviceType, setServiceType] = useState<'pixelfix' | 'pixelframe'>('pixelfix');
  
  // IT Fix Configuration
  const [itDeviceCount, setItDeviceCount] = useState<number>(1);
  const [itNeedOS, setItNeedOS] = useState<boolean>(true);
  const [itNeedOffice, setItNeedOffice] = useState<boolean>(false);
  const [itSsdUpgrade, setItSsdUpgrade] = useState<boolean>(false);
  const [itServiceSpeed, setItServiceSpeed] = useState<'standard' | 'express'>('standard');

  // Photography Configuration
  const [photoType, setPhotoType] = useState<'wedding' | 'corporate' | 'party' | 'custom'>('wedding');
  const [photoNeedPreWedding, setPhotoNeedPreWedding] = useState<boolean>(false);
  const [photoNeedDrone, setPhotoNeedDrone] = useState<boolean>(false);
  const [photoNeedAlbum, setPhotoNeedAlbum] = useState<boolean>(true);

  // 2. Date Selection State (Default tomorrow in YYYY-MM-DD format)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const initialDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);

  // 3. Time Slots State
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // 4. Customer Information State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Inline Map Expansion State within Booking Flow
  const [showInlineMap, setShowInlineMap] = useState<boolean>(false);

  // 5. Submission & Success State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingData | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);

  // Area Coverage Match Helper for instant feedback
  const matchedLocality = useMemo(() => {
    const q = customerAddress.trim().toLowerCase();
    if (!q) return null;
    const foundKey = Object.keys(LOCALITY_DATA).find(
      key => key === q || q.includes(key) || key.includes(q)
    );
    return foundKey ? LOCALITY_DATA[foundKey] : null;
  }, [customerAddress]);

  // Price Calculation Engine
  const estimatedPrice = useMemo(() => {
    if (serviceType === 'pixelfix') {
      let base = 499; // Standard doorstep diagnostic & OS labor
      base += (itDeviceCount - 1) * 299;
      if (itNeedOS) base += 250;
      if (itNeedOffice) base += 199;
      if (itSsdUpgrade) base += 350;
      if (itServiceSpeed === 'express') base += 250;
      return base;
    } else {
      let base = 4999;
      if (photoType === 'wedding') base = 11999;
      if (photoType === 'corporate') base = 7999;
      if (photoType === 'party') base = 5999;
      if (photoNeedPreWedding) base += 4500;
      if (photoNeedDrone) base += 3500;
      if (photoNeedAlbum) base += 2500;
      return base;
    }
  }, [
    serviceType,
    itDeviceCount,
    itNeedOS,
    itNeedOffice,
    itSsdUpgrade,
    itServiceSpeed,
    photoType,
    photoNeedPreWedding,
    photoNeedDrone,
    photoNeedAlbum,
  ]);

  // Fetch real-time available slots for selected date
  const fetchAvailableSlots = async (targetDate: string) => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const res = await fetch(`/api/booking/slots?date=${encodeURIComponent(targetDate)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.slots)) {
        setSlots(data.slots);
        const currentSelectedIsAvailable = data.slots.some(
          (s: SlotInfo) => s.time === selectedSlot && s.isAvailable
        );
        if (!currentSelectedIsAvailable) {
          const firstAvail = data.slots.find((s: SlotInfo) => s.isAvailable);
          if (firstAvail) {
            setSelectedSlot(firstAvail.time);
          } else {
            setSelectedSlot('');
          }
        }
      } else {
        setSlotsError(data.error || 'Failed to load time slots.');
      }
    } catch (err: any) {
      setSlotsError('Network error checking availability. Defaulting to priority slots.');
      setSlots([
        { time: '09:30 AM', label: 'Morning Slot', period: 'morning', isAvailable: true, isBooked: false },
        { time: '11:00 AM', label: 'Late Morning', period: 'morning', isAvailable: true, isBooked: false },
        { time: '01:30 PM', label: 'Early Afternoon', period: 'afternoon', isAvailable: true, isBooked: false },
        { time: '03:00 PM', label: 'Mid Afternoon', period: 'afternoon', isAvailable: true, isBooked: false },
        { time: '04:30 PM', label: 'Late Afternoon', period: 'afternoon', isAvailable: true, isBooked: false },
        { time: '06:00 PM', label: 'Evening Priority', period: 'evening', isAvailable: true, isBooked: false },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  // Quick 7-day picker helper (Cleanly handles mobile swiping)
  const nextDays = useMemo(() => {
    const days: { dateStr: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ dateStr, dayName, dayNum, monthName });
    }
    return days;
  }, []);

  // Form Submission
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!customerName.trim()) {
      setSubmissionError('Please enter your full name.');
      triggerToast('Please enter your full name.', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setSubmissionError('Please enter a valid WhatsApp or contact phone number.');
      triggerToast('Please enter a valid phone number.', 'error');
      return;
    }
    if (!selectedSlot) {
      setSubmissionError('Please select an available time slot.');
      triggerToast('Please select an available time slot.', 'error');
      return;
    }
    if (!customerAddress.trim()) {
      setSubmissionError('Please enter your Guwahati doorstep area / landmark.');
      triggerToast('Please enter your doorstep area.', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      serviceType,
      date: selectedDate,
      time: selectedSlot,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerNotes: customerNotes.trim() || undefined,
      estimatedPrice,
      configuration:
        serviceType === 'pixelfix'
          ? {
              devices: itDeviceCount,
              osSetup: itNeedOS,
              officeSetup: itNeedOffice,
              ssdUpgrade: itSsdUpgrade,
              speed: itServiceSpeed,
            }
          : {
              eventCategory: photoType,
              preWedding: photoNeedPreWedding,
              droneAerial: photoNeedDrone,
              album: photoNeedAlbum,
            },
    };

    try {
      const response = await fetch('/api/booking/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success && result.booking) {
        setConfirmedBooking(result.booking);
        triggerToast(`Booking confirmed! Ticket: ${result.booking.ticketId}`, 'success');
        const el = document.getElementById('booking-portal-header');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        if (result.slotConflict) {
          setSubmissionError(result.error);
          triggerToast('Slot just booked by someone else! Please pick another time.', 'error');
          fetchAvailableSlots(selectedDate);
        } else {
          setSubmissionError(result.error || 'Failed to submit booking. Please try again.');
          triggerToast(result.error || 'Submission error.', 'error');
        }
      }
    } catch (err: any) {
      setSubmissionError('Network error while booking. You can also send directly via WhatsApp!');
      triggerToast('Network error while booking.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Direct Send
  const handleSendViaWhatsApp = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      triggerToast('Please enter your name and phone number first!', 'error');
      return;
    }

    const serviceTitle =
      serviceType === 'pixelfix'
        ? 'Pixel Fix Doorstep Computer Support'
        : 'Pixel Frame Photography';

    const targetPhone = serviceType === 'pixelfix' ? contactPhoneIt : contactPhonePhotos;

    const message =
      `*APPOINTMENT BOOKING REQUEST*\n` +
      `--------------------------------\n` +
      `👤 *Name:* ${customerName.trim()}\n` +
      `📞 *Phone:* ${customerPhone.trim()}\n` +
      `🛠️ *Service:* ${serviceTitle}\n` +
      `🗓️ *Date:* ${selectedDate}\n` +
      `⏱️ *Time Slot:* ${selectedSlot || 'Flexible'}\n` +
      `📍 *Location:* ${customerAddress.trim() || 'Guwahati area'}\n` +
      `💰 *Estimated Estimate:* ₹${estimatedPrice}\n` +
      `📝 *Notes:* ${customerNotes.trim() || 'None'}\n` +
      `--------------------------------\n` +
      `_Sent from Pixel Fix & Frame Official Booking Portal_`;

    const cleanPhone = targetPhone.replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    triggerToast('Opening WhatsApp with your appointment details...', 'info');
  };

  const handleCopyTicket = (ticket: string) => {
    try {
      navigator.clipboard.writeText(ticket);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
      triggerToast('Ticket ID copied to clipboard!', 'info');
    } catch (_) {}
  };

  const handleResetForNewBooking = () => {
    setConfirmedBooking(null);
    setSubmissionError(null);
    setCustomerNotes('');
    fetchAvailableSlots(selectedDate);
  };

  const popularGuwahatiAreas = [
    'Dispur',
    'Ganeshguri',
    'Beltola',
    'Six Mile',
    'Ulubari',
    'Paltan Bazaar',
    'Maligaon',
    'Borjhar',
  ];

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8" id="booking-portal-header">
      {/* Centered Page Heading per Master Prompt specification */}
      <div className="text-center space-y-2 sm:space-y-3 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500]">
          <Sparkles size={13} className="text-[#FF5500]" />
          <span>Guwahati Doorstep Dispatch &amp; Studio</span>
        </div>

        <h1
          className={`text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Book an Appointment
        </h1>

        <p
          className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          Choose your service, select an available date and time, and submit your doorstep booking with transparent zero-hidden fees.
        </p>
      </div>

      {/* SUCCESS CONFIRMATION STATE */}
      <AnimatePresence>
        {confirmedBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-2xl text-left space-y-5 sm:space-y-6 ${
              isLight
                ? 'bg-white border-emerald-300 shadow-emerald-500/10'
                : 'bg-zinc-950 border-emerald-500/40 shadow-emerald-500/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                    BOOKING RESERVATION CONFIRMED
                  </span>
                  <h3 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Appointment Successfully Scheduled
                  </h3>
                </div>
              </div>

              {/* Ticket ID Box with Copy (Zero Mobile Overflow) */}
              <button
                type="button"
                onClick={() => handleCopyTicket(confirmedBooking.ticketId)}
                className="self-start sm:self-auto max-w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold transition-all cursor-pointer truncate"
                title="Click to copy Ticket ID"
              >
                <span className="truncate">Ticket: {confirmedBooking.ticketId}</span>
                {copiedTicket ? <Check size={14} className="shrink-0" /> : <Copy size={14} className="shrink-0" />}
              </button>
            </div>

            {/* Confirmed Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Service</span>
                <span className={`font-bold block mt-1 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {confirmedBooking.serviceTitle}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Date &amp; Time</span>
                <span className="font-bold block mt-1 text-[#FF5500] truncate">
                  {confirmedBooking.date} • {confirmedBooking.time}
                </span>
                <span className="text-[9.5px] text-zinc-500 block truncate">{confirmedBooking.timezone}</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Customer</span>
                <span className={`font-bold block mt-1 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {confirmedBooking.customerName}
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">{confirmedBooking.customerPhone}</span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Estimated Fee</span>
                <span className="font-black text-emerald-400 text-sm block mt-1">
                  ₹{confirmedBooking.estimatedPrice}
                </span>
                <span className="text-[9.5px] text-zinc-500 block">Pay after completion</span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Next Steps for Your Doorstep Service:
              </span>
              <ul className="text-xs space-y-1.5 text-zinc-300 font-mono">
                {confirmedBooking.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions: Send to WhatsApp or Book Another */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all min-h-[48px]"
              >
                <WhatsAppIcon size={16} />
                <span>Open in WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleResetForNewBooking}
                className={`w-full sm:w-auto px-5 py-3.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[48px] ${
                  isLight
                    ? 'border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'border-white/15 hover:bg-white/10 text-white'
                }`}
              >
                Book Another Appointment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN INTERACTIVE BOOKING FORM */}
      {!confirmedBooking && (
        <form onSubmit={handleConfirmBooking} className="space-y-6 sm:space-y-8 text-left">
          {/* SECTION 1: SERVICE SELECTION */}
          <div
            className={`p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border shadow-xl space-y-4 sm:space-y-5 transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Choose Service Domain</span>
              </label>

              <span className="text-[10px] font-mono text-zinc-400">Guwahati 12KM Free Radius</span>
            </div>

            {/* Service Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setServiceType('pixelfix')}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-3.5 sm:gap-4 transition-all cursor-pointer relative overflow-hidden ${
                  serviceType === 'pixelfix'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] shadow-md shadow-[#FF5500]/10'
                    : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-black/40 hover:bg-black/60 border-white/10 text-zinc-300'
                }`}
              >
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    serviceType === 'pixelfix' ? 'bg-[#FF5500] text-white' : 'bg-orange-500/10 text-[#FF5500]'
                  }`}
                >
                  <Laptop size={22} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-black uppercase truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Pixel Fix IT Support
                    </span>
                    {serviceType === 'pixelfix' && (
                      <CheckCircle2 size={16} className="text-[#FF5500] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                    Doorstep laptop/PC diagnostics, Windows 10/11 format &amp; driver installs, SSD upgrades.
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-mono text-emerald-400 font-bold">
                    Zero diagnostic fee if unresolved
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('pixelframe')}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-3.5 sm:gap-4 transition-all cursor-pointer relative overflow-hidden ${
                  serviceType === 'pixelframe'
                    ? 'bg-[#FF5500]/10 border-[#FF5500] shadow-md shadow-[#FF5500]/10'
                    : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-black/40 hover:bg-black/60 border-white/10 text-zinc-300'
                }`}
              >
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    serviceType === 'pixelframe' ? 'bg-[#FF5500] text-white' : 'bg-orange-500/10 text-[#FF5500]'
                  }`}
                >
                  <Camera size={22} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-black uppercase truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Pixel Frame Photography
                    </span>
                    {serviceType === 'pixelframe' && (
                      <CheckCircle2 size={16} className="text-[#FF5500] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                    Weddings, candid sessions, 4K aerial drone cinematics, and post-production color grading.
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-mono text-indigo-400 font-bold">
                    Full Assam &amp; Northeast coverage
                  </span>
                </div>
              </button>
            </div>

            {/* Scope / Configuration Options */}
            <div
              className={`p-3.5 sm:p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              {serviceType === 'pixelfix' ? (
                <div className="space-y-4">
                  {/* Device Count - Balanced Mobile Spacing */}
                  <div className="space-y-2">
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      Number of Computers / Laptops:
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setItDeviceCount(num)}
                          className={`h-10 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center ${
                            itDeviceCount === num
                              ? 'bg-[#FF5500] text-white border-[#FF5500]'
                              : isLight
                              ? 'bg-white text-slate-700 border-slate-300 hover:border-[#FF5500]'
                              : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <span className="sm:hidden">{num}</span>
                          <span className="hidden sm:inline">{num} {num === 1 ? 'Device' : 'Dev'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add-on toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setItNeedOS(!itNeedOS)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        itNeedOS
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">Windows 10/11 Setup</span>
                        <span className="text-[10px] text-zinc-500 block truncate">Clean OS &amp; drivers</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${itNeedOS ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setItNeedOffice(!itNeedOffice)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        itNeedOffice
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">MS Office Setup</span>
                        <span className="text-[10px] text-zinc-500 block truncate">Word, Excel, PPT</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${itNeedOffice ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setItSsdUpgrade(!itSsdUpgrade)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        itSsdUpgrade
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">SSD Speed Upgrade</span>
                        <span className="text-[10px] text-zinc-500 block truncate">Fast NVMe clone</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${itSsdUpgrade ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo Category */}
                  <div className="space-y-2">
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      Event Category:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'wedding', label: '💍 Wedding' },
                        { id: 'corporate', label: '👔 Corporate' },
                        { id: 'party', label: '🎉 Birthday' },
                        { id: 'custom', label: '🌲 Portrait' },
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPhotoType(item.id as any)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer min-h-[44px] flex items-center justify-center truncate ${
                            photoType === item.id
                              ? 'bg-[#FF5500] text-white border-[#FF5500]'
                              : isLight
                              ? 'bg-white border-slate-300 text-slate-700'
                              : 'bg-zinc-900 border-white/10 text-zinc-300'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Add-ons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPhotoNeedPreWedding(!photoNeedPreWedding)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        photoNeedPreWedding
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">Pre-Wedding Shoot</span>
                        <span className="text-[10px] text-zinc-500 block truncate">Cinematic session</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${photoNeedPreWedding ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoNeedDrone(!photoNeedDrone)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        photoNeedDrone
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">4K Aerial Drone</span>
                        <span className="text-[10px] text-zinc-500 block truncate">Cinematic aerials</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${photoNeedDrone ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoNeedAlbum(!photoNeedAlbum)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                        photoNeedAlbum
                          ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">Hardbound Album</span>
                        <span className="text-[10px] text-zinc-500 block truncate">30-page photobook</span>
                      </div>
                      <CheckCircle2 size={16} className={`shrink-0 ${photoNeedAlbum ? 'text-[#FF5500]' : 'text-zinc-500'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 & 3: DATE & TIME SELECTION */}
          <div
            className={`p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border shadow-xl space-y-5 sm:space-y-6 transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/10'
            }`}
          >
            {/* Step 2: Date Selection */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Select Preferred Date</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">Custom Date:</span>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={e => {
                      if (e.target.value >= todayStr) {
                        setSelectedDate(e.target.value);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono border outline-none transition-all cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#FF5500]'
                        : 'bg-zinc-900 border-white/15 text-white focus:border-[#FF5500]'
                    }`}
                  />
                </div>
              </div>

              {/* Responsive 7-Day Picker: Snap Scroll on Mobile, 7-Col Grid on Desktop (Zero Orphan Cards) */}
              <div className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x touch-pan-x">
                {nextDays.map(item => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`min-w-[70px] sm:min-w-0 flex-1 snap-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-md shadow-[#FF5500]/25'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-zinc-900/80 hover:bg-zinc-900 border-white/10 text-zinc-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-85">
                        {item.dayName}
                      </span>
                      <span className="text-base font-black my-0.5">{item.dayNum}</span>
                      <span className="text-[9.5px] font-mono opacity-70">{item.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Available Time Slots */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-mono font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Available Time Slots</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock size={12} className="text-[#FF5500]" />
                    <span>IST (Asia/Kolkata)</span>
                  </span>
                  {loadingSlots && (
                    <RefreshCw size={12} className="animate-spin text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Slot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                {slots.map(slot => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all relative min-h-[58px] flex flex-col justify-center ${
                        !slot.isAvailable
                          ? 'opacity-40 cursor-not-allowed bg-zinc-900/30 border-white/5 text-zinc-600'
                          : isSelected
                          ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-md shadow-[#FF5500]/25 cursor-pointer'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 cursor-pointer'
                          : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/10 text-zinc-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black font-mono">{slot.time}</span>
                        {isSelected && <Check size={14} className="stroke-[3] shrink-0" />}
                      </div>
                      <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? 'text-white/85' : 'text-zinc-500'}`}>
                        {slot.isBooked ? '● Booked' : slot.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {slotsError && (
                <div className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center gap-1.5">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{slotsError}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: CUSTOMER INFORMATION & AREA VERIFICATION */}
          <div
            className={`p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border shadow-xl space-y-4 sm:space-y-5 transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Customer &amp; Location Details</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-400">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <LagFreeInput
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF5500]'
                        : 'bg-zinc-900 border border-white/15 text-white focus:border-[#FF5500]'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  WhatsApp / Contact Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <LagFreeInput
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 86388 75231"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF5500]'
                        : 'bg-zinc-900 border border-white/15 text-white focus:border-[#FF5500]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Guwahati Doorstep Area Field with Quick Chips & Map Integration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                  Guwahati Doorstep Area / Landmark <span className="text-red-500">*</span>
                </label>

                {/* Map toggle button inside booking flow */}
                <button
                  type="button"
                  onClick={() => setShowInlineMap(!showInlineMap)}
                  className="text-[11px] font-mono text-[#FF5500] hover:text-orange-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MapIcon size={12} />
                  <span>{showInlineMap ? 'Hide Coverage Map' : 'Explore Coverage Map'}</span>
                  {showInlineMap ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <LagFreeInput
                  type="text"
                  required
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Dispur Last Gate, Beltola, Ulubari, Ganeshguri, Six Mile..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF5500]'
                      : 'bg-zinc-900 border border-white/15 text-white focus:border-[#FF5500]'
                  }`}
                />
              </div>

              {/* Quick Area Pick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                  Popular:
                </span>
                {popularGuwahatiAreas.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setCustomerAddress(area);
                      triggerToast(`Selected ${area} for doorstep dispatch!`, 'info');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                      customerAddress.toLowerCase().includes(area.toLowerCase())
                        ? 'bg-[#FF5500] text-white border-[#FF5500]'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-white/10'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Instant Area Verification Note */}
              {matchedLocality && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between gap-2 ${
                    matchedLocality.status === 'fully_covered'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>
                      <strong>{matchedLocality.name}:</strong>{' '}
                      {matchedLocality.status === 'fully_covered' ? 'Zero travel fee' : 'Extended zone'}
                    </span>
                  </div>
                  {matchedLocality.eta && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                      ⚡ ETA: {matchedLocality.eta}
                    </span>
                  )}
                </div>
              )}

              {/* INLINE MAP ACCORDION (Properly Contained & Responsive) */}
              <AnimatePresence>
                {showInlineMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-2"
                  >
                    <div className="p-3 sm:p-4 rounded-2xl border border-white/15 bg-black/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#FF5500]" />
                          <span>Tap any pin to select your doorstep area:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowInlineMap(false)}
                          className="text-zinc-400 hover:text-white text-[11px] font-mono"
                        >
                          Close Map ✕
                        </button>
                      </div>

                      <CoverageMap
                        currentTheme={currentTheme}
                        compact={true}
                        onSelectLocality={(locName) => {
                          setCustomerAddress(locName);
                          setShowInlineMap(false);
                          triggerToast(`Selected ${locName} for booking!`, 'success');
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                Issue Description or Special Requests (Optional)
              </label>
              <LagFreeTextArea
                rows={2}
                value={customerNotes}
                onChange={e => setCustomerNotes(e.target.value)}
                placeholder="Describe fault symptoms (e.g. laptop blue screen, RAM beep error, or photography venue preferences)..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all resize-none ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF5500]'
                    : 'bg-zinc-900 border border-white/15 text-white focus:border-[#FF5500]'
                }`}
              />
            </div>
          </div>

          {/* SECTION 5: BOOKING SUMMARY & PRIMARY ACTIONS */}
          <div
            className={`p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border shadow-xl space-y-4 sm:space-y-5 transition-all ${
              isLight
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-[#FF5500]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center text-[10px]">
                  5
                </span>
                <span>Booking Summary</span>
              </label>

              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ✓ Transparent Proposal
              </span>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-black/50 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 block uppercase">Selected Service</span>
                <span className={`font-bold block mt-0.5 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {serviceType === 'pixelfix' ? 'Pixel Fix IT Support' : 'Pixel Frame Photography'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-black/50 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 block uppercase">Reserved Slot</span>
                <span className="font-bold text-[#FF5500] block mt-0.5 truncate">
                  {selectedDate} • {selectedSlot || 'Select slot'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-black/50 border-white/10'}`}>
                <span className="text-[10px] text-zinc-400 block uppercase">Estimated Fee</span>
                <span className="text-lg font-black text-[#FF5500] block mt-0.5">
                  ₹{estimatedPrice}
                </span>
              </div>
            </div>

            {submissionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Primary Action Buttons (Full width on mobile, comfortable touch targets) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-[#FF5500] hover:bg-orange-500 disabled:opacity-50 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5500]/25 active:scale-[0.98] transition-all min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all min-h-[48px]"
              >
                <WhatsAppIcon size={16} />
                <span>Send Booking to WhatsApp</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};
