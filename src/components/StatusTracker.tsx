import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  Camera,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Printer,
  Plus,
  Zap,
  Cpu,
  Film,
  Compass,
  Layers,
  Activity,
  SlidersHorizontal,
  Share2
} from 'lucide-react';
import { LagFreeInput, LagFreeTextArea } from './LagFreeInputs';

export type ServiceCategory = 'it_repair' | 'photography';

export type TicketStageId =
  | 'intake'
  | 'diagnostics'
  | 'in_progress'
  | 'testing_review'
  | 'ready_completed';

export interface TimelineMilestone {
  id: string;
  stageId: TicketStageId;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming';
  badge?: string;
  technicianNotes?: string;
}

export interface MetricSpec {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface SupportTicket {
  ticketNumber: string;
  category: ServiceCategory;
  clientName: string;
  clientPhone: string;
  serviceTitle: string;
  deviceOrPackageName: string;
  dateBooked: string;
  estimatedCompletion: string;
  assignedStaff: string;
  staffRole: string;
  staffPhone: string;
  currentStage: TicketStageId;
  progressPercent: number;
  priority: 'standard' | 'high' | 'express';
  notes: string;
  timeline: TimelineMilestone[];
  specs: MetricSpec[];
  lastUpdated: string;
}

const STORAGE_KEY = 'pf_support_tickets_v1';

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    ticketNumber: 'PF-IT-8492',
    category: 'it_repair',
    clientName: 'Rahul Barman',
    clientPhone: '+91 98640 12849',
    serviceTitle: 'Doorstep Thermal Overhaul & NVMe 1TB Migration',
    deviceOrPackageName: 'Lenovo Legion 5 Pro (RTX 3060, Ryzen 7 5800H)',
    dateBooked: 'Oct 05, 2026 • 10:15 AM',
    estimatedCompletion: 'Today • 06:30 PM (On-Track)',
    assignedStaff: 'Murari Panjiyar',
    staffRole: 'Lead IT Systems Engineer',
    staffPhone: '8638875231',
    currentStage: 'testing_review',
    progressPercent: 80,
    priority: 'express',
    notes: 'Thermal paste fully renewed with Arctic MX-6 compound. High-speed 1TB NVMe cloned with zero data loss. Running 45-min Cinebench & 3DMark stress benchmark.',
    lastUpdated: '15 mins ago',
    specs: [
      { label: 'Thermal Paste', value: 'Arctic MX-6 Compound', highlight: true },
      { label: 'CPU Temp Before', value: '94°C (Severe Throttle)' },
      { label: 'CPU Temp After', value: '68°C (Stable Peak)', highlight: true },
      { label: 'SSD Clone', value: '1TB PCIe Gen4 NVMe' },
      { label: 'Bench Stress', value: '3DMark TimeSpy Passed' },
      { label: 'Dispatch Location', value: 'Zoo Road, Guwahati' }
    ],
    timeline: [
      {
        id: 'step-1',
        stageId: 'intake',
        title: 'Ticket Logged & Hardware Intake',
        description: 'Client booked doorstep support. Serial number recorded, physical chassis inspected, and intake diagnostic profile generated.',
        timestamp: 'Oct 05, 10:15 AM',
        status: 'completed',
        badge: 'Verified Intake'
      },
      {
        id: 'step-2',
        stageId: 'diagnostics',
        title: 'Thermal Imaging & Hardware Telemetry',
        description: 'Vapor chamber airflow blockage diagnosed. Thermal throttling detected at 94°C on CPU package.',
        timestamp: 'Oct 05, 01:30 PM',
        status: 'completed',
        badge: 'Diagnosis Confirmed'
      },
      {
        id: 'step-3',
        stageId: 'in_progress',
        title: 'Thermal Overhaul & NVMe Drive Clone',
        description: 'Full heat-sink dust purge, Arctic MX-6 repasting, and bit-level OS migration to new 1TB PCIe Gen4 NVMe SSD.',
        timestamp: 'Oct 05, 04:00 PM',
        status: 'completed',
        badge: 'Hardware Ready'
      },
      {
        id: 'step-4',
        stageId: 'testing_review',
        title: 'Cinebench R23 & 3DMark Stress Benchmark',
        description: 'Running 45-minute continuous benchmark to guarantee no throttling under heavy gaming or rendering workloads.',
        timestamp: 'Active Now',
        status: 'current',
        badge: 'Stress Testing'
      },
      {
        id: 'step-5',
        stageId: 'ready_completed',
        title: 'Final Quality Check & Doorstep Handover',
        description: 'Technician signs off QA report. Laptop packaged with warranty tag ready for doorstep customer return.',
        timestamp: 'Estimated: 06:30 PM',
        status: 'upcoming',
        badge: 'Pending Handover'
      }
    ]
  },
  {
    ticketNumber: 'PF-PHOTO-3184',
    category: 'photography',
    clientName: 'Ankita & Priyam',
    clientPhone: '+91 94350 31840',
    serviceTitle: 'Pre-Wedding 4K Cinematography & Luxury Album',
    deviceOrPackageName: 'Pixel Frame Royal 2-Day Package (Sony A7 IV + DJI Mini 4 Pro Drone)',
    dateBooked: 'Sep 28, 2026 • 04:00 PM',
    estimatedCompletion: 'Oct 14, 2026 (On-Track)',
    assignedStaff: 'Murari Panjiyar',
    staffRole: 'Lead Cinematographer & Drone Pilot',
    staffPhone: '9864361940',
    currentStage: 'in_progress',
    progressPercent: 60,
    priority: 'standard',
    notes: 'Sunset golden-hour drone reels and candid portraits successfully backed up in triplicate. Currently color grading RAW footage in DaVinci Resolve.',
    lastUpdated: '1 hour ago',
    specs: [
      { label: 'Camera Gear', value: 'Sony A7 IV + 24-70 GM II' },
      { label: 'Aerial Drone', value: 'DJI Mini 4 Pro (4K 60fps)' },
      { label: 'RAW Frames Captured', value: '1,840 High-Res Frames', highlight: true },
      { label: 'Color Space', value: 'S-Log3 to Rec.709 Cine' },
      { label: 'Album Specs', value: '30-Page Hardcover Velvet' },
      { label: 'Shoot Location', value: 'Brahmaputra Heritage, Guwahati' }
    ],
    timeline: [
      {
        id: 'p-step-1',
        stageId: 'intake',
        title: 'Shoot Booking & Concept Planning',
        description: 'Event dates locked, theme moodboards confirmed, and outdoor shooting schedule scheduled across Guwahati.',
        timestamp: 'Sep 28, 04:00 PM',
        status: 'completed',
        badge: 'Shoot Reserved'
      },
      {
        id: 'p-step-2',
        stageId: 'diagnostics',
        title: 'On-Location 4K & Aerial Drone Capture',
        description: 'Full day shoot completed. Golden hour candid couple portraits and 4K aerial drone cinematics recorded without delays.',
        timestamp: 'Oct 02, 07:30 PM',
        status: 'completed',
        badge: 'Footage Secured'
      },
      {
        id: 'p-step-3',
        stageId: 'in_progress',
        title: 'RAW Culling & DaVinci Resolve Color Grading',
        description: 'Selection of top 250 master shots. Colorist fine-tuning skin tones, contrast curves, and cinematic warmth.',
        timestamp: 'Active Now',
        status: 'current',
        badge: 'In Grading Suite'
      },
      {
        id: 'p-step-4',
        stageId: 'testing_review',
        title: 'Private Digital Proofing Gallery Review',
        description: 'Upload to secure client proofing gallery for couple to select favorite printed album layout spreads.',
        timestamp: 'Expected: Oct 10',
        status: 'upcoming',
        badge: 'Review Pending'
      },
      {
        id: 'p-step-5',
        stageId: 'ready_completed',
        title: 'High-Res Master Delivery & Album Print Dispatch',
        description: 'Delivery of 4K final video cut via Google Drive link and courier dispatch of the physical luxury coffee-table album.',
        timestamp: 'Expected: Oct 14',
        status: 'upcoming',
        badge: 'Final Handover'
      }
    ]
  },
  {
    ticketNumber: 'MP-BEEP-7193',
    category: 'it_repair',
    clientName: 'Debojit Sarma',
    clientPhone: '+91 88760 71932',
    serviceTitle: 'Motherboard Acoustic POST Decoder — RAM Alert',
    deviceOrPackageName: 'ASUS TUF B550M-PLUS (1 Long 2 Short Beeps / No Display)',
    dateBooked: 'Oct 06, 2026 • 09:20 AM',
    estimatedCompletion: 'Tomorrow • 11:30 AM',
    assignedStaff: 'Murari Panjiyar',
    staffRole: 'Lead IT Systems Engineer',
    staffPhone: '8638875231',
    currentStage: 'in_progress',
    progressPercent: 50,
    priority: 'high',
    notes: 'Beep code decoded as RAM parity/detection failure. Tracing DIMM slot voltages and testing individual DDR4 sticks in dual-channel configuration.',
    lastUpdated: '35 mins ago',
    specs: [
      { label: 'Motherboard Model', value: 'ASUS TUF Gaming B550M' },
      { label: 'Reported Beep Code', value: '1 Long, 2 Short Beeps', highlight: true },
      { label: 'Failure Cause', value: 'Memory / DIMM Parity Error' },
      { label: 'RAM Config', value: 'Corsair Vengeance 2x8GB' },
      { label: 'CMOS Voltage', value: '3.12V (Healthy)' },
      { label: 'Service Hub', value: 'Beltola Lab, Guwahati' }
    ],
    timeline: [
      {
        id: 'b-step-1',
        stageId: 'intake',
        title: 'Motherboard Beep Diagnostics Intake',
        description: 'Ticket generated via Pixel Fix Motherboard Beep Diagnostician tool. Motherboard arrived at diagnostics bench.',
        timestamp: 'Oct 06, 09:20 AM',
        status: 'completed',
        badge: 'Intake Registered'
      },
      {
        id: 'b-step-2',
        stageId: 'diagnostics',
        title: 'DIMM Slot & Voltage Rail Inspection',
        description: 'Contact pin oxidation cleaned using isopropyl alcohol. Slot 2 trace impedance verified.',
        timestamp: 'Oct 06, 11:45 AM',
        status: 'completed',
        badge: 'Root Cause Found'
      },
      {
        id: 'b-step-3',
        stageId: 'in_progress',
        title: 'Dual-Channel Memory Stabilization & BIOS Update',
        description: 'Testing individual RAM sticks with MemTest86. Updating BIOS firmware to latest stable AGESA build.',
        timestamp: 'Active Now',
        status: 'current',
        badge: 'In Repair'
      },
      {
        id: 'b-step-4',
        stageId: 'testing_review',
        title: 'POST Multi-Cycle Boot Sanity Tests',
        description: 'Cycling 10 cold restarts to ensure 100% first-attempt POST pass with no acoustic beep warnings.',
        timestamp: 'Upcoming: 04:00 PM',
        status: 'upcoming',
        badge: 'Cold Boot Tests'
      },
      {
        id: 'b-step-5',
        stageId: 'ready_completed',
        title: 'Bench Sign-Off & Client Collection',
        description: 'Complete diagnostic report handed to client with 30-day doorstep service guarantee.',
        timestamp: 'Tomorrow: 11:30 AM',
        status: 'upcoming',
        badge: 'Ready for Client'
      }
    ]
  },
  {
    ticketNumber: 'PF-IT-5104',
    category: 'it_repair',
    clientName: 'Pooja Das',
    clientPhone: '+91 97060 51044',
    serviceTitle: 'Windows 11 Genuine Setup, Driver Pack & MS Office',
    deviceOrPackageName: 'Dell Inspiron 15 3520 (Intel Core i5 12th Gen)',
    dateBooked: 'Oct 04, 2026 • 11:00 AM',
    estimatedCompletion: 'Completed & Delivered',
    assignedStaff: 'Murari Panjiyar',
    staffRole: 'Lead IT Systems Engineer',
    staffPhone: '8638875231',
    currentStage: 'ready_completed',
    progressPercent: 100,
    priority: 'standard',
    notes: 'Genuine Windows 11 Pro activated with verified digital license. Office 2024 configured. System speedup optimized with zero bloatware.',
    lastUpdated: 'Yesterday',
    specs: [
      { label: 'Operating System', value: 'Windows 11 Pro Genuine', highlight: true },
      { label: 'Office Suite', value: 'Office 2024 Configured' },
      { label: 'Driver Status', value: 'All Hardware Signed WHQL' },
      { label: 'Boot Time', value: '8.4 Seconds (Optimized)' },
      { label: 'Status', value: 'Completed & Delivered', highlight: true },
      { label: 'Service Hub', value: 'Dispur, Guwahati' }
    ],
    timeline: [
      {
        id: 'c-step-1',
        stageId: 'intake',
        title: 'Doorstep Booking Received',
        description: 'Client booked OS migration and speedup service.',
        timestamp: 'Oct 04, 11:00 AM',
        status: 'completed',
        badge: 'Received'
      },
      {
        id: 'c-step-2',
        stageId: 'diagnostics',
        title: 'Storage & Health Diagnostic Audit',
        description: 'Confirmed NVMe SSD health at 99%. Backed up user personal documents securely.',
        timestamp: 'Oct 04, 12:15 PM',
        status: 'completed',
        badge: 'Backup Safe'
      },
      {
        id: 'c-step-3',
        stageId: 'in_progress',
        title: 'Clean Windows 11 Pro Installation',
        description: 'Fresh clean install with certified Microsoft retail license key.',
        timestamp: 'Oct 04, 02:00 PM',
        status: 'completed',
        badge: 'OS Installed'
      },
      {
        id: 'c-step-4',
        stageId: 'testing_review',
        title: 'Driver Stack & Office Configuration',
        description: 'Configured chipset, audio, graphics, and WiFi drivers. Verified Office activation.',
        timestamp: 'Oct 04, 03:45 PM',
        status: 'completed',
        badge: 'Configured'
      },
      {
        id: 'c-step-5',
        stageId: 'ready_completed',
        title: 'Doorstep Handover & Client Sign-Off',
        description: 'Laptop delivered back to client in Dispur with zero issues. Client verified lightning boot speeds.',
        timestamp: 'Oct 04, 05:30 PM',
        status: 'completed',
        badge: 'Delivered'
      }
    ]
  }
];

interface StatusTrackerProps {
  currentTheme?: 'light' | 'dark' | 'mono' | string;
  initialTicketId?: string;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  currentTheme = 'dark',
  initialTicketId = '',
  onClose,
  isEmbedded = false
}) => {
  const isLight = currentTheme === 'light';

  // Load tickets from localStorage or fall back to INITIAL_TICKETS
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TICKETS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // Ignore
    }
  }, [tickets]);

  // Search input state
  const [searchInput, setSearchInput] = useState<string>(initialTicketId || 'PF-IT-8492');
  const [searchedId, setSearchedId] = useState<string>(initialTicketId || 'PF-IT-8492');
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false);
  const [isSimulatingAdvance, setIsSimulatingAdvance] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New ticket state for modal
  const [newCategory, setNewCategory] = useState<ServiceCategory>('it_repair');
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newServiceTitle, setNewServiceTitle] = useState<string>('');
  const [newDeviceDetails, setNewDeviceDetails] = useState<string>('');

  // Find active ticket by searched ID
  const activeTicket = useMemo(() => {
    const cleanQuery = (searchedId || '').trim().toUpperCase();
    if (!cleanQuery) return null;

    // Exact match
    const exact = tickets.find(t => t.ticketNumber.toUpperCase() === cleanQuery);
    if (exact) return exact;

    // Partial/numeric match (e.g. "8492" matching "PF-IT-8492")
    const partial = tickets.find(t =>
      t.ticketNumber.toUpperCase().includes(cleanQuery) ||
      cleanQuery.includes(t.ticketNumber.toUpperCase().replace(/^PF-IT-|^PF-PHOTO-|^MP-BEEP-/, ''))
    );
    if (partial) return partial;

    // Match by client phone or name
    return tickets.find(t =>
      t.clientName.toUpperCase().includes(cleanQuery) ||
      t.clientPhone.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''))
    ) || null;
  }, [tickets, searchedId]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      setSearchedId(searchInput.trim());
    }
  };

  const handleSelectDemoChip = (ticketNum: string) => {
    setSearchInput(ticketNum);
    setSearchedId(ticketNum);
  };

  const handleCopyTicket = (ticketNum: string) => {
    navigator.clipboard.writeText(ticketNum);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const handleShareUrl = (ticketNum: string) => {
    const url = `${window.location.origin}/#track/${ticketNum}`;
    navigator.clipboard.writeText(url);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  // State-based simulator: advance ticket stage live in real-time
  const handleAdvanceStage = useCallback(() => {
    if (!activeTicket) return;
    setIsSimulatingAdvance(true);

    const STAGE_ORDER: TicketStageId[] = ['intake', 'diagnostics', 'in_progress', 'testing_review', 'ready_completed'];
    const currentIdx = STAGE_ORDER.indexOf(activeTicket.currentStage);
    const nextIdx = (currentIdx + 1) % STAGE_ORDER.length;
    const nextStage = STAGE_ORDER[nextIdx];

    const nextPercent = Math.min(100, Math.round(((nextIdx + 1) / STAGE_ORDER.length) * 100));

    // Update timeline step statuses
    const updatedTimeline = activeTicket.timeline.map((step, idx) => {
      if (idx < nextIdx) {
        return { ...step, status: 'completed' as const };
      } else if (idx === nextIdx) {
        return { ...step, status: 'current' as const, timestamp: 'Just now' };
      } else {
        return { ...step, status: 'upcoming' as const };
      }
    });

    const updatedTicket: SupportTicket = {
      ...activeTicket,
      currentStage: nextStage,
      progressPercent: nextPercent,
      lastUpdated: 'Just now',
      timeline: updatedTimeline
    };

    setTimeout(() => {
      setTickets(prev => prev.map(t => t.ticketNumber === activeTicket.ticketNumber ? updatedTicket : t));
      setIsSimulatingAdvance(false);
    }, 400);
  }, [activeTicket]);

  // Reset demo tickets
  const handleResetTickets = () => {
    setTickets(INITIAL_TICKETS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
    setSearchInput('PF-IT-8492');
    setSearchedId('PF-IT-8492');
  };

  // Create new ticket submission
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newServiceTitle) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = newCategory === 'it_repair' ? 'PF-IT' : 'PF-PHOTO';
    const newTicketId = `${prefix}-${randomNum}`;

    const newTicket: SupportTicket = {
      ticketNumber: newTicketId,
      category: newCategory,
      clientName: newClientName,
      clientPhone: newClientPhone || '+91 86388 75231',
      serviceTitle: newServiceTitle,
      deviceOrPackageName: newDeviceDetails || (newCategory === 'it_repair' ? 'Client Laptop Hardware' : 'Photography Event Booking'),
      dateBooked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • Just Now',
      estimatedCompletion: newCategory === 'it_repair' ? 'Within 24 Hours' : 'Within 7 Business Days',
      assignedStaff: 'Murari Panjiyar',
      staffRole: newCategory === 'it_repair' ? 'Lead IT Systems Engineer' : 'Lead Cinematographer',
      staffPhone: newCategory === 'it_repair' ? '8638875231' : '9864361940',
      currentStage: 'intake',
      progressPercent: 20,
      priority: 'high',
      notes: `New support ticket generated for ${newClientName}. Intake diagnostics registered in Guwahati dispatcher hub.`,
      lastUpdated: 'Just now',
      specs: [
        { label: 'Service Category', value: newCategory === 'it_repair' ? 'Doorstep IT Repair' : 'Photography & Media', highlight: true },
        { label: 'Intake Node', value: 'Guwahati Live Dispatch' },
        { label: 'Assigned Engineer', value: 'Murari Panjiyar' }
      ],
      timeline: [
        {
          id: 'step-new-1',
          stageId: 'intake',
          title: 'Intake Registered & Ticket Generated',
          description: 'Ticket created in client portal. Engineer notified for inspection.',
          timestamp: 'Just now',
          status: 'current',
          badge: 'New Request'
        },
        {
          id: 'step-new-2',
          stageId: 'diagnostics',
          title: 'Initial Assessment & Inspection',
          description: 'Hardware diagnostics / shoot schedule preparation.',
          status: 'upcoming'
        },
        {
          id: 'step-new-3',
          stageId: 'in_progress',
          title: 'Service Execution & Fixes',
          description: 'Component level repair / editing and grading phase.',
          status: 'upcoming'
        },
        {
          id: 'step-new-4',
          stageId: 'testing_review',
          title: 'Quality Assurance & Testing',
          description: 'Stress benchmarking / client digital proofing.',
          status: 'upcoming'
        },
        {
          id: 'step-new-5',
          stageId: 'ready_completed',
          title: 'Final Handover & Delivery',
          description: 'Doorstep return of repaired PC / final 4K masters delivery.',
          status: 'upcoming'
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setSearchInput(newTicketId);
    setSearchedId(newTicketId);
    setShowCreateModal(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewServiceTitle('');
    setNewDeviceDetails('');
  };

  const stageBadgeColor = (stage: TicketStageId) => {
    switch (stage) {
      case 'intake':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
      case 'diagnostics':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'in_progress':
        return 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30';
      case 'testing_review':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'ready_completed':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const stageHumanName = (stage: TicketStageId) => {
    switch (stage) {
      case 'intake':
        return 'Stage 1 of 5: Request Intake & Logged';
      case 'diagnostics':
        return 'Stage 2 of 5: Hardware & Error Diagnostic';
      case 'in_progress':
        return 'Stage 3 of 5: Repair & Overhaul Active';
      case 'testing_review':
        return 'Stage 4 of 5: Stress Benchmark & Quality Review';
      case 'ready_completed':
        return 'Stage 5 of 5: Completed & Ready for Handover';
      default:
        return 'In Progress';
    }
  };

  return (
    <div className={`w-full text-left transition-all duration-300 ${isEmbedded ? '' : 'max-w-5xl mx-auto'}`}>
      
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border mb-8 transition-all duration-300 shadow-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-white/10">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF5500]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>Pixel Fix &amp; Pixel Frame • Live Service Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              Service Status Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track the live milestone progress of your doorstep IT computer repair, motherboard acoustic beep resolution, or wedding photography package using your support ticket number.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF6A1A] hover:from-[#FF4400] hover:to-[#FF5500] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FF5500]/25 hover:scale-105 active:scale-95"
            >
              <Plus size={14} />
              <span>Simulate New Ticket</span>
            </button>
            <button
              type="button"
              onClick={handleResetTickets}
              title="Reset sample tickets to default"
              className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close Tracker
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <LagFreeInput
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Ticket # (e.g. PF-IT-8492, PF-PHOTO-3184, MP-BEEP-7193)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white font-mono text-sm placeholder:text-slate-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FF5500]/30 hover:scale-102 active:scale-98"
            >
              <Search size={15} />
              <span>Track Progress</span>
            </button>
          </form>

          {/* QUICK ACCESS DEMO CHIPS */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold shrink-0">
              Quick Test Tickets:
            </span>
            {tickets.slice(0, 4).map((t) => {
              const isActive = activeTicket?.ticketNumber === t.ticketNumber;
              const isIt = t.category === 'it_repair';
              return (
                <button
                  key={t.ticketNumber}
                  type="button"
                  onClick={() => handleSelectDemoChip(t.ticketNumber)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5500] text-white border-transparent shadow-md shadow-[#FF5500]/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  {isIt ? <Laptop size={11} className={isActive ? 'text-white' : 'text-[#FF5500]'} /> : <Camera size={11} className={isActive ? 'text-white' : 'text-indigo-400'} />}
                  <span>{t.ticketNumber}</span>
                  <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {t.progressPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TICKET DETAILS DISPLAY */}
      {activeTicket ? (
        <div className="space-y-6">
          
          {/* PRIMARY STATUS CARD */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-lg ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1018] border-white/10 text-white'
          }`}>
            
            {/* Top Bar Details */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider border ${
                    activeTicket.category === 'it_repair'
                      ? 'bg-orange-500/10 text-[#FF5500] border-orange-500/25'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                  }`}>
                    {activeTicket.category === 'it_repair' ? '💻 Doorstep IT Computer Repair' : '📸 Pixel Frame 4K Photography'}
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider border ${stageBadgeColor(activeTicket.currentStage)}`}>
                    {stageHumanName(activeTicket.currentStage)}
                  </span>

                  {activeTicket.priority === 'express' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse">
                      ⚡ Express Priority
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-2">
                    <span>{activeTicket.ticketNumber}</span>
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(activeTicket.ticketNumber)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                    title="Copy Ticket ID"
                  >
                    {copiedTicket ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span className="font-mono text-[9px]">{copiedTicket ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareUrl(activeTicket.ticketNumber)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                    title="Copy Share Link"
                  >
                    {copiedShareUrl ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
                    <span className="font-mono text-[9px]">{copiedShareUrl ? 'Link Copied' : 'Share'}</span>
                  </button>
                </div>

                <h4 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {activeTicket.serviceTitle}
                </h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} font-mono`}>
                  Hardware / Package: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{activeTicket.deviceOrPackageName}</strong>
                </p>
              </div>

              {/* Progress dial & advance simulation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:text-right">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Estimated Handover
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#FF5500] font-mono bg-[#FF5500]/10 px-2.5 py-1 rounded-lg border border-[#FF5500]/20">
                    <Clock size={12} />
                    <span>{activeTicket.estimatedCompletion}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAdvanceStage}
                    disabled={isSimulatingAdvance}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95"
                    title="Simulate the next milestone stage in real-time"
                  >
                    <Activity size={13} className={`text-[#FF5500] ${isSimulatingAdvance ? 'animate-spin' : ''}`} />
                    <span>Advance Stage ({activeTicket.progressPercent}%)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="py-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  Overall Diagnostic &amp; Repair Completion
                </span>
                <span className="text-[#FF5500] font-black text-sm">
                  {activeTicket.progressPercent}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeTicket.progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#FF5500] to-emerald-500 relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                </motion.div>
              </div>
            </div>

            {/* TIMELINE STEPPER */}
            <div className="pt-4 space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider font-mono text-slate-400">
                Milestone Execution Stepper:
              </h5>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                {activeTicket.timeline.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <motion.div
                      key={step.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="relative text-left"
                    >
                      {/* Step Node Marker */}
                      <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : isCurrent
                            ? 'bg-[#FF5500] text-white ring-4 ring-[#FF5500]/25 animate-pulse'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 border border-slate-300 dark:border-white/10'
                      }`}>
                        {isCompleted ? (
                          <Check size={14} className="stroke-[3]" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-[#FF5500]/40 bg-[#FF5500]/5 shadow-sm'
                          : isCompleted
                            ? isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                            : isLight ? 'bg-slate-50/50 border-slate-200/50 opacity-60' : 'bg-black/20 border-white/5 opacity-50'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${
                              isCurrent ? 'text-[#FF5500]' : isCompleted ? (isLight ? 'text-slate-900' : 'text-white') : 'text-slate-400'
                            }`}>
                              {step.title}
                            </span>
                            {step.badge && (
                              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : isCurrent
                                    ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {step.badge}
                              </span>
                            )}
                          </div>
                          {step.timestamp && (
                            <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* TECHNICAL SPECS & DIAGNOSTICS TELEMETRY */}
            {activeTicket.specs && activeTicket.specs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                    <Zap size={13} className="text-[#FF5500]" />
                    <span>Diagnostic Telemetry &amp; Gear Specifications</span>
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400">
                    Updated {activeTicket.lastUpdated}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  {activeTicket.specs.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-left ${
                        item.highlight
                          ? 'border-[#FF5500]/30 bg-[#FF5500]/5 text-[#FF5500]'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/30 border-white/5 text-slate-300'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans font-bold">
                        {item.label}
                      </span>
                      <strong className={`font-black text-xs block mt-0.5 ${item.highlight ? 'text-[#FF5500]' : isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ENGINEER & DIRECT CONTACT ASSIGNMENT */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5500] to-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  MP
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Direct Assigned Specialist
                  </span>
                  <strong className={`text-sm block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {activeTicket.assignedStaff}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {activeTicket.staffRole}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://wa.me/91${activeTicket.staffPhone}?text=${encodeURIComponent(`Hi Murari, I am checking status on my ticket ${activeTicket.ticketNumber} (${activeTicket.serviceTitle}). Please provide an update!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Phone size={13} />
                  <span>WhatsApp Specialist</span>
                </a>
                <a
                  href={`tel:${activeTicket.staffPhone}`}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  }`}
                >
                  <span>Call Hotline</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* NO TICKET FOUND EMPTY STATE */
        <div className={`p-10 rounded-3xl border text-center space-y-4 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-xl font-black uppercase">
            No Ticket Found For &ldquo;{searchedId}&rdquo;
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Please verify your support ticket number from your WhatsApp booking message or invoice receipt. Try testing one of the live sample ticket numbers below.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSelectDemoChip('PF-IT-8492')}
              className="px-3 py-1.5 rounded-xl bg-[#FF5500] text-white text-xs font-bold uppercase cursor-pointer"
            >
              Test PF-IT-8492
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemoChip('PF-PHOTO-3184')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase cursor-pointer"
            >
              Test PF-PHOTO-3184
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemoChip('MP-BEEP-7193')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase cursor-pointer"
            >
              Test MP-BEEP-7193
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SIMULATE NEW TICKET CREATOR */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 text-left ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Generate New Support Ticket
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly create a new simulated tracking record to test live milestone progression.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                {/* Category select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Service Sector *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCategory('it_repair')}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newCategory === 'it_repair'
                          ? 'bg-[#FF5500] text-white border-transparent'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <Laptop size={14} />
                      <span>Pixel Fix IT Repair</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategory('photography')}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newCategory === 'photography'
                          ? 'bg-indigo-600 text-white border-transparent'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <Camera size={14} />
                      <span>Pixel Frame Photo</span>
                    </button>
                  </div>
                </div>

                {/* Client Name */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Customer Full Name *
                  </label>
                  <LagFreeInput
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Suman Choudhury"
                    className="w-full p-3 rounded-xl border bg-black/40 border-white/10 text-white text-xs outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Client Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    WhatsApp Phone Number
                  </label>
                  <LagFreeInput
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 86388 75231"
                    className="w-full p-3 rounded-xl border bg-black/40 border-white/10 text-white text-xs outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Service Title */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Service Package / Requirement *
                  </label>
                  <LagFreeInput
                    type="text"
                    required
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    placeholder={newCategory === 'it_repair' ? 'e.g. SSD 512GB Upgrade & Windows 11' : 'e.g. 1-Day Pre-Wedding Cinematics & Drone'}
                    className="w-full p-3 rounded-xl border bg-black/40 border-white/10 text-white text-xs outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Hardware details */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Hardware / Shoot Specification
                  </label>
                  <LagFreeInput
                    type="text"
                    value={newDeviceDetails}
                    onChange={(e) => setNewDeviceDetails(e.target.value)}
                    placeholder={newCategory === 'it_repair' ? 'e.g. HP Pavilion 14 (Core i5)' : 'e.g. Diphu Destination Shoot'}
                    className="w-full p-3 rounded-xl border bg-black/40 border-white/10 text-white text-xs outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF4400] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#FF5500]/25 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create &amp; Track Ticket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
