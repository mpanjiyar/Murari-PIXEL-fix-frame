import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Download,
  ExternalLink,
  Film,
  HelpCircle,
  Send,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  Lock,
  Share2,
  FolderCheck,
  Play,
  Layers,
  Flame,
  Award,
  Video,
  Settings,
  X,
  ChevronDown,
  Info,
  Clock,
  Sparkle,
  Bell,
  User,
  Phone,
  ShoppingBag,
  Search
} from 'lucide-react';
import QRCode from 'qrcode';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { DurgaPujaOfferPopup } from './DurgaPujaOfferPopup';
import { AdminNotificationsPanel } from './AdminNotificationsPanel';
import { AdminPurchaseManager } from './AdminPurchaseManager';
import { MegaPackBundleDirectory } from './MegaPackBundleDirectory';
import { AdminCornerTrigger } from './AdminCornerTrigger';
import { submitPaymentReferenceWithRetry } from '../utils/retryWithBackoff';

interface StandaloneReelsOfferPageProps {
  currentTheme?: 'light' | 'normal' | 'mono';
  onToggleTheme?: () => void;
  isAuthorized?: boolean;
}

interface CategoryCard {
  id: string;
  name: string;
  count: string;
  description: string;
  sampleAspect: string;
  tags: string[];
  gradient: string;
  accentColor: string;
}

const CATEGORIES_DATA: CategoryCard[] = [
  {
    id: 'anime',
    name: 'Anime & Shonen Hits',
    count: '20,000+ Clips',
    description: 'High-octane fights, 4K aesthetics, lo-fi cyberpunk edits, shonen character arcs, and viral sound overlays.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Aesthetic', 'Action', 'Lo-Fi', 'Viral Edits'],
    gradient: 'from-purple-900/40 via-purple-800/20 to-black',
    accentColor: '#a855f7',
  },
  {
    id: 'cartoons',
    name: 'Cartoons & Classic Animation',
    count: '18,000+ Clips',
    description: 'Nostalgic 90s/2000s cartoon masterpieces, relatable comedy skits, retro edits, and viral childhood memories.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Nostalgia', 'Classic', 'Comedy', 'High Retention'],
    gradient: 'from-amber-900/40 via-amber-800/20 to-black',
    accentColor: '#f59e0b',
  },
  {
    id: 'motivation',
    name: 'Motivation & Mindset',
    count: '25,000+ Clips',
    description: 'Billionaire mindset speeches, workout discipline, cinematic monologue clips, dark academia, and stoic philosophy.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Gym', 'Mindset', 'Business', 'Success'],
    gradient: 'from-red-900/40 via-red-800/20 to-black',
    accentColor: '#ef4444',
  },
  {
    id: 'woodworking',
    name: 'Woodworking & Artisans',
    count: '15,000+ Clips',
    description: 'Mesmerizing timber transformations, Japanese joinery, epoxy river tables, and satisfying lathe turning.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Craft', 'Artisan', 'ASMR', 'DIY'],
    gradient: 'from-orange-950/40 via-amber-900/20 to-black',
    accentColor: '#f97316',
  },
  {
    id: 'satisfying',
    name: 'Oddly Satisfying & ASMR',
    count: '22,000+ Clips',
    description: 'Kinetic sand, soap slicing, industrial paint mixing, hydraulic press crushes, and hypnotic mechanical loops.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['ASMR', 'Hypnotic', 'Oddly Satisfying', 'Relaxing'],
    gradient: 'from-cyan-900/40 via-cyan-800/20 to-black',
    accentColor: '#06b6d4',
  },
  {
    id: '3d',
    name: '3D Animation & CGI Design',
    count: '16,000+ Clips',
    description: 'Blender & Unreal Engine simulations, surreal physics experiments, satisfying CGI balls, and futuristic motion.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Blender', 'Physics', 'Futuristic', 'Visual Effects'],
    gradient: 'from-indigo-900/40 via-indigo-800/20 to-black',
    accentColor: '#6366f1',
  },
  {
    id: 'cars',
    name: 'Cars & Supercars Automotive',
    count: '14,000+ Clips',
    description: 'Exotic hypercars, drift maneuvers, exhaust rev symphony, rolling night highway shots, and JDM car culture.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Supercars', 'Drift', 'Exotic', 'Soundtrack'],
    gradient: 'from-rose-900/40 via-rose-800/20 to-black',
    accentColor: '#f43f5e',
  },
  {
    id: 'travel',
    name: 'Travel, Nature & Scenery',
    count: '20,000+ Clips',
    description: 'Breathtaking drone overflights, Northern Lights, tropical waterfalls, Alpine mountain cabins, and ocean sunsets.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Nature', 'Wanderlust', 'Drone 4K', 'Peaceful'],
    gradient: 'from-emerald-900/40 via-emerald-800/20 to-black',
    accentColor: '#10b981',
  },
  {
    id: 'tech',
    name: 'Tech, Gadgets & Innovation',
    count: '12,000+ Clips',
    description: 'Unboxing aesthetics, workspace setups, smart home engineering, AI tools, and future innovation showcases.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Tech', 'Setups', 'Future', 'Gadgets'],
    gradient: 'from-blue-900/40 via-blue-800/20 to-black',
    accentColor: '#3b82f6',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does payment and Google Drive access verification work?',
    a: 'When you click Buy Now, scan our verified BharatPe UPI QR code and pay exactly ₹199 (or configured offer price). Enter your 12-digit UPI Reference Number (UTR) from your payment receipt. Once submitted, our server verifies the reference and instantly unlocks your Google Drive Master Vault link.',
  },
  {
    q: 'What resolution, format, and aspect ratio are the videos?',
    a: 'All files are vertical 9:16 format (1080x1920 Full HD) MP4 files at 60 FPS. They have no watermarks, logos, or burned-in subtitles, making them ready to edit directly.',
  },
  {
    q: 'Can I monetize these reels on YouTube, Instagram, or TikTok?',
    a: 'Yes! You are granted commercial usage rights for your personal and commercial content creation channels. You can add your voiceover, commentary, music, and captions to monetize across YouTube Shorts, Instagram Reels, TikTok, and Facebook.',
  },
  {
    q: 'What video editing software can I use with this pack?',
    a: 'The MP4 files are universally compatible with CapCut (PC & Mobile), Premiere Pro, DaVinci Resolve, VN Video Editor, Final Cut Pro, InShot, and Canva.',
  },
  {
    q: 'Do I get access to all 9 categories with this one-time payment?',
    a: 'Yes! The one-time payment unlocks complete access to the organized Master Google Drive collection containing all 9 categories (Anime, Cartoons, Motivation, Woodworking, Satisfying, 3D, Cars, Travel, Tech).',
  },
  {
    q: 'What if my payment is deducted but I face an issue with the UTR?',
    a: 'Don\'t worry! Our automated system checks your 12-digit UTR against BharatPe transaction records. If you need any manual support, submit our support form or contact Murari Panjiyar directly at Mpanjiyar100@gmail.com / +91 86388 75231.',
  },
];

export function StandaloneReelsOfferPage({
  currentTheme = 'normal',
  isAuthorized = false,
}: StandaloneReelsOfferPageProps) {
  // Storefront Config (Dynamic & completely editable by admin)
  const [config, setConfig] = useState({
    upiId: 'BHARATPE2J0A0P3W3B36214@unitype',
    receiverName: 'MURARI PANJIYAR',
    productPrice: 199.0,
    currency: 'INR',
    campaignName: 'Durga Puja Special Offer',
    productName: '150K+ MEGA PACK — REELS & SHORTS',
    headline: '150K+ MEGA PACK OF REELS & SHORTS',
    subtitle: 'Take your content creation to the next level with a massive collection of short-form videos for your creative projects.',
    badgeText: 'DURGA PUJA SPECIAL OFFER',
    masterDriveLink: '',
    customQrUrl: '',
    supportEmail: 'Mpanjiyar100@gmail.com',
    supportPhone: '+91 86388 75231',
  });

  // State (Name & Phone ONLY — NO Delivery Email!)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submittedUtr, setSubmittedUtr] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [orderStatus, setOrderStatus] = useState<'checkout' | 'submitting' | 'pending_approval' | 'approved' | 'rejected' | 'error'>('checkout');
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionProgress, setSubmissionProgress] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [unlockedDriveLink, setUnlockedDriveLink] = useState('');
  const [downloadToken, setDownloadToken] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [previewCategory, setPreviewCategory] = useState<CategoryCard | null>(null);

  // Order Lookup by Phone or ID
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Admin drawer state
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [adminDrawerTab, setAdminDrawerTab] = useState<'notifications' | 'orders' | 'config'>('orders');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(isAuthorized);
  const [adminForm, setAdminForm] = useState({ ...config });
  const [adminSaveStatus, setAdminSaveStatus] = useState<string>('');
  const [adminUnreadCount, setAdminUnreadCount] = useState<number>(0);

  // Support Form State (Name, Phone, Order ID, Message — NO mandatory email!)
  const [supportName, setSupportName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportOrderId, setSupportOrderId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [supportFeedback, setSupportFeedback] = useState('');

  // Toast banner
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch live config from server
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsAdminDrawerOpen(true);
      }
    } catch (_) {}

    fetch('/api/reels/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setConfig(prev => ({ ...prev, ...data.config }));
          setAdminForm(prev => ({ ...prev, ...data.config }));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch unread notifications count for admin
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/reels/admin/notifications');
        const data = await res.json();
        if (data.success && typeof data.unreadCount === 'number') {
          setAdminUnreadCount(data.unreadCount);
        }
      } catch (_) {}
    };
    fetchUnread();
  }, [isAdminDrawerOpen]);

  // Generate QR Code for UPI
  useEffect(() => {
    const activeOrderId = orderId || `RP-PUJA-${Date.now().toString(36).toUpperCase()}`;
    const amount = config.productPrice || 199.0;
    const payeeName = encodeURIComponent(config.receiverName);
    const note = encodeURIComponent(`${config.campaignName} ${activeOrderId}`);
    const upiPayload = `upi://pay?pa=${config.upiId}&pn=${payeeName}&am=${amount.toFixed(2)}&cu=INR&tn=${note}`;

    QRCode.toDataURL(upiPayload, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [config.upiId, config.receiverName, config.productPrice, config.campaignName, orderId]);

  // REAL-TIME APPROVAL LISTENER: Unlocks access only when Murari approves (Multi-Device Firestore + SSE)
  useEffect(() => {
    if (!orderId) return;

    // 1. Direct Firestore real-time listener across all devices
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      if (db) {
        unsubscribeFirestore = onSnapshot(
          doc(db, 'reels_orders', orderId),
          (snapshot) => {
            if (snapshot.exists()) {
              const liveData = snapshot.data();
              if (liveData.status === 'APPROVED') {
                setOrderStatus('approved');
                setUnlockedDriveLink(liveData.links?.masterGoogleDrive || config.masterDriveLink);
                setDownloadToken(liveData.downloadToken || '');
                showToast('🎉 Payment Verified & Approved by Murari Panjiyar! Access Unlocked.', 'success');
              } else if (liveData.status === 'REJECTED') {
                setOrderStatus('rejected');
                setRejectionReason(liveData.rejectionReason || 'UPI UTR could not be reconciled in BharatPe settlement.');
                showToast('Verification Unsuccessful. Please check details.', 'error');
              } else if (liveData.status === 'PENDING_ADMIN_REVIEW') {
                setOrderStatus('pending_approval');
              }
            }
          },
          (err) => {
            console.warn('Firestore real-time order listener note:', err);
          }
        );
      }
    } catch (fsErr) {
      console.warn('Firestore listener init error:', fsErr);
    }

    // 2. Server-Sent Events (SSE) stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/reels/events?orderId=${encodeURIComponent(orderId)}`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orderId === orderId || payload.id === orderId) {
            if (payload.eventType === 'ORDER_APPROVED') {
              setOrderStatus('approved');
              setUnlockedDriveLink(payload.masterDriveLink || config.masterDriveLink);
              setDownloadToken(payload.downloadToken || '');
              showToast('🎉 Payment Verified & Approved by Murari Panjiyar! Access Unlocked.', 'success');
            } else if (payload.eventType === 'ORDER_REJECTED') {
              setOrderStatus('rejected');
              setRejectionReason(payload.rejectionReason || 'UPI UTR could not be reconciled in BharatPe settlement.');
              showToast('Verification Unsuccessful. Please check details.', 'error');
            }
          }
        } catch (_) {}
      };
    } catch (_) {}

    // 3. Polling fallback while in pending approval state
    let pollInterval: NodeJS.Timeout | null = null;
    if (orderStatus === 'pending_approval') {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/reels/order-status/${orderId}`);
          const data = await res.json();
          if (data.success && data.order) {
            if (data.order.status === 'APPROVED') {
              setOrderStatus('approved');
              setUnlockedDriveLink(data.links?.masterGoogleDrive || config.masterDriveLink);
              setDownloadToken(data.order.downloadToken || '');
              showToast('🎉 Payment Verified & Approved by Murari Panjiyar! Access Unlocked.', 'success');
            } else if (data.order.status === 'REJECTED') {
              setOrderStatus('rejected');
              setRejectionReason(data.order.rejectionReason || 'UTR could not be reconciled.');
            }
          }
        } catch (_) {}
      }, 5000);
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, orderStatus, config.masterDriveLink]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Share exclusive standalone link
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?offer=reels`;
    navigator.clipboard.writeText(url);
    showToast('🎉 Exclusive Offer Link Copied! Sharing this link shows ONLY this offer with zero website access.');
  };

  // Open checkout and init order
  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    if (!orderId) {
      const newId = `RP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      setOrderId(newId);
    }
  };

  // Handle UTR Submission — STRICT BUSINESS LOGIC: Sets status to pending_approval!
  // No buyer can access Google Drive before Murari approves in the admin panel!
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const cleanUtr = utrNumber.replace(/[^\d]/g, '').trim();

    // Client-side validation: must strictly be 12 numeric digits
    if (!cleanUtr) {
      setErrorMessage('Please enter the 12-digit UPI Reference Number (UTR) from your payment receipt.');
      return;
    }
    if (cleanUtr.length !== 12) {
      setErrorMessage(`A valid UPI UTR must be exactly 12 numeric digits (currently ${cleanUtr.length} digits). Example: 428819034812.`);
      return;
    }
    if (/^(\d)\1{11}$/.test(cleanUtr)) {
      setErrorMessage('Invalid UTR: Repetitive dummy digits (e.g. 000000000000) are rejected.');
      return;
    }
    if (['123456789012', '012345678901', '987654321098'].includes(cleanUtr)) {
      setErrorMessage('Invalid UTR: Trivial sequential numbers are rejected.');
      return;
    }

    setOrderStatus('submitting');
    setErrorMessage('');
    setSubmissionProgress('Submitting payment details for verification...');

    try {
      const activeOrderId = orderId || `RP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      if (!orderId) setOrderId(activeOrderId);

      const submitPayload = {
        orderId: activeOrderId,
        utrReference: cleanUtr,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
      };

      const result = await submitPaymentReferenceWithRetry(submitPayload, {
        maxRetries: 4,
        initialDelayMs: 800,
        backoffFactor: 2,
        maxDelayMs: 5000,
        timeoutMs: 9000,
        onAttemptStart: (attempt, max) => {
          if (attempt > 1) {
            setSubmissionProgress(`Reconnecting to server (attempt ${attempt}/${max})...`);
          } else {
            setSubmissionProgress('Submitting payment reference...');
          }
        },
        onRetry: (attempt, max, delayMs, reason) => {
          const secs = (delayMs / 1000).toFixed(1);
          setSubmissionProgress(`Network issue (${reason}). Retrying in ${secs}s (attempt ${attempt + 1}/${max})...`);
        },
      });

      if (result.success && result.order) {
        const assignedId = result.order?.id || activeOrderId;
        setOrderId(assignedId);
        setSubmittedUtr(cleanUtr);
        setSubmittedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Also write/sync to Firestore for multi-device instant propagation
        if (db) {
          try {
            const nowIso = new Date().toISOString();
            await setDoc(
              doc(db, 'reels_orders', assignedId),
              {
                id: assignedId,
                productId: '150k-mega-reels-pack',
                productName: config.productName || '150K+ MEGA PACK — REELS & SHORTS',
                campaign: config.campaignName || 'Durga Puja Special Offer',
                amount: config.productPrice || 199.0,
                currency: 'INR',
                customerName: customerName.trim(),
                customerPhone: cleanPhone,
                status: result.order?.status || 'PENDING_ADMIN_REVIEW',
                utrReference: cleanUtr,
                submittedAt: nowIso,
                updatedAt: nowIso,
              },
              { merge: true }
            );
          } catch (fsSyncErr) {
            console.warn('Firestore live sync note:', fsSyncErr);
          }
        }

        if (result.order?.status === 'APPROVED') {
          setOrderStatus('approved');
          setUnlockedDriveLink(result.links?.masterGoogleDrive || '');
          setDownloadToken(result.order.downloadToken || '');
          showToast('🎉 Order already approved! Access granted.', 'success');
        } else {
          setOrderStatus('pending_approval');
          showToast('Payment submitted! Awaiting Murari Panjiyar verification.', 'info');
        }
        return;
      }

      // If backend returned a clear user validation or business conflict error (e.g. duplicate UTR or invalid phone)
      const isDefiniteValidationOrConflict = (err?: string) => {
        if (!err) return false;
        const lower = err.toLowerCase();
        if (
          lower.includes('network') ||
          lower.includes('timeout') ||
          lower.includes('failed to fetch') ||
          lower.includes('unexpected') ||
          lower.includes('server error') ||
          lower.includes('endpoint unavailable') ||
          lower.includes('404') ||
          lower.includes('500') ||
          lower.includes('502') ||
          lower.includes('503') ||
          lower.includes('504')
        ) {
          return false;
        }
        return true;
      };

      if (result.error && isDefiniteValidationOrConflict(result.error)) {
        setOrderStatus('error');
        setErrorMessage(result.error);
        showToast(result.error, 'error');
        return;
      }

      // If backend was unreachable after all retries, persist directly to Firestore
      if (db) {
        try {
          const nowIso = new Date().toISOString();
          await setDoc(
            doc(db, 'reels_orders', activeOrderId),
            {
              id: activeOrderId,
              productId: '150k-mega-reels-pack',
              productName: config.productName || '150K+ MEGA PACK — REELS & SHORTS',
              campaign: config.campaignName || 'Durga Puja Special Offer',
              amount: config.productPrice || 199.0,
              currency: 'INR',
              customerName: customerName.trim(),
              customerPhone: cleanPhone,
              status: 'PENDING_ADMIN_REVIEW',
              paymentMethod: 'UPI_BHARATPE',
              upiId: config.upiId,
              receiverName: config.receiverName,
              utrReference: cleanUtr,
              submittedAt: nowIso,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );

          // Also write alert notification
          const notifId = 'NOTIF-' + Date.now().toString(36).toUpperCase();
          await setDoc(
            doc(db, 'admin_notifications', notifId),
            {
              id: notifId,
              type: 'MANUAL_VERIFICATION_REQUEST',
              severity: 'INFO',
              title: 'New Manual UPI Payment Verification Request',
              message: `Murari, order ${activeOrderId} from ${customerName.trim()} (${cleanPhone}) has submitted UTR ${cleanUtr} for ₹199. Please verify BharatPe statement and approve.`,
              relatedOrderId: activeOrderId,
              customerName: customerName.trim(),
              customerPhone: cleanPhone,
              amount: 199,
              utrReference: cleanUtr,
              createdAt: nowIso,
              readAt: null,
              resolvedAt: null,
            },
            { merge: true }
          );

          setSubmittedUtr(cleanUtr);
          setSubmittedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setOrderStatus('pending_approval');
          showToast('Payment details saved. Murari Panjiyar has been notified for verification.', 'info');
          return;
        } catch (fsDirectErr) {
          console.warn('Firestore fallback write error:', fsDirectErr);
        }
      }

      setOrderStatus('error');
      setErrorMessage(result.error || 'Network connection interrupted after 4 retry attempts. Please check your internet connection and tap Submit again.');
      showToast('Connection issue after retries. Please retry submission.', 'error');
    } catch (finalErr: any) {
      setOrderStatus('error');
      setErrorMessage(finalErr?.message || 'Unable to connect to server. Please check your network and retry.');
    } finally {
      setSubmissionProgress('');
    }
  };

  // Handle Order Lookup by Phone or Order ID
  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const cleanQ = lookupQuery.trim();
    const digitsOnly = cleanQ.replace(/[^\d]/g, '');
    const isPhoneQuery = digitsOnly.length >= 10;
    const isOrderQuery = cleanQ.toUpperCase().startsWith('RP-') || cleanQ.length >= 6;

    if (!cleanQ || (!isPhoneQuery && !isOrderQuery)) {
      setLookupError('Please enter a valid 10-digit registered Phone Number or Order ID (e.g. RP-...). Without a valid mobile number or order ID, access cannot be granted.');
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await fetch('/api/reels/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQ }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderId(data.order.id);
        setCustomerName(data.order.customerName);
        setCustomerPhone(data.order.customerPhone);
        setSubmittedUtr(data.order.utrReference || '');
        if (data.order.status === 'APPROVED') {
          setOrderStatus('approved');
          setUnlockedDriveLink(data.links?.masterGoogleDrive || '');
          setDownloadToken(data.order.downloadToken || '');
          showToast('Verified purchase found! Google Drive unlocked.', 'success');
        } else if (data.order.status === 'REJECTED') {
          setOrderStatus('rejected');
          setRejectionReason(data.order.rejectionReason || 'UTR not verified.');
        } else {
          setOrderStatus('pending_approval');
          showToast('Order found! Awaiting Murari Panjiyar approval.', 'info');
        }
        setIsCheckoutOpen(true);
        setIsLookupOpen(false);
      } else {
        setLookupError(data.error || 'No matching order found. Without a valid mobile number or approved Order ID, access cannot be granted.');
      }
    } catch {
      setLookupError('Network error looking up order. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle Support Ticket Submit (NO Delivery Email!)
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportMessage) {
      setSupportFeedback('Please fill in your name and message.');
      return;
    }

    setSupportStatus('sending');
    setSupportFeedback('');

    try {
      const res = await fetch('/api/reels/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName,
          phone: supportPhone || '',
          orderId: supportOrderId,
          message: supportMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSupportStatus('success');
        setSupportFeedback(data.message || 'Thank you! Your inquiry has been submitted to Murari Panjiyar.');
        setSupportName('');
        setSupportPhone('');
        setSupportOrderId('');
        setSupportMessage('');
      } else {
        setSupportStatus('error');
        setSupportFeedback(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setSupportStatus('error');
      setSupportFeedback('Network error submitting inquiry.');
    }
  };

  // Admin Save Settings
  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSaveStatus('Saving changes...');

    try {
      const res = await fetch('/api/reels/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm),
      });

      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setAdminSaveStatus('✅ Settings saved & applied live to storefront!');
        showToast('✅ Storefront settings updated successfully!', 'success');
        setTimeout(() => setAdminSaveStatus(''), 3000);
      } else {
        setAdminSaveStatus('❌ Error: ' + (data.error || 'Failed to save'));
      }
    } catch {
      setAdminSaveStatus('❌ Network error saving settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-amber-500 selection:text-black font-sans antialiased overflow-x-hidden relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-xs font-mono font-bold shadow-2xl flex items-center gap-2 border ${
              toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : 'bg-zinc-900/95 text-amber-300 border-amber-500/50'
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Durga Puja Offer Popup & Floating Reopen Badge */}
      <DurgaPujaOfferPopup
        currentTheme={currentTheme}
        isAuthorized={isAuthorized}
        isCheckoutActive={isCheckoutOpen}
        onUnlockPack={() => handleOpenCheckout()}
        onExploreCategories={() => {
          const catSection = document.getElementById('categories-section');
          if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Ambient Lighting & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-red-600/20 via-amber-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-[40%] -left-40 w-[500px] h-[500px] bg-red-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[60%] -right-40 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full" />
      </div>

      {/* A. Dedicated Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Campaign */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Film size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm tracking-wider text-white">
                  150K+ CREATOR VAULT
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                  Puja Special
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                Curated by Murari Panjiyar
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-zinc-300">
            <a href="#hero" className="hover:text-amber-400 transition-colors">Home</a>
            <a href="#categories-section" className="hover:text-amber-400 transition-colors">Explore Categories</a>
            <a href="#included-section" className="hover:text-amber-400 transition-colors">What's Included</a>
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a>
            <a href="#faq-section" className="hover:text-amber-400 transition-colors">FAQ</a>
            <a href="#support-section" className="hover:text-amber-400 transition-colors">Support</a>
          </nav>

          {/* Action Buttons: Share Link & Buy Now CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCopyShareLink}
              title="Copy link to share ONLY this offer (customers cannot access website)"
              className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Share Offer</span>
            </button>


            <button
              type="button"
              onClick={handleOpenCheckout}
              className="px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
            >
              <Zap size={14} className="fill-black stroke-black" />
              <span>Buy Now — ₹{Math.round(config.productPrice)}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* B. Hero Section */}
        <section id="hero" className="text-center pt-4 sm:pt-8 space-y-6 max-w-4xl mx-auto">
          {/* Festive Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>{config.badgeText || 'DURGA PUJA SPECIAL OFFER'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-sans text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400"
          >
            {config.headline || '150K+ MEGA PACK OF REELS & SHORTS'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed"
          >
            {config.subtitle ||
              'Take your content creation to the next level with a massive collection of short-form videos for your creative projects.'}
          </motion.p>

          {/* Prominent Price Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-zinc-500 line-through text-sm sm:text-base font-mono">₹4,999</span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400">
                ONLY ₹{Math.round(config.productPrice)}/-
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                96% OFF
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 text-left">
              One-Time Lifetime Payment • Instant Google Drive Delivery
            </div>
          </motion.div>

          {/* CTAs Stack */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={handleOpenCheckout}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-mono font-black text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Zap size={18} className="fill-black stroke-black" />
              <span>Unlock 150K+ Reels for ₹{Math.round(config.productPrice)}</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="#categories-section"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-mono font-bold text-sm bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Layers size={16} className="text-amber-400" />
              <span>Browse 9 Categories</span>
            </a>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl font-mono font-bold text-xs bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Copy link to share only this offer"
            >
              <Share2 size={15} />
              <span>Copy Share Link</span>
            </button>
          </div>

          {/* Verified Fact-Based Inclusions Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2.5 text-left">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">No Watermarks</div>
                <div className="text-zinc-400 font-mono text-[10px]">Clean MP4 Source</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2.5 text-left">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">9:16 Vertical HD</div>
                <div className="text-zinc-400 font-mono text-[10px]">1080x1920 60 FPS</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2.5 text-left">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">Google Drive Vault</div>
                <div className="text-zinc-400 font-mono text-[10px]">Instant Master Link</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-2.5 text-left">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">Commercial Rights</div>
                <div className="text-zinc-400 font-mono text-[10px]">YouTube / Insta / TikTok</div>
              </div>
            </div>
          </div>
        </section>

        {/* C. Categories Section */}
        <section id="categories-section" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              High-Retention Niches
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white">
              Explore Available Categories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Every category is meticulously organized with high-bitrate vertical clips. All 9 categories are bundled together inside the Master Google Drive Vault.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CATEGORIES_DATA.map(category => (
              <div
                key={category.id}
                className="group relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/10 hover:border-amber-500/40 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 font-bold uppercase">
                      {category.sampleAspect}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400">
                      {category.count}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {category.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Action (No external Drive link, purely informational preview) */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPreviewCategory(category)}
                    className="text-xs font-mono text-zinc-300 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <Play size={12} className="fill-current text-amber-400" />
                    <span>Preview Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCheckout}
                    className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Get Access</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* D. What's Included Section */}
        <section id="included-section" className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 border border-amber-500/20 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              Transparent & Verified Deliverables
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white">
              What Is Included In Your ₹{Math.round(config.productPrice)} Purchase
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Only factual features verified to exist in the collection are listed below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Video size={20} />
              </div>
              <h4 className="font-bold text-white text-base">Master Google Drive Vault</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct access to our master Google Drive containing all 9 folders. Add as shortcut to your own Google Drive or download in batches with high-speed transfer.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Film size={20} />
              </div>
              <h4 className="font-bold text-white text-base">Standard Vertical MP4 Formats</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                1080x1920 9:16 vertical MP4 format clips. Clean frames with no embedded logos, ready to import into CapCut, Premiere, or InShot.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-white text-base">Creator Commercial License</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Full permission to remix, overlay sound, add narration, and publish across your monetized social accounts with peace of mind.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleOpenCheckout}
              className="px-8 py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              GET ACCESS FOR ₹{Math.round(config.productPrice)}
            </button>
          </div>
        </section>

        {/* E. How It Works Section */}
        <section id="how-it-works" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              Step-by-Step Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Four simple steps from discovery to downloading your 150K+ clips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3 relative">
              <span className="text-2xl font-mono font-black text-amber-500">01</span>
              <h4 className="font-bold text-white text-sm">Explore the Product</h4>
              <p className="text-xs text-zinc-400">
                Browse our 9 video categories, clip counts, and sample aspects to verify suitability for your channels.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3 relative">
              <span className="text-2xl font-mono font-black text-orange-500">02</span>
              <h4 className="font-bold text-white text-sm">Pay ₹{Math.round(config.productPrice)} via UPI</h4>
              <p className="text-xs text-zinc-400">
                Scan our official BharatPe QR code using GPay, PhonePe, Paytm, or BHIM for exactly ₹{Math.round(config.productPrice)}.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3 relative">
              <span className="text-2xl font-mono font-black text-red-500">03</span>
              <h4 className="font-bold text-white text-sm">Submit 12-Digit UTR</h4>
              <p className="text-xs text-zinc-400">
                Enter the 12-digit transaction reference number from your payment receipt for instant validation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3 relative">
              <span className="text-2xl font-mono font-black text-emerald-400">04</span>
              <h4 className="font-bold text-white text-sm">Unlock Google Drive</h4>
              <p className="text-xs text-zinc-400">
                Your order is verified and your Master Google Drive Vault link is unlocked immediately.
              </p>
            </div>
          </div>
        </section>

        {/* F. FAQ & Support Section */}
        <section id="faq-section" className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              Answers & Assistance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-zinc-900/70 border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-200 hover:text-white cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-amber-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Support Form Section */}
          <div id="support-section" className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-5">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
                <MessageSquare size={18} className="text-amber-400" />
                <span>Customer Support Desk</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Have an inquiry about your order or download? Send a message directly to Murari Panjiyar.
              </p>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={supportName}
                    onChange={e => setSupportName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={supportPhone}
                    onChange={e => setSupportPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Order ID (optional)</label>
                <input
                  type="text"
                  value={supportOrderId}
                  onChange={e => setSupportOrderId(e.target.value)}
                  placeholder="e.g. RP-PUJA-SAMPLE199"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Your Message *</label>
                <textarea
                  required
                  rows={3}
                  value={supportMessage}
                  onChange={e => setSupportMessage(e.target.value)}
                  placeholder="Describe your question or issue..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {supportFeedback && (
                <div className={`p-3 rounded-xl text-xs font-mono ${
                  supportStatus === 'success' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/70 text-red-300 border border-red-500/30'
                }`}>
                  {supportFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={supportStatus === 'sending'}
                className="w-full py-3 rounded-xl font-mono font-bold text-xs uppercase bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {supportStatus === 'sending' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-amber-400" />
                    <span>Sending Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} className="text-amber-400" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 px-4 sm:px-6 py-8 text-center text-xs text-zinc-500 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400">
          <span>Receiver: {config.receiverName}</span>
          <span>•</span>
          <span>UPI: {config.upiId}</span>
          <span>•</span>
          <span>Email: {config.supportEmail}</span>
          <span>•</span>
          <span>Phone: {config.supportPhone}</span>
        </div>
        <p>© 2026 150K+ Reels Pack — Durga Puja Special Offer. All Rights Reserved.</p>
        <div>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Share2 size={12} />
            <span>Copy Exclusive Offer Link (Share Only This Page)</span>
          </button>
        </div>
      </footer>

      {/* ==========================================
          CHECKOUT MODAL / DRAWER
          ========================================== */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full ${orderStatus === 'approved' ? 'max-w-5xl' : 'max-w-2xl'} bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl p-4 sm:p-7 z-10 space-y-5 max-h-[92vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-black">
                    <Zap size={16} className="fill-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {orderStatus === 'approved' ? 'Access Unlocked — Mega Pack Directory' : orderStatus === 'pending_approval' ? 'Verification in Progress' : 'Secure UPI Checkout'}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400">
                      Order Reference: <span className="text-amber-400 font-bold">{orderId}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* STATE 1: APPROVED STATE (Only unlocked when Murari approves in admin) */}
              {orderStatus === 'approved' ? (
                <div className="space-y-6 py-2">
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-xl font-black text-white">Payment Verified &amp; Approved!</h4>
                    <p className="text-xs text-emerald-300 max-w-xl mx-auto">
                      Murari Panjiyar has verified your ₹199 UPI payment against BharatPe records. Your authorized access to the complete 150K+ Mega Pack Bundle Directory is unlocked below!
                    </p>
                  </div>

                  {/* Render the full interactive Clickable Bundle Directory with 53 cards */}
                  <MegaPackBundleDirectory
                    masterDriveLink={unlockedDriveLink}
                    downloadToken={downloadToken}
                    customerName={customerName}
                    orderId={orderId}
                    onCopyLink={handleCopy}
                    copiedLabel={copiedLink}
                  />

                  {/* Direct API Token Link */}
                  {downloadToken && (
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-zinc-400 truncate">Cryptographic Token: {downloadToken.slice(0, 24)}...</span>
                      <a
                        href={`/api/reels/download/${downloadToken}?category=all`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0 flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Direct API</span>
                      </a>
                    </div>
                  )}

                  {/* Order Receipt and Support */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 space-y-1">
                    <strong className="text-zinc-300 block font-mono">💡 Order Receipt &amp; Usage Rights:</strong>
                    <p>• Save your Order Reference (<strong>{orderId}</strong>) or registered phone number (<strong>{customerPhone}</strong>) for retrieval.</p>
                    <p>• Commercial editing permitted for YouTube Shorts, Instagram Reels, and TikTok.</p>
                    <p>• Need support? Murari Panjiyar is available at {config.supportPhone} or {config.supportEmail}.</p>
                  </div>
                </div>
              ) : orderStatus === 'pending_approval' ? (
                /* STATE 2: STRICT PENDING ADMIN APPROVAL STATE */
                <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                    <Clock size={32} className="animate-spin text-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Status: PENDING_ADMIN_REVIEW
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Order Awaiting Administrator Approval
                    </h3>
                    <p className="text-xs text-amber-200/90 max-w-lg mx-auto leading-relaxed">
                      Your payment details have been submitted successfully. Your order is awaiting administrator verification. You will receive download access on this website after approval.
                    </p>
                  </div>

                  {/* Submission Summary Card */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 max-w-md mx-auto text-left text-xs font-mono space-y-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Order ID:</span>
                      <strong className="text-amber-400">{orderId}</strong>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Customer Name:</span>
                      <strong className="text-white">{customerName}</strong>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Phone Number:</span>
                      <strong className="text-white">{customerPhone}</strong>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Amount Paid:</span>
                      <strong className="text-emerald-400">₹{Math.round(config.productPrice)} INR</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Submitted UTR:</span>
                      <strong className="text-amber-300 tracking-wider">{submittedUtr || utrNumber}</strong>
                    </div>
                  </div>

                  {/* Real-time SSE / Radar Pulse Indicator */}
                  <div className="pt-1 flex items-center justify-center gap-2.5 text-xs font-mono text-amber-300">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                    <span>Murari Panjiyar is reviewing BharatPe settlement records. This screen updates automatically.</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/reels/order-status/${orderId}`);
                          const d = await res.json();
                          if (d.success && d.order?.status === 'APPROVED') {
                            setOrderStatus('approved');
                            setUnlockedDriveLink(d.links?.masterGoogleDrive || config.masterDriveLink);
                            setDownloadToken(d.order?.downloadToken || '');
                            showToast('Order approved! Download unlocked.', 'success');
                          } else {
                            showToast('Verification still under review. Please allow a moment.', 'info');
                          }
                        } catch {
                          showToast('Network error checking status', 'error');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw size={13} />
                      <span>Check Approval Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-5 py-2.5 rounded-xl font-mono text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : orderStatus === 'rejected' ? (
                /* STATE 3: REJECTED STATE */
                <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                    <X size={30} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                      Status: REJECTED
                    </span>
                    <h3 className="text-xl font-bold text-white pt-2">Payment Verification Unsuccessful</h3>
                    <p className="text-xs text-red-300 max-w-md mx-auto">
                      {rejectionReason || 'The 12-digit UPI reference number could not be reconciled with the merchant statement.'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderStatus('checkout');
                        setUtrNumber('');
                      }}
                      className="py-2.5 px-5 rounded-xl text-xs font-mono font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      Re-enter Correct 12-Digit UTR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        const sup = document.getElementById('support-desk');
                        if (sup) sup.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="py-2.5 px-5 rounded-xl text-xs font-mono font-bold border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Contact Murari Support
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE 4: CLEAN CHECKOUT & UTR SUBMISSION (Name & Phone ONLY — NO Delivery Email!) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Left: BharatPe QR Code & Payee */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 text-center space-y-3.5 flex flex-col items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase text-amber-400">
                        Step 1: Scan &amp; Pay ₹{Math.round(config.productPrice)}
                      </span>
                      <div className="text-xs text-zinc-300">
                        Verified Receiver: <strong className="text-white">{config.receiverName}</strong>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="BharatPe UPI Payment QR"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-black text-xs font-mono">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    {/* UPI ID & Copy button */}
                    <div className="w-full space-y-1.5">
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-2 px-3">
                        <span className="text-[11px] font-mono text-amber-300 truncate select-all">
                          {config.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(config.upiId, 'UPI ID')}
                          className="p-1 rounded text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedLink === 'UPI ID' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(config.upiId, 'UPI ID')}
                        className="w-full py-2 rounded-xl text-[11px] font-mono font-bold bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        Copy UPI ID: {config.upiId}
                      </button>
                    </div>
                  </div>

                  {/* Right: Enter Customer Details & 12-Digit UTR */}
                  <form onSubmit={handleSubmitUtr} className="space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase text-amber-400 block">
                          Step 2: Enter Details &amp; UTR
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Amount: <strong className="text-emerald-400">₹{Math.round(config.productPrice)}</strong>
                        </span>
                      </div>

                      {/* Customer Full Name (Required) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 font-bold">
                          <User size={12} className="text-amber-400" />
                          <span>Full Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Phone Number (Required — NO Delivery Email!) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 font-bold">
                          <Phone size={12} className="text-amber-400" />
                          <span>10-Digit Mobile Phone Number *</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-zinc-900 text-zinc-400 text-xs font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="9876543210"
                            className="w-full px-3 py-2.5 rounded-r-xl bg-black/60 border border-white/10 text-white text-xs font-mono tracking-wider focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          Used to track your order and recover access anytime.
                        </p>
                      </div>

                      {/* 12-Digit UPI Reference Number (UTR) */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
                            <span>12-Digit UPI Reference (UTR) *</span>
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {utrNumber.replace(/[^\d]/g, '').length}/12 Digits
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          placeholder="e.g. 428819034812"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-amber-500/50 text-amber-300 text-sm font-mono tracking-widest focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <p className="text-[10px] text-zinc-400 font-mono">
                          Found in Google Pay, PhonePe, Paytm, or BHIM after transaction.
                        </p>
                      </div>

                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
                          {errorMessage}
                        </div>
                      )}

                      {submissionProgress && orderStatus === 'submitting' && (
                        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                          <RefreshCw size={14} className="animate-spin text-amber-400 shrink-0" />
                          <span>{submissionProgress}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="submit"
                        disabled={orderStatus === 'submitting'}
                        className="w-full py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {orderStatus === 'submitting' ? (
                          <>
                            <RefreshCw size={15} className="animate-spin text-black" />
                            <span>{submissionProgress || 'Submitting for Verification...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Submit for Admin Approval</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCheckoutOpen(false);
                            setIsLookupOpen(true);
                          }}
                          className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors underline cursor-pointer"
                        >
                          Already paid? Check Order Status / Track Approval
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ORDER LOOKUP MODAL (Track Approval Status)
          ========================================== */}
      <AnimatePresence>
        {isLookupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLookupOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 z-10 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Track Order &amp; Access</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Check approval status or regain access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLookupOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLookupOrder} className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold block">10-Digit Phone Number or Order ID *</label>
                  <input
                    type="text"
                    required
                    value={lookupQuery}
                    onChange={e => setLookupQuery(e.target.value)}
                    placeholder="e.g. 9876543210 or RP-PUJA-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Enter the phone number or Order Reference used during checkout.
                  </p>
                </div>

                {lookupError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs">
                    {lookupError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isLookingUp ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-black" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>Find My Order</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          CATEGORY PREVIEW MODAL
          ========================================== */}
      <AnimatePresence>
        {previewCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewCategory(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    Category Details
                  </span>
                  <h3 className="text-lg font-bold text-white">{previewCategory.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewCategory(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <p>{previewCategory.description}</p>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1 font-mono text-[11px]">
                  <div>Verified Count: <strong className="text-amber-400">{previewCategory.count}</strong></div>
                  <div>Format: <strong className="text-white">{previewCategory.sampleAspect}</strong></div>
                  <div>Tags: <strong className="text-zinc-400">{previewCategory.tags.join(', ')}</strong></div>
                </div>
                <p className="text-[11px] text-zinc-400">
                  All folders and clips in this category are bundled in the Google Drive Master Vault provided after checkout.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCategory(null);
                    handleOpenCheckout();
                  }}
                  className="w-full py-3 rounded-xl font-mono font-black text-xs uppercase bg-gradient-to-r from-red-600 to-amber-500 text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Zap size={14} className="fill-black" />
                  <span>Get Access — ₹{Math.round(config.productPrice)}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ADMIN CONTROL DRAWER (Notifications, Purchases, Settings)
          ========================================== */}
      <AnimatePresence>
        {isAdminDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl h-full bg-zinc-950 border-l border-white/10 p-5 sm:p-7 z-10 overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white text-base">Murari Panjiyar — Administrator Desk</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminDrawerOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {!adminUnlocked ? (
                <div className="space-y-4 py-12 max-w-sm mx-auto text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Lock size={22} />
                  </div>
                  <h4 className="text-base font-bold text-white">Administrator Passkey Required</h4>
                  <p className="text-xs text-zinc-400">
                    Enter your administrative passkey to access notifications, purchase verification, and storefront settings:
                  </p>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (adminPasswordInput === 'Dispur123@' || isAuthorized) {
                        setAdminUnlocked(true);
                        showToast('Admin controls unlocked!');
                      } else {
                        showToast('Invalid admin password', 'error');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl font-mono font-bold text-xs bg-amber-500 text-black cursor-pointer shadow-lg"
                  >
                    Unlock Admin Panel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Admin Navigation Tabs */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setAdminDrawerTab('orders')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                        adminDrawerTab === 'orders'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <ShoppingBag size={13} />
                      <span>Purchases &amp; Approvals</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminDrawerTab('notifications')}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                        adminDrawerTab === 'notifications'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Bell size={13} />
                      <span>Alerts &amp; Notifications</span>
                      {adminUnreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-600 text-white animate-pulse">
                          {adminUnreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminDrawerTab('config')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                        adminDrawerTab === 'config'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Settings size={13} />
                      <span>Storefront Settings</span>
                    </button>
                  </div>

                  {/* TAB 1: PURCHASES & APPROVALS */}
                  {adminDrawerTab === 'orders' && (
                    <div className="pt-2">
                      <AdminPurchaseManager
                        currentTheme="dark"
                        triggerToast={(msg, t) => showToast(msg, t)}
                      />
                    </div>
                  )}

                  {/* TAB 2: ALERTS & NOTIFICATIONS */}
                  {adminDrawerTab === 'notifications' && (
                    <div className="pt-2">
                      <AdminNotificationsPanel
                        currentTheme="dark"
                        triggerToast={(msg, t) => showToast(msg, t)}
                        onOpenOrderReview={() => setAdminDrawerTab('orders')}
                      />
                    </div>
                  )}

                  {/* TAB 3: STOREFRONT SETTINGS */}
                  {adminDrawerTab === 'config' && (
                    <form onSubmit={handleSaveAdminConfig} className="space-y-4 text-xs font-mono pt-2 max-w-xl">
                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Selling Price (INR ₹):</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={adminForm.productPrice}
                          onChange={e => setAdminForm({ ...adminForm, productPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-amber-300 text-sm font-bold focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Master Google Drive Vault Link:</label>
                        <textarea
                          rows={2}
                          required
                          value={adminForm.masterDriveLink}
                          onChange={e => setAdminForm({ ...adminForm, masterDriveLink: e.target.value })}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Headline Text:</label>
                        <input
                          type="text"
                          required
                          value={adminForm.headline}
                          onChange={e => setAdminForm({ ...adminForm, headline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Subtitle Text:</label>
                        <textarea
                          rows={2}
                          value={adminForm.subtitle}
                          onChange={e => setAdminForm({ ...adminForm, subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Campaign Badge Text:</label>
                        <input
                          type="text"
                          value={adminForm.badgeText}
                          onChange={e => setAdminForm({ ...adminForm, badgeText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">BharatPe UPI ID:</label>
                        <input
                          type="text"
                          required
                          value={adminForm.upiId}
                          onChange={e => setAdminForm({ ...adminForm, upiId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Payment Receiver Name:</label>
                        <input
                          type="text"
                          required
                          value={adminForm.receiverName}
                          onChange={e => setAdminForm({ ...adminForm, receiverName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Support Email:</label>
                        <input
                          type="email"
                          value={adminForm.supportEmail}
                          onChange={e => setAdminForm({ ...adminForm, supportEmail: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 block">Support Phone:</label>
                        <input
                          type="text"
                          value={adminForm.supportPhone}
                          onChange={e => setAdminForm({ ...adminForm, supportPhone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {adminSaveStatus && (
                        <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-xs">
                          {adminSaveStatus}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-mono font-black text-xs uppercase bg-amber-500 hover:bg-amber-400 text-black transition-colors cursor-pointer shadow-lg"
                      >
                        Save &amp; Apply Changes Live
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discreet Fixed Admin Corner Trigger in Bottom-Right Corner (Master Prompt Spec 5) */}
      <AdminCornerTrigger
        currentTheme={currentTheme}
        isAuthorized={isAuthorized}
        onOpenAdmin={() => setIsAdminDrawerOpen(true)}
      />

    </div>
  );
}
