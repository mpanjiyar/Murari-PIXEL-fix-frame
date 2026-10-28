import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import {
  X,
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
  Lock,
  Share2,
  FolderCheck,
  AlertCircle,
  Clock,
  User,
  Phone,
  Search,
  Tag,
  AlertTriangle,
  XCircle,
  QrCode
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, getDoc, getDocs, collection } from 'firebase/firestore';
import { ReelPurchaseOrder, ReelOrderStatus } from '../types';
import { submitPaymentReferenceWithRetry } from '../utils/retryWithBackoff';

interface ReelsPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: 'light' | 'normal' | 'mono';
  initialTab?: 'checkout' | 'categories' | 'included' | 'faq' | 'track';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface CategoryInfo {
  id: string;
  name: string;
  count: string;
  description: string;
  sampleAspect: string;
  tags: string[];
  gradient: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'anime',
    name: 'Anime & Shonen Hits',
    count: '20,000+ Clips',
    description: 'High-octane fights, 4K aesthetics, lo-fi cyberpunk edits, shonen character arcs, and viral sound overlays.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Aesthetic', 'Action', 'Lo-Fi', 'Viral Edits'],
    gradient: 'from-purple-600/30 to-pink-600/30',
  },
  {
    id: 'cartoons',
    name: 'Cartoons & Classic Animation',
    count: '18,000+ Clips',
    description: 'Nostalgic 90s/2000s cartoon masterpieces, relatable comedy skits, retro edits, and viral childhood memories.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Nostalgia', 'Classic', 'Memes', 'Humor'],
    gradient: 'from-amber-600/30 to-yellow-600/30',
  },
  {
    id: 'motivation',
    name: 'Motivation, Gym & Mindset',
    count: '25,000+ Clips',
    description: 'Stoic discipline, luxury entrepreneur lifestyle, bodybuilding aesthetics, speech monologues, and hustle quotes.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Hustle', 'Gym', 'Discipline', 'Luxury'],
    gradient: 'from-red-600/30 to-orange-600/30',
  },
  {
    id: 'woodworking',
    name: 'Woodworking & Artisan Craft',
    count: '14,000+ Clips',
    description: 'Precision Japanese joinery, epoxy river tables, chisel carving, timber turning, and hypnotic woodworking restoration.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Craft', 'Artisan', 'Satisfying', 'Woodwork'],
    gradient: 'from-amber-800/30 to-orange-700/30',
  },
  {
    id: 'satisfying',
    name: 'Satisfying & ASMR Kinetic Loops',
    count: '16,000+ Clips',
    description: 'Kinetic sand slicing, hydraulic press crushing, paint mixing harmony, pottery spins, and sensory ASMR loops.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['ASMR', 'Satisfying', 'Relaxing', 'Loops'],
    gradient: 'from-teal-600/30 to-cyan-600/30',
  },
  {
    id: 'animation3d',
    name: '3D CGI & Motion Graphics',
    count: '15,000+ Clips',
    description: 'Surreal Blender visual physics, fluid simulations, futuristic cyber environments, and infinite 3D loops.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Blender', 'CGI', 'VFX', 'Futuristic'],
    gradient: 'from-blue-600/30 to-indigo-600/30',
  },
  {
    id: 'cars',
    name: 'Supercars & JDM Automotive',
    count: '18,000+ Clips',
    description: 'Exotic hypercars, track drifting, night highway rolls, exhaust rev symphonies, and clean cinematic auto edits.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Supercars', 'JDM', 'Drift', 'Cinematic'],
    gradient: 'from-rose-600/30 to-red-600/30',
  },
  {
    id: 'travel',
    name: 'Travel, Nature & Scenery 4K',
    count: '16,000+ Clips',
    description: 'Drone mountain flights, Aurora Borealis, tropical waterfalls, Alpine log cabins, and wanderlust travel reels.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Nature', 'Wanderlust', '4K Drone', 'Peaceful'],
    gradient: 'from-emerald-600/30 to-teal-600/30',
  },
  {
    id: 'other',
    name: 'Bonus: Tech, Gym & Aesthetics',
    count: '12,000+ Clips',
    description: 'Unboxing setups, smart gadgets, wristwatches, street food masterclasses, and viral lifestyle audio clips.',
    sampleAspect: '9:16 Vertical HD',
    tags: ['Gadgets', 'Tech', 'Food', 'Lifestyle'],
    gradient: 'from-violet-600/30 to-purple-600/30',
  },
];

export const ReelsPackModal: React.FC<ReelsPackModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'normal',
  initialTab = 'checkout',
  triggerToast = () => {},
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'checkout' | 'categories' | 'included' | 'faq' | 'track'>(initialTab);

  // Configuration
  const [storeConfig, setStoreConfig] = useState({
    upiId: 'BHARATPE2J0A0P3W3B36214@unitype',
    receiverName: 'MURARI PANJIYAR',
    productPrice: 199.0,
    currency: 'INR',
    campaignName: 'Puja Special Offer',
    productName: '150K+ MEGA PACK — REELS & SHORTS',
    headline: '150K+ MEGA PACK OF REELS & SHORTS',
    subtitle: 'Take your content creation to the next level with a massive collection of short-form videos for your creative projects.',
    badgeText: 'PUJA SPECIAL OFFER',
    masterDriveLink: '',
    customQrUrl: '',
    supportEmail: 'Mpanjiyar100@gmail.com',
    supportPhone: '+91 86388 75231',
    autoApprovalTestMode: false,
  });

  // Customer form inputs (Name & Phone ONLY — strictly blank for new orders)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Submitted order display summary (holds data of submitted order for receipt card, separate from input fields)
  const [submittedOrderSummary, setSubmittedOrderSummary] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    utrReference: string;
    amount: number;
    submittedAt?: string;
  } | null>(null);

  // Order lifecycle states
  // Order lifecycle states (strictly empty until verified and approved by admin)
  const [orderId, setOrderId] = useState<string>(() => {
    return localStorage.getItem('last_reels_order_id') || '';
  });
  const [orderStatus, setOrderStatus] = useState<ReelOrderStatus>('PENDING_PAYMENT');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  // Security gate: Google Drive Master Link starts strictly empty, only populated if order status is explicitly APPROVED
  const [masterDriveUrl, setMasterDriveUrl] = useState<string>('');

  // UI state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [submissionStatusText, setSubmissionStatusText] = useState<string>('');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  // Track order lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [verifyOrderIdInput, setVerifyOrderIdInput] = useState('');
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);

  // Support inquiry states (Name & Phone ONLY)
  const [supportName, setSupportName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const isLight = currentTheme === 'light';

  // Fetch live store config on load (Branding, UPI, Price ONLY — never reveals Master Drive link to unverified users)
  useEffect(() => {
    fetch('/api/reels/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setStoreConfig(prev => ({ ...prev, ...data.config }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // If there's an existing order in session/localStorage, strictly check its current verification status
  useEffect(() => {
    if (orderId && orderId.trim()) {
      fetch(`/api/reels/order-status/${encodeURIComponent(orderId.trim())}`)
        .then(res => res.json())
        .then(async data => {
          if (data.success && data.order) {
            setOrderStatus(data.order.status);
            // Strictly decouple: populate submittedOrderSummary for display cards ONLY.
            // NEVER overwrite the active customerName, customerPhone, or utrNumber form inputs!
            setSubmittedOrderSummary({
              id: data.order.id || orderId.trim(),
              customerName: data.order.customerName || '',
              customerPhone: data.order.customerPhone || '',
              utrReference: data.order.utrReference || '',
              amount: data.order.amount || storeConfig.productPrice || 199,
              submittedAt: data.order.submittedAt || data.order.createdAt,
            });
            if (data.order.rejectionReason) setRejectionReason(data.order.rejectionReason);

            // Access gate: ONLY unlock Google Drive link if status is explicitly APPROVED
            if (data.order.status === 'APPROVED' || data.order.status === 'approved') {
              const approvedUrl = data.links?.masterGoogleDrive || data.order.masterDriveLink || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId.trim()}` : '');
              setDownloadToken(data.order.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
              setMasterDriveUrl(approvedUrl);
            } else {
              setDownloadToken(null);
              setMasterDriveUrl('');
            }
          } else {
            // Direct Firestore fallback before resetting to PENDING_PAYMENT
            if (db) {
              try {
                const snap = await getDoc(doc(db, 'reels_orders', orderId.trim()));
                if (snap.exists()) {
                  const liveData = snap.data() as ReelPurchaseOrder;
                  setSubmittedOrderSummary({
                    id: liveData.id || orderId.trim(),
                    customerName: liveData.customerName || '',
                    customerPhone: liveData.customerPhone || '',
                    utrReference: liveData.utrReference || '',
                    amount: liveData.amount || storeConfig.productPrice || 199,
                    submittedAt: liveData.submittedAt || liveData.createdAt,
                  });
                  setOrderStatus(liveData.status);
                  if (liveData.status === 'APPROVED' || liveData.status === 'approved') {
                    const approvedUrl = liveData.masterDriveLink || (liveData as any).links?.masterGoogleDrive || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId.trim()}` : '');
                    setDownloadToken(liveData.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
                    setMasterDriveUrl(approvedUrl);
                    return;
                  }
                }
              } catch {}
            }
            setOrderStatus('PENDING_PAYMENT');
            setSubmittedOrderSummary(null);
            setDownloadToken(null);
            setMasterDriveUrl('');
          }
        })
        .catch(async () => {
          if (db) {
            try {
              const snap = await getDoc(doc(db, 'reels_orders', orderId.trim()));
              if (snap.exists()) {
                const liveData = snap.data() as ReelPurchaseOrder;
                setSubmittedOrderSummary({
                  id: liveData.id || orderId.trim(),
                  customerName: liveData.customerName || '',
                  customerPhone: liveData.customerPhone || '',
                  utrReference: liveData.utrReference || '',
                  amount: liveData.amount || storeConfig.productPrice || 199,
                  submittedAt: liveData.submittedAt || liveData.createdAt,
                });
                setOrderStatus(liveData.status);
                if (liveData.status === 'APPROVED' || liveData.status === 'approved') {
                  const approvedUrl = liveData.masterDriveLink || (liveData as any).links?.masterGoogleDrive || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId.trim()}` : '');
                  setDownloadToken(liveData.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
                  setMasterDriveUrl(approvedUrl);
                  return;
                }
              }
            } catch {}
          }
          setOrderStatus('PENDING_PAYMENT');
          setSubmittedOrderSummary(null);
          setDownloadToken(null);
          setMasterDriveUrl('');
        });
    } else {
      setOrderStatus('PENDING_PAYMENT');
      setSubmittedOrderSummary(null);
      setDownloadToken(null);
      setMasterDriveUrl('');
    }
  }, [orderId]);

  // Real-Time Listener: Multi-Device Firestore onSnapshot + SSE Backup
  useEffect(() => {
    if (!orderId) return;

    // 1. Direct real-time Firestore listener across all devices
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      if (db) {
        unsubscribeFirestore = onSnapshot(
          doc(db, 'reels_orders', orderId),
          (snapshot) => {
            if (!snapshot.exists()) {
              if (orderStatus === 'APPROVED' || orderStatus === 'PENDING_ADMIN_REVIEW') {
                setOrderStatus('PENDING_PAYMENT');
                setDownloadToken(null);
                setMasterDriveUrl('');
                setSubmittedOrderSummary(null);
                if (triggerToast) {
                  triggerToast('Order record was removed by administrator. Please complete a new purchase to regain access.', 'error');
                }
              }
              return;
            }
            const liveOrder = snapshot.data() as ReelPurchaseOrder;
            if (liveOrder) {
              if (liveOrder.status === 'APPROVED' || liveOrder.status === 'approved') {
                setOrderStatus('APPROVED');
                const approvedUrl = liveOrder.masterDriveLink || (liveOrder as any).links?.masterGoogleDrive || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId}` : '');
                setDownloadToken(liveOrder.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
                setMasterDriveUrl(approvedUrl);
                if (triggerToast) {
                  triggerToast('Your Payment Has Been Verified and Approved!', 'success');
                }
              } else if (liveOrder.status === 'REFUNDED') {
                setOrderStatus('REFUNDED');
                setDownloadToken(null);
                setMasterDriveUrl('');
                if (triggerToast) {
                  triggerToast('Access has been revoked. Please complete a new purchase to regain access.', 'error');
                }
              } else if (liveOrder.status === 'REJECTED') {
                setOrderStatus('REJECTED');
                setDownloadToken(null);
                setMasterDriveUrl('');
                setRejectionReason(liveOrder.rejectionReason || 'Payment verification could not be confirmed.');
                if (triggerToast) {
                  triggerToast('Verification update: Please review rejection reason.', 'error');
                }
              } else if (liveOrder.status) {
                setOrderStatus(liveOrder.status);
              }
            }
          },
          (err) => {
            console.warn('Firestore order live listener warning:', err);
          }
        );
      }
    } catch (fsErr) {
      console.warn('Firestore live listener init error:', fsErr);
    }

    // 2. Real-Time Server-Sent Events (SSE) listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/reels/events?orderId=${encodeURIComponent(orderId)}`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.orderId === orderId || payload.eventType === 'ORDER_APPROVED') {
            if (payload.status === 'APPROVED' || payload.eventType === 'ORDER_APPROVED') {
              setOrderStatus('APPROVED');
              const approvedUrl = payload.masterDriveLink || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId}` : '');
              setDownloadToken(payload.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
              setMasterDriveUrl(approvedUrl);
              if (triggerToast) {
                triggerToast('Your Payment Has Been Verified and Approved!', 'success');
              }
            } else if (payload.status === 'REJECTED' || payload.eventType === 'ORDER_REJECTED') {
              setOrderStatus('REJECTED');
              setDownloadToken(null);
              setMasterDriveUrl('');
              setRejectionReason(payload.rejectionReason || 'Payment verification could not be confirmed.');
              if (triggerToast) {
                triggerToast('Verification update: Please review rejection reason.', 'error');
              }
            } else if (payload.eventType === 'ACCESS_REVOKED' || payload.status === 'REFUNDED') {
              setOrderStatus('REFUNDED');
              setDownloadToken(null);
              setMasterDriveUrl('');
              if (triggerToast) {
                triggerToast('Access has been revoked by administrator. Complete a new purchase to regain access.', 'error');
              }
            } else if (payload.eventType === 'ORDER_DELETED') {
              setOrderStatus('PENDING_PAYMENT');
              setDownloadToken(null);
              setMasterDriveUrl('');
              setSubmittedOrderSummary(null);
              if (triggerToast) {
                triggerToast('Order record was removed. Complete a new purchase to regain access.', 'error');
              }
            }
          }
        } catch (_) {}
      };
    } catch (e) {
      console.warn('SSE connection unavailable for customer:', e);
    }

    // 3. Polling fallback every 8 seconds if waiting for Murari's approval
    const pollInterval = setInterval(() => {
      if (orderStatus === 'PENDING_ADMIN_REVIEW') {
        fetch(`/api/reels/order-status/${orderId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.order) {
              if (data.order.status === 'APPROVED' || data.order.status === 'approved') {
                setOrderStatus('APPROVED');
                const approvedUrl = data.links?.masterGoogleDrive || data.order.masterDriveLink || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId}` : '');
                setDownloadToken(data.order.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
                setMasterDriveUrl(approvedUrl);
                if (triggerToast) {
                  triggerToast('Your Payment Has Been Verified and Approved!', 'success');
                }
              } else if (data.order.status === 'REJECTED') {
                setOrderStatus('REJECTED');
                setRejectionReason(data.order.rejectionReason || '');
              }
            }
          })
          .catch(() => {});
      }
    }, 2000);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [orderId, orderStatus, storeConfig.masterDriveLink]);

  // Generate responsive UPI QR Code
  useEffect(() => {
    const activeId = orderId || `RP-PUJA-${Date.now().toString(36).toUpperCase()}`;
    const amount = storeConfig.productPrice || 199.0;
    const payeeName = encodeURIComponent(storeConfig.receiverName);
    const note = encodeURIComponent(`${storeConfig.campaignName} ${activeId}`);
    const upiUri = `upi://pay?pa=${storeConfig.upiId}&pn=${payeeName}&am=${amount.toFixed(2)}&cu=INR&tn=${note}`;

    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Error generating UPI QR code:', err));
  }, [orderId, storeConfig.upiId, storeConfig.receiverName, storeConfig.productPrice, storeConfig.campaignName]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(storeConfig.upiId);
    setCopiedUpi(true);
    triggerToast('UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyLink = (url: string, typeKey: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkType(typeKey);
    triggerToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLinkType(null), 2500);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?offer=reels`;
    navigator.clipboard.writeText(shareUrl);
    triggerToast('Copied standalone offer link! Anyone opening this sees ONLY the Puja offer.', 'success');
  };

  // Completely resets order and form state so a new customer or new order starts 100% clean
  const handleStartNewOrder = () => {
    setCustomerName('');
    setCustomerPhone('');
    setUtrNumber('');
    setOrderId('');
    setSubmittedOrderSummary(null);
    setOrderStatus('PENDING_PAYMENT');
    setStatusMessage('');
    setRejectionReason('');
    setDownloadToken(null);
    setMasterDriveUrl('');
    setSubmitErrorMessage('');
    setSubmissionStatusText('');
    try {
      localStorage.removeItem('last_reels_order_id');
      localStorage.removeItem('pixelfix_reels_order_status');
    } catch {}
  };

  // Submit UTR for Admin Verification (STRICT ADMIN APPROVAL BEFORE ACCESS)
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingUtr) return; // Prevent duplicate rapid clicks
    setSubmitErrorMessage('');

    // Validate customer name
    if (!customerName.trim() || customerName.trim().length < 2) {
      setSubmitErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    // Validate customer phone (mandatory, minimum 10 numeric digits)
    const rawDigits = customerPhone.replace(/[^\d]/g, '');
    if (!customerPhone.trim() || rawDigits.length < 10) {
      setSubmitErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    // Strict 12-digit numeric validation for UTR
    const cleanUtr = utrNumber.replace(/[^\d]/g, '').trim();
    if (!cleanUtr) {
      setSubmitErrorMessage('Please enter your 12-digit UPI Reference Number (UTR).');
      return;
    }
    if (cleanUtr.length !== 12) {
      setSubmitErrorMessage(`A valid UPI UTR must be exactly 12 numeric digits (you entered ${cleanUtr.length} digits).`);
      return;
    }

    setIsSubmittingUtr(true);
    setSubmitErrorMessage('');
    setSubmissionStatusText('Submitting payment details for verification...');

    try {
      const activeOrderId = orderId && orderId.startsWith('RP-') ? orderId : `RP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      if (!orderId) {
        setOrderId(activeOrderId);
      }

      const submitPayload = {
        orderId: activeOrderId,
        utrReference: cleanUtr,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      };

      const result = await submitPaymentReferenceWithRetry(submitPayload, {
        maxRetries: 4,
        initialDelayMs: 800,
        backoffFactor: 2,
        maxDelayMs: 5000,
        timeoutMs: 9000,
        onAttemptStart: (attempt, max) => {
          if (attempt > 1) {
            setSubmissionStatusText(`Reconnecting to server (attempt ${attempt}/${max})...`);
          } else {
            setSubmissionStatusText('Submitting payment reference...');
          }
        },
        onRetry: (attempt, max, delayMs, reason) => {
          const secs = (delayMs / 1000).toFixed(1);
          setSubmissionStatusText(`Network issue (${reason}). Retrying in ${secs}s (attempt ${attempt + 1}/${max})...`);
        },
      });

      // If backend responded successfully
      if (result.success && result.order) {
        const assignedId = result.order?.id || activeOrderId;
        setOrderId(assignedId);
        try {
          localStorage.setItem('last_reels_order_id', assignedId);
        } catch {}

        // Save submitted order snapshot for display cards, and cleanly reset the input form
        const submittedSnapshot = {
          id: assignedId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          utrReference: cleanUtr,
          amount: storeConfig.productPrice || 199.0,
          submittedAt: new Date().toISOString(),
        };
        setSubmittedOrderSummary(submittedSnapshot);
        setCustomerName('');
        setCustomerPhone('');
        setUtrNumber('');

        setOrderStatus(result.order?.status || 'PENDING_ADMIN_REVIEW');
        setStatusMessage(
          result.message ||
            'Your payment details have been submitted successfully. Your order is awaiting administrator verification. You will receive download access on this website after approval.'
        );

        // Also write/sync to Firestore directly from client to ensure zero delay across all devices
        if (db) {
          try {
            const nowIso = new Date().toISOString();
            await setDoc(
              doc(db, 'reels_orders', assignedId),
              {
                id: assignedId,
                productId: '150k-mega-reels-pack',
                productName: storeConfig.productName || '150K+ MEGA PACK — REELS & SHORTS',
                campaign: storeConfig.campaignName || 'Puja Special Offer',
                amount: storeConfig.productPrice || 199.0,
                currency: 'INR',
                customerName: submittedSnapshot.customerName,
                customerPhone: submittedSnapshot.customerPhone,
                status: result.order?.status || 'PENDING_ADMIN_REVIEW',
                utrReference: cleanUtr,
                submittedAt: nowIso,
                updatedAt: nowIso,
              },
              { merge: true }
            );
          } catch (fsSyncErr) {
            console.warn('Client Firestore backup sync note:', fsSyncErr);
          }
        }

        if (result.order?.status === 'APPROVED' && result.order?.downloadToken) {
          setDownloadToken(result.order.downloadToken);
          if (result.links?.masterGoogleDrive) {
            setMasterDriveUrl(result.links.masterGoogleDrive);
          }
          if (triggerToast) triggerToast('Your Payment Has Been Verified and Approved!', 'success');
        } else {
          if (triggerToast) triggerToast('Your payment is awaiting admin verification and approval.', 'info');
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
        setSubmitErrorMessage(result.error);
        if (triggerToast) triggerToast(result.error, 'error');
        return;
      }

      // If backend was unreachable after all exponential backoff retries, use client Firestore persistence
      if (db) {
        try {
          const fallbackId = activeOrderId;
          const nowIso = new Date().toISOString();

          await setDoc(
            doc(db, 'reels_orders', fallbackId),
            {
              id: fallbackId,
              productId: '150k-mega-reels-pack',
              productName: storeConfig.productName || '150K+ MEGA PACK — REELS & SHORTS',
              campaign: storeConfig.campaignName || 'Puja Special Offer',
              amount: storeConfig.productPrice || 199.0,
              currency: 'INR',
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              status: 'PENDING_ADMIN_REVIEW',
              paymentMethod: 'UPI_BHARATPE',
              upiId: storeConfig.upiId,
              receiverName: storeConfig.receiverName,
              utrReference: cleanUtr,
              submittedAt: nowIso,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );

          // Also create notification in Firestore
          const notifId = 'NOTIF-' + Date.now().toString(36).toUpperCase();
          await setDoc(
            doc(db, 'admin_notifications', notifId),
            {
              id: notifId,
              type: 'MANUAL_VERIFICATION_REQUEST',
              severity: 'INFO',
              title: 'New Manual UPI Payment Verification Request',
              message: `Murari, order ${fallbackId} from ${customerName.trim()} (${customerPhone.trim()}) has submitted UTR ${cleanUtr} for ₹199. Please verify BharatPe statement and approve.`,
              relatedOrderId: fallbackId,
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              amount: 199,
              utrReference: cleanUtr,
              createdAt: nowIso,
              readAt: null,
              resolvedAt: null,
            },
            { merge: true }
          );

          setOrderId(fallbackId);
          try {
            localStorage.setItem('last_reels_order_id', fallbackId);
          } catch {}

          setSubmittedOrderSummary({
            id: fallbackId,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            utrReference: cleanUtr,
            amount: storeConfig.productPrice || 199.0,
            submittedAt: nowIso,
          });
          setCustomerName('');
          setCustomerPhone('');
          setUtrNumber('');

          setOrderStatus('PENDING_ADMIN_REVIEW');
          setStatusMessage(
            'Your payment details have been saved directly to the database. Your order is awaiting administrator verification.'
          );
          if (triggerToast) triggerToast('Payment details saved. Murari Panjiyar has been notified for review.', 'info');
          return;
        } catch (fsDirectErr) {
          console.warn('Firestore fallback write error:', fsDirectErr);
        }
      }

      setSubmitErrorMessage(
        result.error ||
          'Network connection interrupted after 4 retry attempts. Please check your internet connection and tap Submit again.'
      );
      if (triggerToast) triggerToast('Connection issue after retries. Please retry.', 'error');
    } catch (finalErr: any) {
      console.error('Submission fatal error:', finalErr);
      setSubmitErrorMessage(finalErr?.message || 'Unable to connect to server. Please check your network and retry.');
      if (triggerToast) triggerToast('Connection issue. Please retry submission.', 'error');
    } finally {
      setIsSubmittingUtr(false);
      setSubmissionStatusText('');
    }
  };

  // Track Order Status Lookup (Strict Server Verification)
  const handleLookupOrder = async (e?: React.FormEvent, customVerifyOrderId?: string) => {
    if (e) e.preventDefault();
    setLookupError('');
    if (!customVerifyOrderId) {
      setLookupResult(null);
    }

    const rawQuery = lookupQuery.trim();
    if (!rawQuery) {
      setLookupError('Please enter your Order ID or registered mobile number.');
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await fetch('/api/reels/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: rawQuery,
          verifyOrderId: customVerifyOrderId || verifyOrderIdInput.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.order) {
        setLookupResult(data.order);
        if (data.order.id) {
          setOrderId(data.order.id);
          try {
            localStorage.setItem('last_reels_order_id', data.order.id);
          } catch {}
        }

        const isApproved = data.order.status === 'Approved' || data.order.internalStatus === 'APPROVED';
        if (isApproved) {
          setOrderStatus('APPROVED');
          if (data.order.downloadUrl) {
            setMasterDriveUrl(data.order.downloadUrl);
          }
          if (!data.order.requiresOwnershipVerification && triggerToast) {
            triggerToast('Your Payment Has Been Verified and Approved!', 'success');
          }
        } else if (data.order.internalStatus === 'REJECTED' || data.order.status === 'Rejected') {
          setOrderStatus('REJECTED');
          setRejectionReason(data.order.rejectionReason || 'Your request was not approved by the administrator.');
        } else if (data.order.internalStatus === 'PENDING_ADMIN_REVIEW' || data.order.status === 'Pending Admin Approval') {
          setOrderStatus('PENDING_ADMIN_REVIEW');
          if (triggerToast) {
            triggerToast('Your payment has been received and your order is waiting for admin approval.', 'info');
          }
        }
      } else {
        setLookupResult(null);
        setLookupError(
          data?.error || 'No matching order was found. Please check your Order ID or registered mobile number.'
        );
      }
    } catch (err) {
      setLookupError('Network error connecting to tracking service. Please check your internet connection.');
    } finally {
      setIsLookingUp(false);
      setIsVerifyingOwnership(false);
    }
  };

  const handleVerifyOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyOrderIdInput.trim()) {
      triggerToast('Please enter your Order ID to confirm ownership.', 'error');
      return;
    }
    setIsVerifyingOwnership(true);
    await handleLookupOrder(undefined, verifyOrderIdInput.trim());
  };

  // Support form submission (Name, Phone, Order ID, Message — NO Email!)
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportMsg.trim()) {
      triggerToast('Please provide your name and inquiry message.', 'error');
      return;
    }

    setIsSendingSupport(true);
    try {
      const res = await fetch('/api/reels/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName.trim(),
          phone: supportPhone.trim() || customerPhone.trim(),
          orderId: orderId || undefined,
          message: supportMsg.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSupportSubmitted(true);
        triggerToast('Support inquiry sent to Murari! Expect a reply shortly.', 'success');
      } else {
        triggerToast(data.error || 'Failed to submit support request.', 'error');
      }
    } catch {
      triggerToast('Network error submitting support inquiry.', 'error');
    } finally {
      setIsSendingSupport(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
      />

      {/* Main Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full ${orderStatus === 'APPROVED' ? 'max-w-5xl' : 'max-w-4xl'} max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden z-10 border text-left ${
          isLight
            ? 'bg-white text-slate-900 border-amber-300 shadow-amber-500/10'
            : 'bg-[#0c0d14] text-white border-amber-500/30 shadow-2xl'
        }`}
      >
        {/* Top Festive Ribbon */}
        <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-slate-200' : 'bg-gradient-to-r from-red-950/70 via-zinc-900 to-black border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Film size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm sm:text-base tracking-wide uppercase">
                  {storeConfig.productName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 font-bold uppercase">
                  {storeConfig.badgeText}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                150,000+ Raw Vertical MP4s • Instant Master Google Drive Delivery After Admin Approval
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Share link button */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              title="Copy link to share ONLY this offer"
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                isLight ? 'border-amber-300 bg-amber-100/60 text-amber-900 hover:bg-amber-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share Offer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:bg-slate-200 hover:text-slate-900' : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className={`px-3 sm:px-6 py-2.5 border-b flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none transition-colors ${
          isLight ? 'bg-slate-100/90 border-slate-200 shadow-xs' : 'bg-black/60 border-white/10'
        }`}>
          {[
            {
              id: 'checkout' as const,
              label:
                orderStatus === 'PENDING_ADMIN_REVIEW'
                  ? '⏳ Awaiting Approval'
                  : `⚡ Payment & Order (₹${Math.round(storeConfig.productPrice)})`,
            },
            { id: 'track' as const, label: '🔍 Track My Order' },
            { id: 'categories' as const, label: '📁 Explore 9 Categories' },
            { id: 'included' as const, label: "✨ What's Included" },
            { id: 'faq' as const, label: '💬 FAQ & Support' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? isLight
                      ? 'bg-gradient-to-r from-[#FF5500] to-amber-600 text-white font-black shadow-md shadow-[#FF5500]/25 ring-2 ring-[#FF5500]/40 scale-[1.02]'
                      : 'bg-gradient-to-r from-[#FF5500] to-amber-500 text-white font-black shadow-lg shadow-[#FF5500]/30 ring-2 ring-[#FF5500]/40 scale-[1.02]'
                    : isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs hover:border-[#FF5500]/30'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CHECKOUT & APPROVAL STATUS */}
          {activeTab === 'checkout' && (
            <div>
              {/* STATE A: APPROVED — HIGH CONTRAST & CLEAN CONFIRMATION */}
              {orderStatus === 'APPROVED' ? (
                <div className="space-y-6 max-w-lg mx-auto py-6">
                  <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl transition-all ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-emerald-100/50' : 'bg-emerald-950/40 border-emerald-500/40 text-white'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                      isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="space-y-2">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isLight ? 'bg-emerald-200/90 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        Payment Confirmed
                      </div>
                      <h4 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isLight ? "text-emerald-950" : "text-emerald-400"}`}>
                        Your Payment Has Been Verified and Approved!
                      </h4>
                      <p className={`text-xs sm:text-sm leading-relaxed font-mono ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        Administrator Murari Panjiyar has confirmed and approved your payment request.
                      </p>
                    </div>
                    {orderId && (
                      <div className={`p-3.5 rounded-xl border font-mono text-xs flex items-center justify-between ${
                        isLight ? "bg-white border-slate-300 text-slate-900 shadow-xs" : "bg-black/40 border-white/10 text-white"
                      }`}>
                        <span className={isLight ? "text-slate-600 font-bold" : "text-zinc-400"}>Order Reference:</span>
                        <span className={`font-mono font-black select-all ${isLight ? "text-emerald-900" : "text-emerald-400"}`}>{orderId}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl border text-center space-y-2.5 ${
                    isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-500/10 border-amber-500/20 text-white'
                  }`}>
                    <p className={`text-xs font-mono font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                      Need to purchase another license or submit payment for another person?
                    </p>
                    <button
                      type="button"
                      onClick={handleStartNewOrder}
                      className="py-2.5 px-5 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md transition-transform active:scale-95 inline-flex items-center gap-2 border border-amber-500/40"
                    >
                      <Zap size={14} className="fill-slate-950" />
                      <span>Make a New Payment / Submit Another Order →</span>
                    </button>
                  </div>
                </div>
              ) : orderStatus === 'PENDING_ADMIN_REVIEW' ? (
                /* STATE B: AWAITING ADMIN APPROVAL — STRICTLY LOCKED WITH REAL-TIME SYNC */
                <div className="space-y-5 max-w-xl mx-auto py-2">
                  <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-2xl transition-all ${
                    isLight ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-amber-100/60' : 'bg-[#11121d] border-amber-500/40 text-white'
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg border ${
                      isLight ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-amber-200/50' : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                    }`}>
                      <Clock size={28} className={`animate-spin ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
                    </div>
                    <div className="space-y-1.5">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isLight ? 'bg-amber-200/90 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        Verification in Progress
                      </div>
                      <h4 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isLight ? "text-amber-950" : "text-amber-400"}`}>
                        Payment Submitted • Awaiting Admin Approval
                      </h4>
                      <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-mono ${isLight ? "text-slate-700 font-medium" : "text-zinc-300"}`}>
                        Your payment details and 12-digit UTR have been submitted to administrator Murari Panjiyar.
                        Approval is typically completed within 5-15 minutes during business hours.
                      </p>
                    </div>

                    {/* Live Order Metadata Box */}
                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 text-left font-mono text-xs ${
                      isLight ? "bg-white border-amber-300 shadow-sm text-slate-900" : "bg-black/60 border-white/10 text-white"
                    }`}>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Order Reference:</span>
                        <span className={`font-mono font-black select-all ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                          {submittedOrderSummary?.id || orderId}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Customer Name:</span>
                        <span className={`font-bold ${isLight ? "text-slate-950" : "text-white"}`}>
                          {submittedOrderSummary?.customerName || customerName || 'Customer'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Registered Phone:</span>
                        <span className={`font-bold font-mono ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          {submittedOrderSummary?.customerPhone || customerPhone || '—'}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>12-Digit UTR:</span>
                        <span className={`font-mono font-black tracking-wider select-all ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                          {submittedOrderSummary?.utrReference || utrNumber || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className={isLight ? 'text-slate-500 font-bold' : 'text-zinc-400'}>Amount Paid:</span>
                        <span className={`font-mono font-black text-sm ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                          ₹{submittedOrderSummary?.amount || storeConfig.productPrice} INR
                        </span>
                      </div>
                    </div>

                    {/* Real-Time Live Status Pulse */}
                    <div className={`pt-1 flex items-center justify-center gap-2 text-xs font-mono font-bold ${
                      isLight ? 'text-amber-950' : 'text-amber-400'
                    }`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span>Live sync active • This screen updates automatically once approved.</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const activeId = submittedOrderSummary?.id || orderId;
                          if (!activeId) return;
                          fetch(`/api/reels/order-status/${encodeURIComponent(activeId)}`)
                            .then(res => res.json())
                            .then(d => {
                              if (d.success && d.order?.status === 'APPROVED') {
                                setOrderStatus('APPROVED');
                                triggerToast('Your Payment Has Been Verified and Approved!', 'success');
                              } else {
                                triggerToast('Verification in progress. Your order is waiting for admin approval.', 'info');
                              }
                            });
                        }}
                        className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                          isLight
                            ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <RefreshCw size={13} />
                        <span>Check Status Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderStatus('PENDING_PAYMENT')}
                        className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                            : 'bg-transparent border-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        Need to edit details?
                      </button>
                      <button
                        type="button"
                        onClick={handleStartNewOrder}
                        className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                          isLight ? 'text-amber-900 hover:text-amber-950 underline' : 'text-amber-400 hover:underline'
                        }`}
                      >
                        Place Another Order →
                      </button>
                    </div>
                  </div>
                </div>
              ) : orderStatus === 'REJECTED' ? (
                /* STATE C: REJECTED — HIGH CONTRAST & ACTIONABLE */
                <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 max-w-lg mx-auto py-6 shadow-xl ${
                  isLight ? 'bg-red-50 border-red-300 text-slate-900' : 'bg-red-950/40 border-red-500/40 text-white'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                    isLight ? 'bg-red-100 border-red-300 text-red-700' : 'bg-red-500/20 border-red-500/30 text-red-400'
                  }`}>
                    <XCircle size={30} />
                  </div>
                  <div className="space-y-1.5">
                    <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isLight ? 'bg-red-200/90 text-red-950 border border-red-300' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      Verification Unsuccessful
                    </div>
                    <h3 className={`text-lg sm:text-xl font-bold font-mono ${isLight ? 'text-red-950 font-black' : 'text-white'}`}>
                      Payment Verification Unsuccessful
                    </h3>
                    <p className={`text-xs sm:text-sm font-mono max-w-md mx-auto ${isLight ? 'text-red-900 font-medium' : 'text-red-300'}`}>
                      {rejectionReason || 'The 12-digit UPI reference number could not be reconciled in the merchant statement.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOrderStatus('PENDING_PAYMENT')}
                      className="py-2.5 px-4 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-sm"
                    >
                      Re-enter Details & UTR
                    </button>
                    <button
                      type="button"
                      onClick={handleStartNewOrder}
                      className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      Start Fresh Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('faq')}
                      className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isLight
                          ? 'border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          : 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE D: INITIAL CHECKOUT FORM (Clean, Modern, Fully Responsive Payment UI) */
                <div className="space-y-6">
                  {/* Top Festive Special Offer Header Strip */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left transition-all ${
                    isLight
                      ? 'bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-50 border-amber-300 text-slate-900 shadow-sm'
                      : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/10 border-amber-500/30 text-white shadow-lg'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                        <Zap size={24} className="fill-black" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <span className={`font-mono font-black text-[11px] uppercase tracking-wider ${
                            isLight ? 'text-amber-950 font-black' : 'text-amber-400 font-black'
                          }`}>
                            ✨ {storeConfig.campaignName || 'Puja Special Offer'}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            isLight
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}>
                            80% FLAT OFF
                          </span>
                        </div>
                        <h4 className={`font-black text-sm sm:text-base tracking-tight ${isLight ? "text-slate-950 font-black" : "text-white font-black"}`}>
                          150,000+ Ultimate Reels &amp; Shorts Video Vault
                        </h4>
                        <p className={`text-[11px] font-mono hidden sm:block ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                          Full Commercial Rights • 14 Viral Categories • Instant Secured Delivery
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 shrink-0 px-4 py-2.5 rounded-xl border ${
                      isLight
                        ? 'bg-white/95 border-amber-300/80 shadow-xs'
                        : 'bg-black/40 border-white/10'
                    }`}>
                      <div className="text-right">
                        <div className={`text-[10px] font-mono line-through ${
                          isLight ? 'text-slate-500 font-semibold' : 'text-zinc-400'
                        }`}>MRP ₹999</div>
                        <div className={`text-xs font-mono font-bold ${
                          isLight ? 'text-emerald-800' : 'text-emerald-400'
                        }`}>Save ₹800</div>
                      </div>
                      <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        isLight ? 'text-slate-950 font-black' : 'text-emerald-400 font-black'
                      }`}>
                        ₹{Math.round(storeConfig.productPrice)}
                      </div>
                      <span className={`text-[10px] font-mono uppercase font-bold ${
                        isLight ? 'text-slate-700' : 'text-zinc-400'
                      }`}>INR</span>
                    </div>
                  </div>

                  {/* Two-Column Responsive Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                    {/* Left Column (lg:col-span-5): Step 1 — Scan & Pay ₹199 */}
                    <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 text-center ${
                      isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-zinc-900/80 border-white/10 shadow-xl'
                    }`}>
                      <div className="space-y-1.5 w-full">
                        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-black uppercase border shadow-xs ${
                          isLight
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-black'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold'
                        }`}>
                          <QrCode size={13} className={isLight ? 'text-amber-800' : 'text-amber-400'} />
                          <span>Step 1: Scan &amp; Pay ₹{Math.round(storeConfig.productPrice)}</span>
                        </div>
                        <h5 className={`font-bold text-sm pt-1 ${isLight ? "text-slate-950 font-black" : "text-white font-bold"}`}>
                          Scan with Any UPI Application
                        </h5>
                        <p className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                          Google Pay, PhonePe, Paytm, BHIM, Cred, or Mobile Banking
                        </p>
                      </div>

                      {/* Clean Precision QR Container */}
                      <div className="p-4 bg-white rounded-2xl shadow-xl border border-zinc-200 flex flex-col items-center justify-center relative mx-auto group">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="BharatPe UPI Payment QR"
                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                          />
                        ) : (
                          <div className="w-44 h-44 flex items-center justify-center text-black text-xs font-mono">
                            <RefreshCw size={22} className="animate-spin text-amber-500" />
                          </div>
                        )}
                        <div className="mt-2 text-[10.5px] font-mono font-bold text-slate-900 bg-slate-100 px-3.5 py-0.5 rounded-full border border-slate-300 shadow-xs">
                          ₹{Math.round(storeConfig.productPrice)} INR • BharatPe Verified
                        </div>
                      </div>

                      {/* Mobile 1-Tap Pay & Copy Actions */}
                      <div className="w-full space-y-2.5">
                        {/* 1-Tap Pay Button */}
                        <a
                          href={`upi://pay?pa=${encodeURIComponent(storeConfig.upiId)}&pn=${encodeURIComponent(storeConfig.receiverName)}&am=${encodeURIComponent(storeConfig.productPrice.toFixed(2))}&cu=INR&tn=${encodeURIComponent('Puja Offer 150K Reels Pack')}`}
                          className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer min-h-[46px] border border-emerald-400/40"
                        >
                          <ExternalLink size={14} className="stroke-[2.5]" />
                          <span>Tap to Pay ₹{Math.round(storeConfig.productPrice)} in UPI App</span>
                        </a>

                        {/* UPI ID Card with 1-Click Copy */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/60 border-white/10'
                        }`}>
                          <div className="text-left overflow-hidden">
                            <span className={`text-[9px] uppercase font-mono block font-bold ${
                              isLight ? 'text-slate-600' : 'text-zinc-400'
                            }`}>Merchant UPI ID</span>
                            <span className={`text-xs font-mono font-black truncate block select-all ${
                              isLight ? 'text-amber-950' : 'text-amber-400'
                            }`}>
                              {storeConfig.upiId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors border ${
                              isLight
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                            }`}
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? (
                              <>
                                <Check size={13} className={isLight ? "text-emerald-800" : "text-emerald-400"} />
                                <span className={isLight ? "text-emerald-800 font-black" : "text-emerald-400 font-bold"}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} className={isLight ? "text-amber-900" : "text-amber-400"} />
                                <span className={isLight ? "text-amber-950 font-black" : "text-amber-300"}>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Verified Merchant Badge */}
                        <div className={`text-[11px] font-mono flex items-center justify-center gap-1.5 ${
                          isLight ? 'text-slate-700 font-semibold' : 'text-zinc-400'
                        }`}>
                          <ShieldCheck size={13} className={isLight ? "text-emerald-700" : "text-emerald-400"} />
                          <span>Payee: <strong className={isLight ? "text-slate-950 font-black" : "text-white font-bold"}>{storeConfig.receiverName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (lg:col-span-7): Step 2 — Customer Details Form */}
                    <form
                      onSubmit={handleSubmitUtr}
                      autoComplete="off"
                      className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                        isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-zinc-900/80 border-white/10 shadow-xl'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono uppercase border shadow-xs ${
                            isLight
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold'
                          }`}>
                            <ShieldCheck size={13} className={isLight ? 'text-emerald-800' : 'text-emerald-400'} />
                            <span>Step 2: Enter Details &amp; UTR</span>
                          </div>
                          <h4 className={`text-base sm:text-lg font-black pt-1 ${isLight ? "text-slate-950" : "text-white"}`}>
                            Customer Verification Form
                          </h4>
                          <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                            After paying ₹199, fill your details below. Administrator Murari Panjiyar will verify your payment and approve your order.
                          </p>
                        </div>

                        {/* Field 1: Customer Full Name (Always blank on new order) */}
                        <div className="space-y-1.5">
                          <label className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                            isLight ? "text-slate-900 font-black" : "text-zinc-200 font-semibold"
                          }`}>
                            <User size={13} className={isLight ? "text-amber-700" : "text-amber-400"} />
                            <span>Customer Full Name *</span>
                          </label>
                          <input
                            type="text"
                            required
                            name="puja_customer_full_name"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            data-lpignore="true"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="Enter your full name (e.g. Rahul Sharma)"
                            className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all ${
                              isLight
                                ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium'
                                : 'bg-black/70 border border-white/15 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                            }`}
                          />
                        </div>

                        {/* Field 2: Registered Mobile Number (Always blank on new order, 10 Digits) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                              isLight ? "text-slate-900 font-black" : "text-zinc-200 font-semibold"
                            }`}>
                              <Phone size={13} className={isLight ? "text-emerald-700" : "text-emerald-400"} />
                              <span>Registered Mobile Number *</span>
                            </label>
                            <span className={`text-[10px] font-mono font-bold ${
                              customerPhone.replace(/[^\d]/g, '').length === 10
                                ? (isLight ? 'text-emerald-800 font-black' : 'text-emerald-400 font-bold')
                                : (isLight ? 'text-slate-600 font-semibold' : 'text-zinc-400')
                            }`}>
                              {customerPhone.replace(/[^\d]/g, '').length === 10 ? '✓ 10/10 Digits' : `${customerPhone.replace(/[^\d]/g, '').length}/10 Digits`}
                            </span>
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            required
                            maxLength={10}
                            name="puja_customer_phone_number"
                            autoComplete="off"
                            autoCorrect="off"
                            data-lpignore="true"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                            placeholder="10-digit mobile number (e.g. 9876543210)"
                            className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-mono outline-none transition-all ${
                              isLight
                                ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium'
                                : 'bg-black/70 border border-white/15 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                            }`}
                          />
                        </div>

                        {/* Field 3: 12-Digit UTR / UTI / UPI Reference Number */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                              isLight ? "text-amber-950 font-black" : "text-amber-400 font-bold"
                            }`}>
                              <Tag size={13} className={isLight ? "text-amber-700" : "text-amber-400"} />
                              <span>12-Digit UTR / UTI / UPI Ref No *</span>
                            </label>
                            <span className={`text-[10px] font-mono font-bold ${
                              utrNumber.replace(/[^\d]/g, '').length === 12
                                ? (isLight ? 'text-emerald-800 font-black' : 'text-emerald-400 font-bold')
                                : (isLight ? 'text-slate-600 font-semibold' : 'text-zinc-400')
                            }`}>
                              {utrNumber.replace(/[^\d]/g, '').length === 12 ? '✓ 12/12 Complete' : `${utrNumber.replace(/[^\d]/g, '').length}/12 Digits`}
                            </span>
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            maxLength={12}
                            name="puja_utr_reference_number"
                            autoComplete="off"
                            autoCorrect="off"
                            data-lpignore="true"
                            value={utrNumber}
                            onChange={e => setUtrNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 12))}
                            placeholder="Enter 12-digit UTR No. (e.g. 882349102845)"
                            className={`w-full px-4 py-3 rounded-xl text-sm sm:text-base font-mono font-bold tracking-widest outline-none transition-all ${
                              isLight
                                ? 'bg-amber-50/70 border-2 border-amber-400 text-slate-950 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-black placeholder:text-slate-400'
                                : 'bg-black/80 border-2 border-amber-500/60 text-amber-300 placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                            }`}
                          />
                          {/* Helper Card */}
                          <div className={`p-3 rounded-xl border text-[10px] font-mono space-y-1 leading-relaxed ${
                            isLight
                              ? 'bg-amber-50/90 border-amber-200 text-slate-800'
                              : 'bg-black/40 border-white/10 text-zinc-300'
                          }`}>
                            <span className={`font-black block ${
                              isLight ? 'text-amber-950' : 'text-amber-300'
                            }`}>💡 Where to find your 12-digit UTR on receipt:</span>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <span>• PhonePe: <strong className={isLight ? "text-slate-950" : "text-white"}>UTR</strong></span>
                              <span>• Google Pay: <strong className={isLight ? "text-slate-950" : "text-white"}>UPI Ref No</strong></span>
                              <span>• Paytm: <strong className={isLight ? "text-slate-950" : "text-white"}>UPI Ref ID</strong></span>
                              <span>• BHIM / Cred: <strong className={isLight ? "text-slate-950" : "text-white"}>Ref ID</strong></span>
                            </div>
                          </div>
                        </div>

                        {submitErrorMessage && (
                          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2">
                            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                            <span>{submitErrorMessage}</span>
                          </div>
                        )}
                        {submissionStatusText && isSubmittingUtr && (
                          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                            <RefreshCw size={14} className="animate-spin text-amber-400 shrink-0" />
                            <span>{submissionStatusText}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingUtr}
                          className="w-full py-3.5 px-4 rounded-xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 shadow-xl shadow-orange-500/25 border border-amber-300/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 min-h-[50px]"
                        >
                          {isSubmittingUtr ? (
                            <>
                              <RefreshCw size={16} className="animate-spin text-slate-950" />
                              <span>{submissionStatusText || 'Submitting Details for Approval...'}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={16} />
                              <span>Submit Payment Details for Admin Approval</span>
                            </>
                          )}
                        </button>

                        {/* Encryption & Security Trust Seals */}
                        <div className={`flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono pt-1 ${
                          isLight ? 'text-slate-700 font-semibold' : 'text-zinc-400'
                        }`}>
                          <span className={`flex items-center gap-1 font-bold ${
                            isLight ? 'text-emerald-800' : 'text-emerald-400'
                          }`}>
                            <ShieldCheck size={12} />
                            <span>256-Bit SSL Encrypted</span>
                          </span>
                          <span>•</span>
                          <span className={`flex items-center gap-1 font-bold ${
                            isLight ? 'text-amber-950' : 'text-amber-400'
                          }`}>
                            <Zap size={12} />
                            <span>Real-Time Instant Approval</span>
                          </span>
                          <span>•</span>
                          <span className={isLight ? "text-slate-800 font-bold" : "text-zinc-300"}>
                            Murari Panjiyar Verified
                          </span>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRACK MY ORDER */}
          {activeTab === 'track' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="text-center space-y-1.5">
                <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  Live Order Tracker
                </div>
                <h4 className={`text-lg sm:text-xl font-black font-mono tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                  Track Your Order Status
                </h4>
                <p className={`text-xs font-mono ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                  Check real-time admin approval status and verify your payment submission across devices.
                </p>
              </div>

              {/* Single Search Field & Button */}
              <form onSubmit={handleLookupOrder} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className={`absolute left-3.5 top-3.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={e => setLookupQuery(e.target.value)}
                      placeholder="Enter Order ID (RP-...) or 10-Digit Mobile"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono outline-none transition-all ${
                        isLight
                          ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm'
                          : 'bg-black/70 border border-white/15 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="py-3 px-5 sm:px-6 rounded-xl font-mono text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 border border-amber-500/40"
                  >
                    {isLookingUp ? 'Searching...' : 'Track Order'}
                  </button>
                </div>

                {lookupError && (
                  <div className={`p-3.5 rounded-xl text-xs font-mono font-medium border ${
                    isLight ? 'bg-red-50 border-red-300 text-red-950' : 'bg-red-950/60 border-red-500/30 text-red-300'
                  }`}>
                    ⚠️ {lookupError}
                  </div>
                )}
              </form>

              {/* Order Status Display */}
              {lookupResult && (
                <div className={`p-5 rounded-2xl border space-y-4 font-mono text-xs shadow-md transition-all ${
                  isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black/60 border-white/10 text-white"
                }`}>
                  {/* Header: Order ID & Current Status */}
                  <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <div>
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Order ID</span>
                      <span className={`font-mono font-black text-sm select-all ${isLight ? "text-slate-950" : "text-white"}`}>{lookupResult.id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase border ${
                      lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                        ? isLight ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                        : lookupResult.status === 'Pending Admin Approval' || lookupResult.internalStatus === 'PENDING_ADMIN_REVIEW'
                        ? isLight ? 'bg-amber-100 text-amber-950 border-amber-300 font-black' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                        : lookupResult.status === 'Rejected' || lookupResult.internalStatus === 'REJECTED'
                        ? isLight ? 'bg-rose-100 text-rose-950 border-rose-300 font-black' : 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
                        : isLight ? 'bg-slate-100 text-slate-900 border-slate-300 font-black' : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30 font-bold'
                    }`}>
                      {lookupResult.status || 'Pending Admin Approval'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className={`grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  }`}>
                    <div>
                      <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Customer Name:</span>
                      <span className={`font-bold ${isLight ? "text-slate-950" : "text-white"}`}>{lookupResult.customerName || 'Customer'}</span>
                    </div>
                    <div>
                      <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Mobile Number:</span>
                      <span className={`font-bold font-mono ${isLight ? 'text-emerald-900' : 'text-emerald-400'}`}>
                        {lookupResult.customerPhone || 'Registered'}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Tracker */}
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Order Progress Timeline:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] sm:text-[10px]">
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>✓</div>
                        <span className={`font-bold block ${isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'}`}>1. Created</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.utrReference
                            ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-white/5 text-zinc-500 border-white/10'
                        }`}>{lookupResult.utrReference ? '✓' : '2'}</div>
                        <span className={`font-bold block ${
                          lookupResult.utrReference
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-slate-500 font-normal' : 'text-zinc-500'
                        }`}>2. UTR Sent</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLight ? 'bg-amber-100 text-amber-950 border-amber-400 font-black' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED' ? '✓' : '3'}
                        </div>
                        <span className={`font-bold block ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-amber-950 font-black' : 'text-amber-400'
                        }`}>3. Review</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs border ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'bg-emerald-600 text-white border-emerald-700 font-black' : 'bg-emerald-500 text-black border-emerald-400 font-black'
                            : isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-white/5 text-zinc-500 border-white/10'
                        }`}>
                          {lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED' ? '★' : '4'}
                        </div>
                        <span className={`font-bold block ${
                          lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED'
                            ? isLight ? 'text-emerald-950 font-black' : 'text-emerald-400'
                            : isLight ? 'text-slate-500 font-normal' : 'text-zinc-500'
                        }`}>4. Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS CONDITION: Revoked / Refunded */}
                  {(lookupResult.status === 'Refunded' || lookupResult.internalStatus === 'REFUNDED') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2.5 text-center ${
                      isLight ? 'bg-rose-50 border-rose-300 text-slate-900' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        <Lock size={18} />
                      </div>
                      <p className={`font-bold text-sm ${isLight ? 'text-rose-950 font-black' : 'text-amber-300'}`}>Access Revoked</p>
                      <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        {lookupResult.rejectionReason || 'Access for this order has been revoked by administrator. Please complete a new purchase to regain access.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleStartNewOrder}
                        className="py-2.5 px-5 rounded-xl text-xs font-mono font-black bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-md inline-flex items-center gap-2 border border-amber-500/40"
                      >
                        <Zap size={14} className="fill-slate-950" />
                        <span>Place a New Order →</span>
                      </button>
                    </div>
                  )}

                  {/* STATUS CONDITION 1: Pending Admin Approval */}
                  {(lookupResult.status === 'Pending Admin Approval' || lookupResult.internalStatus === 'PENDING_ADMIN_REVIEW') && (
                    <div className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                      isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        <Clock size={18} className="animate-pulse" />
                      </div>
                      <p className={`font-black text-sm ${isLight ? 'text-amber-950 font-black' : 'text-amber-300'}`}>Waiting for Admin Approval</p>
                      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        Your payment has been received and your order is waiting for admin approval from Murari Panjiyar.
                      </p>
                    </div>
                  )}

                  {/* STATUS CONDITION 2: Approved */}
                  {(lookupResult.status === 'Approved' || lookupResult.internalStatus === 'APPROVED') && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                        isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                          isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          <CheckCircle2 size={20} />
                        </div>
                        <p className={`font-black text-sm ${isLight ? 'text-emerald-950 font-black' : 'text-white'}`}>
                          Your Payment Has Been Verified and Approved!
                        </p>
                        <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                          Your digital access to the authorized resources has been unlocked.
                        </p>
                      </div>

                      {/* If searched by mobile number alone: Ownership verification requirement */}
                      {lookupResult.requiresOwnershipVerification ? (
                        <form onSubmit={handleVerifyOwnership} className={`p-4 rounded-xl border space-y-2.5 ${
                          isLight ? 'bg-amber-50/70 border-amber-300 text-slate-900' : 'bg-black/60 border-amber-500/40 text-white'
                        }`}>
                          <div className="space-y-1">
                            <label className={`text-xs font-bold block ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                              🔒 Ownership Verification Required
                            </label>
                            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                              To protect customer privacy and access your download, please enter your Order ID:
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={verifyOrderIdInput}
                              onChange={e => setVerifyOrderIdInput(e.target.value)}
                              placeholder="Enter Order ID (e.g. RP-...)"
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none ${
                                isLight
                                  ? 'bg-white border-2 border-slate-300 text-slate-900 focus:border-amber-500'
                                  : 'bg-black border border-white/20 text-white focus:border-amber-500'
                              }`}
                            />
                            <button
                              type="submit"
                              disabled={isVerifyingOwnership || !verifyOrderIdInput.trim()}
                              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono cursor-pointer border border-amber-500/40 shadow-sm"
                            >
                              {isVerifyingOwnership ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Authorized Download Button */
                        <a
                          href={lookupResult.downloadUrl || masterDriveUrl || (lookupResult.id ? `/api/reels/vault-access/${lookupResult.id}` : '#')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Download size={16} />
                          <span>Download Now</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* STATUS CONDITION 3: Rejected */}
                  {(lookupResult.status === 'Rejected' || lookupResult.internalStatus === 'REJECTED') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 text-center ${
                      isLight ? 'bg-rose-50 border-rose-300 text-slate-900' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                        isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        <XCircle size={18} />
                      </div>
                      <p className={`font-black text-sm ${isLight ? 'text-rose-950' : 'text-white'}`}>Order Not Approved</p>
                      <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-zinc-300'}`}>
                        {lookupResult.rejectionReason || 'Your request was not approved by the administrator.'}
                      </p>
                    </div>
                  )}

                  {/* STATUS CONDITION 4: Payment Pending or Verification Failed */}
                  {(lookupResult.status === 'Payment Pending' || lookupResult.status === 'Payment Verification Failed' || lookupResult.internalStatus === 'PENDING_PAYMENT') && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 text-center ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-zinc-800/80 border-white/10 text-zinc-300'
                    }`}>
                      <p className={`font-black text-sm ${isLight ? 'text-slate-950' : 'text-zinc-200'}`}>{lookupResult.status}</p>
                      <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                        Payment verification could not be confirmed. Please check your transaction details or contact support.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('faq')}
                        className={`text-xs font-mono font-bold underline cursor-pointer ${
                          isLight ? 'text-amber-900 hover:text-amber-950' : 'text-amber-400'
                        }`}
                      >
                        Contact Support →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* TAB 3: EXPLORE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    Verified Digital Video Categories
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'}`}>
                    All 9 categories are organized in folders inside the Master Google Drive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('checkout')}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-black uppercase bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer shadow-md border border-amber-500/40 shrink-0 self-start sm:self-auto"
                >
                  {orderStatus === 'APPROVED' ? 'View Order Status' : `Unlock All for ₹${Math.round(storeConfig.productPrice)}`}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all shadow-xs hover:shadow-md ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-amber-400'
                        : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                        isLight
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {cat.count}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                        isLight ? 'bg-slate-100 text-slate-700 font-bold border border-slate-200' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {cat.sampleAspect}
                      </span>
                    </div>

                    <h5 className={`text-sm font-bold tracking-tight ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                      {cat.name}
                    </h5>

                    <p className={`text-[11.5px] leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {cat.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md ${
                            isLight ? 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold' : 'bg-white/5 text-zinc-300'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* TAB 4: WHAT'S INCLUDED */}
          {activeTab === 'included' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10 text-white'
                }`}>
                  <h5 className={`text-sm font-bold uppercase font-mono flex items-center gap-2 ${
                    isLight ? 'text-amber-800 font-black' : 'text-amber-400'
                  }`}>
                    <CheckCircle2 size={16} />
                    Verified Pack Specifications
                  </h5>
                  <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Total Count:</strong> 150,000+ Raw Short-Form Video Clips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Aspect Ratio:</strong> 9:16 Vertical format (1080x1920 Full HD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Video Format:</strong> H.264 MP4 (Universal CapCut, Premiere, InShot compatibility)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Watermarks:</strong> 100% Watermark-free, logo-free clean footage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>Storage Delivery:</strong> High-Speed Master Google Drive Direct Access</span>
                    </li>
                  </ul>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10 text-white'
                }`}>
                  <h5 className={`text-sm font-bold uppercase font-mono flex items-center gap-2 ${
                    isLight ? 'text-emerald-800 font-black' : 'text-emerald-400'
                  }`}>
                    <ShieldCheck size={16} />
                    License & Usage Permissions
                  </h5>
                  <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Personal and commercial content creation rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Eligible for monetization on YouTube Shorts, Instagram Reels, and TikTok</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>No attribution required when published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className={isLight ? 'text-slate-800' : 'text-zinc-300'}>Lifetime access with no recurring subscription fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* TAB 5: FAQ & SUPPORT */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className={`font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    <HelpCircle size={15} className="text-amber-500 shrink-0" />
                    How does payment verification work?
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                    Scan our verified BharatPe UPI QR code and pay ₹{Math.round(storeConfig.productPrice)}. Submit your 10-digit mobile number and 12-digit UTR reference. Administrator Murari Panjiyar matches your UTR against merchant records to approve your order.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className={`font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    <HelpCircle size={15} className="text-amber-500 shrink-0" />
                    How long does approval take?
                  </h5>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600 font-normal' : 'text-zinc-400'}`}>
                    Murari reviews incoming payments promptly, typically within 5 to 30 minutes. Once approved, your order status changes to Approved in real-time across all your devices without refreshing.
                  </p>
                </div>
              </div>

              {/* Direct Support Form (NO Email!) */}
              <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#FF5500]" />
                  <h5 className={`font-bold text-sm ${isLight ? "text-slate-950 font-black" : "text-white"}`}>
                    Contact Murari Panjiyar for Assistance
                  </h5>
                </div>

                {supportSubmitted ? (
                  <div className={`p-4 rounded-xl border text-xs font-mono font-medium ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    ✅ Your inquiry has been received! Murari will reach out to your registered phone number shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={supportName}
                        onChange={e => setSupportName(e.target.value)}
                        placeholder="Your Name *"
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                            : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                        }`}
                      />
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={e => setSupportPhone(e.target.value)}
                        placeholder="Your Phone Number"
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                            : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                        }`}
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      placeholder="Describe your issue or question regarding your UPI payment or order reference..."
                      className={`w-full px-3.5 py-2.5 rounded-xl outline-none font-mono ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 shadow-xs'
                          : 'bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSendingSupport}
                      className="py-2.5 px-5 rounded-xl font-bold bg-[#FF5500] hover:bg-orange-600 text-white cursor-pointer shadow-md inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{isSendingSupport ? 'Sending...' : 'Send Inquiry to Murari'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
