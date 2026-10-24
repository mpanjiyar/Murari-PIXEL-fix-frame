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
  ThumbsUp,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, getDoc, getDocs, collection } from 'firebase/firestore';
import { ReelPurchaseOrder, ReelOrderStatus } from '../types';
import { MegaPackBundleDirectory } from './MegaPackBundleDirectory';
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

  // Customer form inputs (Name & Phone ONLY — NO Delivery Email!)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

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
            if (data.order.customerName) setCustomerName(data.order.customerName);
            if (data.order.customerPhone) setCustomerPhone(data.order.customerPhone);
            if (data.order.utrReference) setUtrNumber(data.order.utrReference);
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
                  if (liveData.customerName) setCustomerName(liveData.customerName);
                  if (liveData.customerPhone) setCustomerPhone(liveData.customerPhone);
                  if (liveData.utrReference) setUtrNumber(liveData.utrReference);
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
                if (liveData.customerName) setCustomerName(liveData.customerName);
                if (liveData.customerPhone) setCustomerPhone(liveData.customerPhone);
                if (liveData.utrReference) setUtrNumber(liveData.utrReference);
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
          setDownloadToken(null);
          setMasterDriveUrl('');
        });
    } else {
      setOrderStatus('PENDING_PAYMENT');
      setDownloadToken(null);
      setMasterDriveUrl('');
    }
  }, [orderId]);

  // Real-Time Listener: Multi-Device Firestore onSnapshot + SSE Backup
  useEffect(() => {
    if (!orderId || orderStatus === 'APPROVED') return;

    // 1. Direct real-time Firestore listener across all devices
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      if (db) {
        unsubscribeFirestore = onSnapshot(
          doc(db, 'reels_orders', orderId),
          (snapshot) => {
            if (snapshot.exists()) {
              const liveOrder = snapshot.data() as ReelPurchaseOrder;
              if (liveOrder.status === 'APPROVED' || liveOrder.status === 'approved') {
                setOrderStatus('APPROVED');
                const approvedUrl = liveOrder.masterDriveLink || (liveOrder as any).links?.masterGoogleDrive || storeConfig.masterDriveLink || (orderId ? `/api/reels/vault-access/${orderId}` : '');
                setDownloadToken(liveOrder.downloadToken || ('TOKEN-' + Date.now().toString(36).toUpperCase()));
                setMasterDriveUrl(approvedUrl);
                if (triggerToast) {
                  triggerToast('Your Payment Has Been Verified and Approved!', 'success');
                }
              } else if (liveOrder.status === 'REJECTED') {
                setOrderStatus('REJECTED');
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
              setRejectionReason(payload.rejectionReason || 'Payment verification could not be confirmed.');
              if (triggerToast) {
                triggerToast('Verification update: Please review rejection reason.', 'error');
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
    }, 8000);

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
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
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

  // Track Order Status Lookup
  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const rawQuery = lookupQuery.trim();
    if (!rawQuery) {
      setLookupError('Please enter your Order ID (e.g. RP-...), registered 10-digit Phone Number, or 12-digit UPI UTR.');
      return;
    }

    setIsLookingUp(true);
    let resolvedOrder: any = null;
    let apiErrorMsg = '';

    // 1. Try server endpoints (/api/reels/order-lookup and alias /api/order-lookup)
    const endpoints = ['/api/reels/order-lookup', '/api/order-lookup'];
    for (const ep of endpoints) {
      if (resolvedOrder) break;
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: rawQuery }),
        });
        const data = await res.json().catch(() => null);
        if (data && data.success && data.order) {
          resolvedOrder = {
            ...data.order,
            links: data.links || (data.order.masterDriveLink ? { masterGoogleDrive: data.order.masterDriveLink } : undefined),
          };
          break;
        } else if (data && data.error) {
          apiErrorMsg = data.error;
        }
      } catch (err) {
        // Network lag or fetch error on endpoint, continue to next
      }
    }

    // 2. Direct Firestore fallback search if server had no match or network issue
    if (!resolvedOrder && db) {
      try {
        const cleanQ = rawQuery.trim();
        const digitsOnly = cleanQ.replace(/[^\d]/g, '');
        const queryVariants = [
          cleanQ,
          cleanQ.toUpperCase(),
          cleanQ.toLowerCase(),
          'RP-' + cleanQ.toUpperCase().replace(/^RP-/, ''),
        ];

        for (const qVariant of queryVariants) {
          if (resolvedOrder) break;
          const snap = await getDoc(doc(db, 'reels_orders', qVariant));
          if (snap.exists()) {
            resolvedOrder = snap.data();
          }
        }

        if (!resolvedOrder) {
          const allDocs = await getDocs(collection(db, 'reels_orders'));
          for (const d of allDocs.docs) {
            const ord = d.data();
            if (!ord) continue;
            const ordId = String(ord.id || '').toLowerCase();
            const ordPhone = String(ord.customerPhone || '').replace(/[^\d]/g, '');
            const ordUtr = String(ord.utrReference || '').replace(/[^\d]/g, '');
            const cleanLower = cleanQ.toLowerCase();

            if (
              ordId === cleanLower ||
              ordId.replace(/^rp-/, '') === cleanLower.replace(/^rp-/, '') ||
              ordId.includes(cleanLower) ||
              (digitsOnly.length >= 7 && ordPhone && (ordPhone.includes(digitsOnly.slice(-10)) || digitsOnly.includes(ordPhone.slice(-10)))) ||
              (digitsOnly.length >= 8 && ordUtr && (ordUtr.includes(digitsOnly) || digitsOnly.includes(ordUtr)))
            ) {
              resolvedOrder = ord;
              break;
            }
          }
        }
      } catch (fsErr) {
        // Firestore read error
      }
    }

    // 3. Check localStorage for last registered order ID match as last-resort convenience
    if (!resolvedOrder) {
      try {
        const savedOrderId = localStorage.getItem('last_reels_order_id');
        if (savedOrderId && (savedOrderId.toLowerCase() === rawQuery.toLowerCase() || rawQuery.toLowerCase().includes(savedOrderId.toLowerCase()))) {
          // Attempt direct fetch of that saved order status
          const res = await fetch(`/api/reels/order-status/${savedOrderId}`).catch(() => null);
          if (res && res.ok) {
            const statusData = await res.json().catch(() => null);
            if (statusData && statusData.order) {
              resolvedOrder = statusData.order;
            }
          }
        }
      } catch (_) {}
    }

    if (resolvedOrder) {
      setLookupResult(resolvedOrder);
      setOrderId(resolvedOrder.id);
      localStorage.setItem('last_reels_order_id', resolvedOrder.id);
      
      const rawStatus = String(resolvedOrder.status || '').toUpperCase();
      const normStatus: ReelOrderStatus =
        rawStatus === 'APPROVED' || rawStatus === 'PAID'
          ? 'APPROVED'
          : rawStatus === 'REJECTED'
          ? 'REJECTED'
          : rawStatus === 'PENDING_ADMIN_REVIEW' || rawStatus === 'PENDING_VERIFICATION' || rawStatus === 'AWAITING_MANUAL_VERIFICATION'
          ? 'PENDING_ADMIN_REVIEW'
          : rawStatus === 'PAYMENT_FAILED'
          ? 'PAYMENT_FAILED'
          : rawStatus === 'REFUNDED'
          ? 'REFUNDED'
          : 'PENDING_PAYMENT';
      setOrderStatus(normStatus);

      if (resolvedOrder.downloadToken) {
        setDownloadToken(resolvedOrder.downloadToken);
      }

      if (normStatus === 'APPROVED') {
        const driveUrl =
          resolvedOrder.masterDriveLink ||
          resolvedOrder.links?.masterGoogleDrive ||
          (resolvedOrder as any).links?.masterGoogleDrive ||
          storeConfig.masterDriveLink ||
          (resolvedOrder.id ? `/api/reels/vault-access/${resolvedOrder.id}` : '');
        setMasterDriveUrl(driveUrl);
        if (!resolvedOrder.downloadToken) {
          setDownloadToken('TOKEN-' + Date.now().toString(36).toUpperCase());
        }
        triggerToast('Your Payment Has Been Verified and Approved!', 'success');
      } else if (normStatus === 'PENDING_ADMIN_REVIEW' || normStatus === 'PENDING_PAYMENT') {
        triggerToast('Your order is waiting for admin approval.', 'info');
      } else if (normStatus === 'REJECTED') {
        triggerToast('Your order has been rejected. Please contact support for assistance.', 'error');
      }
    } else {
      setLookupError(
        apiErrorMsg ||
        `No order found matching "${rawQuery}". Please check your 10-digit mobile number, Order ID (e.g. RP-...), or 12-digit UPI UTR reference.`
      );
    }
    setIsLookingUp(false);
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
        <div className={`px-4 sm:px-6 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/10'
        }`}>
          {[
            {
              id: 'checkout',
              label:
                orderStatus === 'APPROVED'
                  ? '🎉 Download Vault'
                  : orderStatus === 'PENDING_ADMIN_REVIEW'
                  ? '⏳ Awaiting Approval'
                  : `⚡ UPI Checkout (₹${Math.round(storeConfig.productPrice)})`,
            },
            { id: 'track', label: '🔍 Track My Order' },
            { id: 'categories', label: 'Explore 9 Categories' },
            { id: 'included', label: "What's Included" },
            { id: 'faq', label: 'FAQ & Support' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-mono font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CHECKOUT & APPROVAL STATUS */}
          {activeTab === 'checkout' && (
            <div>
              {/* STATE A: APPROVED — DOWNLOAD UNLOCKED */}
              {orderStatus === 'APPROVED' ? (
                <div className="space-y-5">
                  <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                    isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-950/40 border-emerald-500/30 text-white'
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-lg font-bold">Your Payment Has Been Verified and Approved!</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-emerald-300'}`}>
                      Administrator Murari Panjiyar has confirmed your payment receipt. Your digital download access to the complete 150K+ Master Google Drive Vault is now fully unlocked.
                    </p>
                  </div>

                  {/* Complete 53 Resource Clickable Directory & Master Google Drive Access */}
                  <MegaPackBundleDirectory
                    masterDriveLink={masterDriveUrl || (orderId ? `/api/reels/vault-access/${orderId}` : '')}
                    downloadToken={downloadToken}
                    customerName={customerName}
                    orderId={orderId}
                    customerPhone={customerPhone}
                    isUnlocked={orderStatus === 'APPROVED' || orderStatus === 'approved'}
                    orderStatus={orderStatus}
                    onCopyLink={handleCopyLink}
                    copiedLabel={copiedLinkType}
                  />

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderId('');
                        setUtrNumber('');
                        setOrderStatus('PENDING_PAYMENT');
                        setDownloadToken(null);
                        setMasterDriveUrl('');
                      }}
                      className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Unlock another pack / Place new order →
                    </button>
                  </div>
                </div>
              ) : orderStatus === 'PENDING_ADMIN_REVIEW' ? (
                /* STATE B: AWAITING ADMIN APPROVAL — LOCKED */
                <div className="space-y-5">
                  <div className={`p-6 rounded-3xl border text-center space-y-3.5 ${
                    isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-zinc-900/90 border-amber-500/40'
                  }`}>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                      <Clock size={30} />
                    </div>

                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ⏳ Awaiting Administrator Verification
                      </span>
                      <h3 className="text-lg sm:text-xl font-black mt-2 text-white">
                        Your payment is awaiting admin verification and approval.
                      </h3>
                      <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Your request has been submitted and is awaiting admin approval. You will receive download access on this website after approval by Murari Panjiyar.
                      </p>
                    </div>

                    {/* Order & UTR Summary Box */}
                    <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-left font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Order Reference:</span>
                        <span className="font-bold text-white select-all">{orderId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Customer Name:</span>
                        <span className="font-bold text-white">{customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Customer Phone:</span>
                        <span className="font-bold text-emerald-400">{customerPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">12-Digit UTR Submitted:</span>
                        <span className="font-bold text-amber-400 tracking-wider select-all">{utrNumber}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-zinc-400">Amount Paid:</span>
                        <span className="font-black text-emerald-400">₹{storeConfig.productPrice} INR</span>
                      </div>
                    </div>

                    {/* Real-Time Live Status Pulse */}
                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Live status check active... This page will automatically update once Murari approves your order.</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          fetch(`/api/reels/order-status/${orderId}`)
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
                        className={`py-2 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                          isLight ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <RefreshCw size={13} />
                        <span>Check Status Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderStatus('PENDING_PAYMENT')}
                        className={`py-2 px-3 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer`}
                      >
                        Need to edit UTR or phone?
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOrderId('');
                          setUtrNumber('');
                          setOrderStatus('PENDING_PAYMENT');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-mono text-amber-400 hover:underline transition-colors cursor-pointer`}
                      >
                        Place Another Order
                      </button>
                    </div>
                  </div>
                </div>
              ) : orderStatus === 'REJECTED' ? (
                /* STATE C: REJECTED */
                <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                    <XCircle size={30} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Payment Verification Unsuccessful</h3>
                    <p className="text-xs text-red-300 max-w-md mx-auto">
                      {rejectionReason || 'The 12-digit UPI reference number could not be reconciled in the merchant statement.'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOrderStatus('PENDING_PAYMENT')}
                      className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer"
                    >
                      Re-enter Correct 12-Digit UTR
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('faq')}
                      className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold border border-white/10 text-white hover:bg-white/10 cursor-pointer"
                    >
                      Contact Murari Support
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE D: INITIAL CHECKOUT FORM (Name & Phone ONLY — NO Delivery Email!) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Left Column: UPI QR Code & Instructions */}
                  <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-3.5 flex flex-col items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/70 border-white/10'
                  }`}>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold uppercase text-amber-500">
                        Step 1: Scan &amp; Pay ₹{Math.round(storeConfig.productPrice)}
                      </span>
                      <div className="text-xs text-zinc-300">
                        Receiver: <strong className="text-white">{storeConfig.receiverName}</strong>
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

                    {/* UPI ID Box & Copy Button */}
                    <div className="w-full space-y-1.5">
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 px-3 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-black/60 border-white/10'
                      }`}>
                        <span className="text-[11px] font-mono text-amber-400 truncate select-all">
                          {storeConfig.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 rounded text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className={`w-full py-2 rounded-xl text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                          isLight ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        Copy UPI ID
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Customer Details (Name & Phone) + 12-Digit UTR Form */}
                  <form onSubmit={handleSubmitUtr} className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                          Step 2: Enter Details &amp; 12-Digit UTR
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Customer Verification Request
                        </h4>
                        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          After transferring ₹{Math.round(storeConfig.productPrice)} in Google Pay, PhonePe, Paytm, or BHIM, submit your details for Murari to verify and approve.
                        </p>
                      </div>

                      {/* Full Name Input (Required) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-300 flex items-center gap-1">
                          <User size={12} className="text-[#FF5500]" />
                          <span>Full Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-colors ${
                            isLight ? 'bg-white border border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-black/60 border border-white/10 text-white focus:border-amber-400'
                          }`}
                        />
                      </div>

                      {/* Phone Number Input (Required — NO Email!) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-300 flex items-center gap-1">
                          <Phone size={12} className="text-emerald-400" />
                          <span>10-Digit Mobile Phone Number *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-colors font-mono ${
                            isLight ? 'bg-white border border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-black/60 border border-white/10 text-white focus:border-amber-400'
                          }`}
                        />
                      </div>

                      {/* 12-Digit UPI Reference Number (UTR) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                            <Tag size={12} />
                            <span>12-Digit UPI Reference Number (UTR) *</span>
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {utrNumber.replace(/[^\d]/g, '').length}/12 Digits
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 12))}
                          placeholder="e.g. 882349102845"
                          className={`w-full px-3.5 py-3 rounded-xl text-base font-mono font-bold tracking-widest outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-2 border-amber-400 text-slate-900 focus:border-amber-500'
                              : 'bg-black/80 border-2 border-amber-500/60 text-amber-300 focus:border-amber-400'
                          }`}
                        />
                        <p className="text-[10px] text-zinc-400 font-mono">
                          ℹ️ In your UPI payment app receipt, look for "UPI Ref No" or "UTR". Must be exactly 12 numeric digits.
                        </p>
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

                    <button
                      type="submit"
                      disabled={isSubmittingUtr}
                      className="w-full py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 min-h-[46px]"
                    >
                      {isSubmittingUtr ? (
                        <>
                          <RefreshCw size={15} className="animate-spin text-black" />
                          <span>{submissionStatusText || 'Submitting for Verification...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Submit for Admin Approval</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRACK MY ORDER */}
          {activeTab === 'track' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-base sm:text-lg font-black text-white">Track Your Order &amp; Approval Status</h4>
                <p className="text-xs text-zinc-400">
                  Already paid? Check your real-time approval status using your Order ID or registered 10-digit phone number.
                </p>
              </div>

              <form onSubmit={handleLookupOrder} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={e => setLookupQuery(e.target.value)}
                      placeholder="Enter Order ID (e.g. RP-...) or Mobile Phone"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono outline-none ${
                        isLight ? 'bg-white border border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-black/70 border border-white/10 text-white focus:border-amber-400'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="py-3 px-5 rounded-xl font-mono text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                  >
                    {isLookingUp ? 'Searching...' : 'Find Order'}
                  </button>
                </div>

                {lookupError && (
                  <p className="text-xs text-rose-400 font-mono text-center">{lookupError}</p>
                )}
              </form>

              {lookupResult && (
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-white font-bold">{lookupResult.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      String(lookupResult.status || '').toUpperCase() === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : String(lookupResult.status || '').toUpperCase() === 'PENDING_ADMIN_REVIEW' || String(lookupResult.status || '').toUpperCase() === 'PENDING_VERIFICATION'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {String(lookupResult.status || '').toUpperCase() === 'APPROVED' ? 'APPROVED & READY' : lookupResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block">Customer Name:</span>
                      <span className="text-white font-bold">{lookupResult.customerName || 'Valued Customer'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Phone Number:</span>
                      <span className="text-emerald-400 font-bold">{lookupResult.customerPhone || 'Verified'}</span>
                    </div>
                  </div>

                  {lookupResult.utrReference && (
                    <div className="text-[11px] border-t border-white/5 pt-1.5 flex items-center justify-between">
                      <span className="text-zinc-500">12-Digit UPI UTR:</span>
                      <span className="text-amber-300 font-bold">{lookupResult.utrReference}</span>
                    </div>
                  )}

                  {String(lookupResult.status || '').toUpperCase() === 'APPROVED' ? (
                    <div className="pt-2 space-y-3">
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-1">
                        <p className="font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={15} />
                          <span>Your Payment Has Been Verified and Approved!</span>
                        </p>
                        <p className="text-[11px] text-zinc-300">
                          Your digital access to the 150K+ Master Google Drive Vault has been unlocked.
                        </p>
                      </div>

                      <a
                        href={lookupResult.masterDriveLink || masterDriveUrl || storeConfig.masterDriveLink || (lookupResult.id ? `/api/reels/vault-access/${lookupResult.id}` : '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl font-bold uppercase bg-emerald-500 text-black flex items-center justify-center gap-2 hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.99]"
                      >
                        <ExternalLink size={15} />
                        <span>Open Google Drive Master Vault (150K+ Reels)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('categories');
                        }}
                        className="w-full py-2 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Explore Video Folders &amp; Asset Categories →
                      </button>
                    </div>
                  ) : String(lookupResult.status || '').toUpperCase() === 'PROCESSING' ? (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs text-center space-y-1">
                      <p className="font-bold">Processing</p>
                      <p className="text-[11px] text-zinc-300">
                        Your order is being processed.
                      </p>
                    </div>
                  ) : String(lookupResult.status || '').toUpperCase() === 'DELIVERED' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-1">
                      <p className="font-bold">Delivered</p>
                      <p className="text-[11px] text-zinc-300">
                        Your pack has been delivered.
                      </p>
                    </div>
                  ) : String(lookupResult.status || '').toUpperCase() === 'PENDING_ADMIN_REVIEW' || String(lookupResult.status || '').toUpperCase() === 'PENDING_VERIFICATION' || String(lookupResult.status || '').toUpperCase() === 'PENDING_PAYMENT' || String(lookupResult.status || '').toUpperCase() === 'PENDING_APPROVAL' ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center space-y-1">
                      <p className="font-bold">Your order is waiting for admin approval.</p>
                      <p className="text-[11px] text-zinc-300">
                        Administrator Murari Panjiyar is reconciling your 12-digit UTR in BharatPe. Once approved, your Google Drive link will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
                      <p className="font-bold">Your order has been rejected. Please contact support for assistance.</p>
                      <p className="text-[11px] text-zinc-300">
                        Reason: {lookupResult.rejectionReason || 'UTR could not be matched against current BharatPe statement.'}
                      </p>
                      <a
                        href="https://wa.me/919864361940?text=Hello%20Murari,%20I%20need%20help%20with%20my%20Reels%20Pack%20order"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                      >
                        Contact Murari Panjiyar on WhatsApp (+91 9864361940) →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPLORE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black tracking-tight text-white">
                    Verified Digital Video Categories
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    All 9 categories are organized in folders inside the Master Google Drive Vault.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('checkout')}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-black uppercase bg-amber-500 text-black hover:bg-amber-400 self-start sm:self-auto cursor-pointer"
                >
                  {orderStatus === 'APPROVED' ? 'View My Links' : `Unlock All for ₹${Math.round(storeConfig.productPrice)}`}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-amber-500 uppercase">
                        {cat.count}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        {cat.sampleAspect}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold tracking-tight text-white">
                      {cat.name}
                    </h5>

                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {cat.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300">
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
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className="text-sm font-bold text-amber-500 uppercase font-mono flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Verified Pack Specifications
                  </h5>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong>Total Count:</strong> 150,000+ Raw Short-Form Video Clips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong>Aspect Ratio:</strong> 9:16 Vertical format (1080x1920 Full HD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong>Video Format:</strong> H.264 MP4 (Universal CapCut, Premiere, InShot compatibility)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong>Watermarks:</strong> 100% Watermark-free, logo-free clean footage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><strong>Storage Delivery:</strong> High-Speed Master Google Drive Vault</span>
                    </li>
                  </ul>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className="text-sm font-bold text-emerald-500 uppercase font-mono flex items-center gap-2">
                    <ShieldCheck size={16} />
                    License &amp; Usage Permissions
                  </h5>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Personal and commercial content creation rights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Eligible for monetization on YouTube Shorts, Instagram Reels, and TikTok</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>No attribution required when published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Lifetime access with no recurring subscription fees</span>
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
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    <HelpCircle size={15} className="text-amber-500" />
                    How does payment verification work?
                  </h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Scan our verified BharatPe UPI QR code and pay ₹{Math.round(storeConfig.productPrice)}. Submit your full name, phone number, and 12-digit UPI UTR. Administrator Murari Panjiyar checks your credit against the BharatPe merchant statement and approves your order to unlock your Google Drive Master Vault.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-white/10'
                }`}>
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    <HelpCircle size={15} className="text-amber-500" />
                    How long does approval take?
                  </h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Murari reviews incoming payments promptly, typically within 5 to 30 minutes. Once approved, your order unlocks automatically without you needing to reload the page.
                  </p>
                </div>
              </div>

              {/* Direct Support Form (NO Email!) */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#FF5500]" />
                  <h5 className="font-bold text-sm text-white">Contact Murari Panjiyar for Assistance</h5>
                </div>

                {supportSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono text-center">
                    ✅ Your inquiry has been received! Murari will reach out to your phone number shortly.
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
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none ${
                          isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-black/60 border border-white/10 text-white'
                        }`}
                      />
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={e => setSupportPhone(e.target.value)}
                        placeholder="Your Phone Number"
                        className={`w-full px-3.5 py-2.5 rounded-xl outline-none ${
                          isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-black/60 border border-white/10 text-white'
                        }`}
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      placeholder="Describe your issue or question regarding your UPI payment..."
                      className={`w-full px-3.5 py-2.5 rounded-xl outline-none ${
                        isLight ? 'bg-white border border-slate-300 text-slate-900' : 'bg-black/60 border border-white/10 text-white'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSendingSupport}
                      className="py-2.5 px-5 rounded-xl font-bold bg-[#FF5500] hover:bg-orange-600 text-white cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
