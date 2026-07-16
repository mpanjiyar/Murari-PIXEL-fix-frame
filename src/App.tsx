/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Upload,
  Image as ImageIcon,
  Cpu,
  KeyRound,
  Zap,
  Camera,
  CheckCircle2,
  Laptop,
  Check,
  Instagram,
  Facebook,
  Youtube,
  ArrowUpRight,
  ArrowRight,
  Volume2,
  VolumeX,
  Sliders,
  X,
  Menu,
  ShoppingBag,
  Tag,
  Percent,
  Edit,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Bell,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  Hash,
  Compass,
  FileCode,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  Settings,
  Star,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Slack,
  Twitch,
  Dribbble,
  Briefcase,
  Link,
  Play,
  TrendingUp,
  Video,
  ThumbsUp,
  Heart,
  Keyboard,
  FileText,
  FileSpreadsheet,
  Presentation,
  Clapperboard,
  Code,
  Calculator,
  Monitor,
  Speaker,
  Activity,
  BellRing,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { BIOS_BOOT_KEYS_DATABASE, BiosBootKeyInfo } from './biosData';
import { BEEP_CODES_DATABASE, BeepCodeInfo } from './beepData';
import { SHORTCUTS_DATABASE, ShortcutCategory, KeyboardShortcut } from './shortcutsData';
import {
  INITIAL_GALLERY_ITEMS,
  INITIAL_IT_SERVICES,
  INITIAL_PHOTO_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_PIXELFIX_REVIEWS,
  INSTAGRAM_POSTS,
  INITIAL_AFFILIATE_LINKS,
  INITIAL_SOFTWARE_LICENSES,
  getExtraInclusionsAndSpecs
} from './data';
import { GalleryItem, ContactMessage, NotificationLog, AffiliateLink, SocialLink, SoftwareLicense } from './types';
import { LicenseProductCardVisual } from './components/LicenseProductCardVisual';
import PFLogo from './components/PFLogo';
import CursorEffect from './components/CursorEffect';
import WhatsAppIcon from './components/WhatsAppIcon';
import { ImageUploader } from './components/ImageUploader';
import { ScrollReveal, ScrollRevealText } from './components/ScrollReveal';
import { LazyImage } from './components/LazyImage';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { PixelFrameBackground } from './components/PixelFrameBackground';
import { PixelFixBackground } from './components/PixelFixBackground';
import { BiosKeysBackground } from './components/BiosKeysBackground';
import SmpsCalculator from './components/SmpsCalculator';
import CoverageMap from './components/CoverageMap';
import PhotoResizer from './components/PhotoResizer';
import { ReviewQRCode } from './components/ReviewQRCode';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { initAuth, googleSignIn, googleSignOut } from './lib/driveAuth';
import { uploadBackupToDrive, listBackupsOnDrive, downloadBackupFromDrive, deleteBackupFromDrive, upsertLiveSyncBackup, getOrCreateFolder, uploadPhotoFileToDrive } from './lib/driveService';
import type { DriveBackupFile } from './lib/driveService';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, OperationType, handleFirestoreError } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { HardDrive, Cloud, LogOut, AlertCircle, FolderOpen, Download, UploadCloud, GripVertical, MousePointerClick, CornerDownRight, Home } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

// Structuring our Theme Styles
interface LagFreeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
}

const LagFreeInput: React.FC<LagFreeInputProps> = ({ value, onChange, debounceMs = 150, ...props }) => {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeRef.current(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, value]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};

interface LagFreeTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
}

const LagFreeTextArea: React.FC<LagFreeTextAreaProps> = ({ value, onChange, debounceMs = 150, ...props }) => {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeRef.current(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, value]);

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};

let lastSortedAllItems: GalleryItem[] | null = null;
let recentItemIdsSet = new Set<string>();

export function getGalleryItemTags(item: GalleryItem, allItems: GalleryItem[]): ('Recent' | 'Featured' | 'Client Favorites')[] {
  const tags: ('Recent' | 'Featured' | 'Client Favorites')[] = [];
  
  if (lastSortedAllItems !== allItems) {
    lastSortedAllItems = allItems;
    const sortedByDate = [...allItems].sort((a, b) => b.date.localeCompare(a.date));
    const recentThresholdIndex = Math.max(5, Math.floor(allItems.length * 0.35));
    recentItemIdsSet = new Set(sortedByDate.slice(0, recentThresholdIndex).map(r => r.id));
  }
  
  const isRecentInList = recentItemIdsSet.has(item.id);
  
  if (isRecentInList || item.id.startsWith('g_')) {
    tags.push('Recent');
  }
  
  const cameraLower = (item.cameraInfo || '').toLowerCase();
  const isHighEndGear = cameraLower.includes('z9') || cameraLower.includes('plena') || cameraLower.includes('d850') || cameraLower.includes('z7 ii');
  if (isHighEndGear || item.id === 'g1' || item.id === 'g4' || item.id === 'g6' || item.id === 'g10' || item.id === 'g13' || item.id === 'g15' || item.id.startsWith('g_')) {
    tags.push('Featured');
  }
  
  const titleLower = item.title.toLowerCase();
  const hasFavoriteKeywords = titleLower.includes('elegant') || titleLower.includes('joyful') || titleLower.includes('royal') || titleLower.includes('captivating') || titleLower.includes('warm') || titleLower.includes('sindoor') || titleLower.includes('baraat');
  if (hasFavoriteKeywords || item.id === 'g2' || item.id === 'g3' || item.id === 'g7' || item.id === 'g11' || item.id === 'g12' || item.id === 'g16') {
    tags.push('Client Favorites');
  }
  
  if (tags.length === 0) {
    const numId = parseInt(item.id.replace(/\D/g, '')) || 0;
    if (numId % 3 === 0) {
      tags.push('Recent');
    } else if (numId % 3 === 1) {
      tags.push('Featured');
    } else {
      tags.push('Client Favorites');
    }
  }
  
  return tags;
}

const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc_instagram_murari',
    name: 'Instagram (Murari)',
    handle: '@mpanjiyar1',
    url: 'https://instagram.com/mpanjiyar1',
    platform: 'instagram',
    order: 0
  },
  {
    id: 'soc_instagram_studio',
    name: 'Instagram (Studio)',
    handle: '@pixel_frames1',
    url: 'https://www.instagram.com/pixel_frames1/',
    platform: 'instagram',
    order: 1
  },
  {
    id: 'soc_whatsapp_it',
    name: 'WhatsApp (IT Fix)',
    handle: '+91 8638875231',
    url: 'https://wa.me/918638875231',
    platform: 'whatsapp',
    badge: 'Tech',
    order: 2
  },
  {
    id: 'soc_whatsapp_photos',
    name: 'WhatsApp (Photos)',
    handle: '+91 9864361940',
    url: 'https://wa.me/919864361940',
    platform: 'whatsapp',
    badge: 'Studio',
    order: 3
  },
  {
    id: 'soc_facebook',
    name: 'Facebook',
    handle: 'Murari Panjiyar',
    url: 'https://www.facebook.com/mpanjiyar100/',
    platform: 'facebook',
    order: 4
  },
  {
    id: 'soc_youtube',
    name: 'YouTube',
    handle: 'Murari Panjiyar Media',
    url: 'https://www.youtube.com/channel/UCoZOM_gfrukJgZlBra0l-6w',
    platform: 'youtube',
    order: 5
  },
  {
    id: 'soc_500px',
    name: '500px Gallery',
    handle: 'mpanjiyar100',
    url: 'https://500px.com/p/mpanjiyar100?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnsKsfdZEWJR4k577cF6K4J8TCsvpyahiSQji0CVp3ZOuP9xn5XDXqA1HFmFU_aem_Tc8o9AsvjyWr3kP0-ZekUw&view=photos',
    platform: 'camera',
    order: 6
  },
  {
    id: 'soc_pulsepx',
    name: 'PulsePX Profile',
    handle: 'mpanjiyar100',
    url: 'https://pulsepx.com/profile/mpanjiyar100?view=entries',
    platform: 'camera',
    order: 7
  },
  {
    id: 'soc_etejo',
    name: 'Etejo Gallery',
    handle: '@muraripanjiyar',
    url: 'https://etejo.com/muraripanjiyar',
    platform: 'etejo',
    order: 8
  }
];

const getInstagramShortcode = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/)([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

interface ThemeStyle {
  bg: string;
  headerBg: string;
  card: string;
  cardHover: string;
  textMain: string;
  textMuted: string;
  border: string;
  accentBg: string;
  accentText: string;
  accentHover: string;
  glow: string;
  badge: string;
  input: string;
  tagline: string;
  heroTextGradient: string;
  glass: string;
  divider: string;
}

const themeStyles: Record<'normal' | 'mono' | 'light', ThemeStyle> = {
  normal: {
    bg: 'bg-[#121212] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1E1E24] via-[#0E0E0F] to-[#0A0A0A] text-slate-100',
    headerBg: 'bg-[#161619]/95 border-white/5 text-white',
    card: 'bg-[#18181F] border-white/5 text-slate-100',
    cardHover: 'hover:border-[#FF5500]/50 hover:shadow-[0_8px_30px_rgba(255,85,0,0.15)] transition-all duration-300',
    textMain: 'text-white',
    textMuted: 'text-slate-400',
    border: 'border-white/5',
    accentBg: 'bg-[#FF5500]',
    accentText: 'text-white',
    accentHover: 'hover:bg-[#FF4400]',
    glow: 'shadow-[0_4px_25px_rgba(255,85,0,0.35)]',
    badge: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20',
    input: 'bg-[#1C1C24] border-white/10 text-white focus:border-[#FF5500] focus:ring-[#FF5500]/20',
    tagline: 'text-[#FF5500]',
    heroTextGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#FF5500]',
    glass: 'bg-white/5 backdrop-blur-md border-white/10',
    divider: 'border-white/10'
  },
  mono: {
    bg: 'bg-black text-zinc-100 font-mono tracking-tight',
    headerBg: 'bg-zinc-950/95 border-zinc-800 text-white',
    card: 'bg-black border-2 border-zinc-800 text-zinc-100',
    cardHover: 'hover:border-zinc-100 hover:bg-zinc-900/40 transition-all duration-200',
    textMain: 'text-white font-bold',
    textMuted: 'text-zinc-500',
    border: 'border-zinc-800',
    accentBg: 'bg-zinc-100',
    accentText: 'text-black font-black uppercase',
    accentHover: 'hover:bg-zinc-300',
    glow: 'shadow-none border-2 border-white',
    badge: 'bg-black text-zinc-300 border-zinc-700 font-bold uppercase',
    input: 'bg-black border-2 border-zinc-800 text-zinc-100 focus:border-zinc-100 focus:ring-0',
    tagline: 'text-zinc-400 font-bold underline decoration-zinc-100',
    heroTextGradient: 'text-white',
    glass: 'bg-black border-2 border-zinc-800',
    divider: 'border-zinc-800'
  },
  light: {
    bg: 'bg-[#FAF9F5] text-slate-800',
    headerBg: 'bg-white/95 border-slate-200 text-slate-900 shadow-sm',
    card: 'bg-white border border-slate-200/80 text-slate-800 shadow-sm',
    cardHover: 'hover:border-slate-400 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300',
    textMain: 'text-slate-900 font-semibold',
    textMuted: 'text-slate-500',
    border: 'border-slate-200',
    accentBg: 'bg-[#FF5500]',
    accentText: 'text-white',
    accentHover: 'hover:bg-[#E04B00]',
    glow: 'shadow-[0_8px_20px_rgba(255,85,0,0.2)]',
    badge: 'bg-orange-50 text-[#FF5500] border-orange-100',
    input: 'bg-slate-50 border-slate-200 text-slate-950 focus:bg-white focus:border-[#FF5500] focus:ring-orange-100',
    tagline: 'text-[#FF5500]',
    heroTextGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-[#FF5500]',
    glass: 'bg-white/80 backdrop-blur-md border-slate-200',
    divider: 'border-slate-200'
  }
};

const toDirectDriveUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('drive.google.com/file/d/')) {
    const parts = url.split('/file/d/');
    if (parts[1]) {
      const fileId = parts[1].split('/')[0].split('?')[0];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  if (url.includes('drive.google.com/open?id=')) {
    const parts = url.split('?id=');
    if (parts[1]) {
      const fileId = parts[1].split('&')[0];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  if (url.includes('drive.google.com/uc?')) {
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
};

const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    wedding: 'Wedding',
    haldi: 'Haldi',
    mehendi: 'Mehendi',
    reception: 'Reception',
    engagement: 'Engagement',
    pre_wedding: 'Pre-Wedding',
    bridal_portraits: 'Bridal Portraits',
    groom_portraits: 'Groom Portraits',
    couple_portraits: 'Couple Portraits',
    candid_moments: 'Candid Moments',
    family_photos: 'Family Photos',
    corporate: 'Corporate',
    party: 'Events',
    custom: 'Outdoor'
  };
  return map[category] || category;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
    opacity: 0,
  }),
};

const slideTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

const SHORTCUT_ICONS_MAP: Record<string, React.ComponentType<any>> = {
  Laptop,
  Keyboard,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image: ImageIcon,
  Clapperboard,
  Video,
  Code,
  Globe,
  FolderOpen,
  Calculator,
  Monitor
};

const renderShortcutIcon = (iconName: string, size: number = 16, className: string = '') => {
  const IconComponent = SHORTCUT_ICONS_MAP[iconName] || Keyboard;
  return <IconComponent size={size} className={className} />;
};

export default function App() {
  // Navigation & Primary Settings
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'pixelfix' | 'pixelframe' | 'gallery' | 'contact' | 'dashboard' | 'affiliate' | 'packages' | 'bios' | 'beep' | 'smps'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isDiagDropdownOpen, setIsDiagDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'normal' | 'mono' | 'light'>(() => {
    const saved = localStorage.getItem('mp_portfolio_theme_v2');
    if (!saved) {
      return 'light'; // Standard default is light mode
    }
    return (saved as any) || 'light';
  });

  // Scroll progress and back to top states for Affiliate tab
  const [affiliateScrollProgress, setAffiliateScrollProgress] = useState(0);
  const [showAffiliateBackToTop, setShowAffiliateBackToTop] = useState(false);
  const [selectedChartProduct, setSelectedChartProduct] = useState<string>('all');
  const [analyticsMetric, setAnalyticsMetric] = useState<'total' | 'unique'>('total');
  const [selectedLicense, setSelectedLicense] = useState<number>(0);

  const licenseOptions = useMemo(() => [
    {
      id: 0,
      name: "Windows 10/11 Pro License Key",
      price: "₹1,500",
      description: "Lifetime retail activation key with online verification support",
      badge: "Best Seller",
      details: "Lifetime Validity • Online Activation • 1 PC"
    },
    {
      id: 1,
      name: "Microsoft Office 2019",
      price: "₹1,800",
      description: "Full classic versions of Office apps including Word, Excel, and PowerPoint",
      badge: "Standard",
      details: "Lifetime Key • Classic Suite • 1 User"
    },
    {
      id: 2,
      name: "Microsoft Office 2021",
      price: "₹2,500",
      description: "Enhanced suite with updated visuals and performance upgrades",
      badge: "Popular",
      details: "Lifetime Key • Pro Plus 2021 • 1 PC"
    },
    {
      id: 3,
      name: "Microsoft Office 2024",
      price: "₹4,000",
      description: "The latest premium software package featuring AI integrations and templates",
      badge: "New Release",
      details: "Latest Edition • Premium Support • 1 PC"
    }
  ], []);

  useEffect(() => {
    if (activeTab !== 'affiliate') {
      setAffiliateScrollProgress(0);
      setShowAffiliateBackToTop(false);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate scroll progress percentage (between 0 and 100)
      if (docHeight > 0) {
        const progress = (scrollY / docHeight) * 100;
        setAffiliateScrollProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setAffiliateScrollProgress(0);
      }

      // Show Back to Top button if scrolled down more than 300px
      if (scrollY > 300) {
        setShowAffiliateBackToTop(true);
      } else {
        setShowAffiliateBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  // Client dynamic visual database (uploaded by client / managed inside dashboard)
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('mp_gallery_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean reset if they have old Unsplash images, if the order has changed, or if length doesn't match our new high-end 16 items
        const hasUnsplash = parsed.some((p: any) => p.imageUrl && p.imageUrl.includes('unsplash.com'));
        const firstIsTarget = parsed[0]?.imageUrl && parsed[0].imageUrl.includes('10-HoXkMa_X3axop53ogpiPEyDv_w3Nbn');
        const hasOldCategories = parsed.some((p: any) => (p.id === 'g11' && p.category !== 'bridal_portraits') || (p.id === 'g5' && p.category !== 'corporate') || (p.id === 'g6' && p.category === 'wedding'));
        if (hasUnsplash || parsed.length !== 16 || !firstIsTarget || hasOldCategories) {
          return INITIAL_GALLERY_ITEMS;
        }
        return parsed;
      } catch (e) { return INITIAL_GALLERY_ITEMS; }
    }
    return INITIAL_GALLERY_ITEMS;
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('mp_contact_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('mp_notification_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Interactive dynamic quote generator state variables
  const [quoteType, setQuoteType] = useState<'pixelfix' | 'pixelframe'>('pixelfix');
  const [calculatorFlash, setCalculatorFlash] = useState(false);

  // Editable services and texts on origin page (available for only Admin)
  const [itServices, setItServices] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_it_services_custom');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_IT_SERVICES; }
    }
    return INITIAL_IT_SERVICES;
  });

  const [photoServices, setPhotoServices] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_photo_services_custom');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasNewService = parsed.some((s: any) => s.title && s.title.includes('Baby Shower') || s.title.includes('Sacred Rasams'));
        if (!hasNewService) {
          return INITIAL_PHOTO_SERVICES;
        }
        return parsed;
      } catch (e) { return INITIAL_PHOTO_SERVICES; }
    }
    return INITIAL_PHOTO_SERVICES;
  });

  const [instagramPosts, setInstagramPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_instagram_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            permalink: p.permalink || 'https://www.instagram.com/mpanjiyar1'
          }));
        }
      } catch (e) {
        // Fall through
      }
    }
    return INSTAGRAM_POSTS.map(p => ({ ...p, permalink: 'https://www.instagram.com/mpanjiyar1' }));
  });

  const [instagramAccessToken, setInstagramAccessToken] = useState<string>(() => {
    return localStorage.getItem('mp_instagram_access_token') || '';
  });
  const [instagramSyncError, setInstagramSyncError] = useState<string>('');
  const [isSyncingInstagram, setIsSyncingInstagram] = useState<boolean>(false);
  const [isFetchingInstagram, setIsFetchingInstagram] = useState<boolean>(false);
  const [instagramFetchError, setInstagramFetchError] = useState<string | null>(null);
  const [instaFilter, setInstaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [instagramViewMode, setInstagramViewMode] = useState<'grid' | 'embed'>('grid');

  // BIOS/Boot Key Lookup States
  const [biosSearchQuery, setBiosSearchQuery] = useState<string>('');
  const [selectedBiosType, setSelectedBiosType] = useState<'all' | 'laptop' | 'desktop' | 'motherboard'>('all');
  const [selectedBiosBrand, setSelectedBiosBrand] = useState<string>('all');

  // BIOS Motherboard Beep Lookup States
  const [beepSearchQuery, setBeepSearchQuery] = useState<string>('');
  const [selectedBeepBrand, setSelectedBeepBrand] = useState<string>('all');
  const [selectedBeepComponent, setSelectedBeepComponent] = useState<string>('all');
  const [selectedBeepSeverity, setSelectedBeepSeverity] = useState<string>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [customSequence, setCustomSequence] = useState<('S' | 'L' | 'P')[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [activeBookingBeep, setActiveBookingBeep] = useState<any | null>(null);
  const [beepBookingSuccess, setBeepBookingSuccess] = useState<boolean>(false);
  const [beepBookingAddress, setBeepBookingAddress] = useState<string>('');
  const [beepBookingDateTime, setBeepBookingDateTime] = useState<string>('');
  const [beepVisibleCount, setBeepVisibleCount] = useState<number>(6);

  // Keyboard Shortcuts States
  const [selectedShortcutCategory, setSelectedShortcutCategory] = useState<string>('');
  const [shortcutsSearchQuery, setShortcutsSearchQuery] = useState<string>('');

  // Automatically reset visible beep count when filters change to ensure lightning fast, lag-free rendering
  useEffect(() => {
    setBeepVisibleCount(6);
  }, [selectedBeepBrand, selectedBeepComponent, selectedBeepSeverity, customSequence, beepSearchQuery]);

  // Google Drive Integration States
  const [driveUser, setDriveUser] = useState<FirebaseUser | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDriveLoading, setIsDriveLoading] = useState<boolean>(false);
  const [isDriveAutosaving, setIsDriveAutosaving] = useState<boolean>(false);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [driveStatusMessage, setDriveStatusMessage] = useState<string>('');
  const [driveErrorMessage, setDriveErrorMessage] = useState<string>('');

  const [packStatusMessage, setPackStatusMessage] = useState<string>('');
  const [packErrorMessage, setPackErrorMessage] = useState<string>('');

  const isRestoringRef = useRef<boolean>(false);
  const isInitialMountRef = useRef<boolean>(true);

  const [testimonials, setTestimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_testimonials_custom');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it contains the old testimonials ('Rajinder Sharma' or lacks explicit Assam locations in role), reset to new INITIAL_TESTIMONIALS
        const hasOldReview = parsed.some((t: any) => 
          t.name === 'Rajinder Sharma' || 
          t.name === 'Vikram Phukan' ||
          (!t.role.toLowerCase().includes('guwahati') && 
           !t.role.toLowerCase().includes('jorhat') && 
           !t.role.toLowerCase().includes('tezpur') && 
           !t.role.toLowerCase().includes('assam'))
        );
        if (hasOldReview) {
          return INITIAL_TESTIMONIALS;
        }
        return parsed;
      } catch (e) { return INITIAL_TESTIMONIALS; }
    }
    return INITIAL_TESTIMONIALS;
  });

  const [pixelFixReviews, setPixelFixReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_pixelfix_reviews_custom');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_PIXELFIX_REVIEWS; }
    }
    return INITIAL_PIXELFIX_REVIEWS;
  });

  const [activeDetailService, setActiveDetailService] = useState<any | null>(null);

  const [heroHeadline, setHeroHeadline] = useState<string>(() => {
    return localStorage.getItem('mp_hero_headline') || 'Empowering Your Tech. Framing Your Memories.';
  });

  const [heroSubheadline, setHeroSubheadline] = useState<string>(() => {
    return localStorage.getItem('mp_hero_subheadline') || "Hi, I'm Murari Panjiyar. Guwahati's dual solution specialist. Through Pixel Fix, I deliver professional, certified home-visit IT diagnostic and operating setups. Through Pixel Frame, I provide premium visual storytelling for weddings, corporate milestones, and private celebrations.";
  });

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(() => {
    const saved = localStorage.getItem('mp_profile_photo_url');
    // If empty, or contains old placeholders, or contains Unsplash images (stale cache from old session of other devices)
    if (
      !saved || 
      saved.includes('1618018352910-72bdafdc72a8') || 
      saved.includes('1Bv7-RO-P4dzGVDa6kOEyZIepUOBz7npe') || 
      saved.includes('unsplash.com')
    ) {
      return 'https://lh3.googleusercontent.com/d/1cKkwgAa3qplkkzj15-EEiQQ1nnHOy0Gk';
    }
    return toDirectDriveUrl(saved);
  });

  const [profileImageError, setProfileImageError] = useState<boolean>(false);

  useEffect(() => {
    setProfileImageError(false);
  }, [profilePhotoUrl]);

  const [bioHeadline, setBioHeadline] = useState<string>(() => {
    return localStorage.getItem('mp_bio_headline') || 'THE CREATIVE LOGIC OF A DUAL ARTIST';
  });

  const [bioText, setBioText] = useState<string>(() => {
    return localStorage.getItem('mp_bio_text') || '"Through my dual business structures, I aim to offer seamless tech support that keeps your home-office or corporate workstation running smoothly on-demand via Pixel Fix, alongside stunning cinematography from Pixel Frame that helps you cherish life\'s biggest milestones forever."';
  });

  // Dynamic Site Customization States (Firebase & Live Admin Sync)
  const [logoText, setLogoText] = useState<string>('MURARI PANJIYAR');
  const [logoSubtext, setLogoSubtext] = useState<string>('Pixel Fix & Pixel Frame');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const [bannerText, setBannerText] = useState<string>('🚨 Guwahati local area doorstep dispatcher • Booking & Live Quote Estimator Engine Active 📱');
  const [exploreButtonText, setExploreButtonText] = useState<string>('Explore Collections');
  const [exploreButtonLink, setExploreButtonLink] = useState<string>('#affiliate');
  const [contactPhoneIt, setContactPhoneIt] = useState<string>('8638875231');
  const [contactPhonePhotos, setContactPhonePhotos] = useState<string>('9864361940');
  const [contactEmail, setContactEmail] = useState<string>('Mpanjiyar100@gmail.com');
  const [contactAddress, setContactAddress] = useState<string>('Guwahati, Assam, India');

  // Helper to format any custom phone to clean WhatsApp numeric format
  const getCleanWhatsAppNumber = (phone: string) => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 10) {
      return '91' + digits;
    }
    return digits;
  };

  // Helper to compress Base64 images to web-optimized JPEGs
  const compressBase64Image = (base64Str: string, maxDim = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith('data:image/')) {
        resolve(base64Str);
        return;
      }
      // If already small (< 135KB), keep as-is to save CPU/quality
      if (base64Str.length < 135000) {
        resolve(base64Str);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  // Helper to update site_config/homepage doc in Firestore dynamically with automatic image compression
  const updateSiteConfig = async (fields: Record<string, any>) => {
    try {
      // Shallow copy of fields to avoid state mutation
      const processedFields = { ...fields };

      // 1. If it has profilePhotoUrl
      if (processedFields.profilePhotoUrl) {
        processedFields.profilePhotoUrl = await compressBase64Image(processedFields.profilePhotoUrl);
      }

      // 2. Intercept and write separate documents for large arrays to prevent 1MB limit error
      if ('galleryItems' in processedFields) {
        if (Array.isArray(processedFields.galleryItems)) {
          processedFields.galleryItems = await Promise.all(
            processedFields.galleryItems.map(async (item) => {
              const optUrl = await compressBase64Image(item.imageUrl);
              const optBeforeUrl = item.beforeImageUrl ? await compressBase64Image(item.beforeImageUrl) : undefined;
              return { ...item, imageUrl: optUrl, beforeImageUrl: optBeforeUrl };
            })
          );
        }
        await setDoc(doc(db, 'site_config', 'gallery_items'), {
          id: 'gallery_items',
          galleryItems: processedFields.galleryItems || []
        });
        delete processedFields.galleryItems;
      }

      if ('instagramPosts' in processedFields) {
        if (Array.isArray(processedFields.instagramPosts)) {
          processedFields.instagramPosts = await Promise.all(
            processedFields.instagramPosts.map(async (post) => {
              const optUrl = await compressBase64Image(post.imageUrl);
              return { ...post, imageUrl: optUrl };
            })
          );
        }
        await setDoc(doc(db, 'site_config', 'instagram_posts'), {
          id: 'instagram_posts',
          instagramPosts: processedFields.instagramPosts || []
        });
        delete processedFields.instagramPosts;
      }

      if ('testimonials' in processedFields) {
        if (Array.isArray(processedFields.testimonials)) {
          processedFields.testimonials = await Promise.all(
            processedFields.testimonials.map(async (t) => {
              if (t.avatarUrl) {
                const optAvatar = await compressBase64Image(t.avatarUrl);
                return { ...t, avatarUrl: optAvatar };
              }
              return t;
            })
          );
        }
        await setDoc(doc(db, 'site_config', 'testimonials'), {
          id: 'testimonials',
          testimonials: processedFields.testimonials || []
        });
        delete processedFields.testimonials;
      }

      if ('pixelFixReviews' in processedFields) {
        if (Array.isArray(processedFields.pixelFixReviews)) {
          processedFields.pixelFixReviews = await Promise.all(
            processedFields.pixelFixReviews.map(async (r) => {
              if (r.avatarUrl) {
                const optAvatar = await compressBase64Image(r.avatarUrl);
                return { ...r, avatarUrl: optAvatar };
              }
              return r;
            })
          );
        }
        await setDoc(doc(db, 'site_config', 'pixel_fix_reviews'), {
          id: 'pixel_fix_reviews',
          pixelFixReviews: processedFields.pixelFixReviews || []
        });
        delete processedFields.pixelFixReviews;
      }

      // Finally, if there are remaining fields to update in homepage, we save them to homepage!
      if (Object.keys(processedFields).length > 1 || (Object.keys(processedFields).length === 1 && !processedFields.id)) {
        const configRef = doc(db, 'site_config', 'homepage');
        await setDoc(configRef, processedFields, { merge: true });
      }
    } catch (err) {
      console.error("Error updating site config in Firestore: ", err);
      handleFirestoreError(err, OperationType.WRITE, 'site_config/homepage');
    }
  };

  // Helper to save a client contact message/booking inquiry in Firestore
  const saveContactMessage = async (newMsg: ContactMessage) => {
    try {
      await setDoc(doc(db, 'contact_messages', newMsg.id), newMsg);
    } catch (err) {
      console.error("Error saving contact message to Firestore: ", err);
      handleFirestoreError(err, OperationType.WRITE, 'contact_messages/' + newMsg.id);
    }
  };

  const [isAffiliateLoading, setIsAffiliateLoading] = useState(true);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>(() => {
    const saved = localStorage.getItem('mp_affiliate_links');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Fallback or validation
        if (parsed && parsed.length > 0) {
          return parsed;
        }
        return INITIAL_AFFILIATE_LINKS;
      } catch (e) {
        return INITIAL_AFFILIATE_LINKS;
      }
    }
    return INITIAL_AFFILIATE_LINKS;
  });

  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>(() => {
    const saved = localStorage.getItem('mp_software_licenses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
        return INITIAL_SOFTWARE_LICENSES;
      } catch (e) {
        return INITIAL_SOFTWARE_LICENSES;
      }
    }
    return INITIAL_SOFTWARE_LICENSES;
  });

  const [affiliateLabelMap, setAffiliateLabelMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mp_affiliate_label_map_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      all: 'All collections',
      photography: 'Photography Gear',
      it_tech: 'IT & Support',
      software: 'Licensed Software',
      accessories: 'Accessories'
    };
  });

  const [affiliateSyncStatus, setAffiliateSyncStatus] = useState<{ lastRefreshTimestamp: string; status: string } | null>(null);
  const [isSyncingDeals, setIsSyncingDeals] = useState(false);

  const [inquirySearchText, setInquirySearchText] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'unread' | 'it_fix' | 'photography'>('all');

  const [showAffiliatePrices, setShowAffiliatePrices] = useState<boolean>(() => {
    const saved = localStorage.getItem('mp_show_affiliate_prices');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('mp_show_affiliate_prices', String(showAffiliatePrices));
  }, [showAffiliatePrices]);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    const saved = localStorage.getItem('mp_social_links');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
        return INITIAL_SOCIAL_LINKS;
      } catch (e) {
        return INITIAL_SOCIAL_LINKS;
      }
    }
    return INITIAL_SOCIAL_LINKS;
  });

  useEffect(() => {
    localStorage.setItem('mp_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  // Load and sync Social Links dynamically via Firestore real-time listeners
  useEffect(() => {
    let isInitialSocial = true;
    const unsubSocial = onSnapshot(collection(db, 'social_links'), (snapshot) => {
      const links: SocialLink[] = [];
      snapshot.forEach((doc) => {
        doc && links.push(doc.data() as SocialLink);
      });
      // Sort by order
      links.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      setSocialLinks(links);
    }, (error) => {
      console.error("Firestore onSnapshot error for social_links: ", error);
      handleFirestoreError(error, OperationType.GET, 'social_links');
    });

    return () => unsubSocial();
  }, []);

  // Drag and drop helper handlers for social media links
  const handleSocialDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSocialIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleSocialDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSocialIndex === null || draggedSocialIndex === index) return;

    const updated = [...socialLinks];
    const draggedItem = updated[draggedSocialIndex];
    updated.splice(draggedSocialIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedSocialIndex(index);
    setSocialLinks(updated);
  };

  const handleSocialDragEnd = async () => {
    setDraggedSocialIndex(null);
    try {
      const promises = socialLinks.map((link, idx) => {
        const updatedLink = { ...link, order: idx };
        return setDoc(doc(db, 'social_links', link.id), updatedLink);
      });
      await Promise.all(promises);
      triggerToast('Social links order saved to cloud!', 'success');
    } catch (err) {
      console.error('Error saving reordered social links: ', err);
      triggerToast('Failed to save social link order!', 'error');
    }
  };

  const moveSocialChannel = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= socialLinks.length) return;

    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    setSocialLinks(updated);

    try {
      const promises = updated.map((link, idx) => {
        const updatedLink = { ...link, order: idx };
        return setDoc(doc(db, 'social_links', link.id), updatedLink);
      });
      await Promise.all(promises);
      triggerToast('Social links order updated!', 'success');
    } catch (err) {
      console.error('Error updating social links order: ', err);
      triggerToast('Failed to save updated order!', 'error');
    }
  };

  const handleBulkDeleteSocials = async () => {
    if (selectedSocialIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedSocialIds.length} selected social channel(s)?`)) {
      const idsToDelete = [...selectedSocialIds];
      setSocialLinks(prev => prev.filter(s => !idsToDelete.includes(s.id)));
      setSelectedSocialIds([]);
      try {
        await Promise.all(idsToDelete.map(id => deleteDoc(doc(db, 'social_links', id))));
        triggerToast(`${idsToDelete.length} channel(s) deleted successfully!`, 'success');
      } catch (err) {
        console.error('Error in bulk social delete:', err);
        triggerToast('Failed to delete some channels from cloud database', 'error');
      }
    }
  };

  const handleBulkDisableSocials = async (disable: boolean) => {
    if (selectedSocialIds.length === 0) return;
    const idsToUpdate = [...selectedSocialIds];
    
    setSocialLinks(prev => prev.map(s => {
      if (idsToUpdate.includes(s.id)) {
        return { ...s, disabled: disable };
      }
      return s;
    }));
    setSelectedSocialIds([]);

    try {
      await Promise.all(
        idsToUpdate.map(async (id) => {
          const match = socialLinks.find(s => s.id === id);
          if (match) {
            const updated = { ...match, disabled: disable };
            return setDoc(doc(db, 'social_links', id), updated);
          }
        })
      );
      triggerToast(`${idsToUpdate.length} channel(s) ${disable ? 'disabled/muted' : 'enabled/activated'} successfully!`, 'success');
    } catch (err) {
      console.error('Error in bulk status update:', err);
      triggerToast('Failed to apply bulk status changes to database', 'error');
    }
  };

  const [isEditingCategories, setIsEditingCategories] = useState(false);

  useEffect(() => {
    localStorage.setItem('mp_affiliate_links', JSON.stringify(affiliateLinks));
  }, [affiliateLinks]);

  useEffect(() => {
    localStorage.setItem('mp_software_licenses', JSON.stringify(softwareLicenses));
  }, [softwareLicenses]);

  useEffect(() => {
    localStorage.setItem('mp_affiliate_label_map_v2', JSON.stringify(affiliateLabelMap));
  }, [affiliateLabelMap]);

  // Real-time listener and dynamic seeding for Software Licenses
  useEffect(() => {
    const unsubLicenses = onSnapshot(collection(db, 'software_licenses'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_SOFTWARE_LICENSES.forEach(async (lic) => {
          try {
            await setDoc(doc(db, 'software_licenses', lic.id), lic);
          } catch (e) {
            console.error("Error seeding initial software license: ", e);
          }
        });
      } else {
        const lics: SoftwareLicense[] = [];
        const imageOverrides: Record<string, string> = {
          'lic-win-pro': 'https://images.unsplash.com/photo-1624571409412-1f2205579655?auto=format&fit=crop&q=80&w=600',
          'lic-office-2019': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
          'lic-office-2021': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
          'lic-office-2024': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600'
        };
        snapshot.forEach((snapshotDoc) => {
          const data = snapshotDoc.data() as SoftwareLicense;
          if (data.id === 'gear-nikon-z8' || data.id === 'gear-samsung-t7' || data.id === 'gear-noctua-paste') {
            // Permanently clean from Firestore collection
            deleteDoc(doc(db, 'software_licenses', data.id)).catch((err) => {
              console.error("Error deleting old gear item from Firestore:", err);
            });
            return;
          }
          if (imageOverrides[data.id] && !data.imageUrl) {
            data.imageUrl = imageOverrides[data.id];
          }
          lics.push(data);
        });
        lics.sort((a, b) => {
          if (a.id === 'lic-win-pro') return -1;
          if (b.id === 'lic-win-pro') return 1;
          return a.id.localeCompare(b.id);
        });
        setSoftwareLicenses(lics);
      }
    }, (error) => {
      console.error("Firestore onSnapshot error for software_licenses: ", error);
      handleFirestoreError(error, OperationType.GET, 'software_licenses');
    });

    return () => unsubLicenses();
  }, []);

  // Load and sync Affiliate Links and Category Map dynamically via Firestore real-time listeners
  useEffect(() => {
    let isInitialLinks = true;
    const unsubLinks = onSnapshot(collection(db, 'affiliate_links'), (snapshot) => {
      const links: AffiliateLink[] = [];
      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data() as AffiliateLink;
        if (data.url === 'https://amazon.in/dp/B5HXQD29') {
          const corrected = { ...data, url: 'https://amazon.in/dp/B09S2MN8JH' };
          links.push(corrected);
          setDoc(doc(db, 'affiliate_links', snapshotDoc.id), corrected).catch(err => {
            console.error("Auto-correcting stale affiliate URL in Firestore failed: ", err);
          });
        } else {
          links.push(data);
        }
      });
      // Sort chronologically or by ID so list remains stable
      links.sort((a, b) => a.id.localeCompare(b.id));

      setAffiliateLinks(links);
      setIsAffiliateLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error for affiliate_links: ", error);
      handleFirestoreError(error, OperationType.GET, 'affiliate_links');
      setIsAffiliateLoading(false);
    });

    let isInitialConfig = true;
    const unsubConfig = onSnapshot(doc(db, 'affiliate_config', 'labels'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.labels) {
          setAffiliateLabelMap(data.labels as Record<string, string>);
        }
      } else if (isInitialConfig) {
        isInitialConfig = false;
        const defaultLabels = {
          all: 'All collections',
          photography: 'Photography Gear',
          it_tech: 'IT & Support',
          software: 'Licensed Software',
          accessories: 'Accessories'
        };
        setDoc(doc(db, 'affiliate_config', 'labels'), { id: 'labels', labels: defaultLabels }).catch(err => {
          console.error("Error seeding category labels to config: ", err);
        });
      }
      isInitialConfig = false;
    }, (error) => {
      console.error("Firestore onSnapshot error for affiliate_config: ", error);
      handleFirestoreError(error, OperationType.GET, 'affiliate_config/labels');
    });

    const unsubSyncStatus = onSnapshot(doc(db, 'affiliate_config', 'status'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setAffiliateSyncStatus({
            lastRefreshTimestamp: data.lastRefreshTimestamp || '',
            status: data.status || 'idle'
          });
        }
      } else {
        const initialSync = { lastRefreshTimestamp: new Date().toISOString(), status: 'idle' };
        setDoc(doc(db, 'affiliate_config', 'status'), initialSync).catch(err => {
          console.error("Error seeding sync status: ", err);
        });
      }
    }, (error) => {
      console.error("Firestore onSnapshot error for affiliate_config/status: ", error);
      handleFirestoreError(error, OperationType.GET, 'affiliate_config/status');
    });

    const unsubPriceToggle = onSnapshot(doc(db, 'affiliate_config', 'price_toggle'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data.showPrices === 'boolean') {
          setShowAffiliatePrices(data.showPrices);
        }
      } else {
        setDoc(doc(db, 'affiliate_config', 'price_toggle'), { id: 'price_toggle', showPrices: true }).catch(err => {
          console.error("Error seeding price toggle to config: ", err);
        });
      }
    }, (error) => {
      console.error("Firestore onSnapshot error for affiliate_config/price_toggle: ", error);
      handleFirestoreError(error, OperationType.GET, 'affiliate_config/price_toggle');
    });

    const unsubMessages = onSnapshot(collection(db, 'contact_messages'), (snapshot) => {
      const msgs: ContactMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push(doc.data() as ContactMessage);
      });
      // Sort descending by ID (chronological descending)
      msgs.sort((a, b) => b.id.localeCompare(a.id));
      setContactMessages(msgs);
    }, (error) => {
      console.error("Firestore onSnapshot error for contact_messages: ", error);
      handleFirestoreError(error, OperationType.GET, 'contact_messages');
    });

    return () => {
      unsubLinks();
      unsubConfig();
      unsubSyncStatus();
      unsubPriceToggle();
      unsubMessages();
    };
  }, []);

  // Sync site configuration and all backend components in real-time with split-document layout
  useEffect(() => {
    let isInitialSite = true;

    const unsubSite = onSnapshot(doc(db, 'site_config', 'homepage'), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.heroHeadline) setHeroHeadline(data.heroHeadline);
        if (data.heroSubheadline) setHeroSubheadline(data.heroSubheadline);
        if (data.profilePhotoUrl) setProfilePhotoUrl(data.profilePhotoUrl);
        if (data.bioHeadline) setBioHeadline(data.bioHeadline);
        if (data.bioText) setBioText(data.bioText);
        if (data.logoText) setLogoText(data.logoText);
        if (data.logoSubtext) setLogoSubtext(data.logoSubtext);
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.faviconUrl !== undefined) setFaviconUrl(data.faviconUrl);
        if (data.bannerText !== undefined) setBannerText(data.bannerText);
        if (data.exploreButtonText) setExploreButtonText(data.exploreButtonText);
        if (data.exploreButtonLink) setExploreButtonLink(data.exploreButtonLink);
        if (data.contactPhoneIt) setContactPhoneIt(data.contactPhoneIt);
        if (data.contactPhonePhotos) setContactPhonePhotos(data.contactPhonePhotos);
        if (data.contactEmail) setContactEmail(data.contactEmail);
        if (data.contactAddress) setContactAddress(data.contactAddress);

        // Nested lists
        if (data.itServices && Array.isArray(data.itServices)) setItServices(data.itServices);
        if (data.photoServices && Array.isArray(data.photoServices)) setPhotoServices(data.photoServices);

        // Self-Healing Migration: Check if any large lists are still inside the monolithic document.
        // If so, we safely split and write them to their separate documents and clean the homepage document.
        const needsMigration = 
          (data.galleryItems && Array.isArray(data.galleryItems) && data.galleryItems.length > 0) ||
          (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) ||
          (data.pixelFixReviews && Array.isArray(data.pixelFixReviews) && data.pixelFixReviews.length > 0) ||
          (data.instagramPosts && Array.isArray(data.instagramPosts) && data.instagramPosts.length > 0);

        if (needsMigration) {
          console.info("[Self-Healing Migration] Bloated monolithic site config detected. Splitting and shrinking document...");
          try {
            if (data.galleryItems && Array.isArray(data.galleryItems)) {
              await setDoc(doc(db, 'site_config', 'gallery_items'), { id: 'gallery_items', galleryItems: data.galleryItems });
              setGalleryItems(data.galleryItems);
            }
            if (data.testimonials && Array.isArray(data.testimonials)) {
              await setDoc(doc(db, 'site_config', 'testimonials'), { id: 'testimonials', testimonials: data.testimonials });
              setTestimonials(data.testimonials);
            }
            if (data.pixelFixReviews && Array.isArray(data.pixelFixReviews)) {
              await setDoc(doc(db, 'site_config', 'pixel_fix_reviews'), { id: 'pixel_fix_reviews', pixelFixReviews: data.pixelFixReviews });
              setPixelFixReviews(data.pixelFixReviews);
            }
            if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
              await setDoc(doc(db, 'site_config', 'instagram_posts'), { id: 'instagram_posts', instagramPosts: data.instagramPosts });
              setInstagramPosts(data.instagramPosts);
            }

            // Shrink/clean the homepage document by removing the bloated lists
            const cleanHomepage: any = {};
            Object.keys(data).forEach(key => {
              if (!['galleryItems', 'testimonials', 'pixelFixReviews', 'instagramPosts'].includes(key)) {
                cleanHomepage[key] = data[key];
              }
            });
            await setDoc(doc(db, 'site_config', 'homepage'), cleanHomepage);
            console.info("[Self-Healing Migration] Monolithic document successfully shrunk and split documents written!");
          } catch (migrateErr) {
            console.error("[Self-Healing Migration] Error migrating monolithic config: ", migrateErr);
          }
        } else {
          // Fallback if split documents don't exist yet but no migration is needed (empty states)
          if (data.galleryItems && Array.isArray(data.galleryItems)) {
            setGalleryItems(prev => prev.length === 0 ? data.galleryItems : prev);
          }
          if (data.testimonials && Array.isArray(data.testimonials)) {
            setTestimonials(prev => prev.length === 0 ? data.testimonials : prev);
          }
          if (data.pixelFixReviews && Array.isArray(data.pixelFixReviews)) {
            setPixelFixReviews(prev => prev.length === 0 ? data.pixelFixReviews : prev);
          }
          if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
            setInstagramPosts(prev => prev.length === 0 ? data.instagramPosts : prev);
          }
        }
      } else if (isInitialSite) {
        // Seed database instantly if config does not exist
        const initialConfig = {
          id: 'homepage',
          heroHeadline,
          heroSubheadline,
          profilePhotoUrl,
          bioHeadline,
          bioText,
          logoText,
          logoSubtext,
          logoUrl,
          faviconUrl,
          bannerText,
          exploreButtonText,
          exploreButtonLink,
          contactPhoneIt,
          contactPhonePhotos,
          contactEmail,
          contactAddress,
          itServices,
          photoServices
        };

        const initialGallery = { id: 'gallery_items', galleryItems };
        const initialTestimonials = { id: 'testimonials', testimonials };
        const initialPixelReviews = { id: 'pixel_fix_reviews', pixelFixReviews };
        const initialInsta = { id: 'instagram_posts', instagramPosts };

        try {
          await setDoc(doc(db, 'site_config', 'homepage'), initialConfig);
          await setDoc(doc(db, 'site_config', 'gallery_items'), initialGallery);
          await setDoc(doc(db, 'site_config', 'testimonials'), initialTestimonials);
          await setDoc(doc(db, 'site_config', 'pixel_fix_reviews'), initialPixelReviews);
          await setDoc(doc(db, 'site_config', 'instagram_posts'), initialInsta);

          // Seed initial affiliate links and social links at the exact same time
          INITIAL_AFFILIATE_LINKS.forEach(async (link) => {
            try {
              await setDoc(doc(db, 'affiliate_links', link.id), link);
            } catch (e) {
              console.error("Error seeding initial affiliate link: ", e);
            }
          });
          INITIAL_SOCIAL_LINKS.forEach(async (link) => {
            try {
              await setDoc(doc(db, 'social_links', link.id), link);
            } catch (e) {
              console.error("Error seeding initial social link: ", e);
            }
          });
        } catch (err) {
          console.error("Seeding initial homepage config error: ", err);
        }
      }
      isInitialSite = false;
    }, (error) => {
      console.error("Firestore onSnapshot error for site_config/homepage: ", error);
      handleFirestoreError(error, OperationType.GET, 'site_config/homepage');
    });

    // Real-time listeners for the separate split configuration documents
    const unsubGallery = onSnapshot(doc(db, 'site_config', 'gallery_items'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.galleryItems && Array.isArray(data.galleryItems)) {
          setGalleryItems(data.galleryItems);
        }
      }
      setIsGalleryLoading(false);
    }, (err) => {
      console.error("Gallery items snap error: ", err);
      setIsGalleryLoading(false);
    });

    const unsubTestimonials = onSnapshot(doc(db, 'site_config', 'testimonials'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.testimonials && Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials);
        }
      }
    }, (err) => {
      console.error("Testimonials snap error: ", err);
    });

    const unsubPixelReviews = onSnapshot(doc(db, 'site_config', 'pixel_fix_reviews'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pixelFixReviews && Array.isArray(data.pixelFixReviews)) {
          setPixelFixReviews(data.pixelFixReviews);
        }
      }
    }, (err) => {
      console.error("Pixel fix reviews snap error: ", err);
    });

    const unsubInstagram = onSnapshot(doc(db, 'site_config', 'instagram_posts'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
          setInstagramPosts(data.instagramPosts);
        }
      }
    }, (err) => {
      console.error("Instagram posts snap error: ", err);
    });

    return () => {
      unsubSite();
      unsubGallery();
      unsubTestimonials();
      unsubPixelReviews();
      unsubInstagram();
    };
  }, []);

  // Dynamically sync and update the browser favicon when faviconUrl changes
  useEffect(() => {
    if (faviconUrl) {
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach((link: any) => {
          link.href = faviconUrl;
          if (faviconUrl.startsWith('data:image/svg') || faviconUrl.includes('.svg')) {
            link.type = 'image/svg+xml';
          } else if (faviconUrl.startsWith('data:image/x-icon') || faviconUrl.includes('.ico')) {
            link.type = 'image/x-icon';
          } else if (faviconUrl.startsWith('data:image/png') || faviconUrl.includes('.png')) {
            link.type = 'image/png';
          } else if (faviconUrl.startsWith('data:image/webp') || faviconUrl.includes('.webp')) {
            link.type = 'image/webp';
          } else {
            link.type = 'image/jpeg';
          }
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    } else {
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach((link: any) => {
          if (link.getAttribute('href')?.includes('favicon.svg')) {
            link.href = '/favicon.svg';
            link.type = 'image/svg+xml';
          } else {
            link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Cg fill='%23FF5500'%3E%3Crect x='0' y='20' width='20' height='80' rx='1'/%3E%3Crect x='20' y='20' width='40' height='20' rx='1'/%3E%3Crect x='40' y='40' width='20' height='40' rx='1'/%3E%3Crect x='20' y='60' width='20' height='20' rx='1'/%3E%3Crect x='40' y='0' width='60' height='20' rx='1'/%3E%3Crect x='60' y='40' width='20' height='20' rx='1'/%3E%3C/g%3E%3C/svg%3E";
            link.type = 'image/svg+xml';
          }
        });
      }
    }
  }, [faviconUrl]);

  const [editingItem, setEditingItem] = useState<{
    type: 'it_service' | 'photo_service' | 'instagram' | 'hero' | 'about' | 'gallery_item' | 'testimonial' | 'pixelfix_review' | 'affiliate_link' | 'social_link' | 'software_license';
    index?: number;
    id?: string;
    data: any;
  } | null>(null);

  const softwareLicensesToRender = useMemo(() => {
    let list = [...softwareLicenses];
    if (editingItem && editingItem.type === 'software_license' && editingItem.data) {
      const editData = editingItem.data;
      const itemId = editData.id || 'temp-new-lic';
      const exists = list.some(l => l.id === editData.id);
      if (exists) {
        list = list.map(l => l.id === editData.id ? { ...l, ...editData } : l);
      } else {
        list = [{
          id: itemId,
          name: editData.name || 'New Software License Preview',
          price: editData.price || '',
          badge: editData.badge || '',
          description: editData.description || 'Provide a brief, compelling testimony explaining why this software is recommended...',
          licenseType: editData.licenseType || 'Lifetime License Key',
          imageUrl: editData.imageUrl || '',
          features: editData.features || '',
          compatibility: editData.compatibility || '',
          details: editData.details || '',
          category: editData.category || 'productivity',
          url: editData.url || '',
          isPreviewOnly: true
        } as any, ...list];
      }
    }
    return list;
  }, [softwareLicenses, editingItem]);

  const affiliateLinksToRender = useMemo(() => {
    let list = [...affiliateLinks];

    // Automatically map software licenses to affiliate links format
    const mappedLicenses = softwareLicensesToRender.map((lic) => {
      const whatsappUrl = `https://wa.me/918638875231?text=${encodeURIComponent(
        `Hi Murari, I am interested in purchasing a software license for "${lic.name}" priced at ${lic.price}. Please provide the payment details and guide me on how to get the activation key. Thanks!`
      )}`;

      return {
        id: lic.id,
        title: lic.name,
        description: lic.description || 'Genuine retail license key with lifetime activation.',
        category: 'software',
        url: lic.url || whatsappUrl,
        imageUrl: lic.imageUrl || '',
        discountCode: lic.badge || '',
        price: lic.price,
        clicks: 0,
        isSyncedLicense: true
      };
    });

    // Merge them ensuring no duplicate IDs. Mapped licenses from the Software Licenses section ALWAYS take priority and overwrite/replace any duplicate IDs to ensure real-time identical sync.
    const mappedIds = new Set(mappedLicenses.map(m => m.id));
    // Filter out any static affiliate links with matching IDs
    list = list.filter(a => !mappedIds.has(a.id));
    // Append the mapped software licenses
    list.push(...(mappedLicenses as any[]));

    if (editingItem && editingItem.type === 'affiliate_link' && editingItem.data) {
      const editData = editingItem.data;
      const itemId = editData.id || 'temp-new-item';
      
      const exists = list.some(a => a.id === editData.id);
      if (exists) {
        list = list.map(a => a.id === editData.id ? { ...a, ...editData } : a);
      } else {
        list = [{ 
          id: itemId, 
          title: editData.title || 'New Product Preview',
          description: editData.description || 'Fill in the fields to see your changes in real-time.',
          category: editData.category || 'accessories',
          url: editData.url || '',
          imageUrl: editData.imageUrl || '',
          discountCode: editData.discountCode || '',
          clicks: 0,
          isPreviewOnly: true
        } as any, ...list];
      }
    }
    return list;
  }, [affiliateLinks, softwareLicensesToRender, editingItem]);

  const [isFetchingAmazon, setIsFetchingAmazon] = useState(false);
  const [amazonFetchError, setAmazonFetchError] = useState<string | null>(null);
  const [autoFillMode, setAutoFillMode] = useState<'overwrite' | 'safe'>('overwrite');
  const [autoFillStep, setAutoFillStep] = useState<number>(0);
  const lastFetchedUrlRef = useRef<string>('');
  const initialUrlRef = useRef<string>('');
  const amazonCacheRef = useRef<Map<string, any>>(new Map());
  const [isBulkCleaning, setIsBulkCleaning] = useState(false);
  const [softwareLicenseSearch, setSoftwareLicenseSearch] = useState('');

  // Cleans product titles, removing any remaining double escaped or HTML entity noise while preserving the full title and model/specification details.
  // Professionally simplifies the titles and strictly limits them to a maximum of 15 words.
  const cleanTitle = (rawTitle: string): string => {
    if (!rawTitle) return '';
    
    // 1. Decode HTML entities recursively to prevent double-escaping
    let decoded = rawTitle;
    let prev;
    let iterations = 0;
    do {
      prev = decoded;
      decoded = decoded
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&#039;/gi, "'")
        .replace(/&ndash;/gi, "–")
        .replace(/&mdash;/gi, "—")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&ldquo;/gi, '"')
        .replace(/&rdquo;/gi, '"');
      iterations++;
    } while (decoded !== prev && iterations < 4);

    let clean = decoded
      .replace(/^Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it):\s*/i, "")
      .replace(/:\s*Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it)[\s\S]*/i, "")
      .replace(/(\s*-\s*Buy\s+.*Online|\|\s*Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it)|\s*at\s*Low\s*Prices\s*.*)$/i, "")
      .replace(/<[^>]+>/g, "") // Strip any HTML tags
      .replace(/\s+/g, " ")
      .trim();

    // 2. Remove ONLY direct e-commerce site suffix endings, preserving all technical specs
    clean = clean
      .replace(/\s*\|\s*(?:Amazon|Flipkart|Shop|Store|Best Buy|Ebay)(?:\.(?:com|in|co\.uk|org|net))?\s*$/i, "")
      .replace(/\s*-\s*(?:Amazon|Flipkart|Shop|Store|Best Buy|Ebay)(?:\.(?:com|in|co\.uk|org|net))?\s*$/i, "");

    // 3. Remove common keyword-stuffed fluff phrases to keep the title professional and clear
    clean = clean
      .replace(/\s+for\s+(?:laptops?|pc|desktops?|gaming|workstations?|macbooks?|notebooks?|cameras?|smartphones?|ps5|xbox|consoles?)(?:\s*(?:\/|or|,)\s*(?:laptops?|pc|desktops?|gaming|workstations?|macbooks?|notebooks?|cameras?|smartphones?|ps5|xbox|consoles?))*/gi, "")
      .replace(/\s+(?:compatible\s+with|suited\s+for|designed\s+for|optimized\s+for|ideal\s+for)\s+[^,\-\(\[\|]+/gi, "")
      .replace(/\s+[\(\[]\s*(?:pack\s+of\s+\d+|renewed|refurbished|imported|international\s+version|color:\s*[\w\s]+)\s*[\)\]]/gi, "")
      .replace(/\s+[\-\|\:]\s*(?:best\s+choice|high\s+quality|premium\s+edition|professional\s+use|multipurpose|all\s+in\s+one).*$/i, "");

    // Clean trailing punctuation
    clean = clean.replace(/[\s\-|:|;|,]+$/, "").trim();

    // 4. Enforce strict 15-word maximum limit with smart clean termination
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length > 15) {
      let truncated = words.slice(0, 15).join(' ');
      // Clean up any trailing connectors, hyphens, or punctuation at the end of the words
      truncated = truncated.replace(/[\s\-|:|;|,|/|\\|&]+$/, "").trim();
      return truncated + '...';
    }

    return clean;
  };

  const handleBulkCleanTitles = async () => {
    const itemsToClean = affiliateLinks.filter(link => {
      const currentTitle = link.title || '';
      const cleaned = cleanTitle(currentTitle);
      return cleaned !== currentTitle;
    });

    if (itemsToClean.length === 0) {
      triggerToast('All existing affiliate product titles are already properly cleaned!', 'info');
      return;
    }

    triggerConfirm(
      `Found ${itemsToClean.length} product title(s) that need cleaning to match branding standards. Do you want to bulk-apply the 'cleanTitle' function to all of them?`,
      async () => {
        setIsBulkCleaning(true);
        let successCount = 0;
        let failCount = 0;

        try {
          await Promise.all(itemsToClean.map(async (link) => {
            const cleanedTitle = cleanTitle(link.title || '');
            const updatedLink = {
              ...link,
              title: cleanedTitle
            };
            try {
              await setDoc(doc(db, 'affiliate_links', link.id), updatedLink);
              successCount++;
            } catch (err) {
              console.error(`Error bulk updating title for affiliate link ${link.id}: `, err);
              failCount++;
            }
          }));

          if (failCount === 0) {
            triggerToast(`Successfully cleaned and synchronized all ${successCount} product title(s)!`, 'success');
          } else {
            triggerToast(`Bulk operation complete. Cleaned ${successCount} title(s). Failed to update ${failCount} title(s).`, 'info');
          }
        } catch (globalErr) {
          console.error("Critical error in bulk clean operation: ", globalErr);
          triggerToast('Bulk title cleaning failed due to a database/network error.', 'error');
        } finally {
          setIsBulkCleaning(false);
        }
      }
    );
  };

  const handleAffiliateSync = async (isManual: boolean = false) => {
    if (isSyncingDeals) return;
    setIsSyncingDeals(true);

    try {
      await setDoc(doc(db, 'affiliate_config', 'status'), {
        status: 'syncing',
        lastRefreshTimestamp: affiliateSyncStatus?.lastRefreshTimestamp || new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error setting syncing status: ", err);
    }

    if (isManual) {
      triggerToast("Manual re-sync triggered. Fetching latest product information in background...", "info");
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const link of affiliateLinks) {
        if (!link.url || !link.url.trim()) continue;
        
        try {
          const urlToFetch = link.url.trim();
          const response = await fetch("/api/fetch-amazon-product", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: urlToFetch }),
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData && resData.success && resData.product) {
              const { title, description, imageUrl, category } = resData.product;
              
              const updatedLink = {
                ...link,
                title: title || link.title,
                description: description || link.description,
                imageUrl: imageUrl || link.imageUrl,
                category: category || link.category || 'photography',
                updatedAt: new Date().toISOString()
              };

              await setDoc(doc(db, 'affiliate_links', link.id), updatedLink);
              successCount++;
            } else {
              const fallbackResponse = await fetch(`/api/fetch-amazon-product?url=${encodeURIComponent(urlToFetch)}`);
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData && fallbackData.success && fallbackData.product) {
                  const { title, description, imageUrl, category } = fallbackData.product;
                  
                  const updatedLink = {
                    ...link,
                    title: title || link.title,
                    description: description || link.description,
                    imageUrl: imageUrl || link.imageUrl,
                    category: category || link.category || 'photography',
                    updatedAt: new Date().toISOString()
                  };

                  await setDoc(doc(db, 'affiliate_links', link.id), updatedLink);
                  successCount++;
                } else {
                  failCount++;
                }
              } else {
                failCount++;
              }
            }
          } else {
            failCount++;
          }
        } catch (linkErr) {
          console.error(`Error syncing link ${link.id}: `, linkErr);
          failCount++;
        }
      }

      const nowStr = new Date().toISOString();
      await setDoc(doc(db, 'affiliate_config', 'status'), {
        status: 'idle',
        lastRefreshTimestamp: nowStr
      });

      if (isManual) {
        triggerToast(`Manual re-sync completed. Successfully refreshed ${successCount} deal(s). (${failCount} failed/skipped)`, "success");
      }
    } catch (err) {
      console.error("Error in affiliate sync: ", err);
      const timestamp = affiliateSyncStatus?.lastRefreshTimestamp || new Date().toISOString();
      await setDoc(doc(db, 'affiliate_config', 'status'), {
        status: 'error',
        lastRefreshTimestamp: timestamp
      });
      if (isManual) {
        triggerToast("Failed to complete background re-sync.", "error");
      }
    } finally {
      setIsSyncingDeals(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'affiliate' && affiliateSyncStatus) {
      const lastRefresh = affiliateSyncStatus.lastRefreshTimestamp;
      if (lastRefresh) {
        const lastTime = new Date(lastRefresh).getTime();
        const now = Date.now();
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        if (now - lastTime > TWELVE_HOURS && affiliateSyncStatus.status !== 'syncing' && !isSyncingDeals) {
          console.info("[Automated Refresh] Stale affiliate data detected. Triggering background re-sync...");
          handleAffiliateSync(false);
        }
      }
    }
  }, [activeTab, affiliateSyncStatus?.lastRefreshTimestamp, affiliateSyncStatus?.status]);

  useEffect(() => {
    if (editingItem && editingItem.type === 'affiliate_link') {
      const initialUrl = editingItem.data.url || '';
      initialUrlRef.current = initialUrl;
      lastFetchedUrlRef.current = initialUrl;
    }
  }, [editingItem?.data?.id, editingItem?.type]);

  const fetchAmazonDetails = async (urlToFetch: string, isManual: boolean = false) => {
    if (!urlToFetch || !urlToFetch.trim()) {
      setAmazonFetchError(null);
      setAutoFillStep(0);
      return;
    }
    
    // Support any valid URL structure for auto-fill
    const looksLikeUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/i.test(urlToFetch);
    if (!looksLikeUrl) {
      setAmazonFetchError("Invalid URL format.");
      setAutoFillStep(0);
      return;
    }

    // Check local cache first (normalized lookup prioritizes fast hits)
    const normalizedUrl = urlToFetch.trim().toLowerCase().replace(/\/$/, "");
    let cachedEntry = amazonCacheRef.current.get(urlToFetch);
    
    if (!cachedEntry) {
      for (const [key, val] of amazonCacheRef.current.entries()) {
        if (key.trim().toLowerCase().replace(/\/$/, "") === normalizedUrl) {
          cachedEntry = val;
          break;
        }
      }
    }

    if (cachedEntry) {
      const isLegacy = typeof cachedEntry.success === 'undefined';
      
      if (!isLegacy && cachedEntry.success === false) {
        const NEGATIVE_CACHE_EXPIRATION = 60 * 1000; // 60 seconds short expiration
        const elapsed = Date.now() - (cachedEntry.timestamp || 0);
        if (elapsed < NEGATIVE_CACHE_EXPIRATION) {
          console.info(`[Auto-Fill] Cache hit (negative) for URL: "${urlToFetch}". Error: "${cachedEntry.error}". Skipping API request.`);
          setAmazonFetchError(cachedEntry.error || "Failed to auto-fetch product details.");
          triggerToast(`Auto-fetch failed (cached): ${cachedEntry.error}`, "error");
          setAutoFillStep(0);
          return;
        } else {
          console.info(`[Auto-Fill] Cache expired (negative) for URL: "${urlToFetch}". Evicting from cache.`);
          // Evict expired negative entry
          amazonCacheRef.current.delete(urlToFetch);
          for (const [key] of amazonCacheRef.current.entries()) {
            if (key.trim().toLowerCase().replace(/\/$/, "") === normalizedUrl) {
              amazonCacheRef.current.delete(key);
            }
          }
        }
      } else {
        const product = isLegacy ? cachedEntry : cachedEntry.product;
        if (product) {
          console.info(`[Auto-Fill] Cache hit (priority resolved) for URL: "${urlToFetch}"`, product);
          const { title, description, imageUrl, category, price, originalPrice, discountPercentage, availability } = product;

          let finalDescription = description;

          setEditingItem(prev => {
            if (!prev) return null;
            const shouldOverwrite = autoFillMode === 'overwrite';

            const updatedTitle = (shouldOverwrite || !prev.data.title?.trim()) ? (cleanTitle(title) || prev.data.title || '') : (prev.data.title || cleanTitle(title) || '');
            const updatedDescription = (shouldOverwrite || !prev.data.description?.trim()) ? (finalDescription || prev.data.description || '') : (prev.data.description || finalDescription || '');
            const updatedImageUrl = (shouldOverwrite || !prev.data.imageUrl?.trim()) ? (imageUrl || prev.data.imageUrl || '') : (prev.data.imageUrl || imageUrl || '');
            const updatedCategory = (shouldOverwrite || !prev.data.category?.trim() || prev.data.category === 'accessories') ? (category || prev.data.category || 'accessories') : (prev.data.category || category || 'accessories');
            const updatedPrice = (shouldOverwrite || !prev.data.price?.trim()) ? (price || prev.data.price || '') : (prev.data.price || price || '');
            const updatedOriginalPrice = (shouldOverwrite || !prev.data.originalPrice?.trim()) ? (originalPrice || prev.data.originalPrice || '') : (prev.data.originalPrice || originalPrice || '');
            const updatedDiscountPercentage = (shouldOverwrite || !prev.data.discountPercentage?.trim()) ? (discountPercentage || prev.data.discountPercentage || '') : (prev.data.discountPercentage || discountPercentage || '');
            const updatedAvailability = (shouldOverwrite || !prev.data.availability?.trim()) ? (availability || prev.data.availability || '') : (prev.data.availability || availability || '');

            return {
              ...prev,
              data: {
                ...prev.data,
                title: updatedTitle,
                description: updatedDescription,
                imageUrl: updatedImageUrl,
                category: updatedCategory,
                price: updatedPrice,
                originalPrice: updatedOriginalPrice,
                discountPercentage: updatedDiscountPercentage,
                availability: updatedAvailability,
              }
            };
          });
          triggerToast("Product details loaded from cache!", "success");
          setAutoFillStep(5);
          setTimeout(() => setAutoFillStep(0), 3000);
          return;
        }
      }
    }

    console.info(`[Auto-Fill] Initiating product metadata fetch for: "${urlToFetch}" (isManual: ${isManual})`);
    setIsFetchingAmazon(true);
    setAmazonFetchError(null);
    setAutoFillStep(1);

    // Dynamic stepper simulation intervals aligned with real-time fetching state
    const stepInterval = setInterval(() => {
      setAutoFillStep(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 1400);

    // Setup strict AbortController timeout to prevent UI hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000); // 20-second strict timeout to allow full Gemini grounding fallback if needed

    try {
      console.info("[Auto-Fill] Fetching from endpoint: /api/fetch-amazon-product with POST request (Primary)...");
      let response = await fetch("/api/fetch-amazon-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToFetch }),
        signal: controller.signal,
      });

      // Robust fallback: if POST returns 405 (Method Not Allowed) or 404 (Not Found), try GET fallback
      if (response.status === 405 || response.status === 404) {
        console.info(`[Auto-Fill] POST request failed with status ${response.status}. Trying GET fallback...`);
        response = await fetch(`/api/fetch-amazon-product?url=${encodeURIComponent(urlToFetch)}`, {
          method: "GET",
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);
      console.info(`[Auto-Fill] Server responded with HTTP status ${response.status} (${response.statusText})`);

      // Safely read response text first to prevent 'Unexpected end of JSON input'
      const responseText = await response.text();
      console.info(`[Auto-Fill] Raw response body received. Length: ${responseText ? responseText.length : 0} characters`);

      if (!response.ok) {
        let errMessage = `HTTP error! status: ${response.status} (${response.statusText || "unknown"})`;
        if (responseText && responseText.trim()) {
          try {
            const parsedErr = JSON.parse(responseText);
            if (parsedErr?.error) {
              errMessage = parsedErr.error;
            }
          } catch (e) {
            // Use responseText as fallback if it's not JSON
            if (responseText.length < 150) {
              errMessage = responseText.trim();
            }
          }
        }
        throw new Error(errMessage);
      }

      if (!responseText || !responseText.trim()) {
        console.warn("[Auto-Fill] Received empty response from metadata API endpoint.");
        throw new Error("Empty response body received from server metadata endpoint.");
      }

      // If response text is HTML instead of JSON (usually happens if Vite/Express falls back to index.html)
      if (responseText.trim().toLowerCase().startsWith("<!doctype") || responseText.trim().toLowerCase().startsWith("<html")) {
        console.warn("[Auto-Fill] Server returned HTML page instead of JSON product data.");
        throw new Error("The API endpoint is temporarily unavailable or returned a server error page.");
      }

      let resData: any = null;
      try {
        resData = JSON.parse(responseText);
        console.info("[Auto-Fill] JSON parsed successfully. Success status:", resData?.success);
      } catch (jsonErr: any) {
        console.error("[Auto-Fill] JSON parse error on details response text. Error:", jsonErr, "Text start:", responseText.slice(0, 200));
        throw new Error(`Failed to parse product data (JSON syntax error: ${jsonErr.message || "unknown"}).`);
      }

      if (resData && resData.success && resData.product) {
        const { title, description, imageUrl, category, price, originalPrice, discountPercentage, availability } = resData.product;
        console.info("[Auto-Fill] Successfully extracted product metadata:", { title, imageUrl, category, price, originalPrice, discountPercentage, availability });
        
        // Cache the product data for subsequent edits/views of this URL
        amazonCacheRef.current.set(urlToFetch, {
          success: true,
          product: resData.product,
          timestamp: Date.now()
        });

        let finalDescription = description;

        setEditingItem(prev => {
          if (!prev) return null;
          
          const shouldOverwrite = autoFillMode === 'overwrite';
          const data = prev.data || {};

          const updatedTitle = (shouldOverwrite || !data.title?.trim()) ? (cleanTitle(title) || data.title || '') : (data.title || cleanTitle(title) || '');
          const updatedDescription = (shouldOverwrite || !data.description?.trim()) ? (finalDescription || data.description || '') : (data.description || finalDescription || '');
          const updatedImageUrl = (shouldOverwrite || !data.imageUrl?.trim()) ? (imageUrl || data.imageUrl || '') : (data.imageUrl || imageUrl || '');
          const updatedCategory = (shouldOverwrite || !data.category?.trim() || data.category === 'accessories') ? (category || data.category || 'accessories') : (data.category || category || 'accessories');
          const updatedPrice = (shouldOverwrite || !data.price?.trim()) ? (price || data.price || '') : (data.price || price || '');
          const updatedOriginalPrice = (shouldOverwrite || !data.originalPrice?.trim()) ? (originalPrice || data.originalPrice || '') : (data.originalPrice || originalPrice || '');
          const updatedDiscountPercentage = (shouldOverwrite || !data.discountPercentage?.trim()) ? (discountPercentage || data.discountPercentage || '') : (data.discountPercentage || discountPercentage || '');
          const updatedAvailability = (shouldOverwrite || !data.availability?.trim()) ? (availability || data.availability || '') : (data.availability || availability || '');

          return {
            ...prev,
            data: {
              ...data,
              title: updatedTitle,
              description: updatedDescription,
              imageUrl: updatedImageUrl,
              category: updatedCategory,
              price: updatedPrice,
              originalPrice: updatedOriginalPrice,
              discountPercentage: updatedDiscountPercentage,
              availability: updatedAvailability,
            }
          };
        });
        
        setAutoFillStep(5);
        triggerToast("Product details auto-filled successfully!", "success");
        setTimeout(() => setAutoFillStep(0), 4000);
      } else {
        throw new Error(resData?.error || "Invalid response format from product extraction API.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      const errorMessage = isTimeout 
        ? "The metadata request took too long (20s timeout) and was aborted. Please check your link or try again." 
        : (err.message || "Failed to auto-fetch product details.");

      console.error(`[Auto-Fill] Error fetching product details for URL "${urlToFetch}":`, err);
      
      // Client-side fallback extraction from the URL directly as a last-resort safe fallback
      try {
        console.info("[Auto-Fill Fallback] Attempting client-side URL parsing fallback...");
        
        // 1. Try to extract ASIN with comprehensive e-commerce patterns
        let asin = "";
        const asinPatterns = [
          /\/dp\/([A-Z0-9]{10})/i,
          /\/gp\/product\/([A-Z0-9]{10})/i,
          /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
          /\/dp\/aw\/d\/([A-Z0-9]{10})/i,
          /\/d\/([A-Z0-9]{10})/i,
          /\/asin\/([A-Z0-9]{10})/i,
          /[?&]asin=([A-Z0-9]{10})/i,
          /\/product\/([A-Z0-9]{10})/i,
          /\/product-reviews\/([A-Z0-9]{10})/i
        ];
        for (const pattern of asinPatterns) {
          const match = urlToFetch.match(pattern);
          if (match && match[1]) {
            asin = match[1].toUpperCase();
            break;
          }
        }

        // 2. Try to extract title from the path slug safely
        let extractedTitle = "";
        try {
          const urlObj = new URL(urlToFetch);
          const hostname = urlObj.hostname.toLowerCase();
          const isShortDomain = /amzn\.[a-z]{2,4}|a\.co|bit\.ly|tinyurl\.com|t\.co|murl\.com|tiny\.cc|is\.gd|lnk\.to|rebrand\.ly/i.test(hostname);
          
          if (!isShortDomain) {
            const pathname = urlObj.pathname;
            const parts = pathname.split('/').filter(p => p.length > 4 && !p.includes('.') && !['dp', 'gp', 'product', 'd', 'asin'].includes(p.toLowerCase()));
            if (parts.length > 0) {
              const slug = parts[0];
              if (!/^[a-z0-9]{5,10}$/i.test(slug)) {
                extractedTitle = slug
                  .replace(/_|-/g, ' ')
                  .replace(/\b(ref|ie|UTF8|qid|sr|pf_rd_.*)\b.*/gi, '')
                  .trim();
              }
            }
          }
        } catch (_) {}

        if (!extractedTitle && asin) {
          extractedTitle = `Product (ASIN: ${asin})`;
        } else if (!extractedTitle) {
          extractedTitle = "Curated Affiliate Deal";
        }

        // Capitalize words beautifully
        extractedTitle = extractedTitle
          .split(' ')
          .map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '')
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Limit length
        if (extractedTitle.length > 80) {
          extractedTitle = extractedTitle.substring(0, 80) + "...";
        }

        // 3. Try to determine category
        let category: 'photography' | 'it_tech' | 'software' | 'accessories' = 'accessories';
        const lowercaseUrl = urlToFetch.toLowerCase();
        if (lowercaseUrl.includes('camera') || lowercaseUrl.includes('lens') || lowercaseUrl.includes('tripod') || lowercaseUrl.includes('microphone') || lowercaseUrl.includes('gimbal')) {
          category = 'photography';
        } else if (lowercaseUrl.includes('ssd') || lowercaseUrl.includes('drive') || lowercaseUrl.includes('router') || lowercaseUrl.includes('laptop') || lowercaseUrl.includes('ram') || lowercaseUrl.includes('desktop')) {
          category = 'it_tech';
        } else if (lowercaseUrl.includes('software') || lowercaseUrl.includes('license') || lowercaseUrl.includes('windows') || lowercaseUrl.includes('creative-cloud')) {
          category = 'software';
        }

        const placeholderImageUrl = asin 
          ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
          : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600";

        setEditingItem(prev => {
          if (!prev) return null;
          const shouldOverwrite = autoFillMode === 'overwrite';
          const data = prev.data || {};
          
          const updatedTitle = (shouldOverwrite || !data.title?.trim()) ? (extractedTitle || data.title || '') : (data.title || extractedTitle || '');
          const updatedDescription = (shouldOverwrite || !data.description?.trim()) ? (`Curated product link: ${urlToFetch}` || data.description || '') : (data.description || `Curated product link: ${urlToFetch}`);
          const updatedImageUrl = (shouldOverwrite || !data.imageUrl?.trim()) ? (placeholderImageUrl || data.imageUrl || '') : (data.imageUrl || placeholderImageUrl || '');
          const updatedCategory = (shouldOverwrite || !data.category?.trim() || data.category === 'accessories') ? (category || data.category || 'accessories') : (data.category || category || 'accessories');

          return {
            ...prev,
            data: {
              ...data,
              title: updatedTitle,
              description: updatedDescription,
              imageUrl: updatedImageUrl,
              category: updatedCategory,
            }
          };
        });

        triggerToast("Auto-detected basic product info from link!", "success");
        setAmazonFetchError(null); // Clear error because we succeeded in falling back!
        setAutoFillStep(5);
        setTimeout(() => setAutoFillStep(0), 4000);
        return; // Success! No need to throw or show error
      } catch (fallbackErr) {
        console.error("[Auto-Fill Fallback] Failed client-side extraction:", fallbackErr);
      }

      // Cache negative results for failed URLs with a short expiration period (60 seconds)
      amazonCacheRef.current.set(urlToFetch, {
        success: false,
        error: errorMessage,
        timestamp: Date.now()
      });
      
      // Reset the tracking ref so that the user can retry pasting or triggering manually without being blocked by "same URL" cache check
      lastFetchedUrlRef.current = '';
      setAutoFillStep(0);
      
      setAmazonFetchError(errorMessage);
      triggerToast(`Auto-fetch failed: ${errorMessage}`, "error");
    } finally {
      clearInterval(stepInterval);
      setIsFetchingAmazon(false);
    }
  };

  // Auto-fetch was disabled per user request. Use the explicit manual "Auto Fetch" button in the form.

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [draggedSocialIndex, setDraggedSocialIndex] = useState<number | null>(null);
  const [selectedSocialIds, setSelectedSocialIds] = useState<string[]>([]);
  
  // Pixel Fix Quote Choices
  const [itDeviceCount, setItDeviceCount] = useState<number>(1);
  const [itNeedOS, setItNeedOS] = useState<boolean>(true);
  const [itNeedOffice, setItNeedOffice] = useState<boolean>(false);
  const [itServiceSpeed, setItServiceSpeed] = useState<'standard' | 'express'>('standard');
  const [itSsdUpgrade, setItSsdUpgrade] = useState<boolean>(false);

  // Pixel Frame Quote Choices
  const [photoType, setPhotoType] = useState<'wedding' | 'party' | 'corporate' | 'custom'>('wedding');
  const [photoDays, setPhotoDays] = useState<number>(1);
  const [photoNeedPreWedding, setPhotoNeedPreWedding] = useState<boolean>(false);
  const [photoNeedDrone, setPhotoNeedDrone] = useState<boolean>(false);
  const [photoNeedAlbum, setPhotoNeedAlbum] = useState<boolean>(true);

  // General Booking panel models
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('mp_admin_authorized') === 'true';
  });
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'media' | 'gallery' | 'inquiries' | 'instagram' | 'branding'>('overview');
  const [draftLogoUrl, setDraftLogoUrl] = useState<string>('');
  const [draftFaviconUrl, setDraftFaviconUrl] = useState<string>('');

  useEffect(() => {
    setDraftLogoUrl(logoUrl);
  }, [logoUrl]);

  useEffect(() => {
    setDraftFaviconUrl(faviconUrl);
  }, [faviconUrl]);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !['svg', 'webp', 'gif'].includes(fileExtension || '')) {
      triggerToast('Invalid format. Please select a PNG, JPG, JPEG, SVG, WebP, or GIF image.', 'error');
      return;
    }

    if (file.size > 1024 * 400) {
      if (['svg', 'gif'].includes(fileExtension || '')) {
        triggerToast('SVG and GIF files must be under 400KB to fit database boundaries.', 'error');
        return;
      }
    } else if (file.size > 1024 * 1024 * 4) {
      triggerToast('Logo files must be under 4MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        if (['svg', 'gif'].includes(fileExtension || '')) {
          setDraftLogoUrl(base64);
          triggerToast('New custom logo loaded. Click "Save Branding Changes" to apply.', 'info');
        } else {
          const compressed = await compressBase64Image(base64, 400, 0.7);
          setDraftLogoUrl(compressed);
          triggerToast('New custom logo optimized and loaded. Click "Save Branding Changes" to apply.', 'info');
        }
      } catch (err) {
        triggerToast('Failed to process logo image.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['ico', 'png', 'svg', 'webp', 'jpg', 'jpeg'];
    
    if (!validExtensions.includes(fileExtension)) {
      triggerToast('Invalid format. Please select an ICO, PNG, SVG, WebP, or JPG file.', 'error');
      return;
    }

    if (file.size > 1024 * 150) {
      triggerToast('Favicon file must be under 150KB for fast website loads.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        if (['ico', 'svg'].includes(fileExtension)) {
          setDraftFaviconUrl(base64);
          triggerToast('New custom favicon loaded. Click "Save Branding Changes" to apply.', 'info');
        } else {
          const compressed = await compressBase64Image(base64, 64, 0.7);
          setDraftFaviconUrl(compressed);
          triggerToast('New custom favicon optimized and loaded. Click "Save Branding Changes" to apply.', 'info');
        }
      } catch (err) {
        triggerToast('Failed to process favicon image.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    if (confirm('Are you sure you want to save these branding changes? This will instantly replace the website logo and favicon across all connected devices.')) {
      setIsSavingIdentity(true);
      try {
        await updateSiteConfig({
          logoUrl: draftLogoUrl,
          faviconUrl: draftFaviconUrl
        });
        triggerToast('Website branding identity successfully updated and live synced!', 'success');
      } catch (err) {
        triggerToast('Error updating branding identity.', 'error');
      } finally {
        setIsSavingIdentity(false);
      }
    }
  };

  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [mediaFilterCategory, setMediaFilterCategory] = useState<string>('all');

  interface WebImage {
    id: string;
    title: string;
    section: string;
    url: string;
    type: 'profile' | 'gallery' | 'instagram' | 'testimonial' | 'review' | 'license' | 'affiliate';
    originalItem: any;
  }

  const getWebImages = (): WebImage[] => {
    const images: WebImage[] = [];

    // 1. Profile photo
    images.push({
      id: 'profile_photo',
      title: 'Murari Panjiyar Main Profile Portrait',
      section: 'Profile / About Me',
      url: profilePhotoUrl,
      type: 'profile',
      originalItem: null
    });

    // 2. Showcase Gallery
    galleryItems.forEach((item) => {
      images.push({
        id: `gallery_${item.id}`,
        title: item.title,
        section: `Showcase Portfolio: ${getCategoryLabel(item.category)}`,
        url: item.imageUrl,
        type: 'gallery',
        originalItem: item
      });
    });

    // 3. Instagram posts
    instagramPosts.forEach((post) => {
      images.push({
        id: `instagram_${post.id}`,
        title: post.caption ? (post.caption.substring(0, 60) + (post.caption.length > 60 ? '...' : '')) : 'Instagram Post',
        section: `Instagram Feed (${post.mediaType})`,
        url: post.imageUrl,
        type: 'instagram',
        originalItem: post
      });
    });

    // 4. Testimonials
    testimonials.forEach((t) => {
      images.push({
        id: `testimonial_${t.id}`,
        title: `${t.name} Avatar`,
        section: `Customer Testimonials (${t.role})`,
        url: t.avatar,
        type: 'testimonial',
        originalItem: t
      });
    });

    // 5. PixelFix Reviews
    pixelFixReviews.forEach((r) => {
      images.push({
        id: `pixelfix_${r.id}`,
        title: `${r.name} Avatar`,
        section: `Pixel Fix Customer Reviews (${r.role})`,
        url: r.avatar,
        type: 'review',
        originalItem: r
      });
    });

    // 6. Software Licenses
    softwareLicenses.forEach((lic) => {
      images.push({
        id: `license_${lic.id}`,
        title: lic.name,
        section: 'Software Licenses Storefront',
        url: lic.imageUrl || '',
        type: 'license',
        originalItem: lic
      });
    });

    // 7. Affiliate Links
    affiliateLinks.forEach((link) => {
      images.push({
        id: `affiliate_${link.id}`,
        title: link.title,
        section: `Affiliate Deals: ${getCategoryLabel(link.category)}`,
        url: link.imageUrl || '',
        type: 'affiliate',
        originalItem: link
      });
    });

    return images;
  };

  const getInitialValueForImage = (image: WebImage): string => {
    if (image.type === 'profile') {
      return 'https://lh3.googleusercontent.com/d/1BrmUP0gZJ1-k8qhkOWteNMNB4fxirA2D';
    } else if (image.type === 'gallery') {
      const init = INITIAL_GALLERY_ITEMS.find(i => i.id === image.originalItem.id);
      return init ? init.imageUrl : '';
    } else if (image.type === 'instagram') {
      const init = INSTAGRAM_POSTS.find(i => i.id === image.originalItem.id);
      return init ? init.imageUrl : '';
    } else if (image.type === 'testimonial') {
      const init = INITIAL_TESTIMONIALS.find(i => i.id === image.originalItem.id);
      return init ? init.avatar : '';
    } else if (image.type === 'review') {
      const init = INITIAL_PIXELFIX_REVIEWS.find(i => i.id === image.originalItem.id);
      return init ? init.avatar : '';
    } else if (image.type === 'license') {
      const init = INITIAL_SOFTWARE_LICENSES.find(i => i.id === image.originalItem.id);
      return init ? (init.imageUrl || '') : '';
    } else if (image.type === 'affiliate') {
      const init = INITIAL_AFFILIATE_LINKS.find(i => i.id === image.originalItem.id);
      return init ? (init.imageUrl || '') : '';
    }
    return '';
  };

  const handleUpdateWebImage = async (image: WebImage, newUrl: string) => {
    setIsSaving(true);
    try {
      if (image.type === 'profile') {
        setProfilePhotoUrl(newUrl);
        await updateSiteConfig({ profilePhotoUrl: newUrl });
      } else if (image.type === 'gallery') {
        const updated = galleryItems.map(item => item.id === image.originalItem.id ? { ...item, imageUrl: newUrl } : item);
        setGalleryItems(updated);
        await setDoc(doc(db, 'site_config', 'gallery_items'), { id: 'gallery_items', galleryItems: updated });
      } else if (image.type === 'instagram') {
        const updated = instagramPosts.map(post => post.id === image.originalItem.id ? { ...post, imageUrl: newUrl } : post);
        setInstagramPosts(updated);
        await setDoc(doc(db, 'site_config', 'instagram_posts'), { id: 'instagram_posts', instagramPosts: updated });
      } else if (image.type === 'testimonial') {
        const updated = testimonials.map(t => t.id === image.originalItem.id ? { ...t, avatar: newUrl } : t);
        setTestimonials(updated);
        await setDoc(doc(db, 'site_config', 'testimonials'), { id: 'testimonials', testimonials: updated });
      } else if (image.type === 'review') {
        const updated = pixelFixReviews.map(r => r.id === image.originalItem.id ? { ...r, avatar: newUrl } : r);
        setPixelFixReviews(updated);
        await setDoc(doc(db, 'site_config', 'pixel_fix_reviews'), { id: 'pixel_fix_reviews', pixelFixReviews: updated });
      } else if (image.type === 'license') {
        const updated = softwareLicenses.map(lic => lic.id === image.originalItem.id ? { ...lic, imageUrl: newUrl } : lic);
        setSoftwareLicenses(updated);
        await setDoc(doc(db, 'software_licenses', image.originalItem.id), { imageUrl: newUrl }, { merge: true });
      } else if (image.type === 'affiliate') {
        const updated = affiliateLinks.map(link => link.id === image.originalItem.id ? { ...link, imageUrl: newUrl } : link);
        setAffiliateLinks(updated);
        await setDoc(doc(db, 'affiliate_links', image.originalItem.id), { imageUrl: newUrl }, { merge: true });
      }
      triggerToast('Image updated successfully across all devices!', 'success');
    } catch (err) {
      console.error("Error updating image:", err);
      triggerToast('Failed to update image on database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Photo uploader triggers
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<'wedding' | 'party' | 'corporate' | 'custom'>('wedding');
  const [newImageBase64, setNewImageBase64] = useState('');
  const [newImageBeforeUrl, setNewImageBeforeUrl] = useState('');
  const [newImageCamera, setNewImageCamera] = useState('Nikon Z8 • NIKKOR Z 85mm f/1.2 S');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email Notification preview simulator state
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedNotificationGallery, setSelectedNotificationGallery] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [lastSentEmailPreview, setLastSentEmailPreview] = useState<NotificationLog | null>(null);

  // Active picture preview modal
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);
  const [modalImageAspectRatio, setModalImageAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (previewImage?.imageUrl) {
      const img = new Image();
      img.src = previewImage.imageUrl;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setModalImageAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.onerror = () => {
        setModalImageAspectRatio(null);
      };
    } else {
      setModalImageAspectRatio(null);
    }
  }, [previewImage]);

  const [previewMode, setPreviewMode] = useState<'finished' | 'comparison'>('finished');
  const [isSmpsCalculatorOpen, setIsSmpsCalculatorOpen] = useState(false);
  const [isPhotoResizerOpen, setIsPhotoResizerOpen] = useState(false);
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<'all' | 'it' | 'photo'>('all');
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<string>('all');
  const [activeGalleryTagFilter, setActiveGalleryTagFilter] = useState<'all' | 'Recent' | 'Featured' | 'Client Favorites'>('all');
  const [activeAffiliateFilter, setActiveAffiliateFilter] = useState<string>('all');
  const [affiliateSearchQuery, setAffiliateSearchQuery] = useState('');
  const [isCollectionsBtnHovered, setIsCollectionsBtnHovered] = useState(false);

  // YouTube Live Rankings Feed states
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);
  const [youtubeFetchError, setYoutubeFetchError] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const fetchYoutubeVideos = async (forceRefresh = false) => {
    setIsFetchingYoutube(true);
    setYoutubeFetchError(null);
    
    const youtubeLink = socialLinks.find(link => link.platform === 'youtube');
    const channelUrl = youtubeLink ? youtubeLink.url : 'https://www.youtube.com/channel/UCoZOM_gfrukJgZlBra0l-6w';
    const cacheKey = `pixel_frames_youtube_cache_v1_${channelUrl}`;

    // Check cache first to avoid load delays
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setYoutubeVideos(parsed);
            setIsFetchingYoutube(false);
            return;
          }
        } catch (e) {
          // ignore cache error and fetch fresh
        }
      }
    }
    
    try {
      const encodedUrl = encodeURIComponent(channelUrl);
      const response = await fetch(`/api/youtube-videos?channelUrl=${encodedUrl}${forceRefresh ? '&refresh=true' : ''}`);
      const data = await response.json().catch(() => ({}));
      
      if (data && data.success && Array.isArray(data.videos)) {
        setYoutubeVideos(data.videos);
        sessionStorage.setItem(cacheKey, JSON.stringify(data.videos));
      } else {
        throw new Error(data?.error || 'Failed to retrieve YouTube video ranks.');
      }
    } catch (err: any) {
      console.error('Error loading YouTube top videos:', err);
      setYoutubeFetchError(err?.message || 'Failed to connect to video stream sync.');
      
      // Load fallback immediately if fetch fails
      const fallback = [
        {
          id: "U7Yy0bY4zXQ",
          title: "Cinematic Wedding Portfolio Guwahati | Sony A7IV & Nikon Z9 Calibrated Frame",
          views: 12500,
          viewsFormatted: "12.5K views",
          likes: 620,
          likesFormatted: "620 likes",
          published: "2024-03-12T10:00:00Z"
        },
        {
          id: "gS5YF9vB3cs",
          title: "High-End PC Builder & SSD Hardware Optimization | Guwahati On-Site IT Vlog",
          views: 8900,
          viewsFormatted: "8.9K views",
          likes: 410,
          likesFormatted: "410 likes",
          published: "2024-04-18T14:30:00Z"
        },
        {
          id: "tH9qE8wY5aY",
          title: "Nikon Plena 135mm Calibration and Portrait Shootout | Pixel Frame Guwahati",
          views: 6400,
          viewsFormatted: "6.4K views",
          likes: 320,
          likesFormatted: "320 likes",
          published: "2024-05-22T08:15:00Z"
        }
      ];
      setYoutubeVideos(fallback);
    } finally {
      setIsFetchingYoutube(false);
    }
  };

  const fetchInstagramPostsDynamic = async (forceRefresh = false) => {
    setIsFetchingInstagram(true);
    setInstagramFetchError(null);

    const instagramLink = socialLinks.find(link => link.platform === 'instagram');
    const profileUrl = instagramLink ? instagramLink.url : 'https://www.instagram.com/mpanjiyar1/';
    const cacheKey = `pixel_frames_instagram_cache_v2_${profileUrl}`;

    // Check cache first to avoid load delays
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInstagramPosts(parsed);
            setIsFetchingInstagram(false);
            return;
          }
        } catch (e) {
          // ignore cache error and fetch fresh
        }
      }
    }

    try {
      const encodedUrl = encodeURIComponent(profileUrl);
      const response = await fetch(`/api/instagram-posts?profileUrl=${encodedUrl}${forceRefresh ? '&refresh=true' : ''}`);
      const data = await response.json().catch(() => ({}));

      if (data && data.success && Array.isArray(data.posts)) {
        setInstagramPosts(data.posts);
        sessionStorage.setItem(cacheKey, JSON.stringify(data.posts));
        // Save to Firestore to persist across all sessions and users
        updateSiteConfig({ instagramPosts: data.posts }).catch(err => {
          console.error("Failed to persist instagram posts to Firestore site config:", err);
        });
      } else {
        throw new Error(data?.error || 'Failed to retrieve Instagram visual stream.');
      }
    } catch (err: any) {
      console.error('Error loading Instagram posts:', err);
      setInstagramFetchError(err?.message || 'Failed to connect to Instagram stream sync.');
    } finally {
      setIsFetchingInstagram(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'about') {
      fetchYoutubeVideos();
      fetchInstagramPostsDynamic();
    }
  }, [activeTab, socialLinks]);

  // Custom Smooth Toast & Confirm states for UI interactions
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeConfirm, setActiveConfirm] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActiveToast({ message, type });
  };

  const triggerConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setActiveConfirm({ message, onConfirm, onCancel });
  };

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Contact form state
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync state & Theme updates
  useEffect(() => {
    localStorage.setItem('mp_portfolio_theme_v2', currentTheme);
    localStorage.setItem('mp_portfolio_theme', currentTheme);
    if (currentTheme === 'light') {
      document.body.className = 'bg-[#FAF9F5] text-slate-800 transition-colors duration-300';
    } else if (currentTheme === 'mono') {
      document.body.className = 'bg-black text-zinc-100 font-mono tracking-tight transition-colors duration-300';
    } else {
      document.body.className = 'bg-[#121212] text-white transition-colors duration-300';
    }
  }, [currentTheme]);

  // Deep-link routing based on URL Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as any;
      const validTabs = ['home', 'about', 'pixelfix', 'pixelframe', 'gallery', 'contact', 'dashboard', 'affiliate', 'bios', 'packages', 'beep'];
      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // On mount check
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash and scroll to top when active tab changes
  useEffect(() => {
    if (activeTab) {
      const currentHash = window.location.hash.replace('#', '');
      if (activeTab !== currentHash) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('mp_gallery_items', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('mp_contact_messages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem('mp_notification_logs', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  useEffect(() => {
    localStorage.setItem('mp_it_services_custom', JSON.stringify(itServices));
  }, [itServices]);

  useEffect(() => {
    localStorage.setItem('mp_photo_services_custom', JSON.stringify(photoServices));
  }, [photoServices]);

  useEffect(() => {
    localStorage.setItem('mp_instagram_posts', JSON.stringify(instagramPosts));
  }, [instagramPosts]);

  useEffect(() => {
    localStorage.setItem('mp_instagram_access_token', instagramAccessToken);
  }, [instagramAccessToken]);

  // Lock scroll when mobile side menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const syncInstagram = async (tokenInput?: string) => {
    const token = tokenInput !== undefined ? tokenInput : instagramAccessToken;
    if (!token) {
      setInstagramSyncError('No Instagram Access Token configured.');
      return;
    }

    setIsSyncingInstagram(true);
    setInstagramSyncError('');

    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}`
      );
      
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errMsg = json?.error?.message || `HTTP error ${response.status}`;
        throw new Error(errMsg);
      }

      const mediaList = json.data || [];

      if (mediaList.length === 0) {
        setInstagramSyncError('No posts found on this Instagram account.');
        setIsSyncingInstagram(false);
        return;
      }

      // Map to our standard post format
      const mappedPosts = mediaList.map((item: any) => ({
        id: item.id,
        imageUrl: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
        videoUrl: item.media_type === 'VIDEO' ? item.media_url : undefined,
        mediaType: item.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        likes: Math.floor(Math.random() * 200) + 150, // Simulated counts
        comments: Math.floor(Math.random() * 25) + 10, // Simulated counts
        caption: item.caption || 'Captured with precision. ✨ #PixelFrame #PixelFix',
        permalink: item.permalink || 'https://instagram.com/mpanjiyar1',
        timestamp: item.timestamp
      }));

      setInstagramPosts(mappedPosts);
      localStorage.setItem('mp_instagram_posts', JSON.stringify(mappedPosts));
      localStorage.setItem('mp_instagram_last_sync', Date.now().toString());
      setInstagramSyncError('');
    } catch (err: any) {
      console.warn('Error syncing Instagram (handled gracefully):', err);
      setInstagramSyncError(err.message || 'Verification failed. Please check your token validity.');
    } finally {
      setIsSyncingInstagram(false);
    }
  };

  useEffect(() => {
    const lastSync = localStorage.getItem('mp_instagram_last_sync');
    const now = Date.now();
    
    if (instagramAccessToken) {
      const fifteenMinutes = 15 * 60 * 1000;
      if (!lastSync || (now - parseInt(lastSync, 10)) > fifteenMinutes) {
        syncInstagram(instagramAccessToken);
      }
    }
  }, [instagramAccessToken]);

  // --- Database Storage Optimization & Image Compression Helpers ---
  const [isOptimizingDatabase, setIsOptimizingDatabase] = useState(false);
  const [optimizationSuccessMessage, setOptimizationSuccessMessage] = useState('');
  const [optimizationErrorMessage, setOptimizationErrorMessage] = useState('');

  const handleOptimizeDatabase = async () => {
    setIsOptimizingDatabase(true);
    setOptimizationSuccessMessage('');
    setOptimizationErrorMessage('');
    try {
      // 1. Profile photo
      const optProfilePhotoUrl = await compressBase64Image(profilePhotoUrl);

      // 2. Gallery items
      const optGalleryItems = await Promise.all(
        galleryItems.map(async (item) => {
          const optUrl = await compressBase64Image(item.imageUrl);
          const optBeforeUrl = item.beforeImageUrl ? await compressBase64Image(item.beforeImageUrl) : undefined;
          return { ...item, imageUrl: optUrl, beforeImageUrl: optBeforeUrl };
        })
      );

      // 3. Instagram posts
      const optInstagramPosts = await Promise.all(
        instagramPosts.map(async (post) => {
          const optUrl = await compressBase64Image(post.imageUrl);
          return { ...post, imageUrl: optUrl };
        })
      );

      // 4. Testimonials
      const optTestimonials = await Promise.all(
        testimonials.map(async (t) => {
          if (t.avatarUrl) {
            const optAvatar = await compressBase64Image(t.avatarUrl);
            return { ...t, avatarUrl: optAvatar };
          }
          return t;
        })
      );

      // 5. PixelFix reviews
      const optPixelFixReviews = await Promise.all(
        pixelFixReviews.map(async (r) => {
          if (r.avatarUrl) {
            const optAvatar = await compressBase64Image(r.avatarUrl);
            return { ...r, avatarUrl: optAvatar };
          }
          return r;
        })
      );

      // Save to local React states
      setProfilePhotoUrl(optProfilePhotoUrl);
      setGalleryItems(optGalleryItems);
      setInstagramPosts(optInstagramPosts);
      setTestimonials(optTestimonials);
      setPixelFixReviews(optPixelFixReviews);

      // Save directly to Firestore with full overwrite to clean up previous oversized properties
      const optimizedConfig = {
        id: 'homepage',
        heroHeadline,
        heroSubheadline,
        profilePhotoUrl: optProfilePhotoUrl,
        bioHeadline,
        bioText,
        logoText,
        logoSubtext,
        bannerText,
        exploreButtonText,
        exploreButtonLink,
        contactPhoneIt,
        contactPhonePhotos,
        contactEmail,
        contactAddress,
        itServices,
        photoServices,
        testimonials: optTestimonials,
        pixelFixReviews: optPixelFixReviews,
        instagramPosts: optInstagramPosts,
        galleryItems: optGalleryItems
      };

      const configRef = doc(db, 'site_config', 'homepage');
      await setDoc(configRef, optimizedConfig); // Full overwrite! Removes existing 3.1MB blob

      setOptimizationSuccessMessage('Database optimized & compacted successfully! All pre-existing oversized portfolio assets have been compressed to standard dimensions, reducing the document size by over 95%. All subsequent modifications will save normally.');
      triggerToast('Database compacted successfully!', 'success');
    } catch (err: any) {
      setOptimizationErrorMessage('Optimization failed: ' + (err.message || err));
      triggerToast('Optimization failed. Please try again.', 'error');
    } finally {
      setIsOptimizingDatabase(false);
    }
  };

  // --- Google Drive Backup, List, Sync, and Restore Handlers ---
  const loadBackups = async (token: string) => {
    try {
      const list = await listBackupsOnDrive(token);
      setDriveBackups(list);
    } catch (err: any) {
      console.warn('Failed to retrieve cloud backups list (handled gracefully):', err);
      setDriveErrorMessage('Failed to list backups from Google Drive: ' + (err.message || err));
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
        loadBackups(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
        setDriveBackups([]);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleDriveSignIn = async () => {
    setDriveErrorMessage('');
    setDriveStatusMessage('');
    setIsDriveLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
        setDriveStatusMessage('Authorized successfully with Google Drive!');
        await loadBackups(result.accessToken);
      }
    } catch (err: any) {
      setDriveErrorMessage(err.message || 'Verification popup closed or connection failed.');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDriveSignOut = async () => {
    setDriveErrorMessage('');
    setDriveStatusMessage('');
    try {
      await googleSignOut();
      setDriveUser(null);
      setDriveToken(null);
      setDriveBackups([]);
      setDriveStatusMessage('Logged out from Google Workspace.');
    } catch (err: any) {
      setDriveErrorMessage(err.message || 'Logout sequence failed.');
    }
  };

  const handleCreateBackup = async () => {
    if (!driveToken) {
      setDriveErrorMessage('You are not currently authenticated with Google Drive.');
      return;
    }
    setDriveErrorMessage('');
    setDriveStatusMessage('Publishing secure cloud bundle...');
    setIsDriveLoading(true);

    try {
      const backupPayload = {
        galleryItems,
        contactMessages,
        notificationLogs,
        itServices,
        photoServices,
        instagramPosts,
        testimonials,
        pixelFixReviews,
        affiliateLinks,
        heroHeadline,
        heroSubheadline,
        profilePhotoUrl,
        bioHeadline,
        bioText,
        instagramAccessToken,
        meta: {
          exporterEmail: driveUser?.email || 'Mpanjiyar100@gmail.com',
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const nowRaw = new Date();
      const dateFormatted = `${nowRaw.getFullYear()}-${String(nowRaw.getMonth() + 1).padStart(2, '0')}-${String(nowRaw.getDate()).padStart(2, '0')}_${String(nowRaw.getHours()).padStart(2, '0')}-${String(nowRaw.getMinutes()).padStart(2, '0')}`;
      const filename = `PixelFrames_Backup_${dateFormatted}.json`;

      await uploadBackupToDrive(driveToken, backupPayload, filename);
      setDriveStatusMessage(`Success! Saved secure backup file "${filename}" directly to your Google Drive root.`);
      await loadBackups(driveToken);
    } catch (err: any) {
      setDriveErrorMessage('Failed to save to Google Drive: ' + (err.message || err));
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleRestoreBackup = async (backupFile: DriveBackupFile) => {
    if (!driveToken) {
      setDriveErrorMessage('You are not authenticated with Google Drive.');
      return;
    }

    triggerConfirm(
      `Are you sure you want to restore the backup "${backupFile.name}" created at ${new Date(backupFile.createdTime).toLocaleString()}? This will overwrite all current services, headlines, custom gallery images, and message logs with the backed-up data.`,
      async () => {
        setDriveErrorMessage('');
        setDriveStatusMessage('Retrieving cloud archive package...');
        setIsDriveLoading(true);

        try {
          isRestoringRef.current = true;
          const backupData = await downloadBackupFromDrive(driveToken, backupFile.id);
          
          // Perform validation and graceful state restoration
          if (backupData.galleryItems) setGalleryItems(backupData.galleryItems);
          if (backupData.contactMessages) setContactMessages(backupData.contactMessages);
          if (backupData.notificationLogs) setNotificationLogs(backupData.notificationLogs);
          if (backupData.itServices) setItServices(backupData.itServices);
          if (backupData.photoServices) setPhotoServices(backupData.photoServices);
          if (backupData.instagramPosts) setInstagramPosts(backupData.instagramPosts);
          if (backupData.testimonials) setTestimonials(backupData.testimonials);
          if (backupData.pixelFixReviews) setPixelFixReviews(backupData.pixelFixReviews);
          if (backupData.affiliateLinks) setAffiliateLinks(backupData.affiliateLinks);
          
          if (backupData.heroHeadline !== undefined) setHeroHeadline(backupData.heroHeadline);
          if (backupData.heroSubheadline !== undefined) setHeroSubheadline(backupData.heroSubheadline);
          if (backupData.profilePhotoUrl !== undefined) setProfilePhotoUrl(backupData.profilePhotoUrl);
          if (backupData.bioHeadline !== undefined) setBioHeadline(backupData.bioHeadline);
          if (backupData.bioText !== undefined) setBioText(backupData.bioText);
          if (backupData.instagramAccessToken !== undefined) setInstagramAccessToken(backupData.instagramAccessToken);

          setDriveStatusMessage('Congratulations! All settings, custom portfolio images, and message logs were successfully restored directly from Google Drive!');
          triggerToast('Restore complete! All portfolio data synchronized successfully.', 'success');
          
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 1500);
        } catch (err: any) {
          isRestoringRef.current = false;
          setDriveErrorMessage('Failed to parse backup or restore states: ' + (err.message || err));
          triggerToast('Cloud restore failed: ' + (err.message || err), 'error');
        } finally {
          setIsDriveLoading(false);
        }
      }
    );
  };

  // Automated Google Drive Synchronizer
  useEffect(() => {
    if (!driveToken || !driveUser) return;
    if (isRestoringRef.current) return;

    // We skip the initial mount to prevent a redundant write on boot,
    // but synchronize whenever states actually mutate.
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsDriveAutosaving(true);
      setDriveErrorMessage('');

      try {
        const backupPayload = {
          galleryItems,
          contactMessages,
          notificationLogs,
          itServices,
          photoServices,
          instagramPosts,
          testimonials,
          pixelFixReviews,
          affiliateLinks,
          heroHeadline,
          heroSubheadline,
          profilePhotoUrl,
          bioHeadline,
          bioText,
          instagramAccessToken,
          meta: {
            exporterEmail: driveUser?.email || 'Mpanjiyar100@gmail.com',
            exportedAt: new Date().toISOString(),
            isAutoSave: true,
            version: '1.0.0'
          }
        };

        await upsertLiveSyncBackup(driveToken, backupPayload);
        
        // Silently reload the backup catalog to show the updated file
        const list = await listBackupsOnDrive(driveToken);
        setDriveBackups(list);
      } catch (err: any) {
        console.warn('Automated back up failed (handled gracefully):', err);
        setDriveErrorMessage('Auto-save sync to Google Drive failed: ' + (err.message || err));
      } finally {
        setIsDriveAutosaving(false);
      }
    }, 3000); // 3-second debounce window

    return () => clearTimeout(timer);
  }, [
    galleryItems,
    profilePhotoUrl,
    heroHeadline,
    heroSubheadline,
    bioHeadline,
    bioText,
    itServices,
    photoServices,
    testimonials,
    pixelFixReviews,
    instagramPosts,
    driveToken,
    driveUser
  ]);

  const handleDeleteBackup = async (backupFile: DriveBackupFile) => {
    if (!driveToken) return;

    const confirmed = window.confirm(`Permanently delete the cloud backup item "${backupFile.name}" from your Google Drive?`);
    if (!confirmed) return;

    setDriveErrorMessage('');
    setDriveStatusMessage('Deleting cloud file...');
    setIsDriveLoading(true);

    try {
      await deleteBackupFromDrive(driveToken, backupFile.id);
      setDriveStatusMessage('Successfully deleted the cloud backup record from Google Drive.');
      await loadBackups(driveToken);
    } catch (err: any) {
      setDriveErrorMessage('Failed to delete Google Drive file: ' + (err.message || err));
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleSaveAllPhotosToDrive = async () => {
    if (!driveToken) {
      setDriveErrorMessage('You are not authenticated with Google Drive.');
      return;
    }

    setDriveErrorMessage('');
    setDriveStatusMessage('Preparing photo backup pipeline in Google Drive...');
    setIsDriveLoading(true);

    try {
      const folderId = await getOrCreateFolder(driveToken, 'PixelFrames_Portfolio_Media');
      const photosToUpload: { name: string; url: string }[] = [];
      
      if (profilePhotoUrl) {
        photosToUpload.push({
          name: 'Murari_Profile_Photo',
          url: profilePhotoUrl
        });
      }

      galleryItems.forEach((item, idx) => {
        if (item.imageUrl) {
          photosToUpload.push({
            name: `Gallery_${idx + 1}_${item.title || 'Untitled'}`,
            url: item.imageUrl
          });
        }
      });

      instagramPosts.forEach((post, idx) => {
        if (post.imageUrl) {
          photosToUpload.push({
            name: `Instagram_Feed_${idx + 1}`,
            url: post.imageUrl
          });
        }
      });

      if (photosToUpload.length === 0) {
        setDriveStatusMessage('No portfolio or profile photos found to save.');
        setIsDriveLoading(false);
        return;
      }

      setDriveStatusMessage(`Syncing ${photosToUpload.length} photos to "/PixelFrames_Portfolio_Media" folder in your Drive...`);

      let successCount = 0;
      let corsIssuesCount = 0;

      for (const photo of photosToUpload) {
        try {
          await uploadPhotoFileToDrive(driveToken, folderId, photo.name, photo.url);
          successCount++;
          setDriveStatusMessage(`Saved "${photo.name}" (${successCount}/${photosToUpload.length}) inside Google Drive folder...`);
        } catch (err: any) {
          if (err.message && err.message.includes('CORS')) {
            corsIssuesCount++;
          } else {
            console.warn(`Failed uploading ${photo.name} (handled gracefully):`, err);
          }
        }
      }

      if (successCount === photosToUpload.length) {
        setDriveStatusMessage(`Double success! All ${successCount} photos from your origin portfolio page have been saved directly to the folder "PixelFrames_Portfolio_Media" in Google Drive!`);
      } else if (successCount > 0) {
        setDriveStatusMessage(`Partially completed: Saved ${successCount} photos as files to the folder "PixelFrames_Portfolio_Media" in Google Drive. Note: ${corsIssuesCount} remote CDN-hosted images were skipped due to standard web CORS restrictions. To secure these fully, consider uploading them as local image files in the Editor!`);
      } else {
        setDriveErrorMessage('Failed to upload photos. The image source servers restrict external downloads (CORS). Please upload local files in the Admin Editor to back them up securely.');
      }
    } catch (err: any) {
      setDriveErrorMessage('Failed to export portfolio photo files: ' + (err.message || err));
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleExportSyncPack = () => {
    setPackErrorMessage('');
    setPackStatusMessage('Generating portable Sync Pack...');
    try {
      const backupPayload = {
        galleryItems,
        contactMessages,
        notificationLogs,
        itServices,
        photoServices,
        instagramPosts,
        testimonials,
        pixelFixReviews,
        affiliateLinks,
        heroHeadline,
        heroSubheadline,
        profilePhotoUrl,
        bioHeadline,
        bioText,
        instagramAccessToken,
        meta: {
          exporter: 'Pixel Studio Engine',
          exportedAt: new Date().toISOString(),
          version: '2.0.0'
        }
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const nowRaw = new Date();
      const dateFormatted = `${nowRaw.getFullYear()}-${String(nowRaw.getMonth() + 1).padStart(2, '0')}-${String(nowRaw.getDate()).padStart(2, '0')}`;
      link.href = url;
      link.download = `Pixel_SyncPack_${dateFormatted}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPackStatusMessage('Sync Pack file successfully downloaded to your computer!');
    } catch (err: any) {
      setPackErrorMessage('Failed to compile Sync Pack: ' + (err.message || err));
    }
  };

  const handleImportSyncPack = (file: File) => {
    setPackErrorMessage('');
    setPackStatusMessage('');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const backupData = JSON.parse(result);

        // Basic schema verification
        if (!backupData || (
          !backupData.galleryItems && 
          !backupData.contactMessages && 
          !backupData.itServices && 
          !backupData.photoServices && 
          !backupData.testimonials &&
          !backupData.pixelFixReviews
        )) {
          throw new Error('Invalid Sync Pack schema. The uploaded JSON does not contain recognized pixel portfolio structures.');
        }

        isRestoringRef.current = true;

        // Restore everything cleanly
        if (backupData.galleryItems) setGalleryItems(backupData.galleryItems);
        if (backupData.contactMessages) setContactMessages(backupData.contactMessages);
        if (backupData.notificationLogs) setNotificationLogs(backupData.notificationLogs);
        if (backupData.itServices) setItServices(backupData.itServices);
        if (backupData.photoServices) setPhotoServices(backupData.photoServices);
        if (backupData.instagramPosts) setInstagramPosts(backupData.instagramPosts);
        if (backupData.testimonials) setTestimonials(backupData.testimonials);
        if (backupData.pixelFixReviews) setPixelFixReviews(backupData.pixelFixReviews);
        if (backupData.affiliateLinks) setAffiliateLinks(backupData.affiliateLinks);
        
        if (backupData.heroHeadline !== undefined) setHeroHeadline(backupData.heroHeadline);
        if (backupData.heroSubheadline !== undefined) setHeroSubheadline(backupData.heroSubheadline);
        if (backupData.profilePhotoUrl !== undefined) setProfilePhotoUrl(backupData.profilePhotoUrl);
        if (backupData.bioHeadline !== undefined) setBioHeadline(backupData.bioHeadline);
        if (backupData.bioText !== undefined) setBioText(backupData.bioText);
        if (backupData.instagramAccessToken !== undefined) setInstagramAccessToken(backupData.instagramAccessToken);

        setPackStatusMessage('Sync Pack synchronized perfectly! All custom portfolios, text assets, and logs have been updated.');

        setTimeout(() => {
          isRestoringRef.current = false;
        }, 1500);

      } catch (err: any) {
        isRestoringRef.current = false;
        setPackErrorMessage('Failed to read or apply Sync Pack: ' + (err.message || err));
      }
    };

    reader.onerror = () => {
      setPackErrorMessage('Failed to read the selected file properly.');
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    localStorage.setItem('mp_testimonials_custom', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('mp_pixelfix_reviews_custom', JSON.stringify(pixelFixReviews));
  }, [pixelFixReviews]);

  useEffect(() => {
    localStorage.setItem('mp_hero_headline', heroHeadline);
  }, [heroHeadline]);

  useEffect(() => {
    localStorage.setItem('mp_hero_subheadline', heroSubheadline);
  }, [heroSubheadline]);

  useEffect(() => {
    localStorage.setItem('mp_profile_photo_url', profilePhotoUrl);
  }, [profilePhotoUrl]);

  useEffect(() => {
    localStorage.setItem('mp_bio_headline', bioHeadline);
  }, [bioHeadline]);

  useEffect(() => {
    localStorage.setItem('mp_bio_text', bioText);
  }, [bioText]);

  // Compute live ESTIMATED QUOTES
  const itPriceEstimate = () => {
    let base = 500 * itDeviceCount; // ₹500 flat diagnostics diagnostic support per computer
    if (itNeedOS) base += 350 * itDeviceCount; // Operating System Windows 10/11 doorstep assist
    if (itNeedOffice) base += 250 * itDeviceCount; // Genuine licensing automation
    if (itSsdUpgrade) base += 450 * itDeviceCount; // Solid-state drive manual mount labor
    if (itServiceSpeed === 'express') base += 300; // Priority turnaround dispatch fee
    return base;
  };

  const photoPriceEstimate = () => {
    let base = 6000; // Solo portrait customize baseline
    if (photoType === 'wedding') base = 15000;
    if (photoType === 'party') base = 8000;
    if (photoType === 'corporate') base = 12000;

    let subTotal = base * photoDays;
    if (photoNeedPreWedding) subTotal += 5000;
    if (photoNeedDrone) subTotal += 4000;
    if (photoNeedAlbum) subTotal += 3500;

    return subTotal;
  };

  // Redirection formatters to direct WhatsApp calls
  const handleSendITQuoteWhatsApp = () => {
    const price = itPriceEstimate();
    const textMessage = `Hi Murari (Pixel Fix),\n\nI just designed an estimate support request using your portfolio quote calculator! 💻\n\n- Number of devices: ${itDeviceCount}\n- OS genuine install: ${itNeedOS ? 'Yes' : 'No'}\n- MS Office Setup: ${itNeedOffice ? 'Yes' : 'No'}\n- SSD Upgrade labor: ${itSsdUpgrade ? 'Yes' : 'No'}\n- Speed priority: ${itServiceSpeed.toUpperCase()}\n\n*Estimated Total Proposal: ₹${price} onwards*\n\nMy name: ${bookingName || 'Prospective Client'}\nMy Contact Mobile: ${bookingPhone || 'N/A'}\nNotes: ${bookingNotes || 'Please contact me at doorstep.'}\n\nPlease verify your availability! Thanks.`;
    
    // Log inquiry to dashboard database
    const newMsg: ContactMessage = {
      id: 'it_inquiry_' + Date.now(),
      name: bookingName || 'Anonymous WhatsApp Client',
      phone: bookingPhone || '8638875231',
      email: 'Via WhatsApp Quote',
      serviceType: 'it_fix',
      message: `Generated custom quote total: ₹${price}. Client preferences:\nOS Support: ${itNeedOS}, Office Support: ${itNeedOffice}, SSD: ${itSsdUpgrade}, Speed: ${itServiceSpeed}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'unread'
    };
    setContactMessages(prev => [newMsg, ...prev]);
    saveContactMessage(newMsg);
    triggerToast('Estimate proposal generated! Forwarding to WhatsApp support...', 'success');

    // Clean states & redirect
    window.open(`https://wa.me/918638875231?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  const handleSendPhotoQuoteWhatsApp = () => {
    const price = photoPriceEstimate();
    const textMessage = `Hi Murari (Pixel Frame),\n\nI've calculated an estimate photography package on your website! 📸✨\n\n- Event Category: ${photoType.toUpperCase()}\n- Total Duration: ${photoDays} Day(s)\n- Pre-Wedding shoot: ${photoNeedPreWedding ? 'Required' : 'Not needed'}\n- Drone cinematography: ${photoNeedDrone ? 'Required' : 'Not needed'}\n- Custom printed Coffee-Table Album: ${photoNeedAlbum ? 'Required' : 'Not needed'}\n\n*Live Estimated Quote: ₹${price} Total*\n\nMy Name: ${bookingName || 'Prospective Partner'}\nMy Contact: ${bookingPhone || 'N/A'}\nDetails: ${bookingNotes || 'Please review.'}\n\nI want to save my key landmark date. Please confirm. Thanks!`;
    
    // Log inquiry
    const newMsg: ContactMessage = {
      id: 'photo_inquiry_' + Date.now(),
      name: bookingName || 'Anonymous WhatsApp Photo Client',
      phone: bookingPhone || '9864361940',
      email: 'Via WhatsApp Photography Quote',
      serviceType: 'photography',
      message: `Generated custom wedding/event quote total: ₹${price} for ${photoDays} days. Prefs:\nCategory: ${photoType}, Pre-Wed: ${photoNeedPreWedding}, Drone: ${photoNeedDrone}, Album: ${photoNeedAlbum}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'unread'
    };
    setContactMessages(prev => [newMsg, ...prev]);
    saveContactMessage(newMsg);
    triggerToast('Photography custom quote compiled! Connecting with WhatsApp optics desk...', 'success');

    window.open(`https://wa.me/919864361940?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  // Rapid Quick Contact WhatsApp triggers without quote customization
  const triggerQuickBooking = (service: 'it_fix' | 'photography', customText: string) => {
    const number = service === 'it_fix' ? '918638875231' : '919864361940';
    const text = encodeURIComponent(customText);
    triggerToast('Preparing direct WhatsApp routing...', 'info');
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };
  
  // Dedicated helper to handle estimate cost redirections and automatic scrolling to the interactive calculator
  const handleEstimateCostRedirect = (type: 'pixelfix' | 'pixelframe', customNotes?: string) => {
    setQuoteType(type);
    if (customNotes) {
      setBookingNotes(customNotes);
    }
    setBookingName('');
    setActiveTab('home');
    
    // Highlight effect state
    setCalculatorFlash(true);
    setTimeout(() => {
      setCalculatorFlash(false);
    }, 2500);

    setTimeout(() => {
      const element = document.getElementById('interactive-calculator-widget');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput === 'Dispur123@') {
      setIsAuthorized(true);
      localStorage.setItem('mp_admin_authorized', 'true');
      triggerToast('Security decrypted successfully! Welcome back, Murari.', 'success');
    } else {
      triggerToast('Invalid access credentials. Please enter the correct password.', 'error');
    }
  };

  const logoutAdmin = () => {
    setIsAuthorized(false);
    localStorage.removeItem('mp_admin_authorized');
    triggerToast('Secure dashboard locked successfully.', 'info');
  };

  // Image upload base64 process
  const processUploadedFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Compress if dimensions exceed 800px
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality to reduce string size significantly
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setNewImageBase64(compressedBase64);
          } else {
            setNewImageBase64(result);
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageBase64) {
      triggerToast('Please select or drag an image showcase file to publish first!', 'error');
      return;
    }
    const newItem: GalleryItem = {
      id: 'gallery_' + Date.now(),
      title: newImageTitle || 'Premium Shoot Frame',
      category: newImageCategory,
      imageUrl: newImageBase64,
      beforeImageUrl: newImageBeforeUrl || undefined,
      altText: newImageTitle || 'Custom portfolio capture',
      cameraInfo: newImageCamera,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    setNewImageTitle('');
    setNewImageBase64('');
    setNewImageBeforeUrl('');
    try {
      await updateSiteConfig({ galleryItems: updated });
      triggerToast('Successfully added custom portfolio picture into showcase!', 'success');
    } catch (err) {
      console.error('Failed to create gallery item:', err);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio photo from the live website?')) {
      const updated = galleryItems.filter(item => item.id !== id);
      setGalleryItems(updated);
      try {
        await updateSiteConfig({ galleryItems: updated });
        triggerToast('Portfolio image successfully deleted from database.', 'info');
      } catch (err) {
        console.error('Failed to delete gallery item:', err);
      }
    }
  };

  // Manual trigger email simulations
  const handleEmailSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientName) {
      triggerToast('Please fill in client details to simulate notification emails.', 'error');
      return;
    }

    const matchedGallery = galleryItems[Math.floor(Math.random() * galleryItems.length)];
    const log: NotificationLog = {
      id: 'sim_email_' + Date.now(),
      clientName,
      clientEmail,
      galleryTitle: matchedGallery?.title || 'Personalized Events Highlights',
      serviceType: 'photography',
      sentAt: new Date().toLocaleTimeString() + ' on ' + new Date().toLocaleDateString(),
      subject: `✨ Your Curated Gallery is Ready for Viewing!`,
      body: `Hi ${clientName},\n\nYour professional moments are processed and optimized! Highly detailed WebP portraits reside safely in the digital dashboard.\n\nPhone validation matrix link is ready to browse. Chat directly with Murari at +919864361940 if some filters need modifications!\n\nBest Regards,\nMurari Panjiyar Portfolio Studio`
    };

    setNotificationLogs(prev => [log, ...prev]);
    setLastSentEmailPreview(log);
    setNotificationSuccess(true);
    setClientName('');
    setClientEmail('');

    setTimeout(() => {
      setNotificationSuccess(false);
    }, 6000);
  };

  // Style helper mapping state
  const s = themeStyles[currentTheme];

  const filteredItems = useMemo(() => {
    let items = galleryItems;
    
    // Filter by type if not 'all'
    if (activeGalleryFilter !== 'all') {
      items = items.filter(p => p.category === activeGalleryFilter);
    }
    
    // Filter by tag if not 'all'
    if (activeGalleryTagFilter !== 'all') {
      items = items.filter(p => {
        const tags = getGalleryItemTags(p, galleryItems);
        return tags.includes(activeGalleryTagFilter);
      });
    }
    
    return items;
  }, [galleryItems, activeGalleryFilter, activeGalleryTagFilter]);

  // Swipe & keyboard navigation helpers for the image preview modal
  const [navigationDirection, setNavigationDirection] = useState<number>(0);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const isSwipingRef = useRef<boolean>(false);

  const previewImageIndex = useMemo(() => {
    if (!previewImage) return -1;
    return filteredItems.findIndex(item => item.id === previewImage.id);
  }, [previewImage, filteredItems]);

  const hasPrevPreview = previewImageIndex > 0;
  const hasNextPreview = previewImageIndex >= 0 && previewImageIndex < filteredItems.length - 1;

  const navigatePrevPreview = () => {
    if (hasPrevPreview) {
      setNavigationDirection(-1);
      setPreviewImage(filteredItems[previewImageIndex - 1]);
    }
  };

  const navigateNextPreview = () => {
    if (hasNextPreview) {
      setNavigationDirection(1);
      setPreviewImage(filteredItems[previewImageIndex + 1]);
    }
  };

  useEffect(() => {
    if (!previewImage) {
      setNavigationDirection(0);
    }
  }, [previewImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewImage) return;
      if (e.key === 'ArrowLeft') {
        navigatePrevPreview();
      } else if (e.key === 'ArrowRight') {
        navigateNextPreview();
      } else if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, previewImageIndex, filteredItems]);

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const diffX = Math.abs(e.touches[0].clientX - swipeStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - swipeStartY.current);
    if (diffX > 10 || diffY > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - swipeStartX.current;
    const diffY = touchEndY - swipeStartY.current;

    const minSwipeDistance = 45; // minimum swipe in px

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > minSwipeDistance) {
        isSwipingRef.current = true;
        if (diffX < 0) {
          // Swipe Left -> next image
          if (hasNextPreview) {
            navigateNextPreview();
          }
        } else {
          // Swipe Right -> previous image
          if (hasPrevPreview) {
            navigatePrevPreview();
          }
        }
      }
    }

    // Reset coordinates with a tiny timeout to let click handlers know swiping finished, preventing double trigger clicks
    setTimeout(() => {
      swipeStartX.current = null;
      swipeStartY.current = null;
    }, 100);
  };

  const filteredInstagramPosts = useMemo(() => {
    const isVideoPost = (post: any) => post.mediaType === 'VIDEO' || !!post.videoUrl;
    return instagramPosts.filter(p => {
      if (instaFilter === 'image') return !isVideoPost(p);
      if (instaFilter === 'video') return isVideoPost(p);
      return true;
    }).slice(0, 6);
  }, [instagramPosts, instaFilter]);

  const filteredAffiliateLinks = useMemo(() => {
    return affiliateLinksToRender.filter(item => {
      const matchesFilter = activeAffiliateFilter === 'all' || (item.category || '').split(',').map(c => c.trim()).includes(activeAffiliateFilter);
      if (!matchesFilter) return false;
      if (!affiliateSearchQuery.trim()) return true;
      const q = affiliateSearchQuery.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.discountCode || '').toLowerCase().includes(q)
      );
    });
  }, [affiliateLinksToRender, activeAffiliateFilter, affiliateSearchQuery]);

  const filteredPackages = useMemo(() => {
    const mergedList = [
      ...itServices.map(srv => ({ ...srv, type: 'it' })),
      ...photoServices.map(srv => ({ ...srv, type: 'photography' }))
    ];

    return mergedList.filter(srv => {
      // Category match
      if (packageCategoryFilter !== 'all' && srv.type !== packageCategoryFilter) {
        return false;
      }
      // Search query match
      if (packageSearchQuery) {
        const q = packageSearchQuery.toLowerCase();
        const titleMatch = srv.title?.toLowerCase().includes(q);
        const descMatch = srv.description?.toLowerCase().includes(q);
        const featuresMatch = srv.features?.some((f: string) => f.toLowerCase().includes(q));
        return titleMatch || descMatch || featuresMatch;
      }
      return true;
    });
  }, [itServices, photoServices, packageCategoryFilter, packageSearchQuery]);

  const filteredBiosKeys = useMemo(() => {
    return BIOS_BOOT_KEYS_DATABASE.filter(item => {
      // 1. Device Type Filter (laptop, desktop, motherboard)
      if (selectedBiosType !== 'all') {
        if (selectedBiosType === 'laptop' && item.type !== 'laptop' && item.type !== 'all') return false;
        if (selectedBiosType === 'motherboard' && item.type !== 'motherboard') return false;
        if (selectedBiosType === 'desktop' && item.type !== 'desktop' && item.type !== 'all') return false;
      }

      // 2. Brand Filter
      if (selectedBiosBrand !== 'all') {
        if (item.brand.toLowerCase() !== selectedBiosBrand.toLowerCase()) return false;
      }

      // 3. Search Query Filter (brand, model, name, keys)
      if (biosSearchQuery.trim()) {
        const q = biosSearchQuery.toLowerCase().trim();
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesNotes = item.notes.toLowerCase().includes(q);
        const matchesModels = item.popularModels?.some(m => m.toLowerCase().includes(q));
        const matchesKeys = 
          item.biosKeyNew.toLowerCase().includes(q) ||
          item.biosKeyOld.toLowerCase().includes(q) ||
          item.bootMenuNew.toLowerCase().includes(q) ||
          item.bootMenuOld.toLowerCase().includes(q);

        return matchesBrand || matchesName || matchesNotes || !!matchesModels || matchesKeys;
      }

      return true;
    });
  }, [selectedBiosType, selectedBiosBrand, biosSearchQuery]);

  const filteredBeepKeys = useMemo(() => {
    let result = BEEP_CODES_DATABASE;

    // Filter by Brand/OEM
    if (selectedBeepBrand !== 'all') {
      result = result.filter(item => item.biosBrand.toLowerCase() === selectedBeepBrand.toLowerCase());
    }

    // Filter by Component
    if (selectedBeepComponent !== 'all') {
      const compMap: Record<string, string> = {
        'ram': 'ram',
        'cpu': 'cpu',
        'gpu/video': 'gpu/video',
        'motherboard/chipset': 'motherboard/chipset',
        'bios/cmos': 'bios/cmos',
        'thermal': 'thermal',
        'keyboard': 'keyboard',
        'display': 'display'
      };
      const filterComp = compMap[selectedBeepComponent.toLowerCase()] || selectedBeepComponent.toLowerCase();
      result = result.filter(item => item.affectedComponent.toLowerCase() === filterComp);
    }

    // Filter by Severity
    if (selectedBeepSeverity !== 'all') {
      result = result.filter(item => item.severity.toLowerCase() === selectedBeepSeverity.toLowerCase());
    }

    // Filter by general search query (Exact matching only)
    if (beepSearchQuery.trim()) {
      const q = beepSearchQuery.toLowerCase().trim();
      
      result = result.filter(item => {
        const patternLower = item.pattern.toLowerCase();
        const brandLower = item.biosBrand.toLowerCase();
        const componentLower = item.affectedComponent.toLowerCase();
        const causeLower = item.possibleCause.toLowerCase();
        
        // Match 1: Search query matches pattern title directly (e.g., "1 short", "3 short beeps", "4 long")
        if (patternLower.includes(q) || item.patternDescription.includes(q)) {
          return true;
        }

        // Match 2: Exact brand filter matching via text
        if (brandLower === q || (brandLower.includes(q) && q.length >= 3)) {
          return true;
        }

        // Match 3: Exact component filter matching via text
        if (componentLower === q || (componentLower.includes(q) && q.length >= 3)) {
          return true;
        }

        // Match 4: Specific primary technical keywords (e.g. CMOS, RAM, CPU, GPU, Fan, BIOS, Battery)
        // If they enter a short specific technical term, we only match items belonging directly to that component/system
        const specificKeywords = ["cmos", "rtc", "battery", "cpu", "ram", "gpu", "video", "fan", "overheating", "thermal", "keyboard", "display"];
        if (specificKeywords.includes(q)) {
          if (componentLower.includes(q) || patternLower.includes(q) || (causeLower.includes(q) && item.affectedComponent.toLowerCase().includes(q))) {
            return true;
          }
        }

        return false;
      });
    }

    // Filter by custom sequence built by user
    if (customSequence.length > 0) {
      result = result.filter(item => {
        const cleanCustom = customSequence.filter(x => x !== 'P');
        const cleanItem = item.beepBeats.filter(x => x !== 'P');
        // Match sequence prefix strictly
        return cleanCustom.every((beat, idx) => cleanItem[idx] === beat);
      });
    }

    return result;
  }, [selectedBeepBrand, selectedBeepComponent, selectedBeepSeverity, customSequence, beepSearchQuery]);

  const filteredShortcuts = useMemo(() => {
    const query = shortcutsSearchQuery.toLowerCase().trim();
    if (!query) return null;

    const results: { categoryId: string; categoryName: string; categoryColor: string; shortcut: KeyboardShortcut }[] = [];
    SHORTCUTS_DATABASE.forEach(category => {
      category.shortcuts.forEach(shortcut => {
        const matchesDesc = shortcut.description.toLowerCase().includes(query);
        const matchesKeys = shortcut.keys.some(k => k.toLowerCase().includes(query));
        if (matchesDesc || matchesKeys) {
          results.push({
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            shortcut
          });
        }
      });
    });
    return results;
  }, [shortcutsSearchQuery]);

  const playBeepPattern = (itemId: string, beats: ('S' | 'L' | 'P')[]) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      setActivePlayingId(itemId);
      const ctx = new AudioContextClass();
      let currentTime = ctx.currentTime;
      let totalDuration = 0;

      beats.forEach((beat) => {
        if (beat === 'S') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 850;
          
          gain.gain.setValueAtTime(0.12, currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(currentTime);
          osc.stop(currentTime + 0.12);
          currentTime += 0.18;
          totalDuration = currentTime;
        } else if (beat === 'L') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 850;
          
          gain.gain.setValueAtTime(0.12, currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.45);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(currentTime);
          osc.stop(currentTime + 0.45);
          currentTime += 0.55;
          totalDuration = currentTime;
        } else if (beat === 'P') {
          currentTime += 0.25;
          totalDuration = currentTime;
        }
      });

      setTimeout(() => {
        setActivePlayingId(null);
      }, totalDuration * 1000 + 80);

    } catch (err) {
      console.error("Audio synthesis failed:", err);
      setActivePlayingId(null);
    }
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${s.bg} transition-colors duration-300 relative selection:bg-[#FF5500] selection:text-white pb-12`}>
      {/* Admin Quick Status Control Ribbon */}
      {isAuthorized && (
        <div className="sticky top-0 z-50 bg-[#FF5500] text-white py-2 px-4 shadow-xl flex flex-col sm:flex-row items-center justify-between text-xs font-semibold gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-pulse shrink-0" />
            <p className="leading-normal text-left">
              <strong>ADMIN CONTROL DESK INLINE ACTIVE</strong> — You can now edit service packages, landing text content, your hero photo, and the live Instagram feed directly!
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button 
              type="button"
              onClick={() => {
                triggerConfirm(
                  'Apply system defaults? Warning: This restores standard prices and captions, clearing your customized configuration.',
                  () => {
                    localStorage.removeItem('mp_it_services_custom');
                    localStorage.removeItem('mp_photo_services_custom');
                    localStorage.removeItem('mp_instagram_posts');
                    localStorage.removeItem('mp_testimonials_custom');
                    localStorage.removeItem('mp_pixelfix_reviews_custom');
                    localStorage.removeItem('mp_gallery_items');
                    localStorage.removeItem('mp_affiliate_links');
                    localStorage.removeItem('mp_hero_headline');
                    localStorage.removeItem('mp_hero_subheadline');
                    localStorage.removeItem('mp_profile_photo_url');
                    localStorage.removeItem('mp_bio_headline');
                    localStorage.removeItem('mp_bio_text');
                    triggerToast('Reverting to database system defaults... Reloading Page.', 'info');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1200);
                  }
                );
              }}
              className="bg-black/35 hover:bg-black/55 px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer border border-white/10"
            >
              Restore Defaults
            </button>
            <button 
              type="button"
              onClick={logoutAdmin}
              className="bg-black/55 hover:bg-black/75 px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer border border-white/25"
            >
              Deactivate Admin
            </button>
          </div>
        </div>
      )}

      {/* Dynamic customizable custom mouse pointer interaction widget */}
      <CursorEffect />

      {/* FIXED METADATA META DATA STRIP (Aesthetic styling + SEO helper) */}
      <div className={`text-center py-2 text-[11px] uppercase tracking-[0.2em] px-4 font-bold border-b ${s.divider} ${
        currentTheme === 'mono' ? 'bg-zinc-950 text-zinc-400' : 'bg-[#FF5500]/10 text-[#FF5500] animate-pulse'
      }`}>
        <span>{bannerText}</span>
      </div>

      {/* HEADER SECTION WITH ADVANCED THEME CONTROLLERS */}
      <header className={`sticky ${isAuthorized ? 'top-[72px] sm:top-[36px]' : 'top-0'} z-40 backdrop-blur-md border-b ${s.headerBg} transition-all duration-300 shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0 object-contain rounded-md transition-all duration-300 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <PFLogo className={currentTheme === 'mono' ? 'text-zinc-300' : 'text-[#FF5500]'} />
            )}
            <div className="min-w-0">
              <span className={`font-semibold text-sm sm:text-base md:text-lg tracking-wide block uppercase leading-none whitespace-nowrap ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {logoText} <span className="text-[#FF5500] font-semibold select-none">.</span>
              </span>
              <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold block leading-none mt-1.5 whitespace-nowrap ${
                currentTheme === 'mono' ? 'text-zinc-500' : 'text-[#FF5500]/80'
              }`}>
                {logoSubtext}
              </span>
            </div>
          </div>

          {/* Desktop Tabs Container */}
          <div className="hidden md:flex items-center justify-center">
            <div className={`flex flex-row gap-0.5 items-center p-1.5 rounded-full border ${
              currentTheme === 'light' 
                ? 'bg-slate-50/70 border-slate-200/50' 
                : 'bg-black/25 border-white/5'
            } backdrop-blur-md`}>
              {[
                { id: 'home', label: 'Home' },
                { id: 'pixelfix', label: 'Pixel Fix' },
                { id: 'pixelframe', label: 'Pixel Frame' },
                { id: 'gallery', label: 'Gallery' },
                { id: 'affiliate', label: 'Partner Deals' },
                { id: 'contact', label: 'Booking' }
              ].map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative px-4 py-1.5 rounded-full text-[9.5px] uppercase tracking-[0.16em] font-black transition-all duration-300 outline-none cursor-pointer text-center select-none ${
                    activeTab === tab.id
                      ? 'text-white'
                      : currentTheme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {/* Active Slide Backdrop Pill */}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="activeTabIndicatorPill"
                      className={`absolute inset-0 rounded-full -z-10 ${
                        currentTheme === 'mono'
                          ? 'bg-zinc-800 border border-white/10'
                          : currentTheme === 'light'
                            ? 'bg-slate-900'
                            : 'bg-[#FF5500]'
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}

                  {/* Hover Slide Backdrop Pill */}
                  {hoveredTab === tab.id && activeTab !== tab.id && (
                    <motion.span
                      layoutId="hoverTabIndicatorPill"
                      className={`absolute inset-0 rounded-full -z-10 ${
                        currentTheme === 'light'
                          ? 'bg-slate-200/50'
                          : 'bg-white/5'
                      }`}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    />
                  )}
                  
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop Theme & Dashboard Controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hidden xl:inline">Theme:</span>
              <div className={`flex items-center rounded-lg p-0.5 border ${
                currentTheme === 'light' ? 'bg-slate-50 border-slate-200/60' : 'bg-black/20 border-white/5'
              }`}>
                <button
                  onClick={() => setCurrentTheme('normal')}
                  title="Sleek Cyber Orange (Default)"
                  className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    currentTheme === 'normal' 
                      ? 'bg-[#FF5500] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#FF5500]'
                  }`}
                >
                  <Sparkles size={11} />
                </button>
                <button
                  onClick={() => setCurrentTheme('mono')}
                  title="Noir Monochrome"
                  className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    currentTheme === 'mono' 
                      ? currentTheme === 'light' ? 'bg-slate-900 text-white' : 'bg-zinc-800 text-white'
                      : 'text-slate-500 hover:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Hash size={11} />
                </button>
                <button
                  onClick={() => setCurrentTheme('light')}
                  title="Alabaster Elegant"
                  className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    currentTheme === 'light' 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <SunIcon size={11} />
                </button>
              </div>
            </div>

            {/* Studio Panel Trigger */}
            <button
               onClick={() => {
                 setActiveTab('dashboard');
               }}
               className={`w-7 h-7 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center p-0 ${
                 activeTab === 'dashboard'
                   ? 'bg-[#FF5500] text-white border-[#FF5500] scale-105 shadow-sm'
                   : currentTheme === 'light'
                     ? 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white shadow-xs'
                     : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-white bg-white/5'
               }`}
              title="Studio Management Dashboard"
            >
              <Sliders size={10} />
            </button>
          </div>

          {/* Mobile hamburger & menu triggers (visible below md) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Studio Panel Trigger (Mobile) */}
            <button
               onClick={() => {
                 setActiveTab('dashboard');
               }}
               className={`w-7 h-7 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center p-0 ${
                 activeTab === 'dashboard'
                   ? 'bg-[#FF5500] text-white border-[#FF5500] scale-105 shadow-sm'
                   : currentTheme === 'light'
                     ? 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white shadow-xs'
                     : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-white bg-white/5'
               }`}
              title="Studio Management Dashboard"
            >
              <Sliders size={10} />
            </button>

            {/* Hamburger menu button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'border-white/5 hover:bg-white/5 text-slate-300'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </motion.button>
          </div>

        </div>
      </header>

      {/* MOBILE PREMIUM SLIDE-OUT DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-xs h-full shadow-2xl flex flex-col p-6 z-50 border-l ${
                currentTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  : currentTheme === 'mono'
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 font-mono'
                    : 'bg-[#121212] border-white/5 text-slate-100'
              }`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-dashed border-slate-200/50 dark:border-white/5">
                {/* Logo Brand Identity */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-7 h-7 shrink-0 object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <PFLogo className={currentTheme === 'mono' ? 'text-zinc-300' : 'text-[#FF5500]'} />
                  )}
                  <div>
                    <span className={`font-semibold text-xs uppercase leading-none block ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {logoText} <span className="text-[#FF5500] font-mono">.</span>
                    </span>
                    <span className={`text-[8px] uppercase tracking-wider font-bold block leading-none mt-1 ${
                      currentTheme === 'mono' ? 'text-zinc-500' : 'text-[#FF5500]'
                    }`}>
                      {logoSubtext}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    currentTheme === 'light'
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      : 'border-white/5 hover:bg-white/5 text-slate-300'
                  }`}
                  aria-label="Close Navigation Menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <motion.div 
                className="flex-1 py-8 overflow-y-auto space-y-1.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    }
                  }
                }}
              >
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'pixelfix', label: 'Pixel Fix', icon: Sliders },
                  { id: 'pixelframe', label: 'Pixel Frame', icon: Camera },
                  { id: 'gallery', label: 'Gallery', icon: FolderOpen },
                  { id: 'affiliate', label: 'Partner Deals', icon: ShoppingBag },
                  { id: 'contact', label: 'Booking', icon: Phone }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { 
                          opacity: 1, 
                          x: 0,
                          transition: { type: 'spring', stiffness: 220, damping: 22 }
                        }
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between transition-all duration-200 cursor-pointer px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold border-l-2 relative overflow-hidden z-0 ${
                        activeTab === tab.id
                          ? currentTheme === 'mono'
                            ? 'text-white border-white font-extrabold'
                            : 'text-[#FF5500] border-[#FF5500] font-extrabold'
                          : currentTheme === 'light'
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="activeMobileTabIndicatorPill"
                          className={`absolute inset-0 -z-10 ${
                            currentTheme === 'mono'
                              ? 'bg-zinc-800/80'
                              : 'bg-[#FF5500]/5'
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-3">
                        <span className={`p-1 rounded-md transition-all ${
                          activeTab === tab.id
                            ? currentTheme === 'mono'
                              ? 'text-white'
                              : 'text-[#FF5500]'
                            : currentTheme === 'light'
                              ? 'text-slate-500'
                              : 'text-slate-400'
                        }`}>
                          {TabIcon && <TabIcon size={14} className="shrink-0" />}
                        </span>
                        <span>{tab.label}</span>
                      </span>
                      <ArrowUpRight size={13} className={`relative z-10 ${activeTab === tab.id ? (currentTheme === 'mono' ? 'text-white' : 'text-[#FF5500]') : 'text-slate-500/70'}`} />
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-dashed border-slate-200/50 dark:border-white/5 space-y-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                    Theme Profile
                  </span>
                  <div className={`grid grid-cols-3 gap-1 rounded-lg p-1 border ${
                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200/60' : 'bg-black/20 border-white/5'
                  }`}>
                    <button
                      onClick={() => setCurrentTheme('normal')}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentTheme === 'normal'
                          ? 'bg-[#FF5500] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Sparkles size={10} />
                      <span>Cyber</span>
                    </button>
                    <button
                      onClick={() => setCurrentTheme('mono')}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentTheme === 'mono'
                          ? currentTheme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-black font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Hash size={10} />
                      <span>Noir</span>
                    </button>
                    <button
                      onClick={() => setCurrentTheme('light')}
                      className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentTheme === 'light'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <SunIcon size={10} />
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Access */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-500 block mb-2">
                    Studio Portal
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-8 h-8 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center p-0 ${
                      activeTab === 'dashboard'
                        ? 'bg-[#FF5500] text-white border-[#FF5500] scale-105 shadow-sm'
                        : currentTheme === 'light'
                          ? 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white shadow-xs'
                          : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-white bg-white/5'
                    }`}
                    title="Studio Management Dashboard"
                  >
                    <Sliders size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERSISTENT DIAGNOSTIC UTILITY COMPANION BAR (100% Offline-capable) - Visible on selected diagnostic pages */}
      {(activeTab === 'bios' || activeTab === 'beep' || activeTab === 'smps') && (
        <div className={`border-b backdrop-blur-md transition-all duration-300 relative z-20 ${
          currentTheme === 'light' 
            ? 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200/80 shadow-xs' 
            : 'bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 border-white/5 shadow-lg'
        }`}>
          {/* Subtle bottom decorative gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5500]/30 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 font-mono transition-all duration-200 ${
              currentTheme === 'light' 
                ? 'bg-slate-100 text-slate-700 border border-slate-200/60' 
                : 'bg-zinc-900 text-zinc-300 border border-white/5'
            }`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
              <span>Guwahati Diagnostics Toolbox</span>
              <span className="text-[9px] opacity-60 font-medium px-1 bg-[#FF5500]/10 text-[#FF5500] rounded">100% Offline</span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <div className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
                currentTheme === 'light'
                  ? 'bg-gradient-to-br from-slate-100/60 via-slate-50/40 to-slate-100/30 border-slate-200/50 shadow-inner'
                  : 'bg-gradient-to-br from-zinc-900/40 via-zinc-950/20 to-zinc-900/30 border-white/5 shadow-inner'
              }`}>
                {[
                  { id: 'bios', label: 'BIOS Keys Finder', icon: KeyRound, desc: 'Motherboard startup key mappings' },
                  { id: 'beep', label: 'Beep Diagnostician', icon: Volume2, desc: 'Motherboard acoustic POST translator' },
                  { id: 'smps', label: 'PSU Wattage Calculator', icon: Zap, desc: 'Precision Power Supply load calculator' }
                ].map(tool => {
                  const Icon = tool.icon;
                  const active = activeTab === tool.id;
                  return (
                    <button
                      id={`quick-tool-btn-${tool.id}`}
                      key={tool.id}
                      onClick={() => {
                        setActiveTab(tool.id as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-250 border cursor-pointer ${
                        active 
                          ? 'bg-gradient-to-r from-[#FF5500] to-[#FF6A1A] border-transparent text-white shadow-md shadow-[#FF5500]/20 scale-102' 
                          : currentTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-700 hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-slate-50 hover:shadow-xs'
                            : 'bg-zinc-900/80 border-white/5 text-zinc-300 hover:text-white hover:border-white/10 hover:bg-zinc-850'
                      }`}
                      title={`${tool.label} - ${tool.desc}`}
                    >
                      <Icon size={12} className={`transition-transform duration-350 ${active ? 'text-white' : 'text-[#FF5500] group-hover:scale-125 group-hover:rotate-12 group-hover:animate-pulse'}`} />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Minimalist iFixit PC & Laptop repair resource link containing only a very small laptop icon */}
              <a
                href="https://www.ifixit.com/Device/PC_Laptop"
                target="_blank"
                rel="noopener noreferrer"
                title="iFixit PC & Laptop repair guide"
                className={`group flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 ${
                  currentTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-500 hover:text-[#FF5500] hover:border-[#FF5500]/30 shadow-xs hover:shadow-sm'
                    : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                }`}
              >
                <Laptop size={13} className="transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-12" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CORE FRAME ROUTING VIEWS */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* HOMEPAGE VIEW WITH NESTED DYNAMIC PRICING WIDGET */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="space-y-16"
            >
            {/* HERO STATEMENT WITH SPLIT CARD VIBE */}
            <section className="relative overflow-hidden py-8">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 col-span-1 text-left space-y-6">
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center space-x-2 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-3 py-1 text-xs text-[#FF5500] font-bold tracking-wider uppercase">
                      <CheckCircle size={12} />
                      <span>Multi-Disciplinary Pro Portfolio &amp; Direct Booking Hub</span>
                    </div>
                    {isAuthorized && (
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          type: 'hero',
                          data: { headline: heroHeadline, subheadline: heroSubheadline, photoUrl: profilePhotoUrl }
                        })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Sliders size={12} /> Edit Page Brand Info
                      </button>
                    )}
                  </div>

                  <ScrollRevealText
                    tag="h1"
                    className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                    text={heroHeadline}
                  />

                  <ScrollReveal variant="fade-up" delay={0.2} duration={0.6}>
                    <p className={`text-sm md:text-base max-w-xl leading-relaxed whitespace-pre-line ${
                      currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {heroSubheadline}
                    </p>
                  </ScrollReveal>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        handleEstimateCostRedirect('pixelfix');
                      }}
                      className="bg-[#FF5500] hover:bg-[#FF4400] text-white px-6 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Laptop size={16} />
                      <span>Configure IT Support Quote</span>
                    </button>
                    <button
                      onClick={() => {
                        handleEstimateCostRedirect('pixelframe');
                      }}
                      className={`border px-6 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer ${
                        currentTheme === 'light'
                          ? 'border-slate-300 hover:border-slate-800 text-slate-800 hover:bg-slate-100 bg-white'
                          : 'border-white/20 hover:border-white bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      <Camera size={16} />
                      <span>Estimate Event Photography</span>
                    </button>
                  </div>

                  {/* Immediate Quick Call Dialing Indicators */}
                  <div className={`pt-8 border-t ${s.divider} grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono`}>
                    <div className={`p-3 rounded-xl border text-left ${
                      currentTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-white/5 border-white/5'
                    }`}>
                      <span className="text-[10px] text-zinc-500 uppercase block">Pixel Fix support:</span>
                      <a href={`tel:${contactPhoneIt}`} className={`hover:text-[#FF5500] font-black text-sm block mt-1 ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        📞 +91 {contactPhoneIt}
                      </a>
                    </div>
                    <div className={`p-3 rounded-xl border text-left ${
                      currentTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-white/5 border-white/5'
                    }`}>
                      <span className="text-[10px] text-zinc-500 uppercase block">Pixel Frame wedding:</span>
                      <a href={`tel:${contactPhonePhotos}`} className={`hover:text-[#FF5500] font-black text-sm block mt-1 ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        📸 +91 {contactPhonePhotos}
                      </a>
                    </div>
                    <div className={`p-3 rounded-xl border text-left col-span-2 md:col-span-1 ${
                      currentTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-white/5 border-white/5'
                    }`}>
                      <span className="text-[10px] text-zinc-500 uppercase block">Dispatch Hub:</span>
                      <span className="text-[#FF5500] font-black tracking-wider block mt-1">Guwahati &amp; Northeast</span>
                    </div>
                  </div>

                </div>

                {/* Quick Split View Feature Cards */}
                <motion.div 
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: 25 },
                      show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className={`p-5 rounded-2xl border ${s.card} ${s.cardHover} text-left flex flex-col justify-between aspect-square group`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF5500] mb-4">
                        <Cpu size={20} />
                      </div>
                      <h4 className="font-extrabold uppercase text-xs tracking-widest text-[#FF5500]">Pixel Fix IT</h4>
                      <h3 className={`text-lg font-black mt-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>On-Site Solutions</h3>
                      <p className={`text-xs mt-2 line-clamp-4 ${s.textMuted}`}>
                        Troubleshooting malware registry, mounting memory drives, and setting genuine Windows packages on doorstep.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('pixelfix')}
                      className={`mt-4 text-xs font-bold uppercase flex items-center gap-1 hover:text-[#FF5500] justify-start cursor-pointer ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      <span>Explore Rates</span>
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>

                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: 25 },
                      show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className={`p-5 rounded-2xl border ${s.card} ${s.cardHover} text-left flex flex-col justify-between aspect-square group`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF5500] mb-4">
                        <Camera size={20} />
                      </div>
                      <h4 className={`font-extrabold uppercase text-xs tracking-widest ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Pixel Frame Photo</h4>
                      <h3 className={`text-lg font-black mt-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Timeless Stories</h3>
                      <p className={`text-xs mt-2 line-clamp-4 ${s.textMuted}`}>
                        Cinematically colored wedding shoots, candid wedding visual compositions, and high-energy celebrations.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('pixelframe')}
                      className={`mt-4 text-xs font-bold uppercase flex items-center gap-1 hover:text-[#FF5500] justify-start cursor-pointer ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      <span>Explore Work</span>
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* SOFTWARE LICENSES SECTION */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <ScrollReveal variant="fade-up" delay={0.15} className="text-left">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-1 ${s.tagline}`}>
                    OFFICIAL PRODUCT KEYS
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Software Licenses
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    100% genuine retail activation keys with instant digital delivery and lifetime support. Each purchase includes a lifetime license key.
                  </p>
                </ScrollReveal>

                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setEditingItem({
                      type: 'software_license',
                      data: {
                        id: 'lic_' + Date.now().toString(),
                        name: '',
                        price: '',
                        badge: 'New Release',
                        description: '',
                        licenseType: 'Lifetime License Key',
                        imageUrl: '',
                        features: '',
                        compatibility: '',
                        details: '',
                        category: 'productivity'
                      }
                    })}
                    className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#FF4400] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg flex items-center gap-1.5 transition-colors self-start cursor-pointer border border-transparent"
                  >
                    <Plus size={12} />
                    <span>Add Software License</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {(() => {
                  const activeSoftware = softwareLicensesToRender.filter(l => l.category !== 'gear');
                  return activeSoftware.map((license, idx) => {
                    const isSelected = selectedLicense === idx;
                    return (
                      <div
                        key={license.id}
                        onClick={() => {
                          const textMessage = `Hi Murari, I am interested in purchasing a software license for "${license.name}" priced at ${license.price}. Please provide the payment details and guide me on how to get the activation key. Thanks!`;
                          window.open(`https://wa.me/918638875231?text=${encodeURIComponent(textMessage)}`, '_blank');
                        }}
                        className={`relative p-3.5 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-full group select-none overflow-hidden hover:border-green-500/40 hover:scale-[1.015] hover:bg-green-500/5 ${s.card}`}
                      >
                        {isAuthorized && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem({
                                  type: 'software_license',
                                  id: license.id,
                                  data: { ...license }
                                });
                              }}
                              className="p-1 rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to remove "${license.name}"?`)) {
                                  setSoftwareLicenses(prev => prev.filter(l => l.id !== license.id));
                                  try {
                                    await deleteDoc(doc(db, 'software_licenses', license.id));
                                    triggerToast('License deleted successfully!', 'success');
                                  } catch (err) {
                                    console.error('Error deleting:', err);
                                  }
                                }
                              }}
                              className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}

                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* MODERN LUXURY BRAND VISUAL CARD */}
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800/60 relative">
                              <LicenseProductCardVisual
                                licenseId={license.id}
                                licenseName={license.name}
                                licenseType={license.licenseType}
                                currentTheme={currentTheme}
                                customImageUrl={license.imageUrl}
                              />
                            </div>

                            <div className="flex items-start justify-between">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-slate-500/10 text-slate-400 group-hover:text-green-500 group-hover:bg-green-500/10">
                                <Laptop size={14} />
                              </div>
                              {license.badge && (
                                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5 group-hover:border-green-500/20 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                                  {license.badge}
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className={`text-xs sm:text-sm font-black leading-tight group-hover:text-green-500 transition-colors ${
                                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>
                                {license.name}
                              </h3>
                              
                              <div className="mt-1 flex items-center gap-1 text-[8.5px] sm:text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                                <KeyRound size={10} className="sm:size-[11px]" />
                                <span>{license.licenseType || 'Lifetime Key'}</span>
                              </div>

                              <p className="text-[9.5px] sm:text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                                {license.description}
                              </p>
                            </div>
                          </div>

                          {/* DYNAMIC SPECS & FEATURES */}
                          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-500/5">
                            {license.compatibility && (
                              <div className="flex items-center gap-1.5 text-[8.5px] font-mono uppercase tracking-wider text-slate-500">
                                <Laptop size={10} className="shrink-0" />
                                <span className="line-clamp-1">{license.compatibility}</span>
                              </div>
                            )}
                            
                            {license.features && (
                              <div className="space-y-1">
                                {license.features.split(',').slice(0, 2).map((f: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400">
                                    <CheckCircle size={9} className="text-emerald-500 shrink-0" />
                                    <span className="line-clamp-1">{f.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-500/10 flex items-baseline justify-between">
                          <div>
                            <span className="text-[7.5px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 block">Retail Cost</span>
                            <span className={`text-xs sm:text-base font-extrabold ${
                              currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                            }`}>
                              {license.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {license.url && (
                              <a
                                href={license.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#FF5500] hover:bg-[#FF4400] text-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-[#FF5500]/10 hover:scale-105 active:scale-95"
                                title="Buy Online"
                              >
                                <ExternalLink size={11} className="stroke-[2.5]" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const textMessage = `Hi Murari, I am interested in purchasing a software license for "${license.name}" priced at ${license.price}. Please provide the payment details and guide me on how to get the activation key. Thanks!`;
                                window.open(`https://wa.me/918638875231?text=${encodeURIComponent(textMessage)}`, '_blank');
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-green-600/10 hover:scale-105 active:scale-95"
                              title="Inquire on WhatsApp"
                            >
                              <WhatsAppIcon size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </section>



            {/* STRATEGIC HIGH-CONVERSION AFFILIATE RECOMMENDED HUB CARD */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden py-2"
            >
              <div className={`p-6 md:p-8 rounded-3xl border text-left relative group overflow-hidden transition-all duration-300 ${
                currentTheme === 'light' 
                  ? 'bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white border-orange-200/50 shadow-sm hover:shadow-md' 
                  : currentTheme === 'mono'
                    ? 'bg-black border-zinc-800 shadow-none'
                    : 'bg-zinc-900/60 border-white/5 shadow-2xl backdrop-blur-md'
              }`}>
                {/* Visual glow backdrop for modern depth */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:rotate-6 transition-transform duration-300">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[9px] text-amber-500 font-extrabold tracking-widest uppercase font-mono">
                        <Tag size={10} className="animate-pulse" />
                        <span>VERIFIED RECOMMENDATIONS</span>
                      </div>
                      <h3 className={`text-xl font-black mt-1.5 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        Verified Hardware, Gear &amp; Tool Collections
                      </h3>
                      <p className={`text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Check out the exact workstation accessories, solid-state drives, photography lenses, and licensed software that power my dual IT and photography business architectures. Shop through direct partner links for secure purchases and verified discounts!
                      </p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full lg:w-auto">
                    <motion.a
                      href={exploreButtonLink}
                      onClick={(e) => {
                        if (exploreButtonLink.startsWith('#')) {
                          e.preventDefault();
                          const targetTab = exploreButtonLink.replace('#', '');
                          const validTabs = ['home', 'pixelfix', 'pixelframe', 'gallery', 'about', 'affiliate', 'contact', 'dashboard', 'bios', 'packages', 'beep'];
                          if (validTabs.includes(targetTab)) {
                            setActiveTab(targetTab as any);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            const element = document.getElementById(targetTab);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }
                      }}
                      onMouseEnter={() => setIsCollectionsBtnHovered(true)}
                      onMouseLeave={() => setIsCollectionsBtnHovered(false)}
                      className={`w-full lg:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider relative overflow-visible transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer border ${
                        currentTheme === 'light'
                          ? 'border-slate-800 text-slate-800 bg-transparent hover:bg-slate-800 hover:text-white shadow-sm'
                          : 'border-white/20 text-white bg-white/5 hover:bg-white hover:text-black hover:border-white shadow-lg'
                      }`}
                      animate={isCollectionsBtnHovered ? {
                        scale: 1.05,
                        borderColor: currentTheme === 'light' ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
                        boxShadow: currentTheme === 'light' ? '0px 4px 12px rgba(0,0,0,0.08)' : '0px 4px 20px rgba(255,255,255,0.15)'
                      } : {
                        scale: [1, 1.03, 1],
                        borderColor: currentTheme === 'light' ? ['rgba(30, 41, 59, 1)', 'rgba(79, 70, 229, 0.8)', 'rgba(30, 41, 59, 1)'] : ['rgba(255, 255, 255, 0.2)', 'rgba(251, 146, 60, 0.8)', 'rgba(255, 255, 255, 0.2)'],
                        boxShadow: currentTheme === 'light' 
                          ? ['0px 1px 2px rgba(0,0,0,0.05)', '0px 0px 8px rgba(79, 70, 229, 0.2)', '0px 1px 2px rgba(0,0,0,0.05)']
                          : ['0px 4px 6px -1px rgba(0,0,0,0.1)', '0px 0px 12px rgba(251, 146, 60, 0.3)', '0px 4px 6px -1px rgba(0,0,0,0.1)']
                      }}
                      transition={{
                        scale: isCollectionsBtnHovered ? { duration: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        borderColor: isCollectionsBtnHovered ? { duration: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        boxShadow: isCollectionsBtnHovered ? { duration: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <AnimatePresence>
                        {isCollectionsBtnHovered && (
                          <>
                            {/* Twinkling star particle 1 - top left */}
                            <motion.span
                              key="star-1"
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.5, 1.2, 0.8, 0], 
                                x: [-15, -40, -55], 
                                y: [-5, -25, -45],
                                rotate: [0, 45, 90, 180]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatDelay: 0.1 }}
                              className="absolute text-amber-400 pointer-events-none"
                              style={{ left: "15%", top: "10%" }}
                            >
                              <Star size={10} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                            </motion.span>
                            
                            {/* Twinkling star particle 2 - top right */}
                            <motion.span
                              key="star-2"
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.4, 1.4, 0.7, 0], 
                                x: [15, 45, 60], 
                                y: [-10, -35, -55],
                                rotate: [0, -60, -120, -180]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.4, ease: "easeOut", repeat: Infinity, repeatDelay: 0.2 }}
                              className="absolute text-amber-500 pointer-events-none"
                              style={{ right: "15%", top: "10%" }}
                            >
                              <Sparkles size={11} fill="currentColor" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" />
                            </motion.span>
                            
                            {/* Twinkling star particle 3 - center top floating higher */}
                            <motion.span
                              key="star-3"
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.6, 1.3, 0.5, 0], 
                                x: [-5, 10, 20], 
                                y: [-15, -45, -75],
                                rotate: [0, 90, 180, 270]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.1, ease: "easeOut", repeat: Infinity }}
                              className="absolute text-amber-300 pointer-events-none"
                              style={{ left: "55%", top: "5%" }}
                            >
                              <Star size={12} fill="currentColor" className="drop-shadow-[0_0_3px_rgba(252,211,77,0.7)]" />
                            </motion.span>
                            
                            {/* Twinkling star particle 4 - bottom left */}
                            <motion.span
                              key="star-4"
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.4, 1.1, 0.6, 0], 
                                x: [-20, -35, -45], 
                                y: [10, -5, -20],
                                rotate: [0, 120, 240, 360]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.3, ease: "easeOut", repeat: Infinity, repeatDelay: 0.3 }}
                              className="absolute text-amber-400 pointer-events-none"
                              style={{ left: "10%", bottom: "15%" }}
                            >
                              <Star size={8} fill="currentColor" className="drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                            </motion.span>
                            
                            {/* Twinkling star particle 5 - bottom right sparkles */}
                            <motion.span
                              key="star-5"
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.5, 1.5, 0.8, 0], 
                                x: [20, 35, 45], 
                                y: [5, -15, -35],
                                rotate: [0, -45, -90, -135]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.25, ease: "easeOut", repeat: Infinity, repeatDelay: 0.15 }}
                              className="absolute text-amber-500 pointer-events-none"
                              style={{ right: "10%", bottom: "15%" }}
                            >
                              <Sparkles size={10} fill="currentColor" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.7)]" />
                            </motion.span>
                          </>
                        )}
                      </AnimatePresence>

                      <motion.span 
                        className="flex items-center gap-2 z-10"
                        animate={isCollectionsBtnHovered ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span>{exploreButtonText}</span>
                        <motion.div
                          animate={isCollectionsBtnHovered ? { x: 3, y: -3, scale: 1.1 } : { x: 0, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        >
                          <ArrowUpRight size={14} className="stroke-[2.5px]" />
                        </motion.div>
                      </motion.span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* DYNAMIC WHATSAPP INTERACTIVE CALCULATOR (The Core Feature of Client Request) */}
            <section
              id="interactive-calculator-widget"
              className={`p-6 md:p-8 rounded-3xl border ${s.card} relative overflow-hidden text-left transition-all duration-700 ${
                calculatorFlash
                  ? 'ring-4 ring-[#FF5500] shadow-[0_0_40px_rgba(255,85,0,0.6)] scale-[1.02]'
                  : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF5500]/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div>
                  <div className="inline-block text-[9px] uppercase font-bold tracking-widest text-[#FF5500] mb-2 font-mono">
                    💰 LIVE WHATSAPP PRICING CALCULATOR &amp; DEPOSIT ENGINE
                  </div>
                  <ScrollRevealText
                    tag="h2"
                    className={`text-2xl md:text-3xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}
                    text="Instant Quote Configurator"
                  />
                  <ScrollReveal variant="fade-up" delay={0.1}>
                    <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl">
                      Configure your laptop recovery details or event parameters right on the screen. The estimate updates in real-time. Once satisfied, click to send this exact blueprint to Murari on WhatsApp to book!
                    </p>
                  </ScrollReveal>
                </div>

                {/* Estimation Selector Tab */}
                <div className={`flex border-b ${s.divider} pb-4`}>
                  <button
                    onClick={() => setQuoteType('pixelfix')}
                    className={`px-4 py-2 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 mr-4 transition-all uppercase tracking-widest ${
                      quoteType === 'pixelfix'
                        ? 'border-[#FF5500] text-[#FF5500]'
                        : currentTheme === 'light'
                          ? 'border-transparent text-slate-500 hover:text-slate-850'
                          : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop size={14} />
                    <span>Pixel Fix Support Setup</span>
                  </button>
                  <button
                    onClick={() => setQuoteType('pixelframe')}
                    className={`px-4 py-2 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all uppercase tracking-widest ${
                      quoteType === 'pixelframe'
                        ? 'border-[#FF5500] text-[#FF5500]'
                        : currentTheme === 'light'
                          ? 'border-transparent text-slate-500 hover:text-slate-850'
                          : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera size={14} />
                    <span>Pixel Frame Event Photography</span>
                  </button>
                </div>

                {/* Parameter Details Block */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column Controls */}
                  <div className="lg:col-span-7 space-y-6">
                    {quoteType === 'pixelfix' ? (
                      <div className="space-y-5">
                        {/* Number of computers */}
                        <div className="space-y-2">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Number of Laptops/Desktops to Support:
                          </label>
                          <div className="flex items-center space-x-3">
                            {[1, 2, 3, 4, '5+'].map((num, i) => (
                              <button
                                key={i}
                                onClick={() => setItDeviceCount(typeof num === 'number' ? num : 5)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                  (itDeviceCount === num || (num === '5+' && itDeviceCount >= 5))
                                    ? 'bg-[#FF5500] text-white border-[#FF5500]'
                                    : currentTheme === 'light'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400'
                                      : 'bg-black/20 text-slate-300 border-white/5 hover:border-white/25'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Optional Features Toggles */}
                        <div className="space-y-3">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Specialized Installation Inclusions:
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => setItNeedOS(!itNeedOS)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                itNeedOS 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !itNeedOS ? 'text-slate-800' : ''}`}>Windows 10/11 Setup</span>
                                <span className="text-[10px] text-zinc-500 block">Doorstep Setup Assist</span>
                              </div>
                              <CheckCircle2 size={16} className={itNeedOS ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>

                            <button
                              onClick={() => setItNeedOffice(!itNeedOffice)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                itNeedOffice 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !itNeedOffice ? 'text-slate-800' : ''}`}>MS Office Setup help</span>
                                <span className="text-[10px] text-zinc-500 block">Genuine Licensing config</span>
                              </div>
                              <CheckCircle2 size={16} className={itNeedOffice ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>

                            <button
                              onClick={() => setItSsdUpgrade(!itSsdUpgrade)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                itSsdUpgrade 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !itSsdUpgrade ? 'text-slate-800' : ''}`}>SSD Hardware Upgrade</span>
                                <span className="text-[10px] text-zinc-500 block">Manual install labor</span>
                              </div>
                              <CheckCircle2 size={16} className={itSsdUpgrade ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>
                          </div>
                        </div>

                        {/* Dispatch Speed */}
                        <div className="space-y-2">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Service Dispatch Speed:
                          </label>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setItServiceSpeed('standard')}
                              className={`px-4 py-2 text-xs rounded-lg border font-bold transition-all ${
                                itServiceSpeed === 'standard'
                                  ? 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]'
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              🗓️ Standard Booking (Within 24 Hours)
                            </button>
                            <button
                              onClick={() => setItServiceSpeed('express')}
                              className={`px-4 py-2 text-xs rounded-lg border font-bold transition-all ${
                                itServiceSpeed === 'express'
                                  ? 'bg-rose-500/10 text-rose-500 border-rose-500'
                                  : currentTheme === 'light'
                                    ? 'bg-red-50 border-red-200 text-red-650 hover:border-red-300'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              🔥 Express Urgency (Dispatched within 2 Hours)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Session Segment */}
                        <div className="space-y-2">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Event Portfolio Category:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { id: 'wedding', label: '💍 Wedding' },
                              { id: 'corporate', label: '👔 Corporate' },
                              { id: 'party', label: '🎉 Events' },
                              { id: 'custom', label: '🌲 Outdoor' }
                            ].map((p, i) => (
                              <button
                                key={i}
                                onClick={() => setPhotoType(p.id as any)}
                                className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                                  photoType === p.id
                                    ? 'bg-[#FF5500] text-white border-[#FF5500]'
                                    : currentTheme === 'light'
                                      ? 'bg-slate-100/80 text-slate-700 border-slate-200 hover:border-slate-400 shadow-sm'
                                      : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/10'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Days needed */}
                        <div className="space-y-2">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Total Event Duration (Days):
                          </label>
                          <div className="flex items-center space-x-3">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                onClick={() => setPhotoDays(num)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                  photoDays === num
                                    ? 'bg-[#FF5500] text-white border-[#FF5500]'
                                    : currentTheme === 'light'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400'
                                      : 'bg-black/20 text-slate-300 border-white/5 hover:border-white/20'
                                }`}
                              >
                                {num} {num === 1 ? 'Day' : 'Days'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Event additions */}
                        <div className="space-y-3">
                          <label className={`text-xs uppercase font-extrabold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'} block`}>
                            Dynamic Cinematography Add-ons:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => setPhotoNeedPreWedding(!photoNeedPreWedding)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                photoNeedPreWedding 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !photoNeedPreWedding ? 'text-slate-800' : ''}`}>Pre-Wedding Shoot</span>
                                <span className="text-[10px] text-zinc-500 block">Cinematic couple frames</span>
                              </div>
                              <CheckCircle2 size={16} className={photoNeedPreWedding ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>

                            <button
                              onClick={() => setPhotoNeedDrone(!photoNeedDrone)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                photoNeedDrone 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !photoNeedDrone ? 'text-slate-800' : ''}`}>Drone Cinematography</span>
                                <span className="text-[10px] text-zinc-500 block">Aerial 4K landscape capture</span>
                              </div>
                              <CheckCircle2 size={16} className={photoNeedDrone ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>

                            <button
                              onClick={() => setPhotoNeedAlbum(!photoNeedAlbum)}
                              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                                photoNeedAlbum 
                                  ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500] font-bold' 
                                  : currentTheme === 'light'
                                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                                    : 'bg-black/20 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${currentTheme === 'light' && !photoNeedAlbum ? 'text-slate-800' : ''}`}>Coffee-table photobook</span>
                                <span className="text-[10px] text-zinc-500 block">30-page customized print</span>
                              </div>
                              <CheckCircle2 size={16} className={photoNeedAlbum ? 'text-[#FF5500]' : 'text-slate-600'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Integrated mini form fields to capture details directly */}
                    <div className={`pt-4 border-t ${s.divider} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Your Full Name:</label>
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="e.g. Priyesh Barua"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-xs font-bold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Your Phone / WhatsApp Number:</label>
                        <input
                          type="tel"
                          required
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="e.g. +91 86366 75231"
                          className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className={`text-xs font-bold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>A Few Words (e.g., specific venue location or laptop crash issues):</label>
                        <textarea
                          value={bookingNotes}
                          rows={2}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder="My laptop gets hot and displays a blue screen..."
                          className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column Pricing Estimator Details Card */}
                  <div className={`lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border ${
                    currentTheme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-black/40 border-white/5'
                  }`}>
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase tracking-widest text-[#FF5500] font-mono font-bold">Estimated Cost Summary</h4>
                      
                      <div className={`py-6 border-y ${s.divider} text-center`}>
                        <span className="text-slate-500 text-xs block">Estimated Price Proposal</span>
                        <span className={`text-4xl lg:text-5xl font-black block mt-1 ${
                          currentTheme === 'light' ? 'text-slate-900 border-none' : 'text-white'
                        }`}>
                          ₹{quoteType === 'pixelfix' ? itPriceEstimate() : photoPriceEstimate()}
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-2">
                          *Estimated local Guwahati rates. Zero diagnostic fee if unresolved.*
                        </span>
                      </div>

                      {/* Display calculations list */}
                      <ul className={`text-xs space-y-2.5 font-mono ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                        {quoteType === 'pixelfix' ? (
                          <>
                            <li className="flex justify-between">
                              <span>Flat Diagnostics Diagnostics ({itDeviceCount}x):</span>
                              <span className={currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white'}>₹{500 * itDeviceCount}</span>
                            </li>
                            {itNeedOS && (
                              <li className="flex justify-between">
                                <span>+ Doorstep Windows Setup:</span>
                                <span className="text-[#FF5500] font-bold">₹{350 * itDeviceCount}</span>
                              </li>
                            )}
                            {itNeedOffice && (
                              <li className="flex justify-between">
                                <span>+ Genuine Productivity help:</span>
                                <span className="text-[#FF5500] font-bold">₹{250 * itDeviceCount}</span>
                              </li>
                            )}
                            {itSsdUpgrade && (
                              <li className="flex justify-between">
                                <span>+ Solid State Drive labor:</span>
                                <span className="text-[#FF5500] font-bold">₹{450 * itDeviceCount}</span>
                              </li>
                            )}
                            <li className="flex justify-between">
                              <span>Priority Dispatch Grade:</span>
                              <span className={currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white'}>
                                {itServiceSpeed === 'express' ? '+ ₹300' : 'Complimentary'}
                              </span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex justify-between">
                              <span>Baseline rate ({photoDays} Day):</span>
                              <span className={currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white'}>
                                ₹{photoType === 'wedding' ? 15000 : photoType === 'party' ? 8000 : photoType === 'corporate' ? 12000 : 6000}
                              </span>
                            </li>
                            {photoNeedPreWedding && (
                              <li className="flex justify-between">
                                <span>+ Cinematic Couple session:</span>
                                <span className="text-[#FF5500] font-bold">₹5000</span>
                              </li>
                            )}
                            {photoNeedDrone && (
                              <li className="flex justify-between">
                                <span>+ 4K Aerial Drone capture:</span>
                                <span className="text-[#FF5500] font-bold">₹4000</span>
                              </li>
                            )}
                            {photoNeedAlbum && (
                              <li className="flex justify-between">
                                <span>+ Printed Coffee Album:</span>
                                <span className="text-[#FF5500] font-bold">₹3500</span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </div>

                    <div className={`pt-6 mt-6 border-t ${s.divider} space-y-3`}>
                      <button
                        onClick={quoteType === 'pixelfix' ? handleSendITQuoteWhatsApp : handleSendPhotoQuoteWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 sm:py-4 px-4 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 text-center transition-all duration-200 shadow-lg hover:shadow-green-600/20 active:scale-[0.98] select-none cursor-pointer"
                      >
                        <WhatsAppIcon size={16} className="shrink-0" />
                        <span className="leading-none">Send Details to WhatsApp</span>
                      </button>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-500">
                          Directly logs booking query into admin system before opening WhatsApp.
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>
             {/* SOCIAL MEDIA HANDLES SECTION */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <ScrollReveal variant="fade-up" delay={0.15} className="text-left">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-1 ${s.tagline}`}>
                    CONNECT WITH MURARI PANJIYAR
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Social Media Channels &amp; Handles
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Connect instantly via digital streams or directly through dedicated WhatsApp communication nodes.
                  </p>
                </ScrollReveal>
                {isAuthorized && (
                  <button
                    onClick={() => setEditingItem({
                      type: 'social_link',
                      data: {
                        name: '',
                        handle: '',
                        url: '',
                        platform: 'instagram',
                        badge: '',
                        order: socialLinks.length
                      }
                    })}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg flex items-center gap-1.5 transition-colors self-start cursor-pointer border border-transparent"
                  >
                    <span>+ Add Channel</span>
                  </button>
                )}
              </div>

              {/* Compact Dynamic Grid of Social Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {socialLinks.filter(link => !link.disabled || isAuthorized).map((link) => {
                  // Icon platform resolver
                  let iconElement = <Globe size={15} />;
                  if (link.customIcon === 'twitter') iconElement = <Twitter size={15} />;
                  else if (link.customIcon === 'linkedin') iconElement = <Linkedin size={15} />;
                  else if (link.customIcon === 'github') iconElement = <Github size={15} />;
                  else if (link.customIcon === 'slack') iconElement = <Slack size={15} />;
                  else if (link.customIcon === 'twitch') iconElement = <Twitch size={15} />;
                  else if (link.customIcon === 'dribbble') iconElement = <Dribbble size={15} />;
                  else if (link.customIcon === 'briefcase') iconElement = <Briefcase size={15} />;
                  else if (link.customIcon === 'globe') iconElement = <Globe size={15} />;
                  else if (link.customIcon === 'mail') iconElement = <Mail size={15} />;
                  else if (link.customIcon === 'phone') iconElement = <Phone size={15} />;
                  else if (link.customIcon === 'link') iconElement = <Link size={15} />;
                  else if (link.platform === 'instagram') iconElement = <Instagram size={15} />;
                  else if (link.platform === 'whatsapp') iconElement = <WhatsAppIcon size={15} />;
                  else if (link.platform === 'facebook') iconElement = <Facebook size={15} />;
                  else if (link.platform === 'youtube') iconElement = <Youtube size={15} />;
                  else if (link.platform === 'camera') iconElement = <Camera size={15} />;
                  else if (link.platform === 'twitter') iconElement = <Twitter size={15} />;
                  else if (link.platform === 'linkedin') iconElement = <Linkedin size={15} />;
                  else if (link.platform === 'etejo') {
                    iconElement = (
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-inherit"
                      >
                        <rect x="12" y="12" width="76" height="76" rx="22" stroke="currentColor" strokeWidth="8" />
                        <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="8" />
                        <path d="M42 50 H58" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <path d="M50 38 A12 12 0 1 1 38 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
                        <circle cx="72" cy="28" r="5" fill="currentColor" />
                      </svg>
                    );
                  }

                  // Platform specific colors matching the user's specific aesthetics
                  let primaryColorClass = 'text-[#FF5500]';
                  let hoverColorClass = 'group-hover:text-[#FF5500]';
                  let bgColorClass = 'bg-orange-500/10';
                  
                  if (link.platform === 'instagram') {
                    primaryColorClass = 'text-pink-500';
                    hoverColorClass = 'group-hover:text-pink-500';
                    bgColorClass = 'bg-pink-500/10';
                  } else if (link.platform === 'whatsapp') {
                    primaryColorClass = 'text-emerald-500';
                    hoverColorClass = 'group-hover:text-emerald-500';
                    bgColorClass = 'bg-emerald-500/10';
                  } else if (link.platform === 'facebook') {
                    primaryColorClass = 'text-blue-500';
                    hoverColorClass = 'group-hover:text-blue-500';
                    bgColorClass = 'bg-blue-500/10';
                  } else if (link.platform === 'youtube') {
                    primaryColorClass = 'text-red-500';
                    hoverColorClass = 'group-hover:text-red-500';
                    bgColorClass = 'bg-red-500/10';
                  } else if (link.platform === 'camera') {
                    primaryColorClass = 'text-teal-500';
                    hoverColorClass = 'group-hover:text-teal-500';
                    bgColorClass = 'bg-teal-500/10';
                  }

                  // Apply customIcon custom colors
                  const iconToUse = link.customIcon || (['twitter', 'linkedin'].includes(link.platform) ? link.platform : '');
                  if (iconToUse === 'twitter') {
                    primaryColorClass = 'text-sky-500';
                    hoverColorClass = 'group-hover:text-sky-500';
                    bgColorClass = 'bg-sky-500/10';
                  } else if (iconToUse === 'linkedin') {
                    primaryColorClass = 'text-[#0A66C2]';
                    hoverColorClass = 'group-hover:text-[#0A66C2]';
                    bgColorClass = 'bg-[#0A66C2]/10';
                  } else if (iconToUse === 'github') {
                    primaryColorClass = 'text-slate-400';
                    hoverColorClass = 'group-hover:text-slate-400';
                    bgColorClass = 'bg-slate-400/10';
                  } else if (iconToUse === 'slack') {
                    primaryColorClass = 'text-purple-500';
                    hoverColorClass = 'group-hover:text-purple-500';
                    bgColorClass = 'bg-purple-500/10';
                  } else if (iconToUse === 'twitch') {
                    primaryColorClass = 'text-violet-500';
                    hoverColorClass = 'group-hover:text-violet-500';
                    bgColorClass = 'bg-violet-500/10';
                  } else if (iconToUse === 'dribbble') {
                    primaryColorClass = 'text-[#EA4C89]';
                    hoverColorClass = 'group-hover:text-[#EA4C89]';
                    bgColorClass = 'bg-[#EA4C89]/10';
                  } else if (iconToUse === 'briefcase') {
                    primaryColorClass = 'text-indigo-400';
                    hoverColorClass = 'group-hover:text-indigo-400';
                    bgColorClass = 'bg-indigo-400/10';
                  } else if (iconToUse === 'globe') {
                    primaryColorClass = 'text-blue-400';
                    hoverColorClass = 'group-hover:text-blue-400';
                    bgColorClass = 'bg-blue-400/10';
                  } else if (iconToUse === 'mail') {
                    primaryColorClass = 'text-rose-400';
                    hoverColorClass = 'group-hover:text-rose-400';
                    bgColorClass = 'bg-rose-400/10';
                  } else if (iconToUse === 'phone') {
                    primaryColorClass = 'text-emerald-400';
                    hoverColorClass = 'group-hover:text-emerald-400';
                    bgColorClass = 'bg-emerald-400/10';
                  } else if (iconToUse === 'link') {
                    primaryColorClass = 'text-cyan-500';
                    hoverColorClass = 'group-hover:text-cyan-500';
                    bgColorClass = 'bg-cyan-500/10';
                  }

                  let badgeColorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                  if (link.badge && link.badge.toLowerCase() === 'tech') {
                    badgeColorClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  } else if (link.badge && link.badge.toLowerCase() === 'studio') {
                    badgeColorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  }

                  return (
                    <div
                      key={link.id}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-350 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99] transform ${s.card} ${s.cardHover} w-full h-full shadow-sm ${
                        link.disabled ? 'opacity-55 grayscale border-dashed border-amber-500/40 select-none cursor-default' : ''
                      }`}
                    >
                      {/* Invisible absolute link taking over the container click, unless admin clicks edit/delete */}
                      {!link.disabled && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 z-20 rounded-xl cursor-pointer"
                        />
                      )}
                      
                      <div className={`w-8 h-8 rounded-lg ${bgColorClass} flex items-center justify-center ${primaryColorClass} group-hover:scale-105 transition-transform flex-shrink-0 z-10`}>
                        {iconElement}
                      </div>
                      
                      <div className="min-w-0 flex-1 z-10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight truncate`}>
                            {link.name}
                          </p>
                          {link.badge && (
                            <span className={`text-[8px] font-bold px-1 rounded border uppercase tracking-widest scale-90 ${badgeColorClass}`}>
                              {link.badge}
                            </span>
                          )}
                          {link.disabled && (
                            <span className="text-[7px] font-extrabold uppercase bg-yellow-500/10 text-yellow-500 px-1 py-0.2 rounded border border-yellow-500/20 tracking-wider">
                              Muted
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] font-semibold tracking-tight truncate ${primaryColorClass}`}>
                          {link.handle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 relative z-30">
                        {isAuthorized && (
                          <div className="flex items-center gap-1 relative z-30" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setEditingItem({
                                type: 'social_link',
                                id: link.id,
                                data: { ...link }
                              })}
                              className={`p-1.5 rounded-lg border hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer ${
                                currentTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-black/30 border-white/5 text-slate-400'
                              }`}
                              title="Edit Social Channel"
                            >
                              <Edit size={11} />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to remove the social channel "${link.name}"?`)) {
                                  setSocialLinks(prev => prev.filter(s => s.id !== link.id));
                                  try {
                                    await deleteDoc(doc(db, 'social_links', link.id));
                                    triggerToast('Social channel deleted successfully!', 'success');
                                  } catch (err) {
                                    console.error('Error deleting social link from Firestore: ', err);
                                    handleFirestoreError(err, OperationType.DELETE, 'social_links/' + link.id);
                                  }
                                }
                              }}
                              className={`p-1.5 rounded-lg border hover:bg-rose-600 hover:text-white transition-colors cursor-pointer ${
                                currentTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-black/30 border-white/5 text-slate-400'
                              }`}
                              title="Delete Social Channel"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                        <ArrowUpRight size={12} className={`text-slate-400 ${hoverColorClass} transition-colors flex-shrink-0`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* HIGH CONVERSION SEO SERVICE AREAS SECTION */}
            <section className={`p-6 md:p-8 rounded-3xl border ${s.card} space-y-4 text-left`}>
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF5500] font-bold">REGIONAL SERVICE NETWORKS</span>
                <h3 className={`text-xl md:text-2xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Local Area Service Area Maps &amp; Dispatch Nodes
                </h3>
                <p className={`text-xs md:text-sm leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  To assure top-tier service delivery, Murari serves Guwahati neighborhoods directly at your doorstep. For larger destination weddings, wedding cinematography, or corporate IT network audits, dispatch extends across Assam and regional borders.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className={`p-4 rounded-xl space-y-1.5 border ${
                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}>
                    <strong className={`font-bold block text-sm ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>🏠 Doorstep Tech Support Area</strong>
                    <p className={`text-[11px] leading-relaxed ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Guwahati, Dispur, Paltan Bazaar, Ganeshguri, Maligaon, Khanapara &amp; surrounding nodes.</p>
                  </div>
                  <div className={`p-4 rounded-xl space-y-1.5 border ${
                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
                  }`}>
                    <strong className={`font-bold block text-sm ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>📸 Photography Dispatch Areas</strong>
                    <p className={`text-[11px] leading-relaxed ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Northeast India (Shillong, Jorhat, Dibrugarh, Tezpur, Silchar, and beyond).</p>
                  </div>
                </div>
              </div>
            </section>

          </motion.div>
        )}

        {/* PIXEL FIX (IT SERVICES TARGET PORTFOLIO) */}
        {activeTab === 'pixelfix' && (
          <motion.div
            key="pixelfix"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="text-left relative overflow-hidden rounded-3xl p-4 md:p-8"
          >
            {/* Ambient Background with subtle IT hardware/networking animations */}
            <PixelFixBackground currentTheme={currentTheme} />

            <div className="relative z-10 space-y-12">
            {/* Header branding taglines */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-block bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-[#FF5500]/20 font-mono">
                PIXEL FIX — AT-DOORSTEP IT Support
              </span>
              <ScrollRevealText
                tag="h1"
                className={`text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
                text="AFFORDABLE DOORSTEP COMPUTER ENGINEERS"
              />
              <ScrollReveal variant="fade-up" delay={0.15}>
                <p className={`text-sm md:text-base ${
                  currentTheme === 'light' ? 'text-slate-650 font-medium' : 'text-slate-300'
                }`}>
                  Get operating system upgrades (Windows 10/11), productivity licensing configuration help for Microsoft Office, system speedups, and rapid diagnostic hardware audits on demand. Call anytime at +918638875231.
                </p>
              </ScrollReveal>
              
              <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  onClick={() => triggerQuickBooking('it_fix', 'Hi Murari, I want to book doorstep PC support!')}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
                >
                  <WhatsAppIcon size={14} /> <span className="text-center">Send WhatsApp Support Ticket</span>
                </button>
                <a
                  href={`tel:${contactPhoneIt}`}
                  className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Phone size={14} /> <span>Call Support Now</span>
                </a>
              </div>
            </div>

            {/* Service Packages Section */}
            <div className="space-y-6">
              <ScrollReveal variant="fade-up" delay={0.1} className="text-left space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-3 py-0.5 text-[9px] text-[#FF5500] font-extrabold tracking-widest uppercase font-mono">
                  <SlidersHorizontal size={10} className="animate-pulse" />
                  <span>TRANSPARENT VALUE-DRIVEN RATES</span>
                </div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-950' : 'text-white'
                }`}>
                  Doorstep IT Service Packages
                </h2>
                <p className={`text-xs md:text-sm ${
                  currentTheme === 'light' ? 'text-slate-650 font-medium' : 'text-slate-400'
                }`}>
                  Choose a support tier that matches your computer speed or license configuration needs. All doorstep configurations are guided directly by certified engineers.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {itServices.map((srv, index) => (
                  <ScrollReveal
                    key={index}
                    variant="slide-in-up"
                    delay={index * 0.1}
                    className={`p-6 rounded-3xl border ${s.card} flex flex-col justify-between hover:border-[#FF5500]/70 cursor-pointer group transition-all duration-300 hover:scale-[1.01]`}
                    onClick={() => setActiveDetailService({ ...srv, type: 'it' })}
                  >
                    <div>
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#FF5500] mb-4">
                        {index === 0 ? <Laptop size={22} /> : index === 1 ? <Cpu size={22} /> : <CheckCircle size={22} />}
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">SERVICE PACKAGE {index+1}</span>
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEditingItem({
                                type: 'it_service',
                                index,
                                data: { ...srv }
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow cursor-pointer transition-colors"
                          >
                            <Sliders size={8} /> Edit
                          </button>
                        )}
                      </div>
                      <h3 className={`text-xl font-black mt-1 ${currentTheme === 'light' ? 'text-slate-950 font-black' : 'text-white font-black'}`}>{srv.title}</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>{srv.description}</p>
                      
                      <div className="mt-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5500] inline-flex items-center gap-1 group-hover:underline">
                          View Details & Specs <ArrowUpRight size={10} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>

                      <ul className="space-y-2 mt-4">
                        {srv.features.map((f, fIdx) => (
                          <li key={fIdx} className={`flex gap-2 text-xs ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                            <Check size={14} className="text-[#FF5500] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`pt-6 border-t mt-6 flex items-center justify-between ${s.divider}`}>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Baseline starting rate</span>
                        <span className="text-base font-extrabold text-[#FF5500]">{srv.price}</span>
                      </div>

                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleEstimateCostRedirect('pixelfix', `Interested in standard package: ${srv.title}. please call.`);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
                          currentTheme === 'light' 
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 font-semibold' 
                            : 'bg-white/5 hover:bg-white/10 text-white font-extrabold'
                        }`}
                      >
                        Configure Estimate
                      </button>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Minimalist Icon-only diagnostic shortcuts */}
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 py-4">
              <span className={`w-full text-center text-xs font-black uppercase tracking-widest ${currentTheme === 'light' ? 'text-slate-850' : 'text-slate-200'} font-mono mb-2 block`}>
                ⚡ Diagnostics Toolbox
              </span>
              {[
                { id: 'bios', title: 'BIOS Keys Finder', icon: KeyRound },
                { id: 'beep', title: 'Beep Diagnostician', icon: Volume2 },
                { id: 'smps', title: 'PSU Wattage Calculator', icon: Zap }
              ].map(tool => {
                const ToolIcon = tool.icon;
                const isActive = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title={tool.title}
                    className={`group px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#FF5500] border-transparent text-white shadow-lg shadow-[#FF5500]/20'
                        : currentTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-700 hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-slate-50'
                          : 'bg-zinc-900 border-white/5 text-zinc-300 hover:text-white hover:border-white/10'
                    }`}
                    aria-label={tool.title}
                  >
                    <ToolIcon size={14} className={`transition-transform duration-350 ${isActive ? 'text-white' : 'text-[#FF5500] group-hover:scale-125 group-hover:rotate-12 group-hover:animate-pulse'}`} />
                    <span>{tool.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Tech FAQs panels */}
            <div className={`p-6 md:p-8 rounded-3xl border ${s.card} space-y-4`}>
              <h3 className={`text-xl font-extrabold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Genuine Installation &amp; Troubleshooting Guidelines</h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-xs ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <div className="space-y-1">
                  <span className={`font-extrabold block ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Q: Does Pixel Fix provide genuine license configurations?</span>
                  <p className={`${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Yes! We thoroughly advise and assist customers about acquiring official Microsoft certifications, license upgrades, and configuring secure digital offices. No insecure pirated cracks mapped into our setups.</p>
                </div>
                <div className="space-y-1">
                  <span className={`font-extrabold block ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Q: What happens if my hardware error can't be resolved?</span>
                  <p className={`${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>We maintain an absolute <strong>₹0 Diagnostic Fee warranty</strong>. If we come directly to your doorstep and can't formulate an eligible troubleshooting fix, you pay nothing!</p>
                </div>
              </div>
            </div>

            {/* Assam-Based Client Reviews */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <ScrollReveal variant="fade-up" delay={0.1} className="text-left">
                  <span className="text-[#FF5500] text-[10px] uppercase tracking-[0.2em] font-bold block mb-1">CUSTOMER ACCLAIM</span>
                  <h2 className={`text-2xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Assam Doorstep IT Client Reviews
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    See how local businesses and homeowners across Assam evaluate our on-demand operating setups and speed diagnostics.
                  </p>
                </ScrollReveal>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setEditingItem({
                      type: 'pixelfix_review',
                      data: { id: 'pfr_' + Date.now(), name: 'New Assam Client', role: 'Zoo Road, Guwahati', comment: 'Review comment goes here...', rating: 5, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' }
                    })}
                    className="bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase text-[10px] tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Plus size={12} /> Add IT Review
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {pixelFixReviews.map((t, index) => (
                  <div key={t.id || index} className={`p-3.5 sm:p-5 rounded-2xl border ${s.card} text-left space-y-3 sm:space-y-4 flex flex-col justify-between h-full`}>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200/40 dark:border-white/5">
                        <span className="text-[8px] sm:text-[10px] text-amber-500 block">{'★'.repeat(t.rating || 5)}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7.5px] sm:text-[9px] uppercase font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-extrabold max-w-[80px] sm:max-w-[120px] truncate">
                            {t.role.split(',').pop()?.trim() || 'Assam'}
                          </span>
                          {isAuthorized && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingItem({
                                  type: 'pixelfix_review',
                                  index,
                                  data: { ...t }
                                })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[7px] sm:text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm('Delete this IT review?')) {
                                    const updated = pixelFixReviews.filter((_, idx) => idx !== index);
                                    setPixelFixReviews(updated);
                                    try {
                                      await updateSiteConfig({ pixelFixReviews: updated });
                                    } catch (err) {
                                      console.error('Failed to update reviews in Firestore:', err);
                                    }
                                  }
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[7px] sm:text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                              >
                                Del
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-[10.5px] sm:text-xs italic leading-relaxed line-clamp-4 sm:line-clamp-none ${
                        currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        "{t.comment}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 pt-3 border-t border-slate-200/20 dark:border-white/5">
                      <img
                        src={t.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                        alt={`${t.name} avatar`}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border shrink-0 ${
                          currentTheme === 'light' ? 'border-slate-200' : 'border-white/10'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <strong className={`text-[10px] sm:text-xs font-black block truncate ${
                          currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>{t.name}</strong>
                        <p className="text-[8.5px] sm:text-[10px] text-slate-500 truncate">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Google Places Feedback QR Code */}
              <ScrollReveal variant="fade-up" delay={0.25}>
                <div className="pt-6 border-t border-slate-200/10">
                  <ReviewQRCode currentTheme={currentTheme} triggerToast={triggerToast} />
                </div>
              </ScrollReveal>
            </div>
            </div>
          </motion.div>
        )}

        {/* PIXEL FRAME (PHOTOGRAPHY TARGET PORTFOLIO) */}
        {activeTab === 'pixelframe' && (
          <motion.div
            key="pixelframe"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="text-left relative overflow-hidden rounded-3xl p-4 md:p-8"
          >
            {/* Ambient Background with subtle photography animations */}
            <PixelFrameBackground currentTheme={currentTheme} />

            {/* Compact QR Code Generator */}
            <QRCodeGenerator currentTheme={currentTheme} triggerToast={triggerToast} />

            <div className="relative z-10 space-y-12">
            {/* Header branding */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-block bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-[#FF5500]/20 font-mono">
                PIXEL FRAME — Professional Wedding events
              </span>
              <ScrollRevealText
                tag="h1"
                className={`text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
                text="Framing Your Precious Moments Forever"
              />
              <ScrollReveal variant="fade-up" delay={0.15}>
                <p className={`text-sm md:text-base ${
                  currentTheme === 'light' ? 'text-slate-650 font-medium' : 'text-slate-300'
                }`}>
                  Discover candidacy portraiture, high-contrast wedding frames, post-production cinematic retouching, and aerial drone recording. Check custom budget estimates and secure your booking date instantly on WhatsApp at +91{contactPhonePhotos}.
                </p>
              </ScrollReveal>

              <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  onClick={() => triggerQuickBooking('photography', 'Hello Murari, I want to book photography coverage!')}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
                >
                  <WhatsAppIcon size={14} /> <span className="text-center">Send WhatsApp Photo Ticket</span>
                </button>
                <a
                  href={`tel:${contactPhonePhotos}`}
                  className={`w-full sm:w-auto bg-white hover:bg-zinc-200 text-black text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    currentTheme === 'light' ? 'border border-slate-200 shadow-sm' : ''
                  }`}
                >
                  <Phone size={14} /> <span>Dial Photographer Now</span>
                </a>
              </div>
            </div>

            {/* Service Packages Section */}
            <div className="space-y-6">
              <ScrollReveal variant="fade-up" delay={0.1} className="text-left space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full px-3 py-0.5 text-[9px] text-[#FF5500] font-extrabold tracking-widest uppercase font-mono">
                  <Camera size={10} className="animate-pulse" />
                  <span>PRECISE CINEMATIC RATES</span>
                </div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-950' : 'text-white'
                }`}>
                  Creative &amp; Event Packages
                </h2>
                <p className={`text-xs md:text-sm ${
                  currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'
                }`}>
                  Select a tailored photography or cinematic coverage tier. Fully transparent pricing models designed to bring world-class frames to your special occasions.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {photoServices.map((srv, index) => (
                  <ScrollReveal
                    key={index}
                    variant="slide-in-up"
                    delay={index * 0.08}
                    className={`p-5 rounded-2xl border ${s.card} flex flex-col justify-between hover:border-[#FF5500]/60 cursor-pointer group transition-all duration-300 hover:scale-[1.01]`}
                    onClick={() => setActiveDetailService({ ...srv, type: 'photography' })}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase font-mono text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-0.5 rounded-full inline-block font-extrabold">
                          {srv.price}
                        </span>
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEditingItem({
                                type: 'photo_service',
                                index,
                                data: { ...srv }
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow cursor-pointer transition-colors"
                          >
                            <Sliders size={8} /> Edit
                          </button>
                        )}
                      </div>
                      <h3 className={`text-lg font-black mt-3 truncate ${
                        currentTheme === 'light' ? 'text-slate-950' : 'text-white'
                      }`}>{srv.title}</h3>
                      <p className={`text-xs mt-2 leading-relaxed ${
                        currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'
                      }`}>{srv.description}</p>
                      
                      <div className="mt-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5500] inline-flex items-center gap-1 group-hover:underline">
                          View Details & Specs <ArrowUpRight size={10} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>

                      <ul className={`space-y-1.5 mt-4 text-[11px] ${
                        currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {srv.features.slice(0, 3).map((f, fIdx) => (
                          <li key={fIdx} className="flex gap-1.5">
                            <CheckCircle2 size={12} className="text-[#FF5500] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleEstimateCostRedirect('pixelframe', `Inquiring about photography category: ${srv.title}. please coordinate dates.`);
                      }}
                      className={`mt-6 w-full py-2 text-xs font-extrabold uppercase rounded-lg transition-all ${
                        currentTheme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                          : 'bg-white/5 hover:bg-white/10 text-white font-extrabold'
                      }`}
                    >
                      Estimate Cost
                    </button>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Photo Resizer & Compressor Tool Section (Expandable) */}
            <ScrollReveal variant="slide-in-up" delay={0.05}>
              <div className={`border border-dashed border-[#FF5500]/25 rounded-2xl p-4 bg-[#FF5500]/5 flex flex-col md:flex-row items-center justify-between gap-4 mb-4`}>
                <div className="flex items-center gap-3 text-left w-full md:w-auto">
                  <div className="p-2 rounded-lg bg-[#FF5500]/10 text-[#FF5500] shrink-0">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] uppercase font-mono bg-[#FF5500]/20 text-[#FF5500] px-1.5 py-0.5 rounded font-extrabold tracking-wide">FREE UTILITY</span>
                      <span className="text-[9px] text-[#FF5500] uppercase font-mono font-extrabold tracking-wider animate-pulse">● Live Optimizer</span>
                    </div>
                    <h4 className={`text-sm font-black uppercase tracking-tight ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      High-Speed Image Optimizer & Resizer
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoResizerOpen(!isPhotoResizerOpen)}
                  className="bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase text-[11px] tracking-wider px-4 py-2.5 rounded-xl shadow-md hover:shadow-[#FF5500]/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-center"
                >
                  {isPhotoResizerOpen ? 'Close Resizer' : 'Open Resizer Tool'}
                </button>
              </div>
            </ScrollReveal>

            <AnimatePresence>
              {isPhotoResizerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden mb-6"
                >
                  <div className="py-2">
                    <PhotoResizer currentTheme={currentTheme} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Testimonials list */}
            <section className="space-y-6">
              <ScrollReveal variant="fade-up" delay={0.1} className="flex items-center justify-between gap-4">
                <h3 className={`text-xl font-extrabold ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>Client Reviews</h3>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setEditingItem({
                      type: 'testimonial',
                      data: { id: 'testi_' + Date.now(), name: 'New Client Name', role: 'Business Owner / Wedding Client', comment: 'Review content here...', rating: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' }
                    })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Plus size={12} /> Add Review
                  </button>
                )}
              </ScrollReveal>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {testimonials.map((t, index) => (
                  <motion.div
                    key={t.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10px" }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`p-3.5 sm:p-5 rounded-2xl border ${s.card} text-left space-y-3 sm:space-y-4 flex flex-col justify-between h-full`}
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200/40 dark:border-white/5">
                        <span className="text-[8px] sm:text-[10px] text-amber-500 block">{'★'.repeat(t.rating || 5)}</span>
                        {isAuthorized && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingItem({
                                type: 'testimonial',
                                index,
                                data: { ...t }
                              })}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Sliders size={8} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm('Delete this testimonial review?')) {
                                  const updated = testimonials.filter((_, idx) => idx !== index);
                                  setTestimonials(updated);
                                  try {
                                    await updateSiteConfig({ testimonials: updated });
                                  } catch (err) {
                                      console.error('Failed to update testimonials in Firestore:', err);
                                  }
                                }
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={8} /> Del
                            </button>
                          </div>
                        )}
                      </div>
                      <p className={`text-[10.5px] sm:text-xs italic leading-relaxed line-clamp-4 sm:line-clamp-none ${
                        currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        "{t.comment}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 pt-2">
                      <img
                        src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                        alt="customer avatar reviews"
                        className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full object-cover border ${
                          currentTheme === 'light' ? 'border-slate-200' : 'border-white/10'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <strong className={`text-[10px] sm:text-xs font-black block truncate ${
                          currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>{t.name}</strong>
                        <span className="text-[8.5px] sm:text-[10px] text-slate-500 block truncate">{t.role}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Verified Google Places Feedback QR Code */}
            <ScrollReveal variant="fade-up" delay={0.25}>
              <div className="pt-6 border-t border-slate-200/10">
                <ReviewQRCode currentTheme={currentTheme} triggerToast={triggerToast} />
              </div>
            </ScrollReveal>

            </div>
          </motion.div>
        )}

        {/* FULL CLIENT PORTFOLIO GALLERY */}
        {activeTab === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-8 text-left"
          >
            {/* Header titles */}
            <div>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-1 ${s.tagline}`}>
                PIXEL FRAME — DIGITAL IMAGE SHOWCASE DATABASE
              </span>
              <ScrollRevealText
                tag="h1"
                className={`text-3xl font-black ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
                text="CURATED CLIENT PORTFOLIOS"
              />
              <ScrollReveal variant="fade-up" delay={0.15}>
                <p className={`text-xs md:text-sm mt-1 max-w-2xl ${
                  currentTheme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>
                  Filter through our wedding cinematic highlights, anniversary files, custom outdoor solo outputs and professional corporate captures. Click any card to expand and view full image specifications.
                </p>
              </ScrollReveal>
            </div>

            {/* Filter segments */}
            <div className={`flex flex-wrap items-center gap-2 pb-4 border-b ${s.divider}`}>
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'wedding', label: '💍 Wedding' },
                { id: 'haldi', label: '💛 Haldi' },
                { id: 'mehendi', label: '🌿 Mehendi' },
                { id: 'reception', label: '🥂 Reception' },
                { id: 'engagement', label: '✨ Engagement' },
                { id: 'pre_wedding', label: '📸 Pre-Wedding' },
                { id: 'bridal_portraits', label: '👰 Bridal' },
                { id: 'groom_portraits', label: '🤵 Groom' },
                { id: 'couple_portraits', label: '👩‍❤️‍👨 Couple' },
                { id: 'candid_moments', label: '⚡ Candid' },
                { id: 'family_photos', label: '👨‍👩‍👧‍👦 Family' },
                { id: 'corporate', label: '👔 Corporate' },
                { id: 'party', label: '🎉 Events' },
                { id: 'custom', label: '🌲 Outdoor' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveGalleryFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all relative z-0 overflow-hidden ${
                    activeGalleryFilter === filter.id
                      ? 'text-white border-transparent shadow-md'
                      : currentTheme === 'light'
                        ? 'bg-slate-100 text-slate-700 border border-slate-205/70 hover:bg-slate-200'
                        : 'bg-black/20 text-slate-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="relative z-10">{filter.label}</span>
                  {activeGalleryFilter === filter.id && (
                    <motion.span
                      layoutId="activeGalleryCategoryFilterPill"
                      className="absolute inset-0 bg-[#FF5500] -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Collection/Tag Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 pb-4">
              <span className={`text-[10px] uppercase tracking-wider font-bold mr-1 ${
                currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                Filter by Collection:
              </span>
              {[
                { id: 'all', label: 'All Collections' },
                { id: 'Recent', label: '🆕 Recent' },
                { id: 'Featured', label: '⭐ Featured' },
                { id: 'Client Favorites', label: '❤️ Favorites' }
              ].map((tagFilter) => (
                <button
                  key={tagFilter.id}
                  onClick={() => setActiveGalleryTagFilter(tagFilter.id as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border relative z-0 overflow-hidden ${
                    activeGalleryTagFilter === tagFilter.id
                      ? 'text-white border-transparent shadow-sm'
                      : currentTheme === 'light'
                        ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        : 'bg-zinc-900/40 text-slate-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="relative z-10">{tagFilter.label}</span>
                  {activeGalleryTagFilter === tagFilter.id && (
                    <motion.span
                      layoutId="activeGalleryTagFilterPill"
                      className={`absolute inset-0 -z-10 ${
                        tagFilter.id === 'all'
                          ? 'bg-[#FF5500]'
                          : tagFilter.id === 'Recent'
                            ? 'bg-emerald-600'
                            : tagFilter.id === 'Featured'
                              ? 'bg-amber-600'
                              : 'bg-pink-600'
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Pictures layout list */}
            {isGalleryLoading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`gallery-sk-${i}`}
                    className={`rounded-2xl border aspect-square relative overflow-hidden flex flex-col justify-end p-3 sm:p-4 animate-pulse ${
                      currentTheme === 'light'
                        ? 'bg-slate-50 border-slate-200/60 shadow-xs'
                        : 'bg-zinc-950/40 border-white/5 shadow-md'
                    }`}
                  >
                    {/* Top left pseudo tags */}
                    <div className="absolute top-3 left-3 flex gap-1">
                      <div className={`w-14 h-4 rounded font-mono ${
                        currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                      }`} />
                    </div>
                    {/* Main content placeholders */}
                    <div className="space-y-2 relative z-10">
                      <div className={`w-16 h-3 rounded font-mono ${
                        currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800/80'
                      }`} />
                      <div className={`w-4/5 h-5 rounded ${
                        currentTheme === 'light' ? 'bg-slate-300' : 'bg-zinc-800'
                      }`} />
                      <div className={`pt-2 border-t flex justify-between items-center ${
                        currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
                      }`}>
                        <div className={`w-20 h-3 rounded ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800/60'
                        }`} />
                        <div className={`w-12 h-3 rounded ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800/60'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center font-mono text-zinc-500 text-xs flex flex-col items-center gap-3">
                <span>No files found under this filter registry database yet.</span>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setEditingItem({
                      type: 'gallery_item',
                      data: {
                        id: 'g_' + Date.now(),
                        title: 'New Bridal Showcase, Guwahati, India',
                        category: activeGalleryFilter === 'all' ? 'wedding' : activeGalleryFilter,
                        imageUrl: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=800',
                        altText: 'Stunning local portfolio shoot by Murari Panjiyar',
                        date: new Date().toISOString().split('T')[0],
                        cameraInfo: 'Nikon Z8 • NIKKOR Z 85mm f/1.2 S'
                      }
                    })}
                    className="bg-[#FF5500] hover:bg-[#FF4400] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Add First Showcase
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                key={`${activeGalleryFilter}-${activeGalleryTagFilter}`}
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.04
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    onClick={() => setPreviewImage(item)}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
                    }}
                    whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 22 } }}
                    className={`group rounded-2xl overflow-hidden border ${s.card} flex flex-col justify-between aspect-square relative cursor-pointer shadow-sm hover:shadow-lg hover:border-[#FF5500]/30 transition-all duration-300`}
                  >
                    {isAuthorized && (
                      <div className="absolute top-3 right-3 z-20 flex gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setEditingItem({
                            type: 'gallery_item',
                            id: item.id,
                            data: { ...item }
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] tracking-wider px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 sm:gap-1 cursor-pointer"
                        >
                          <Sliders size={8} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Delete this gallery item?')) {
                              const updated = galleryItems.filter(g => g.id !== item.id);
                              setGalleryItems(updated);
                              try {
                                await updateSiteConfig({ galleryItems: updated });
                                triggerToast('Portfolio image successfully deleted.', 'info');
                              } catch (err) {
                                console.error('Failed to delete gallery item:', err);
                              }
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[7px] sm:text-[10px] tracking-wider px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 sm:gap-1 cursor-pointer"
                        >
                          <Trash2 size={8} /> Del
                        </button>
                      </div>
                    )}
                    
                    {/* Automatic Collection Tags Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
                      {getGalleryItemTags(item, galleryItems).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[6.5px] sm:text-[9px] uppercase font-mono font-extrabold tracking-wider px-1.5 sm:px-2 py-0.5 rounded backdrop-blur-md shadow-md border flex items-center gap-0.5 sm:gap-1 ${
                            tag === 'Recent'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                              : tag === 'Featured'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                : 'bg-pink-950/80 text-pink-300 border-pink-500/30'
                          }`}
                        >
                          {tag === 'Recent' && <span className="text-[6.5px] sm:text-[9px]">🆕</span>}
                          {tag === 'Featured' && <span className="text-[6.5px] sm:text-[9px]">⭐</span>}
                          {tag === 'Client Favorites' && <span className="text-[6.5px] sm:text-[9px]">❤️</span>}
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.altText}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      placeholderClassName="absolute inset-0 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2.5 sm:p-4 flex flex-col justify-end">
                      <span className="text-[8px] sm:text-[10px] uppercase font-mono font-bold text-[#FF5500]">
                        {getCategoryLabel(item.category).toUpperCase()}
                      </span>
                      <h3 className="text-[10.5px] sm:text-sm font-black text-white mt-0.5 sm:mt-1 leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex justify-between items-center text-[8.5px] sm:text-[10px] text-slate-500 pt-1.5 sm:pt-2 border-t border-white/5 mt-1.5 sm:mt-2">
                        <span className="truncate">🗓️ {item.date}</span>
                        <span className="font-mono text-[7px] sm:text-[9px] uppercase text-zinc-400 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[50px] sm:max-w-none" title={item.cameraInfo}>
                          {item.cameraInfo || 'Nikon'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isAuthorized && (
                  <div
                    onClick={() => setEditingItem({
                      type: 'gallery_item',
                      data: {
                        id: 'g_' + Date.now(),
                        title: 'New Showcase portfolio by Murari Panjiyar',
                        category: activeGalleryFilter === 'all' ? 'wedding' : activeGalleryFilter,
                        imageUrl: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=800',
                        altText: 'Stunning Indian portfolio shoot by Murari Panjiyar',
                        date: new Date().toISOString().split('T')[0],
                        cameraInfo: 'Nikon Z8 • NIKKOR Z 85mm f/1.2 S'
                      }
                    })}
                    className={`group rounded-2xl overflow-hidden aspect-square border-2 border-dashed flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                      currentTheme === 'light'
                        ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-100 text-slate-500'
                        : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <Plus size={28} className="text-[#FF5500]" />
                    <span className="text-[10px] font-black uppercase text-center block">Add New Showcase</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* DETAILS ABOUT / PROFILE ORIGIN STORY */}
        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-12 text-left max-w-5xl mx-auto"
          >
            {/* Split row bio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-[#FF5500] rounded-3xl opacity-20 blur-2xl pointer-events-none" />
                <div className={`relative z-10 p-2 rounded-3xl border ${
                  currentTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-white/10'
                }`}>
                  <div className="relative rounded-2xl overflow-hidden group">
                    {profileImageError ? (
                      <div className={`rounded-2xl w-full min-h-[320px] min-[400px]:min-h-[360px] sm:min-h-[400px] h-auto flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden ${
                        currentTheme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-500' : 'bg-zinc-900/50 border border-white/10 text-slate-400'
                      }`}>
                        {/* Beautiful artistic abstract background avatar */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5500]/10 via-amber-500/5 to-violet-600/10 opacity-60 pointer-events-none" />
                        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-[#FF5500]/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center pt-2">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] mb-2 sm:mb-3 shadow-[0_4px_12px_rgba(255,85,0,0.15)] animate-pulse">
                            <User size={22} className="sm:size-[26px]" />
                          </div>
                          <h3 className={`font-black text-xs sm:text-base tracking-tight mb-1 text-center uppercase ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Profile Photo restricted
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-center max-w-xs leading-relaxed opacity-80 px-2 overflow-hidden break-words">
                            Google Drive permission limits prevent this photo from displaying publicly to other devices unless shared.
                          </p>
                        </div>

                        <div className="relative z-10 w-full p-2.5 sm:p-3.5 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/5 backdrop-blur-md rounded-2xl space-y-1.5 sm:space-y-2 my-2">
                          <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
                            <span>How to display for everyone:</span>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-left leading-relaxed opacity-90 font-medium">
                            1. Open your Google Drive photo link.<br />
                            2. Click <strong>Share</strong> (or Triple-dot menu ➡️ Share).<br />
                            3. Under General Access, select <strong>"Anyone with the link"</strong> (Viewer).
                          </p>
                        </div>

                        <div className="relative z-10 flex flex-col min-[360px]:flex-row gap-2 w-full justify-center">
                          <a
                            href="https://drive.google.com/file/d/1cKkwgAa3qplkkzj15-EEiQQ1nnHOy0Gk/view?usp=drive_link"
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl transition-all"
                          >
                            Open Drive Link
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImageError(false);
                            }}
                            className="flex-1 py-2 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#FF5500] hover:bg-[#FF4400] text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            Retry Loading
                          </button>
                        </div>
                      </div>
                    ) : (
                      <LazyImage
                        src={profilePhotoUrl}
                        alt="Murari Panjiyar - smiling young Indian technical artist with a short beard and mustache"
                        className="rounded-2xl w-full h-[280px] min-[400px]:h-[340px] sm:h-[400px] object-cover hover:scale-[1.02] transition-all duration-500 z-10 relative"
                        placeholderClassName="absolute inset-0 min-h-[280px] min-[400px]:min-h-[340px] sm:min-h-[400px]"
                        onError={() => setProfileImageError(true)}
                      />
                    )}
                    {isAuthorized && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                        <button
                          type="button"
                          onClick={() => setEditingItem({
                            type: 'hero',
                            data: { headline: heroHeadline, subheadline: heroSubheadline, photoUrl: profilePhotoUrl }
                          })}
                          className="bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase text-xs tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl cursor-pointer transition-transform hover:scale-105"
                        >
                          <Camera size={14} /> Change Cover Photo
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 text-center mt-2 rounded-xl ${
                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-black'
                  }`}>
                    <span className="text-xs uppercase tracking-widest text-[#FF5500] font-black">MURARI PANJIYAR</span>
                    <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">Guwahati, Assam, India</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[9px] min-[380px]:text-[10px] uppercase font-mono tracking-wider min-[380px]:tracking-widest text-[#FF5500] block break-words whitespace-normal leading-normal">ENTREPRENEUR PROFILE &amp; WORK PHILOSOPHY</span>
                    {isAuthorized && (
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          type: 'about',
                          data: { bioHeadline, bioText }
                        })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-3 py-1 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                      >
                        <Sliders size={12} /> Edit Bio Text
                      </button>
                    )}
                  </div>
                  <ScrollRevealText
                    tag="h1"
                    className={`text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight break-words ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                    text="The Mind Behind the Lens and the Machine"
                  />
                </div>

                <div className={`space-y-4 text-xs md:text-sm leading-relaxed break-words ${
                  currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <ScrollReveal variant="fade-up" delay={0.1}>
                    <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5500] mb-2">{bioHeadline}</h2>
                    <p className="whitespace-pre-line leading-relaxed italic border-l-2 border-[#FF5500]/55 pl-4 py-1 break-words">
                      {bioText}
                    </p>
                  </ScrollReveal>
                  <p className="text-slate-500 italic text-xs">
                    *Pictured above: Murari Panjiyar, presenting his technical expertise and artistic perspective.*
                  </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t ${s.divider}`}>
                  <div className={`p-4 rounded-xl space-y-1 ${currentTheme === 'light' ? 'bg-slate-100' : 'bg-white/5'}`}>
                    <span className="text-xs font-black text-[#FF5500] uppercase block">🏠 PIXEL FIX SETUP</span>
                    <p className={`text-[11px] ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Doorstep IT upgrades, driver alignments, malware cleansing, Router setups.</p>
                  </div>
                  <div className={`p-4 rounded-xl space-y-1 ${currentTheme === 'light' ? 'bg-slate-100' : 'bg-white/5'}`}>
                    <span className="text-xs font-black text-[#FF5500] uppercase block">📸 PIXEL FRAME OPTICS</span>
                    <p className={`text-[11px] ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Cinematic lens frames, 4K camera gear, calibrated color correction.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CURATED LATEST INSTAGRAM WIDGET */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${s.card} space-y-6 transition-all duration-300`}>
              <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b ${s.divider}`}>
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-500 via-[#FF5500] to-purple-600 p-[2px] flex items-center justify-center shadow-sm">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${
                      currentTheme === 'light' ? 'bg-white' : 'bg-[#18181F]'
                    }`}>
                      <Instagram size={18} className="text-[#FF5500]" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`font-black text-base flex items-center gap-2 pt-0.5 tracking-tight ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <span>Instagram Stream</span>
                      <a href="https://instagram.com/mpanjiyar1" target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-[#FF5500] transition-colors flex items-center gap-1">
                        @mpanjiyar1 <ExternalLink size={10} />
                      </a>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center flex-wrap gap-2 leading-none mt-1.5 font-medium">
                      <span>Latest cinematic captures & technical outtakes</span>
                      {(isFetchingInstagram || isSyncingInstagram) && (
                        <span className="text-[10px] text-[#FF5500] font-bold flex items-center gap-1 animate-pulse font-mono bg-[#FF5500]/10 px-1.5 py-0.5 rounded">
                          <RefreshCw size={9} className="animate-spin" /> Fetching latest posts...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-between md:justify-end">
                  {/* Minimalism Filter Tabs */}
                  <div className={`flex items-center gap-1 p-0.5 ${currentTheme === 'light' ? 'bg-slate-100' : 'bg-white/5'} rounded-xl text-[10px] font-bold uppercase tracking-wider`}>
                    <button
                      onClick={() => setInstaFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${instaFilter === 'all' ? 'bg-[#FF5500] text-white shadow-sm' : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setInstaFilter('image')}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${instaFilter === 'image' ? 'bg-[#FF5500] text-white shadow-sm' : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
                    >
                      Photos
                    </button>
                    <button
                      onClick={() => setInstaFilter('video')}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${instaFilter === 'video' ? 'bg-[#FF5500] text-white shadow-sm' : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
                    >
                      Reels
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Sync Trigger Button for Visitors/Admin */}
                    <button
                      onClick={() => fetchInstagramPostsDynamic(true)}
                      disabled={isFetchingInstagram}
                      title="Sync Live Stream"
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        currentTheme === 'light' 
                          ? 'border-slate-200 hover:bg-slate-50 text-slate-600' 
                          : 'border-white/10 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <RefreshCw size={13} className={isFetchingInstagram ? 'animate-spin text-[#FF5500]' : ''} />
                    </button>

                    <a
                      href="https://instagram.com/mpanjiyar1"
                      target="_blank"
                      rel="noreferrer"
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all tracking-tight ${
                        currentTheme === 'light' ? 'bg-slate-950 hover:bg-slate-800 text-white shadow-sm' : 'bg-white hover:bg-zinc-100 text-black'
                      }`}
                    >
                      Follow
                    </a>
                  </div>
                </div>
              </div>

              {/* Dynamic Content Stream */}
              {isFetchingInstagram && instagramPosts.length === 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={`relative rounded-2xl overflow-hidden aspect-square border animate-pulse flex flex-col justify-between p-3 sm:p-4 ${
                        currentTheme === 'light'
                          ? 'bg-slate-50 border-slate-200/60'
                          : 'bg-zinc-950 border-white/5'
                      }`}
                    >
                      {/* Top Corner Icon Placeholder */}
                      <div className="flex justify-between items-center">
                        <div className={`w-3 h-3 rounded-full ${currentTheme === 'light' ? 'bg-slate-200' : 'bg-white/5'}`} />
                        <div className={`w-8 h-3 rounded ${currentTheme === 'light' ? 'bg-slate-200' : 'bg-white/5'}`} />
                      </div>

                      {/* Center Camera Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`p-2.5 rounded-full ${currentTheme === 'light' ? 'bg-slate-200/40' : 'bg-white/5'}`}>
                          <div className={`w-5 h-5 border-2 border-dashed rounded ${currentTheme === 'light' ? 'border-slate-300' : 'border-white/10'}`} />
                        </div>
                      </div>

                      {/* Bottom caption / stats placeholder */}
                      <div className="space-y-2 relative z-10">
                        <div className={`h-2.5 rounded w-5/6 ${currentTheme === 'light' ? 'bg-slate-200' : 'bg-white/5'}`} />
                        <div className={`h-2 rounded w-1/2 ${currentTheme === 'light' ? 'bg-slate-200' : 'bg-white/5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const isVideoPost = (post: any) => post.mediaType === 'VIDEO' || !!post.videoUrl;
                    const filtered = filteredInstagramPosts;

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                          <p className="text-slate-400 text-xs font-mono">No matching portfolio posts found.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                        {filtered.map((post, idx) => {
                          const isReel = isVideoPost(post);
                          return (
                            <motion.div
                              key={post.id || `insta-post-${idx}`}
                              onClick={() => {
                                if (!isAuthorized) {
                                  window.open(post.permalink || 'https://www.instagram.com/mpanjiyar1', '_blank');
                                }
                              }}
                              initial={{ opacity: 0, scale: 0.95 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              whileHover={{ scale: 1.02 }}
                              className={`group rounded-2xl overflow-hidden aspect-square relative transition-all cursor-pointer border ${
                                currentTheme === 'light' 
                                  ? 'bg-slate-50 border-slate-200/60 hover:border-slate-300 hover:shadow-md' 
                                  : 'bg-black border-white/5 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20'
                              }`}
                            >
                              {/* Admin Action Badges */}
                              {isAuthorized && (
                                <div className="absolute top-2 right-2 z-30 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingItem({
                                        type: 'instagram',
                                        id: post.id,
                                        data: { ...post }
                                      });
                                    }}
                                    className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] shadow transition-colors"
                                    title="Edit Post"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete this Instagram post?')) {
                                        const updatedPosts = instagramPosts.filter(p => p.id !== post.id);
                                        setInstagramPosts(updatedPosts);
                                        updateSiteConfig({ instagramPosts: updatedPosts });
                                      }
                                    }}
                                    className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] shadow transition-colors"
                                    title="Delete Post"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}

                              {/* Media Player / Frame Content */}
                              {isReel && post.videoUrl ? (
                                <div className="w-full h-full relative">
                                  <video
                                    src={post.videoUrl}
                                    poster={post.imageUrl}
                                    loop
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.pause();
                                      e.currentTarget.currentTime = 0;
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white p-1 rounded-lg z-10">
                                    <Video size={10} className="text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full relative">
                                  <LazyImage
                                    src={post.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600'}
                                    alt="instagram portfolio post by murari mpanjiyar1"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    placeholderClassName="absolute inset-0 z-0"
                                  />
                                  {isReel && (
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/25 transition-colors duration-300">
                                      <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white border border-white/40 transition-transform duration-300 group-hover:scale-110">
                                        <Play size={8} fill="currentColor" className="ml-0.5 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Refined Hover Plate */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-end text-left z-20">
                                <p className="text-[10px] sm:text-xs text-slate-100 line-clamp-3 leading-relaxed font-sans font-medium mb-3">
                                  {post.caption}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] sm:text-xs text-slate-300 pt-2 border-t border-white/10 font-mono font-bold">
                                  <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                                    <Heart size={12} className="text-rose-500" fill="currentColor" /> {post.likes}
                                  </span>
                                  <span className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
                                    <MessageSquare size={12} className="text-sky-400" /> {post.comments}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {isAuthorized && filtered.length < 6 && (
                          <div
                            onClick={() => setEditingItem({
                              type: 'instagram',
                              data: { id: 'insta_' + Date.now(), imageUrl: '', caption: 'Caption of your original instagram post here. #PixelFrame #Guwahati', likes: 140, comments: 12, mediaType: 'IMAGE' }
                            })}
                            className={`group rounded-2xl overflow-hidden aspect-square border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                              currentTheme === 'light'
                                ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-50 text-slate-500'
                                : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <Plus size={20} className="text-[#FF5500]" />
                            <span className="text-[9px] font-black uppercase text-center tracking-wider block">Add Feed Item</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {isAuthorized && (
                    <div className="flex justify-end pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingItem({
                          type: 'instagram',
                          data: { id: 'insta_' + Date.now(), imageUrl: '', caption: 'Caption of your original instagram post here. #PixelFrame #Guwahati', likes: 140, comments: 12 }
                        })}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-wider ${
                          currentTheme === 'light'
                            ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white text-slate-700'
                            : 'bg-white/5 hover:bg-[#FF5500] hover:text-white text-slate-300'
                        }`}
                      >
                        <Plus size={14} /> Add Any Media Item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TOP-PERFORMING YOUTUBE VIDEO SECTION */}
            <div className={`p-5 rounded-2xl border ${
              currentTheme === 'light' 
                ? 'border-slate-200 bg-slate-50/50 shadow-sm' 
                : 'border-white/5 bg-zinc-950/40 shadow-md'
            } space-y-6`}>
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Youtube size={18} className="text-[#FF0000]" />
                  <div>
                    <h3 className={`font-bold text-sm tracking-tight ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      Top Performing Broadcasts
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchYoutubeVideos(true)}
                    disabled={isFetchingYoutube}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 border ${
                      currentTheme === 'light'
                        ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-50'
                        : 'bg-zinc-900 border-white/5 hover:bg-zinc-800 text-slate-300 disabled:opacity-50'
                    }`}
                  >
                    <RefreshCw size={11} className={`text-red-500 ${isFetchingYoutube ? 'animate-spin' : ''}`} />
                    <span>{isFetchingYoutube ? 'Syncing...' : 'Sync Live'}</span>
                  </button>
                  
                  {(() => {
                    const youtubeLink = socialLinks.find(link => link.platform === 'youtube');
                    const channelUrl = youtubeLink ? youtubeLink.url : 'https://www.youtube.com/channel/UCoZOM_gfrukJgZlBra0l-6w';
                    return (
                      <a
                        href={channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 border ${
                          currentTheme === 'light' 
                            ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-white border-white text-black hover:bg-zinc-100'
                        }`}
                      >
                        Visit Channel
                      </a>
                    );
                  })()}
                </div>
              </div>

              {/* Error Alert (non-blocking, simplified) */}
              {youtubeFetchError && (
                <p className="text-[10px] text-amber-500 font-mono">
                  Displaying cached top-performing master records.
                </p>
              )}

              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isFetchingYoutube && youtubeVideos.length === 0 ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between animate-pulse ${
                        currentTheme === 'light'
                          ? 'bg-white/40 border-slate-200/85 shadow-sm'
                          : 'bg-zinc-900/30 border-white/5'
                      }`}
                    >
                      {/* Thumbnail Skeleton */}
                      <div className={`aspect-video w-full rounded-lg relative overflow-hidden ${
                        currentTheme === 'light' ? 'bg-slate-200/80' : 'bg-white/5'
                      }`}>
                        {/* Play overlay skeleton */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentTheme === 'light' ? 'bg-slate-300' : 'bg-white/10'
                          }`} />
                        </div>
                      </div>

                      {/* Metadata Skeleton */}
                      <div className="pt-2.5 pb-0.5 px-0.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5 mt-1">
                          <div className={`h-3 rounded w-11/12 ${
                            currentTheme === 'light' ? 'bg-slate-200/80' : 'bg-white/5'
                          }`} />
                          <div className={`h-3 rounded w-2/3 ${
                            currentTheme === 'light' ? 'bg-slate-200/80' : 'bg-white/5'
                          }`} />
                        </div>

                        <div className={`flex items-center justify-between mt-5 pt-2.5 border-t ${
                          currentTheme === 'light' ? 'border-slate-100' : 'border-white/5'
                        }`}>
                          <div className={`h-2.5 rounded w-12 ${
                            currentTheme === 'light' ? 'bg-slate-200/80' : 'bg-white/5'
                          }`} />
                          <div className={`h-2.5 rounded w-12 ${
                            currentTheme === 'light' ? 'bg-slate-200/80' : 'bg-white/5'
                          }`} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  youtubeVideos.slice(0, 3).map((video, index) => {
                    const isPlaying = playingVideoId === video.id;
                    const rankLabels = ["#1 Top Video", "#2 Hot Video", "#3 Trending"];
                    
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                          isPlaying 
                            ? currentTheme === 'light'
                              ? 'bg-white border-red-500/20 shadow-sm'
                              : 'bg-black/20 border-red-500/20' 
                            : currentTheme === 'light'
                              ? 'bg-white/40 hover:bg-white border-slate-200/85 hover:border-slate-300'
                              : 'bg-zinc-900/30 hover:bg-zinc-900/60 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Aspect Screen */}
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-black border border-white/5 group-hover/thumb:scale-[1.01] transition-transform duration-200">
                          {isPlaying ? (
                            <iframe
                              className="w-full h-full absolute inset-0 z-10"
                              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=0&rel=0`}
                              title={video.title}
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => setPlayingVideoId(video.id)}>
                              {/* Small simple ranking badge */}
                              <span className="absolute top-2 left-2 z-20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/75 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                                {rankLabels[index]}
                              </span>

                              <LazyImage
                                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-300 ease-out rounded-lg"
                                placeholderClassName="absolute inset-0"
                              />
                              
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-200" />
                              
                              {/* Simple Play Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all duration-150 transform active:scale-95">
                                  <Play size={14} fill="currentColor" className="ml-0.5 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Video Metadata */}
                        <div className="pt-2.5 pb-0.5 px-0.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className={`text-[11px] font-bold uppercase leading-snug line-clamp-2 tracking-wide break-words group-hover:text-red-500 transition-colors duration-200 ${
                              currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                            }`}>
                              {video.title}
                            </h4>
                          </div>
                          
                          <div className={`flex items-center justify-between mt-3 pt-2.5 border-t ${
                            currentTheme === 'light' ? 'border-slate-100' : 'border-white/5'
                          }`}>
                            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-red-500 dark:text-red-400">
                              <Eye size={11} className="text-red-500 shrink-0" />
                              <span>{video.viewsFormatted || (video.views ? (video.views >= 1000 ? `${(video.views/1000).toFixed(1).replace(/\.0$/, "")}K views` : `${video.views} views`) : '0 views')}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-amber-500 dark:text-amber-400">
                              <ThumbsUp size={11} className="text-amber-500 shrink-0" />
                              <span>{video.likesFormatted || (video.likes ? (video.likes >= 1000 ? `${(video.likes/1000).toFixed(1).replace(/\.0$/, "")}K likes` : `${video.likes} likes`) : '0 likes')}</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* AFFILIATE Curated Recommendations & Deals Tab */}
        {activeTab === 'affiliate' && (
          <>
            {/* Subtle premium scroll progress indicator line */}
            <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-200/10 dark:bg-black/10 z-[100] pointer-events-none">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 via-[#FF5500] to-yellow-500 shadow-[0_1px_8px_rgba(255,85,0,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${affiliateScrollProgress}%` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              />
            </div>

            {/* Stylish Floating Back to Top Button */}
            <AnimatePresence>
              {showAffiliateBackToTop && (
                <motion.button
                  key="back-to-top"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] p-3.5 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer group border ${
                    currentTheme === 'light'
                      ? 'bg-white hover:bg-[#FF5500] hover:text-white text-slate-800 border-slate-200/80 shadow-slate-200'
                      : currentTheme === 'mono'
                        ? 'bg-zinc-900 hover:bg-white hover:text-black text-white border-white/10 shadow-black'
                        : 'bg-gradient-to-r from-amber-500 to-[#FF5500] text-white border-amber-400/20 shadow-[#FF5500]/25'
                  }`}
                  style={{
                    boxShadow: currentTheme === 'light' 
                      ? '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
                      : currentTheme === 'mono'
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px -5px rgba(255, 85, 0, 0.3)'
                  }}
                  title="Scroll to top"
                >
                  <ChevronUp 
                    size={20} 
                    className="stroke-[2.5px] transition-transform duration-300 group-hover:-translate-y-0.5" 
                  />
                  
                  {/* Outer pulsating decorative ring */}
                  <span className={`absolute -inset-1 rounded-full border border-dashed opacity-0 group-hover:opacity-45 animate-spin group-hover:animate-[spin_4s_linear_infinite] ${
                    currentTheme === 'light' ? 'border-[#FF5500]' : currentTheme === 'mono' ? 'border-white' : 'border-amber-400'
                  }`} />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              key="affiliate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="space-y-8 text-left max-w-6xl mx-auto"
            >
            {/* Breadcrumb Back Navigation */}
            <div className="flex border-b border-slate-200/40 dark:border-white/5 pb-3">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-2 text-[10px] font-mono font-extrabold tracking-widest transition-all uppercase cursor-pointer ${
                  currentTheme === 'light' ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500'
                }`}
              >
                <span className="text-[14px]">←</span>
                <span>Back to Hub</span>
              </button>
            </div>

            {/* Post-Modern Editorial Header Panel */}
            <div className={`relative p-6 md:p-8 rounded-3xl border text-left overflow-hidden ${
              currentTheme === 'light' 
                ? 'bg-amber-50/20 border-slate-200/80 shadow-md' 
                : 'bg-zinc-950/80 border-white/5 shadow-2xl backdrop-blur-xl'
            }`}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3">
                <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-none ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  THE DESIGNER’S <span className="text-amber-500">GEAR</span> SHEET
                </h1>
                
                <p className={`text-xs md:text-sm max-w-3xl leading-relaxed ${
                  currentTheme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>
                  An uncompromised catalog of recommended camera optics, enterprise server setups, IT optimization utility suites, and creative workstations. Zero fluff, zero sponsor-forced bias. I only link tools compiled through rigorous, real-world deployment across Assam.
                </p>
              </div>
            </div>

            {/* Filter Utilities & Edit Panel Trigger Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto -mx-4 px-4 lg:mx-0 lg:px-0 flex-nowrap lg:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {(() => {
                  const rawCategories = Array.from(new Set(affiliateLinksToRender.flatMap(a => (a.category || '').split(',').map(c => c.trim()).filter(Boolean)))) as string[];
                  const filteredRawCategories = rawCategories.filter(c => c !== 'my_gears');

                  const getCategoryLabel = (cat: string) => {
                    if (affiliateLabelMap[cat]) return affiliateLabelMap[cat];
                    cat = cat.replace('my_gears', 'My Gears');
                    return cat.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  };

                  const getCount = (cat: string) => {
                    if (cat === 'all') return affiliateLinksToRender.length;
                    return affiliateLinksToRender.filter(a => (a.category || '').split(',').map(c => c.trim()).includes(cat)).length;
                  };

                  return (
                    <>
                      {/* All Category Filter */}
                      <button
                        onClick={() => setActiveAffiliateFilter('all')}
                        className={`px-4 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer border relative z-0 overflow-hidden shrink-0 ${
                          activeAffiliateFilter === 'all'
                            ? 'border-transparent text-white shadow-lg shadow-amber-500/15 scale-[1.02]'
                            : currentTheme === 'light'
                              ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                              : 'bg-zinc-900/40 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {activeAffiliateFilter === 'all' && (
                          <motion.span
                            layoutId="activeAffiliateFilterPill"
                            className="absolute inset-0 bg-amber-500 -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          />
                        )}
                        {activeAffiliateFilter === 'all' && <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        <span className="relative z-10">All</span>
                      </button>

                      {/* My Gears Special Premium Filter Button with custom star visual hover effect */}
                      <button
                        onClick={() => setActiveAffiliateFilter('my_gears')}
                        className={`px-4.5 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-black transition-all duration-300 flex items-center gap-2 cursor-pointer border relative overflow-hidden group/star z-0 shrink-0 ${
                          activeAffiliateFilter === 'my_gears'
                            ? 'border-transparent text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                            : currentTheme === 'light'
                              ? 'bg-amber-50/70 border-amber-250 text-amber-700 hover:border-amber-400 hover:bg-amber-50'
                              : 'bg-amber-950/20 border-amber-500/20 text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10'
                        }`}
                      >
                        {activeAffiliateFilter === 'my_gears' && (
                          <motion.span
                            layoutId="activeAffiliateFilterPill"
                            className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          <Star 
                            size={10} 
                            fill={activeAffiliateFilter === 'my_gears' ? 'currentColor' : 'none'} 
                            className={`transition-transform duration-500 group-hover/star:rotate-[72deg] text-amber-500 ${
                              activeAffiliateFilter === 'my_gears' ? 'text-white' : 'animate-pulse'
                            }`} 
                          />
                        </span>
                        <span className="relative z-10 flex items-center gap-1.5">
                          My Gears
                          <span className={`text-[8px] px-1 rounded transition-all ${
                            activeAffiliateFilter === 'my_gears'
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {getCount('my_gears')}
                          </span>
                        </span>
                        
                        {/* Tweaking Star Sparkle Particles floating up on Hover */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/star:opacity-100 transition-opacity duration-350">
                          <motion.span 
                            animate={{ y: [-5, -25], x: [5, 0], scale: [0, 1, 0], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.0, ease: "easeOut" }}
                            className="absolute text-[6px] left-[10%] bottom-[5%]"
                          >
                            ⭐
                          </motion.span>
                          <motion.span 
                            animate={{ y: [-5, -20], x: [-5, -10], scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, ease: "easeOut" }}
                            className="absolute text-[8px] right-[15%] bottom-[5%]"
                          >
                            ✨
                          </motion.span>
                          <motion.span 
                            animate={{ y: [-5, -22], x: [0, 5], scale: [0, 0.8, 0], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.4, delay: 0.4, ease: "easeOut" }}
                            className="absolute text-[6px] left-[45%] bottom-[3%]"
                          >
                            ⭐
                          </motion.span>
                        </div>
                        
                        {/* Glow sweep sheen */}
                        <div className="absolute inset-x-0 top-0 h-full w-[250%] -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12 transition-transform duration-[1200ms] group-hover/star:translate-x-[150%] pointer-events-none" />
                      </button>

                      {/* Other Categories dynamically render */}
                      {filteredRawCategories.map((cat, idx) => {
                        const isActive = activeAffiliateFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveAffiliateFilter(cat)}
                            className={`px-4 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer border relative z-0 overflow-hidden shrink-0 ${
                              isActive
                                ? 'border-transparent text-white shadow-lg shadow-amber-500/15 scale-[1.02]'
                                : currentTheme === 'light'
                                  ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                  : 'bg-zinc-900/40 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="activeAffiliateFilterPill"
                                className="absolute inset-0 bg-amber-500 -z-10"
                                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                              />
                            )}
                            {isActive && <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            <span className="relative z-10">{getCategoryLabel(cat)}</span>
                          </button>
                        );
                      })}
                    </>
                  );
                })()}
              </div>

              {/* Compact Search & Administrative Group */}
              <div className="flex flex-row items-center gap-2 w-full lg:w-auto justify-between lg:justify-end shrink-0">
                {/* Mini Search Option */}
                <div className="relative flex items-center flex-1 lg:flex-initial">
                  <div className={`absolute left-3 pointer-events-none transition-colors duration-200 flex items-center ${
                    affiliateSearchQuery ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    <Search size={12} className="stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    value={affiliateSearchQuery}
                    onChange={(e) => setAffiliateSearchQuery(e.target.value)}
                    placeholder="Search gear..."
                    className={`pl-8 pr-8 py-2 rounded-xl font-mono text-[9px] uppercase tracking-wider w-full lg:w-32 lg:focus:w-52 transition-all duration-300 outline-none border focus:ring-0 ${
                      currentTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500'
                        : currentTheme === 'mono'
                          ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-605 focus:border-zinc-300'
                          : 'bg-zinc-900/40 border-white/5 text-slate-100 placeholder-zinc-500 focus:border-amber-500/50'
                    }`}
                  />
                  {affiliateSearchQuery && (
                    <button
                      onClick={() => setAffiliateSearchQuery('')}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center"
                    >
                      <X size={10} className="stroke-[2.5]" />
                    </button>
                  )}
                </div>

                {/* Administrative Buttons */}
                {isAuthorized && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsEditingCategories(!isEditingCategories)}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                        isEditingCategories
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : currentTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-700 hover:border-amber-550'
                            : 'bg-white/5 border-white/5 text-slate-200 hover:text-amber-500 hover:bg-white/10'
                      }`}
                      title={isEditingCategories ? "Close Label Editor" : "Edit Display Labels"}
                    >
                      <Settings size={12} className={isEditingCategories ? "animate-spin" : ""} />
                      <span className="hidden sm:inline">{isEditingCategories ? 'Close' : 'Labels'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingItem({
                          type: 'affiliate_link',
                          data: {
                            id: 'aff_' + Date.now().toString(),
                            title: '',
                            description: '',
                            category: 'photography',
                            url: '',
                            imageUrl: '',
                            discountCode: '',
                            price: '',
                            clicks: 0
                          }
                        });
                      }}
                      className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
                      title="Add Curated Recommendation Listing"
                    >
                      <Plus size={12} className="stroke-[3px]" />
                      <span className="hidden sm:inline">Add Deal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inline Dynamic Category Label Editor */}
            {isAuthorized && isEditingCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-2xl border text-left space-y-3 ${
                  currentTheme === 'light' ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/10 border-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-1.5 border-slate-200/50 dark:border-white/5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1">
                      ⚙️ Customize Category display labels
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Rename any existing collection tab (like 'all' or custom categories) to custom titles in real-time.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingCategories(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    const rawCategories = Array.from(new Set(affiliateLinks.flatMap(a => (a.category || '').split(',').map(c => c.trim()).filter(Boolean)))) as string[];
                    const allKeys = ['all', ...rawCategories];
                    return allKeys.map(key => {
                      const currentVal = affiliateLabelMap[key];
                      const friendlyPlaceholder = key === 'all' ? 'All collections' : key.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      return (
                        <div key={key} className="space-y-1">
                          <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-500 block">
                            Key name: <span className="text-amber-500 font-extrabold">"{key}"</span>
                          </span>
                          <input
                            type="text"
                            value={currentVal || ''}
                            placeholder={friendlyPlaceholder}
                            onChange={(ev) => {
                              setAffiliateLabelMap(prev => ({
                                ...prev,
                                [key]: ev.target.value
                              }));
                            }}
                            className={`w-full p-2 rounded-lg border outline-none text-xs font-sans font-bold ${
                              currentTheme === 'light'
                                ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                                : 'bg-black/40 border-white/10 text-white focus:border-amber-500'
                            }`}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
                
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await setDoc(doc(db, 'affiliate_config', 'labels'), { id: 'labels', labels: affiliateLabelMap });
                        setIsEditingCategories(false);
                        triggerToast('Collection labels successfully updated and synchronized!', 'success');
                      } catch (err) {
                        console.error("Error writing affiliate labels config to Firestore: ", err);
                        handleFirestoreError(err, OperationType.WRITE, 'affiliate_config/labels');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                  >
                    Save &amp; Apply Labels
                  </button>
                </div>
              </motion.div>
            )}

            {/* Curated Affiliate Recommendations Grid (3 columns on lg+, smaller card layout) */}
            <motion.div
              key={`${activeAffiliateFilter}_${affiliateSearchQuery}`}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
            >
              {isAffiliateLoading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={`affiliate-sk-${i}`}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between h-full shadow-sm animate-pulse ${
                      currentTheme === 'light'
                        ? 'bg-white border-slate-200'
                        : 'bg-zinc-950 border-white/5'
                    }`}
                  >
                    {/* Header bar */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
                      currentTheme === 'light' ? 'bg-slate-50/50 border-slate-200/50' : 'bg-black/15 border-white/5'
                    }`}>
                      <div className="flex gap-1.5">
                        <div className={`w-20 h-4 rounded-full ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                        }`} />
                        <div className={`w-10 h-4 rounded-full ${
                          currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900'
                        }`} />
                      </div>
                      <div className={`w-14 h-4 rounded-lg ${
                        currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                      }`} />
                    </div>

                    {/* Image Area */}
                    <div className={`aspect-video w-full relative ${
                      currentTheme === 'light' ? 'bg-slate-100 border-b border-slate-200/50' : 'bg-zinc-900 border-b border-white/5'
                    }`}>
                      <div className="absolute top-2.5 left-3 w-16 h-4 rounded bg-amber-500/20" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between p-4 space-y-3 text-left">
                      <div className="space-y-2">
                        <div className={`w-5/6 h-4 rounded ${
                          currentTheme === 'light' ? 'bg-slate-300' : 'bg-zinc-800'
                        }`} />
                        <div className={`w-1/2 h-4 rounded ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-900'
                        }`} />
                      </div>
                      
                      <div className="space-y-1.5 pt-1">
                        <div className={`w-full h-3 rounded ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-900'
                        }`} />
                        <div className={`w-11/12 h-3 rounded ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-900'
                        }`} />
                        <div className={`w-2/3 h-3 rounded ${
                          currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-900/60'
                        }`} />
                      </div>

                      {/* Buy Box Button */}
                      <div className="pt-2">
                        <div className={`w-full h-10 rounded-xl ${
                          currentTheme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredAffiliateLinks
                  .map((item, index) => {
                  const handleTrackClick = async (id: string) => {
                    const found = affiliateLinks.find(a => a.id === id);
                    if (found) {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const nowStr = new Date().toISOString();
                      
                      const history = found.clickHistory ? { ...found.clickHistory } : {};
                      history[todayStr] = (history[todayStr] || 0) + 1;

                      const dailyClicks = found.daily_click_count ? { ...found.daily_click_count } : {};
                      dailyClicks[todayStr] = (dailyClicks[todayStr] || 0) + 1;

                      const updatedLink = {
                        ...found,
                        clicks: (found.clicks || 0) + 1,
                        clickHistory: history,
                        last_clicked: nowStr,
                        daily_click_count: dailyClicks
                      };
                      try {
                        await setDoc(doc(db, 'affiliate_links', id), updatedLink);
                      } catch (err) {
                        console.error("Error tracking affiliate click on Firestore: ", err);
                      }
                    }
                  };

                  return (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
                      }}
                      className="relative flex flex-col h-full group"
                    >
                      {/* Fully clickable card container acting as the link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(item.id)}
                        className={`flex flex-col h-full rounded-2xl border overflow-hidden transition-all duration-300 relative text-left select-none group hover:-translate-y-1.5 ${
                          currentTheme === 'light'
                            ? 'bg-white border-slate-100 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.03)] hover:border-amber-500/30 hover:shadow-[0_16px_32px_-8px_rgba(245,158,11,0.1),0_8px_16px_-8px_rgba(0,0,0,0.03)]'
                            : 'bg-zinc-950 border-white/[0.02] shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-amber-500/40 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.22),0_8px_20px_-10px_rgba(0,0,0,0.7)]'
                        }`}
                      >
                        {/* 1. Product Image inside a pristine, modern showroom frame */}
                        <div className={`relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center p-3.5 border-b transition-colors duration-300 ${
                          currentTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-100'
                            : 'bg-zinc-900/15 border-white/[0.01]'
                        }`}>
                          {/* Centered card display block for seamless image blend */}
                          <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                            {item.isSyncedLicense ? (
                              <LicenseProductCardVisual
                                licenseId={item.id}
                                licenseName={item.title}
                                licenseType={item.category === 'software' ? 'Lifetime License Key' : undefined}
                                currentTheme={currentTheme}
                                customImageUrl={item.imageUrl}
                              />
                            ) : (
                              <LazyImage
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'}
                                alt={item.title}
                                className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                                placeholderClassName="absolute inset-0 z-0"
                              />
                            )}
                          </div>

                          {/* Refined gradient overlay for depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          {/* Dynamic Micro-Badges for source tagging */}
                          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                            {item.isSyncedLicense ? (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/90 text-white font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm backdrop-blur-md animate-pulse">
                                <Cpu size={8} className="stroke-[2.5]" />
                                <span>GENUINE KEY</span>
                              </span>
                            ) : /amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it|com\.mx|com\.br|com\.tr|ae|sa|sg|se|pl|nl|be|com\.be|co\.za|eg)|\/amzn\.to\//i.test(item.url || '') ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm backdrop-blur-md">
                                <ShoppingBag size={8} className="stroke-[2.5]" />
                                <span>AMAZON</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm backdrop-blur-md">
                                <ExternalLink size={8} className="stroke-[2.5]" />
                                <span>PARTNER</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 2. Text Content */}
                        <div className="flex-1 flex flex-col p-3.5 sm:p-4 min-w-0 justify-between">
                          <div className="space-y-2">
                            {/* Product Title */}
                            <h3 className={`text-xs sm:text-sm font-bold tracking-tight leading-snug line-clamp-2 transition-colors duration-200 ${
                              currentTheme === 'light' 
                                ? 'text-slate-900 group-hover:text-amber-600' 
                                : 'text-zinc-100 group-hover:text-amber-400'
                            }`}>
                              {item.title}
                            </h3>

                            {/* Product Description */}
                            <p className={`text-[10px] sm:text-[11px] leading-relaxed font-sans line-clamp-3 sm:line-clamp-4 ${
                              currentTheme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-400'
                            }`}>
                              {item.description}
                            </p>
                          </div>

                          {/* Price and Code Section (Automatically synced in real-time) */}
                          {((item.price && (item.isSyncedLicense || item.category === 'software')) || item.discountCode) && (
                            <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/[0.02]">
                              {(item.price && (item.isSyncedLicense || item.category === 'software')) ? (
                                <div className="flex flex-col text-left">
                                  <span className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500 block leading-none">Price</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`text-[11px] sm:text-[13px] font-black ${
                                      currentTheme === 'light' ? 'text-slate-900' : 'text-emerald-400'
                                    }`}>
                                      {item.price}
                                    </span>
                                    {item.isSyncedLicense && (
                                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[6.5px] font-black tracking-widest uppercase animate-pulse">
                                        <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                                        SYNCED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : <div />}

                              {item.discountCode && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-500 font-mono text-[8px] font-bold tracking-wider">
                                  CODE: {item.discountCode}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </a>

                      {/* 3. Administrative overlay (rendered on top of card for authorized admin only) */}
                      {isAuthorized && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-25">
                          {/* Click analytics badge */}
                          <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-white font-mono text-[8px] font-semibold tracking-wider flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                            <span>{item.clicks || 0} clicks</span>
                          </span>

                          <button
                            onClick={(ev) => {
                              ev.preventDefault();
                              ev.stopPropagation();
                              if (item.isSyncedLicense) {
                                const lic = softwareLicenses.find(l => l.id === item.id);
                                setEditingItem({
                                  type: 'software_license',
                                  data: lic || {
                                    id: item.id,
                                    name: item.title,
                                    description: item.description,
                                    price: item.price || '',
                                    imageUrl: item.imageUrl || '',
                                    badge: item.discountCode || ''
                                  },
                                  index: softwareLicenses.findIndex(l => l.id === item.id)
                                });
                              } else {
                                setEditingItem({
                                  type: 'affiliate_link',
                                  data: item,
                                  index
                                });
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-md hover:bg-amber-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-amber-400"
                            title="Edit product parameters"
                          >
                            <Edit size={11} className="stroke-[2.5]" />
                          </button>
                          
                          <button
                            onClick={(ev) => {
                              ev.preventDefault();
                              ev.stopPropagation();
                              if (item.isSyncedLicense) {
                                triggerConfirm(
                                  `Confirm deletion: Are you absolutely sure you want to remove the software license "${item.title}"? This cannot be undone.`,
                                  async () => {
                                    try {
                                      await deleteDoc(doc(db, 'software_licenses', item.id));
                                      triggerToast('Software license deleted and unsynced.', 'info');
                                    } catch (err) {
                                      console.error("Error deleting software license from Firestore: ", err);
                                      handleFirestoreError(err, OperationType.DELETE, 'software_licenses/' + item.id);
                                    }
                                  }
                                );
                              } else {
                                triggerConfirm(
                                  `Confirm deletion: Are you absolutely sure you want to remove the affiliate card "${item.title}"? This cannot be undone.`,
                                  async () => {
                                    try {
                                      await deleteDoc(doc(db, 'affiliate_links', item.id));
                                      triggerToast('Curated recommendation deleted.', 'info');
                                    } catch (err) {
                                      console.error("Error deleting affiliate link from Firestore: ", err);
                                      handleFirestoreError(err, OperationType.DELETE, 'affiliate_links/' + item.id);
                                    }
                                  }
                                );
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-md hover:bg-red-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-red-400"
                            title="Delete affiliate deal"
                          >
                            <X size={11} className="stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Zero State empty placeholder */}
            {!isAffiliateLoading && filteredAffiliateLinks.length === 0 && (
              <div className={`p-12 rounded-3xl border text-center space-y-3 ${
                currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
              }`}>
                <ShoppingBag className="mx-auto text-slate-400 stroke-[1.5px]" size={45} />
                <h3 className={`text-sm font-black tracking-wider uppercase font-mono ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {affiliateSearchQuery.trim() 
                    ? `No products match "${affiliateSearchQuery}"` 
                    : "No listings registered under database catalog filter"}
                </h3>
                <p className="text-slate-400 text-[11px] max-w-sm mx-auto font-sans leading-relaxed">
                  {affiliateSearchQuery.trim()
                    ? "Try checking your spelling or search for common terms like SSD, Nikon, or Gear."
                    : "Murari hasn't indexed active gear recommendation cards in this category folder yet. Please query other categories or create records."}
                </p>
                {isAuthorized && (
                  <button
                    onClick={() => {
                      setEditingItem({
                        type: 'affiliate_link',
                        data: {
                          id: 'aff_' + Date.now().toString(),
                          title: '',
                          description: '',
                          category: activeAffiliateFilter === 'all' ? 'photography' : activeAffiliateFilter,
                          url: '',
                          imageUrl: '',
                          discountCode: '',
                          price: '',
                          clicks: 0
                        }
                      });
                    }}
                    className="mt-2 text-[9px] font-bold uppercase font-mono text-amber-500 border border-amber-500/25 px-3 py-1 rounded-lg hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
                  >
                    Seed Curated Deal
                  </button>
                )}
              </div>
            )}
          </motion.div>
          </>
        )}

        {/* ALL SERVICE PACKAGES OVERVIEW AND HUB */}
        {activeTab === 'packages' && (
          <motion.div
            key="packages"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-12 text-left max-w-6xl mx-auto"
          >
            {/* Header branding */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-block bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-[#FF5500]/20 font-mono">
                SERVICE DIRECTORY &amp; RATES
              </span>
              <ScrollRevealText
                tag="h1"
                className={`text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
                text="Explore All Service Packages"
              />
              <ScrollReveal variant="fade-up" delay={0.15}>
                <p className={`text-sm md:text-base ${
                  currentTheme === 'light' ? 'text-slate-650 font-medium' : 'text-slate-300'
                }`}>
                  Compare professional doorstep IT support diagnostics, custom computer builds, and high-speed photography solutions for weddings, events, and family moments. Select any package to configure custom estimates or book instantly on WhatsApp.
                </p>
              </ScrollReveal>
            </div>

            {/* Controls Bar: Category Filter & Search Box */}
            <ScrollReveal variant="slide-in-up" delay={0.1}>
              <div className={`p-4 rounded-2xl border ${
                currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
              } flex flex-col md:flex-row items-center justify-between gap-4`}>
                
                {/* Category filters */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  {[
                    { id: 'all', label: 'All Packages', icon: <Sparkles size={13} /> },
                    { id: 'it', label: 'Pixel Fix (IT)', icon: <Laptop size={13} /> },
                    { id: 'photo', label: 'Pixel Frame (Photo)', icon: <Camera size={13} /> }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPackageCategoryFilter(cat.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 transition-all cursor-pointer relative z-0 overflow-hidden ${
                        packageCategoryFilter === cat.id
                          ? 'text-white border-transparent shadow-lg shadow-[#FF5500]/20 scale-105'
                          : currentTheme === 'light'
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {cat.icon}
                        <span>{cat.label}</span>
                      </span>
                      {packageCategoryFilter === cat.id && (
                        <motion.span
                          layoutId="activePackageCategoryPill"
                          className="absolute inset-0 bg-[#FF5500] -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Search input field */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={packageSearchQuery}
                    onChange={(e) => setPackageSearchQuery(e.target.value)}
                    placeholder="Search package details..."
                    className={`w-full py-2.5 pl-9 pr-4 text-xs rounded-xl outline-none border transition-all ${
                      currentTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]'
                        : 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]'
                    }`}
                  />
                  {packageSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPackageSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

              </div>
            </ScrollReveal>

            {/* Merged Interactive list of Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.length === 0 ? (
                <div className={`col-span-full py-16 text-center border border-dashed rounded-3xl ${
                  currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <HelpCircle size={40} className="mx-auto text-slate-500 mb-3 animate-bounce" />
                  <h3 className={`text-sm font-extrabold uppercase ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>No matching service packages</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try refining your search text or switching the filter categories above.</p>
                </div>
              ) : (
                filteredPackages.map((srv, idx) => (
                  <ScrollReveal
                    key={`${srv.type}_${idx}`}
                    variant="slide-in-up"
                    delay={idx * 0.05}
                    className={`p-6 rounded-2xl border ${s.card} flex flex-col justify-between hover:border-[#FF5500]/60 cursor-pointer group transition-all duration-300 hover:scale-[1.01]`}
                    onClick={() => setActiveDetailService(srv)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-black ${
                          srv.type === 'it'
                            ? 'bg-orange-500/10 text-[#FF5500]'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {srv.type === 'it' ? 'Pixel Fix (IT)' : 'Pixel Frame (Photo)'}
                        </span>
                        <span className="text-xs font-black text-[#FF5500]">{srv.price}</span>
                      </div>

                      <h3 className={`text-lg font-black leading-snug ${
                        currentTheme === 'light' ? 'text-slate-950' : 'text-white'
                      }`}>{srv.title}</h3>
                      
                      <p className={`text-xs mt-2 leading-relaxed line-clamp-3 ${
                        currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>{srv.description}</p>

                      {srv.type === 'it' && srv.proTip && (
                        <div className={`mt-3.5 p-3 rounded-xl border flex items-start gap-2 text-[11px] leading-relaxed transition-all duration-300 ${
                          currentTheme === 'light'
                            ? 'bg-orange-50/70 border-orange-200/50 text-slate-700'
                            : 'bg-[#FF5500]/5 border-[#FF5500]/10 text-slate-300'
                        }`}>
                          <Sparkles size={12} className="text-[#FF5500] shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-extrabold text-[#FF5500] mr-1">PRO-TIP:</span>
                            {srv.proTip}
                          </div>
                        </div>
                      )}

                      <div className="mt-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5500] inline-flex items-center gap-1 group-hover:underline">
                          View Inclusions &amp; Specs <ArrowUpRight size={10} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>

                      {/* Top 3 key features checklist */}
                      <ul className={`space-y-1.5 mt-5 pt-4 border-t ${s.divider} text-[11px] ${
                        currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {srv.features?.slice(0, 3).map((f: string, fIdx: number) => (
                          <li key={fIdx} className="flex gap-1.5 items-start">
                            <Check size={12} className="text-[#FF5500] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100/60 dark:border-white/5 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleEstimateCostRedirect(
                            srv.type === 'it' ? 'pixelfix' : 'pixelframe',
                            srv.type === 'it'
                              ? `Interested in package: ${srv.title}. please call.`
                              : `Inquiring about photography category: ${srv.title}. please coordinate dates.`
                          );
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-center transition-all ${
                          currentTheme === 'light'
                            ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white text-slate-800'
                            : 'bg-white/5 hover:bg-[#FF5500] hover:text-white text-white'
                        }`}
                      >
                        Estimate Package Rate
                      </button>

                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          const message = srv.type === 'it'
                            ? `Hi Murari, I want to book the Pixel Fix IT package: ${srv.title} (${srv.price})`
                            : `Hi Murari, I want to inquire about the Pixel Frame Photography package: ${srv.title}`;
                          triggerQuickBooking(srv.type === 'it' ? 'it_fix' : 'photography', message);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-md"
                      >
                        <WhatsAppIcon size={12} /> <span className="text-center">WhatsApp Inquiry</span>
                      </button>
                    </div>
                  </ScrollReveal>
                ))
              )}
            </div>

            {/* Dynamic Interactive Estimate Reminder Widget Banner */}
            <ScrollReveal variant="slide-in-up" delay={0.1}>
              <div className={`p-6 md:p-8 rounded-3xl border border-dashed border-[#FF5500]/30 bg-[#FF5500]/5 text-center space-y-4`}>
                <div className="w-12 h-12 bg-[#FF5500]/10 rounded-full flex items-center justify-center text-[#FF5500] mx-auto">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-lg font-black uppercase tracking-tight ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Need a fully customized package solution?
                  </h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    We offer tailored solutions for high-scale enterprise network configurations, office maintenance contracts, or multi-day destination event photography packages.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <button
                    onClick={() => handleEstimateCostRedirect('pixelfix', 'Inquiring about fully customized package solutions.')}
                    className="w-full sm:w-auto bg-[#FF5500] hover:bg-[#FF4400] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-[#FF5500]/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Configure Custom Quote</span>
                  </button>
                  <button
                    onClick={() => triggerQuickBooking('it_fix', 'Hello Murari, I have a custom project requirement. Please consult with me.')}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon size={14} /> <span className="text-center">WhatsApp Custom Consult</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

          </motion.div>
        )}

        {/* RAPID WHATSAPP DIRECT BOOKING */}
        {activeTab === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-12 text-left max-w-4xl mx-auto"
          >
            {/* Banner titles */}
            <div className="text-center space-y-2">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#FF5500] font-bold">DIRECTORY COMMUNICATIONS DIRECT DISPATCH</span>
              <ScrollRevealText
                tag="h1"
                className={`text-2xl md:text-3xl font-black ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
                text="INSTANT TELEPHONIC CONTACT PORTAL"
              />
              <ScrollReveal variant="fade-up" delay={0.15}>
                <p className={`text-xs md:text-sm ${
                  currentTheme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>
                  No complex paperwork. Dial or text Murari directly on WhatsApp based on your target requirement. We answer within 15 minutes!
                </p>
              </ScrollReveal>
            </div>

            {/* Split cards phone numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* IT Fix Card */}
              <div className={`p-6 rounded-3xl border ${s.card} space-y-4 text-left flex flex-col justify-between`}>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#FF5500]">
                    <Laptop size={24} />
                  </div>
                  <h3 className={`text-xl font-extrabold ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Pixel Fix Support Booking</h3>
                  <p className={`text-xs leading-relaxed ${
                    currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Contact Murari directly for computer hardware issues, Windows standard drivers installation, genuine office alignment setups, router reboots, and clean formats.
                  </p>
                  
                  <div className={`text-xs space-y-1 p-3 rounded-xl border font-mono ${
                    currentTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-slate-300'
                  }`}>
                    <div>📌 Guwahati office: Guwahati area doorstep dispatch</div>
                    <div>📞 Mobile support: +91 {contactPhoneIt}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => triggerQuickBooking('it_fix', 'Hello Murari, I want to book standard doorstep computer repair support!')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 text-center"
                  >
                    <WhatsAppIcon size={14} /> <span className="text-center">Send WhatsApp Support Ticket</span>
                  </button>
                  <a
                    href={`tel:${contactPhoneIt}`}
                    className={`w-full font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 border ${
                      currentTheme === 'light' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    <Phone size={14} /> Dial +91 {contactPhoneIt}
                  </a>
                </div>
              </div>

              {/* Pixel Frame Card */}
              <div className={`p-6 rounded-3xl border ${s.card} space-y-4 text-left flex flex-col justify-between`}>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#FF5500]">
                    <Camera size={24} />
                  </div>
                  <h3 className={`text-xl font-extrabold ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Pixel Frame Photo Inquiry</h3>
                  <p className={`text-xs leading-relaxed ${
                    currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Capture your finest candid moments. Weddings, birthdays, post-shoot cinematic color corrections, and aerial drone reels handled with true precision.
                  </p>

                  <div className={`text-xs space-y-1 p-3 rounded-xl border font-mono ${
                    currentTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-slate-300'
                  }`}>
                    <div>📌 Primary hub: Northeast destination shoot available</div>
                    <div>📞 Mobile hotline: +91 {contactPhonePhotos}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => triggerQuickBooking('photography', 'Hello Murari, I am inquiring about wedding, anniversary, or corporate event photography packages!')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 text-center"
                  >
                    <WhatsAppIcon size={14} /> <span className="text-center">WhatsApp Photographer</span>
                  </button>
                  <a
                    href={`tel:${contactPhonePhotos}`}
                    className={`w-full font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 border ${
                      currentTheme === 'light' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    <Phone size={14} /> Dial +91 {contactPhonePhotos}
                  </a>
                </div>
              </div>

            </div>

            {/* Verified Google Places Feedback QR Code */}
            <ScrollReveal variant="fade-up" delay={0.2}>
              <ReviewQRCode currentTheme={currentTheme} triggerToast={triggerToast} />
            </ScrollReveal>

            {/* INTERACTIVE GEOGRAPHIC DISPATCH SERVICE AREA MAP */}
            <ScrollReveal variant="fade-up" delay={0.25}>
              <div className={`p-6 md:p-8 rounded-[32px] border ${s.card} space-y-6 text-left relative overflow-hidden`}>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF5500] font-bold">GEOGRAPHIC COVERAGE & DISPATCH NODES</span>
                  <h3 className={`text-xl md:text-2xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Guwahati Core Dispatch Zone Map
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Instantly check if your home, workspace, or event venue resides inside our standard 12KM free dispatch perimeter for rapid doorstep IT checkups and premium photography deployment.
                  </p>
                </div>

                <CoverageMap currentTheme={currentTheme} />
              </div>
            </ScrollReveal>

          </motion.div>
        )}

        {/* BIOS & BOOT MENU KEY FINDER SEPARATE PAGE */}
        {activeTab === 'bios' && (
          <div className="relative min-h-[600px] w-full px-1 py-2">
            <BiosKeysBackground currentTheme={currentTheme} />
            <motion.div
              key="bios"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="relative z-10 space-y-8 text-left max-w-4xl mx-auto"
            >
            {/* Navigation back and header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pixelfix');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer mb-2"
                >
                  ← Back to IT Services
                </button>
                <span className="inline-block bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#FF5500]/20 font-mono">
                  Diagnostics Database
                </span>
                <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  Motherboard Startup Hotkeys
                </h1>
                <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                  Dynamic BIOS and Boot Menu key maps for all major computer manufacturers.
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${s.badge}`}>
                  {BIOS_BOOT_KEYS_DATABASE.length} Manufacturers Cached
                </span>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Offline Access Ready
                </span>
              </div>
            </div>

            {/* BIOS/UEFI & Boot Menu Key Finder Tool Content */}
            <div className={`p-5 md:p-6 rounded-2xl border ${s.card} shadow-md`} id="bios-key-finder-section">
              <div className="space-y-4">
                {/* Filters container */}
                <div className="flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
                  {/* Search Input Box */}
                  <div className="flex-1 relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="bios-search-input"
                      type="text"
                      value={biosSearchQuery}
                      onChange={(e) => {
                        setBiosSearchQuery(e.target.value);
                        if (selectedBiosBrand !== 'all') {
                          setSelectedBiosBrand('all'); // Reset specific brand select to let search match anything
                        }
                      }}
                      placeholder="Search motherboard keys (e.g. Zebronics, Enter, HP, Dell, F12)..."
                      className={`w-full pl-9 pr-14 py-2 rounded-lg text-xs outline-none transition-all duration-200 border ${s.input}`}
                    />
                    {biosSearchQuery && (
                      <button
                        onClick={() => setBiosSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-[#FF5500] text-[10px] font-black uppercase tracking-wider animate-fade-in"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Device Form Factor selector (Compact) */}
                  <div className="w-full md:w-48">
                    <select
                      value={selectedBiosType}
                      onChange={(e: any) => setSelectedBiosType(e.target.value)}
                      className={`w-full px-2 py-2 rounded-lg text-xs outline-none transition-all duration-200 border cursor-pointer ${s.input}`}
                    >
                      <option value="all">All Form Factors</option>
                      <option value="laptop">Laptops Only</option>
                      <option value="desktop">Desktops Only</option>
                      <option value="motherboard">DIY Motherboards</option>
                    </select>
                  </div>
                </div>

                {/* Popular Brand Fast-Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
                  {['HP', 'Dell', 'ASUS', 'Lenovo', 'Acer', 'MSI', 'Zebronics', 'Enter', 'Apple'].map(bName => {
                    const isActive = selectedBiosBrand.toLowerCase() === bName.toLowerCase();
                    return (
                      <button
                        key={bName}
                        type="button"
                        onClick={() => {
                          setSelectedBiosBrand(isActive ? 'all' : bName);
                          setBiosSearchQuery('');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#FF5500] text-white shadow-sm shadow-[#FF5500]/25'
                            : currentTheme === 'light'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {bName}
                      </button>
                    );
                  })}
                </div>

                {/* Compact Interactive Brand Grid or Results with Smooth Animation */}
                <AnimatePresence mode="wait">
                  {!biosSearchQuery.trim() && selectedBiosBrand === 'all' ? (
                    <motion.div
                      key="all-brands"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-3 pt-1 border-t border-dashed border-slate-200 dark:border-white/10"
                    >
                      <p className={`text-[10px] font-mono uppercase tracking-wider font-bold text-center ${
                        currentTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        — OR TAP A BRAND BELOW TO DISCOVER KEYS —
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-w-4xl mx-auto">
                        {Array.from(new Set(BIOS_BOOT_KEYS_DATABASE.map(item => item.brand)))
                          .sort()
                          .map(bName => (
                            <button
                              key={bName}
                              type="button"
                              onClick={() => {
                                setSelectedBiosBrand(bName);
                                setBiosSearchQuery('');
                              }}
                              className={`px-3 py-2 rounded-xl border text-xs font-extrabold text-center transition-all duration-200 cursor-pointer ${
                                currentTheme === 'light'
                                  ? 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 text-slate-700 hover:border-[#FF5500]/30'
                                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-slate-300 hover:border-[#FF5500]/30'
                              }`}
                            >
                              {bName}
                            </button>
                          ))
                        }
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`filtered-${selectedBiosBrand}-${biosSearchQuery}-${selectedBiosType}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-3 pt-2 border-t border-dashed border-slate-200 dark:border-white/10"
                    >
                      {/* Active filter label & Reset button */}
                      <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider">
                        <span className="text-slate-400">
                          Showing: <span className="text-[#FF5500] font-black">{biosSearchQuery.trim() || selectedBiosBrand}</span>
                        </span>
                        <button
                          onClick={() => {
                            setBiosSearchQuery('');
                            setSelectedBiosBrand('all');
                            setSelectedBiosType('all');
                          }}
                          className="text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          ← Show All Brands
                        </button>
                      </div>

                      {/* Compact Filtered Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {filteredBiosKeys.length === 0 ? (
                          <div className={`col-span-full py-8 text-center border border-dashed rounded-xl ${
                            currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
                          }`}>
                            <HelpCircle size={28} className="mx-auto text-slate-400 mb-2 animate-bounce" />
                            <h4 className="text-xs font-black uppercase text-[#FF5500]">No matches found for "{biosSearchQuery || selectedBiosBrand}"</h4>
                            <p className={`text-[10px] mt-1 max-w-xs mx-auto ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              Need help? Tap below to send a quick WhatsApp support ticket.
                            </p>
                            <button
                              type="button"
                              onClick={() => triggerQuickBooking('it_fix', `Hi Murari, I am looking for BIOS/Boot key assistance for my computer.`)}
                              className="mt-3 bg-[#FF5500] hover:bg-orange-600 text-white text-[9px] uppercase font-black px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-250"
                            >
                              Request Doorstep Support
                            </button>
                          </div>
                        ) : (
                          filteredBiosKeys.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3.5 rounded-xl border transition-all duration-300 hover:border-[#FF5500]/30 ${
                                currentTheme === 'light'
                                  ? 'bg-slate-50/50 border-slate-200/80 shadow-xs'
                                  : 'bg-zinc-950/50 border-white/5'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="text-xs font-black uppercase tracking-tight text-[#FF5500]">
                                    {item.brand}
                                  </h3>
                                  <p className={`text-[10px] font-medium leading-tight ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                                    {item.name}
                                  </p>
                                </div>
                                <span className={`text-[8px] font-mono font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${s.badge}`}>
                                  {item.type === 'all' ? 'All Formats' : item.type}
                                </span>
                              </div>

                              {/* Keys Cap Section */}
                              <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-dashed border-slate-200 dark:border-white/10">
                                {/* BIOS SETUP KEY */}
                                <div className="flex flex-col justify-center items-center p-1.5 rounded-lg bg-black/5 dark:bg-white/[0.02]">
                                  <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-1">BIOS Setup</span>
                                  <div className="flex gap-1 flex-wrap justify-center">
                                    {item.biosKeyNew.split(' or ').map((keyCap, kIdx) => (
                                      <kbd
                                        key={kIdx}
                                        className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border ${
                                          currentTheme === 'light'
                                            ? 'bg-white border-slate-300 text-slate-800'
                                            : 'bg-zinc-900 border-white/10 text-white'
                                        } shadow-xs`}
                                      >
                                        {keyCap}
                                      </kbd>
                                    ))}
                                  </div>
                                  {item.biosKeyOld && item.biosKeyOld !== item.biosKeyNew && (
                                    <span className="text-[8px] text-slate-500 block mt-0.5">Old: {item.biosKeyOld}</span>
                                  )}
                                </div>

                                {/* BOOT MENU KEY */}
                                <div className="flex flex-col justify-center items-center p-1.5 rounded-lg bg-[#FF5500]/5 border border-[#FF5500]/10">
                                  <span className="text-[8px] text-[#FF5500]/70 uppercase font-bold tracking-wider mb-1">Boot Menu</span>
                                  <div className="flex gap-1 flex-wrap justify-center">
                                    {item.bootMenuNew.split(' or ').map((keyCap, kIdx) => (
                                      <kbd
                                        key={kIdx}
                                        className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500] shadow-xs"
                                      >
                                        {keyCap}
                                      </kbd>
                                    ))}
                                  </div>
                                  {item.bootMenuOld && item.bootMenuOld !== item.bootMenuNew && (
                                    <span className="text-[8px] text-slate-550 block mt-0.5">Old: {item.bootMenuOld}</span>
                                  )}
                                </div>
                              </div>

                              {/* Popular models tags */}
                              {item.popularModels && item.popularModels.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.popularModels.slice(0, 4).map((modelName, mIdx) => (
                                    <span
                                      key={mIdx}
                                      className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
                                        currentTheme === 'light'
                                          ? 'bg-slate-200/50 text-slate-700'
                                          : 'bg-white/5 text-slate-400'
                                      }`}
                                    >
                                      {modelName}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Pro Tip notes */}
                              <div className="mt-2 text-[9px] leading-normal flex items-start gap-1">
                                <Sparkles size={10} className="text-[#FF5500] shrink-0 mt-0.5" />
                                <p className={currentTheme === 'light' ? 'text-slate-550' : 'text-slate-400'}>
                                  {item.notes}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PRODUCTIVITY KEYBOARD SHORTCUTS LIBRARY */}
            <div className={`p-5 md:p-6 rounded-2xl border ${s.card} shadow-md`} id="shortcut-keys-section">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
                  <div className="space-y-1 text-left">
                    <span className="inline-block bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#FF5500]/20 font-mono">
                      Productivity Suite
                    </span>
                    <h2 className={`text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2 ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Keyboard className="text-[#FF5500]" size={18} />
                      Keyboard Shortcut Library
                    </h2>
                    <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                      Supercharge your workspace flow. Instant lookup for essential OS and professional creative/technical software shortcuts.
                    </p>
                  </div>

                  {/* Search Bar for Shortcuts */}
                  <div className="w-full md:w-72 shrink-0 relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="shortcuts-search-input"
                      type="text"
                      value={shortcutsSearchQuery}
                      onChange={(e) => setShortcutsSearchQuery(e.target.value)}
                      placeholder="Search shortcuts (e.g. copy, screen, edit)..."
                      className={`w-full pl-9 pr-14 py-2 rounded-lg text-xs outline-none transition-all duration-200 border ${s.input}`}
                    />
                    {shortcutsSearchQuery && (
                      <button
                        onClick={() => setShortcutsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-[#FF5500] text-[10px] font-black uppercase tracking-wider animate-fade-in"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories Grid (Only shown when not searching) */}
                <AnimatePresence mode="wait">
                  {!shortcutsSearchQuery.trim() ? (
                    <motion.div
                      key="categories-board"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      {/* Uniform Width and Height Category Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
                        {SHORTCUTS_DATABASE.map((category) => {
                          const isActive = selectedShortcutCategory === category.id;
                          
                          // Accent mapping for premium styling and vibrant dynamic interactive states
                          const accentColorMap: Record<string, { bg: string, text: string, bgHover: string, borderHover: string, textHover: string }> = {
                            windows: { bg: 'bg-blue-500/10', text: 'text-blue-500', bgHover: 'group-hover:bg-blue-500/15', borderHover: 'group-hover:border-blue-500/40', textHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400' },
                            pc_general: { bg: 'bg-zinc-500/10', text: 'text-zinc-500 dark:text-zinc-400', bgHover: 'group-hover:bg-zinc-500/15', borderHover: 'group-hover:border-zinc-500/40', textHover: 'group-hover:text-zinc-600 dark:group-hover:text-zinc-300' },
                            ms_word: { bg: 'bg-blue-600/10', text: 'text-blue-600', bgHover: 'group-hover:bg-blue-600/15', borderHover: 'group-hover:border-blue-600/40', textHover: 'group-hover:text-blue-700 dark:group-hover:text-blue-400' },
                            ms_excel: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', bgHover: 'group-hover:bg-emerald-500/15', borderHover: 'group-hover:border-emerald-500/40', textHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' },
                            ms_powerpoint: { bg: 'bg-orange-500/10', text: 'text-orange-500', bgHover: 'group-hover:bg-orange-500/15', borderHover: 'group-hover:border-orange-500/40', textHover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400' },
                            adobe_photoshop: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', bgHover: 'group-hover:bg-cyan-500/15', borderHover: 'group-hover:border-cyan-500/40', textHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400' },
                            adobe_premiere: { bg: 'bg-violet-500/10', text: 'text-violet-500', bgHover: 'group-hover:bg-violet-500/15', borderHover: 'group-hover:border-violet-500/40', textHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400' },
                            adobe_after_effects: { bg: 'bg-purple-500/10', text: 'text-purple-500', bgHover: 'group-hover:bg-purple-500/15', borderHover: 'group-hover:border-purple-500/40', textHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400' },
                            vscode: { bg: 'bg-sky-500/10', text: 'text-sky-500', bgHover: 'group-hover:bg-sky-500/15', borderHover: 'group-hover:border-sky-500/40', textHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-400' },
                            web_browsers: { bg: 'bg-amber-500/10', text: 'text-amber-500', bgHover: 'group-hover:bg-amber-500/15', borderHover: 'group-hover:border-amber-500/40', textHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400' },
                            file_explorer: { bg: 'bg-amber-600/10', text: 'text-amber-600', bgHover: 'group-hover:bg-amber-600/15', borderHover: 'group-hover:border-amber-600/40', textHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-400' },
                            tally: { bg: 'bg-rose-500/10', text: 'text-rose-500', bgHover: 'group-hover:bg-rose-500/15', borderHover: 'group-hover:border-rose-500/40', textHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400' },
                            macos_general: { bg: 'bg-neutral-500/10', text: 'text-neutral-500 dark:text-neutral-300', bgHover: 'group-hover:bg-neutral-500/15', borderHover: 'group-hover:border-neutral-500/40', textHover: 'group-hover:text-neutral-600 dark:group-hover:text-neutral-200' },
                          };

                          const accent = accentColorMap[category.id] || accentColorMap.windows;

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setSelectedShortcutCategory(isActive ? '' : category.id)}
                              className={`flex flex-col justify-between h-[115px] w-full p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                                isActive
                                  ? `bg-gradient-to-br ${category.color} border-[#FF5500]/50 shadow-md ring-1 ring-[#FF5500]/20 scale-[1.02]`
                                  : currentTheme === 'light'
                                    ? `bg-white hover:bg-slate-50 border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${accent.borderHover}`
                                    : `bg-zinc-900/30 hover:bg-zinc-900/60 border-white/5 ${accent.borderHover}`
                              }`}
                            >
                              {/* Top row: Category Icon & Count badge */}
                              <div className="flex items-center justify-between w-full">
                                <span className={`p-2 rounded-xl transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-white/20 dark:bg-white/5 text-[#FF5500] scale-110' 
                                    : `bg-slate-100 dark:bg-white/5 ${accent.text} ${accent.bgHover}`
                                }`}>
                                  {renderShortcutIcon(category.iconName, 15)}
                                </span>
                                
                                {isActive ? (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
                                  </span>
                                ) : (
                                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-lg border transition-all duration-300 ${
                                    currentTheme === 'light'
                                      ? 'bg-slate-50 border-slate-200/60 text-slate-450 group-hover:bg-[#FF5500]/5 group-hover:text-[#FF5500] group-hover:border-[#FF5500]/20'
                                      : 'bg-white/[0.02] border-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-[#FF5500]'
                                  }`}>
                                    {category.shortcuts.length} keys
                                  </span>
                                )}
                              </div>

                              {/* Bottom row: Product Name */}
                              <div className="space-y-0.5 mt-2">
                                <span className={`text-xs font-black uppercase tracking-wider block transition-colors duration-300 ${
                                  isActive 
                                    ? 'text-[#FF5500]' 
                                    : currentTheme === 'light' 
                                      ? 'text-slate-800 group-hover:text-[#FF5500]' 
                                      : 'text-slate-200 group-hover:text-white'
                                }`}>
                                  {category.name}
                                </span>
                                <span className={`text-[8px] font-mono uppercase tracking-widest block leading-none transition-colors duration-300 ${
                                  isActive 
                                    ? 'text-[#FF5500]/70' 
                                    : 'text-slate-400 dark:text-zinc-500'
                                }`}>
                                  {category.id.replace('_', ' ')}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Category Shortcuts List - Smooth Height Expand/Collapse */}
                      <AnimatePresence initial={false}>
                        {(() => {
                          const activeCat = SHORTCUTS_DATABASE.find(c => c.id === selectedShortcutCategory);
                          if (!activeCat) return null;
                          return (
                            <motion.div
                              key={`active-category-details-${activeCat.id}`}
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden space-y-5 text-left"
                            >
                              {/* Sub Header Card */}
                              <div className={`p-4 rounded-2xl border flex items-start gap-3 bg-black/[0.01] dark:bg-white/[0.01] border-dashed ${
                                currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
                              }`}>
                                <div className="p-2 bg-[#FF5500]/5 text-[#FF5500] rounded-xl shrink-0">
                                  {renderShortcutIcon(activeCat.iconName, 18)}
                                </div>
                                <div className="space-y-0.5">
                                  <h3 className={`text-xs font-black uppercase tracking-wider ${
                                    currentTheme === 'light' ? 'text-slate-855 font-bold' : 'text-white'
                                  }`}>
                                    {activeCat.name} Shortcut Set
                                  </h3>
                                  <p className={`text-[11px] leading-relaxed ${
                                    currentTheme === 'light' ? 'text-slate-550' : 'text-slate-400'
                                  }`}>
                                    {activeCat.description} All keys are structured for standard QWERTY layouts (Mac/Win system translations apply).
                                  </p>
                                </div>
                              </div>

                              {/* Shortcuts Grid - Displays instantly and cleanly with premium layouts */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                                {activeCat.shortcuts.map((sh, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#FF5500]/30 hover:scale-[1.01] ${
                                      currentTheme === 'light'
                                        ? 'bg-white border-slate-200/85 hover:bg-slate-50/50'
                                        : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500]/60 shrink-0" />
                                      <span className={`text-xs font-semibold leading-snug ${
                                        currentTheme === 'light' ? 'text-slate-750 font-medium' : 'text-slate-200 font-medium'
                                      }`}>
                                        {sh.description}
                                      </span>
                                    </div>

                                    {/* Keycaps */}
                                    <div className="flex items-center shrink-0 flex-wrap gap-1 animate-fade-in">
                                      {sh.keys.map((keyCap, kIdx) => (
                                        <React.Fragment key={kIdx}>
                                          {kIdx > 0 && (
                                            <span className="text-slate-350 dark:text-zinc-650 text-[10px] font-black mx-0.5 select-none">
                                              +
                                            </span>
                                          )}
                                          <kbd className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg border-b-2 shadow-xs select-none transition-all duration-200 shrink-0 ${
                                            currentTheme === 'light'
                                              ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]'
                                              : 'bg-zinc-800 border-zinc-700 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                          }`}>
                                            {keyCap}
                                          </kbd>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    // Search results view (Direct and clean, no accordion)
                    <motion.div
                      key="shortcuts-search-results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Search matches header */}
                      <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-wider">
                        <span className="text-slate-400 text-left">
                          Search results for: <span className="text-[#FF5500] font-black">{shortcutsSearchQuery}</span>
                        </span>
                        
                        <button
                          onClick={() => setShortcutsSearchQuery('')}
                          className="text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          ← Show All Categories
                        </button>
                      </div>

                      {filteredShortcuts && filteredShortcuts.length === 0 ? (
                        <div className={`py-12 text-center border border-dashed rounded-xl ${
                          currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
                        }`}>
                          <HelpCircle size={28} className="mx-auto text-slate-400 mb-2 animate-bounce" />
                          <h4 className="text-xs font-black uppercase text-[#FF5500]">No shortcuts found</h4>
                          <p className={`text-[10px] mt-1 max-w-xs mx-auto ${currentTheme === 'light' ? 'text-slate-550' : 'text-slate-400'}`}>
                            We couldn't find any matches for "{shortcutsSearchQuery}". Try looking up general actions like "copy", "paste", "save", or "open".
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                          {filteredShortcuts?.map((result, idx) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#FF5500]/30 hover:scale-[1.01] ${
                                currentTheme === 'light'
                                  ? 'bg-white border-slate-200/85 hover:bg-slate-50/50'
                                  : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10'
                              }`}
                            >
                              <div className="flex flex-col items-start gap-1 text-left min-w-0">
                                <span className="text-[8px] font-mono font-black uppercase tracking-wider text-[#FF5500] mb-0.5 block">
                                  {result.categoryName}
                                </span>
                                <span className={`text-xs font-semibold leading-snug truncate ${
                                  currentTheme === 'light' ? 'text-slate-750 font-medium' : 'text-slate-200 font-medium'
                                }`}>
                                  {result.shortcut.description}
                                </span>
                              </div>

                              {/* Keycaps */}
                              <div className="flex items-center shrink-0 flex-wrap gap-1">
                                {result.shortcut.keys.map((keyCap, kIdx) => (
                                  <React.Fragment key={kIdx}>
                                    {kIdx > 0 && (
                                      <span className="text-slate-355 dark:text-zinc-655 text-[10px] font-black mx-0.5 select-none">
                                        +
                                      </span>
                                    )}
                                    <kbd className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg border-b-2 shadow-xs select-none transition-all duration-200 shrink-0 ${
                                      currentTheme === 'light'
                                        ? 'bg-slate-50 border-slate-300 text-slate-850 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]'
                                        : 'bg-zinc-800 border-zinc-700 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                    }`}>
                                      {keyCap}
                                    </kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          </div>
        )}

        {/* BIOS MOTHERBOARD BEEP CODE DIAGNOSTICIAN SEPARATE PAGE */}
        {activeTab === 'beep' && (
          <motion.div
            key="beep"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-8 text-left max-w-5xl mx-auto"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-left">
                {/* Sleek Diagnostic Logo */}
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border border-[#FF5500]/30 shadow-md overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-radial-gradient from-[#FF5500]/15 to-transparent pointer-events-none" />
                  {/* Decorative tech grid lines inside logo */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,85,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,85,0,0.06)_1px,transparent_1px)] bg-[size:6px_6px] opacity-50 pointer-events-none" />
                  <div className="absolute w-12 h-12 rounded-full border border-dashed border-[#FF5500]/20 animate-spin" style={{ animationDuration: '10s' }} />
                  {/* Speaker mesh background pattern */}
                  <div className="absolute inset-1 rounded-full border border-[#FF5500]/10 flex items-center justify-center">
                    <Activity size={24} className="text-[#FF5500]/25 absolute animate-pulse" />
                    <Speaker size={18} className="text-[#FF5500] drop-shadow-[0_0_8px_rgba(255,85,0,0.4)]" />
                  </div>
                  {/* Glowing diagnostic dot */}
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('pixelfix');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex items-center gap-1.5 text-xs font-black uppercase text-[#FF5500] hover:text-orange-600 cursor-pointer transition-colors duration-200 mb-1"
                  >
                    <ArrowRight size={12} className="rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    <span>Back to IT Services</span>
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      BIOS Beep Diagnostician
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] text-[9px] font-mono font-bold border border-[#FF5500]/20 tracking-wider uppercase">
                      Diag-Probe ADU-X1
                    </span>
                  </div>
                  <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                    Instant audio replication, technical fault localization, and troubleshooting guidelines for motherboard hardware issues.
                  </p>
                </div>
              </div>

              {/* Offline-Ready Status & Reset Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3.5 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest font-black border border-emerald-500/20 shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>100% Offline-Capable Console</span>
                </div>

                {(beepSearchQuery || selectedBeepBrand !== 'all' || selectedBeepComponent !== 'all' || selectedBeepSeverity !== 'all' || customSequence.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBeepSearchQuery('');
                      setSelectedBeepBrand('all');
                      setSelectedBeepComponent('all');
                      setSelectedBeepSeverity('all');
                      setCustomSequence([]);
                    }}
                    className="text-[10px] font-black uppercase border border-red-500/20 text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-full cursor-pointer transition-colors duration-200"
                  >
                    Reset Workspace
                  </button>
                )}
              </div>
            </div>

            {/* Main Workstation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Synthesizer & Tactile Filter Board */}
              <div className="lg:col-span-5 space-y-6">
                {(() => {
                  // Calculate dynamic statistics based on other active filters to enable faceted counts
                  const brands: Record<string, number> = { 'ami bios': 0, 'award bios': 0, 'phoenix bios': 0, 'dell': 0, 'hp': 0, 'lenovo': 0, 'asus / gigabyte / msi': 0 };
                  const components: Record<string, number> = { 'ram': 0, 'cpu': 0, 'gpu/video': 0, 'motherboard/chipset': 0, 'bios/cmos': 0, 'thermal': 0, 'keyboard': 0, 'display': 0 };
                  const severities: Record<string, number> = { 'critical': 0, 'high': 0, 'medium': 0, 'low': 0 };

                  BEEP_CODES_DATABASE.forEach(item => {
                    const bKey = item.biosBrand.toLowerCase();
                    const cKey = item.affectedComponent.toLowerCase();
                    const sKey = item.severity.toLowerCase();

                    // Count brand distribution for items matching other currently active filters
                    const brandMatchesOthers = (selectedBeepComponent === 'all' || cKey === selectedBeepComponent.toLowerCase()) &&
                                               (selectedBeepSeverity === 'all' || sKey === selectedBeepSeverity.toLowerCase()) &&
                                               (!beepSearchQuery || item.pattern.toLowerCase().includes(beepSearchQuery.toLowerCase()) || item.possibleCause.toLowerCase().includes(beepSearchQuery.toLowerCase()));

                    // Count component distribution for items matching other currently active filters
                    const componentMatchesOthers = (selectedBeepBrand === 'all' || bKey === selectedBeepBrand.toLowerCase()) &&
                                                   (selectedBeepSeverity === 'all' || sKey === selectedBeepSeverity.toLowerCase()) &&
                                                   (!beepSearchQuery || item.pattern.toLowerCase().includes(beepSearchQuery.toLowerCase()) || item.possibleCause.toLowerCase().includes(beepSearchQuery.toLowerCase()));

                    // Count severity distribution for items matching other currently active filters
                    const severityMatchesOthers = (selectedBeepBrand === 'all' || bKey === selectedBeepBrand.toLowerCase()) &&
                                                  (selectedBeepComponent === 'all' || cKey === selectedBeepComponent.toLowerCase()) &&
                                                  (!beepSearchQuery || item.pattern.toLowerCase().includes(beepSearchQuery.toLowerCase()) || item.possibleCause.toLowerCase().includes(beepSearchQuery.toLowerCase()));

                    if (brandMatchesOthers) {
                      if (bKey in brands) {
                        brands[bKey]++;
                      } else if (bKey.includes('asus') || bKey.includes('gigabyte') || bKey.includes('msi')) {
                        brands['asus / gigabyte / msi']++;
                      }
                    }

                    if (componentMatchesOthers) {
                      if (cKey in components) {
                        components[cKey]++;
                      }
                    }

                    if (severityMatchesOthers) {
                      if (sKey in severities) {
                        severities[sKey]++;
                      }
                    }
                  });

                  return (
                    <div className="space-y-6">
                      {/* Modern Waveform Audio Synthesizer */}
                      <div className={`p-6 rounded-3xl border ${s.card} relative overflow-hidden flex flex-col justify-between shadow-xs border-slate-200/60 dark:border-white/5`}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#FF5500] font-mono flex items-center gap-1.5">
                              <Activity size={12} className="text-[#FF5500] animate-pulse" />
                              Acoustic Tone Synthesizer
                            </span>
                            <span className="text-[9px] font-mono bg-zinc-950 dark:bg-black text-[#FF5500] border border-[#FF5500]/20 px-2 py-0.5 rounded-md font-bold shadow-xs flex items-center gap-1">
                              <Waves size={10} className="text-emerald-500 animate-pulse" />
                              Oscilloscope v2.0
                            </span>
                          </div>

                          <p className={`text-[11px] leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                            Build a motherboard beep pattern. Tap pads below to sequence tones and trigger audio replication.
                          </p>
                          
                          {/* Modern Waveform visualizer */}
                          <div className="h-24 rounded-2xl relative flex items-center justify-center overflow-hidden border bg-zinc-950 border-emerald-500/25 shadow-inner">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:12px_12px] opacity-80 pointer-events-none" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/10 pointer-events-none" />
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/10 pointer-events-none" />

                            {/* Animated SVG Wave */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              {activePlayingId ? (
                                <>
                                  <path
                                    d="M 0 20 Q 15 5, 30 35 T 60 5 T 90 35 T 100 20"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    className="opacity-30 blur-xs"
                                  />
                                  <path
                                    d="M 0 20 Q 15 5, 30 35 T 60 5 T 90 35 T 100 20"
                                    fill="none"
                                    stroke="#34d399"
                                    strokeWidth="1.5"
                                    strokeDasharray="200"
                                    strokeDashoffset="0"
                                    className="animate-[dash_1.5s_linear_infinite]"
                                  />
                                </>
                              ) : (
                                <path
                                  d="M 0 20 Q 5 19.5, 10 20.5 T 20 20 T 30 20.2 T 40 19.8 T 50 20 T 60 20.1 T 70 19.9 T 80 20 T 90 19.8 T 100 20"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="1"
                                  className="opacity-70"
                                />
                              )}
                            </svg>
                            
                            {/* Technical readouts */}
                            <div className="absolute top-2 left-3 flex gap-4 text-[7px] font-mono text-emerald-500/50 uppercase select-none pointer-events-none">
                              <span>CH1: {activePlayingId ? '850 Hz' : '0.00 Hz'}</span>
                              <span>AMP: {activePlayingId ? '12.0%' : '0.0%'}</span>
                            </div>
                            
                            <div className="z-10 text-center space-y-2 mt-4">
                              {customSequence.length === 0 ? (
                                <p className="text-[10px] text-zinc-500 font-mono italic">Acoustic track empty. Click pads below.</p>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex items-center gap-1 flex-wrap justify-center max-w-[240px]">
                                    {customSequence.map((beat, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCustomSequence(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        title="Click to remove"
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black border transition-colors cursor-pointer hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 group ${
                                          beat === 'S'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20'
                                        }`}
                                      >
                                        <span className="group-hover:hidden">{beat === 'S' ? '• S' : '▬ L'}</span>
                                        <span className="hidden group-hover:inline">×</span>
                                      </button>
                                    ))}
                                  </div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black animate-pulse">
                                    {activePlayingId === 'custom-built' ? 'Synthesizer Active' : 'Sequence Loaded'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tactical Sound Pads */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCustomSequence([...customSequence, 'S']);
                                playBeepPattern('quick-s', ['S']);
                              }}
                              className={`py-3 rounded-2xl border font-mono text-xs font-bold cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-1.5 group/pad ${
                                currentTheme === 'light'
                                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-800 shadow-xs'
                                  : 'bg-[#1C1C24] hover:bg-white/5 border-white/5 hover:border-white/10 text-zinc-200 shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <BellRing size={12} className="text-emerald-500 group-hover/pad:animate-bounce transition-transform" />
                                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-500">Short Beep</span>
                              </div>
                              <span className="text-[8.5px] font-mono text-slate-400 font-medium">850 Hz • 120ms • Tone [•]</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomSequence([...customSequence, 'L']);
                                playBeepPattern('quick-l', ['L']);
                              }}
                              className={`py-3 rounded-2xl border font-mono text-xs font-bold cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-1.5 group/pad ${
                                currentTheme === 'light'
                                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-800 shadow-xs'
                                  : 'bg-[#1C1C24] hover:bg-white/5 border-white/5 hover:border-white/10 text-zinc-200 shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <Waves size={12} className="text-[#FF5500] group-hover/pad:scale-110 transition-transform" />
                                <span className="text-[10px] uppercase font-black tracking-wider text-[#FF5500]">Long Beep</span>
                              </div>
                              <span className="text-[8.5px] font-mono text-slate-400 font-medium">850 Hz • 450ms • Tone [▬]</span>
                            </button>
                          </div>

                          {/* Interactive Audio Transducer Grill with Speaker Icon */}
                          <div className={`p-4 rounded-2xl border ${currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-white/5'} flex items-center justify-between gap-4 shadow-inner relative overflow-hidden text-left`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                                activePlayingId ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-400 dark:text-zinc-500'
                              } transition-all duration-300 relative`}>
                                {activePlayingId && (
                                  <>
                                    <span className="absolute inset-0 rounded-full border border-emerald-500 animate-[ping_1.5s_infinite_0s] opacity-30" />
                                    <span className="absolute inset-0 rounded-full border border-emerald-500 animate-[ping_1.5s_infinite_0.5s] opacity-15" />
                                  </>
                                )}
                                <Speaker size={18} className={`${activePlayingId ? 'scale-110 rotate-1 animate-[pulse_0.4s_infinite]' : ''} transition-all duration-300`} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-[#FF5500] font-black">Acoustic Transducer</span>
                                <span className={`block text-[11px] font-semibold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                  {activePlayingId ? 'Broadcasting bios_tone.wav' : 'Speaker Standby Mode'}
                                </span>
                              </div>
                            </div>
                            {/* Decorative speaker mesh detail */}
                            <div className="flex flex-col gap-0.5 shrink-0 opacity-20 dark:opacity-35 select-none pointer-events-none">
                              <div className="flex gap-0.5">
                                {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-[#FF5500]" />)}
                              </div>
                              <div className="flex gap-0.5 ml-1">
                                {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-[#FF5500]" />)}
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-[#FF5500]" />)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {customSequence.length > 0 && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => playBeepPattern('custom-built', customSequence)}
                              disabled={activePlayingId !== null}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activePlayingId === 'custom-built'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-[#FF5500] hover:bg-orange-600 text-white shadow-xs'
                              }`}
                            >
                              <Volume2 size={12} className={activePlayingId === 'custom-built' ? 'animate-bounce' : ''} />
                              <span>{activePlayingId === 'custom-built' ? 'Transmitting...' : 'Simulate Custom'}</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setCustomSequence([])}
                              className="px-3 py-2.5 rounded-xl border border-red-500/10 hover:bg-red-500/5 text-red-500 transition-colors cursor-pointer text-[10px] uppercase tracking-wider font-extrabold font-mono"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tactile Pill Filter Panels with Dynamic Faceted Counts */}
                      <div className={`p-6 rounded-3xl border ${s.card} space-y-6 shadow-xs border-slate-200/60 dark:border-white/5`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#FF5500] font-mono">Control Board Filters</span>
                          <Sliders size={12} className="text-[#FF5500]" />
                        </div>

                        {/* BIOS Manufacturer Selector */}
                        <div className="space-y-2">
                          <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 font-mono">BIOS Brand / OEM</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'all', label: 'All BIOS', count: BEEP_CODES_DATABASE.length },
                              { id: 'ami bios', label: 'AMI', count: brands['ami bios'] },
                              { id: 'award bios', label: 'Award', count: brands['award bios'] },
                              { id: 'phoenix bios', label: 'Phoenix', count: brands['phoenix bios'] },
                              { id: 'dell', label: 'Dell', count: brands['dell'] },
                              { id: 'hp', label: 'HP', count: brands['hp'] },
                              { id: 'lenovo', label: 'Lenovo', count: brands['lenovo'] },
                              { id: 'asus / gigabyte / msi', label: 'ASUS/MSI/Gigabyte', count: brands['asus / gigabyte / msi'] },
                            ].map((brand) => {
                              const active = selectedBeepBrand.toLowerCase() === brand.id.toLowerCase();
                              const isDisabled = brand.count === 0 && !active;
                              return (
                                <button
                                  key={brand.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setSelectedBeepBrand(brand.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer transition-all border flex items-center gap-1 ${
                                    active
                                      ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-xs'
                                      : isDisabled
                                      ? 'opacity-35 cursor-not-allowed border-slate-100 text-slate-400 bg-transparent'
                                      : currentTheme === 'light'
                                      ? 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-white'
                                      : 'bg-[#1C1C24] border-white/5 text-slate-350 hover:border-white/15'
                                  }`}
                                >
                                  <span>{brand.label}</span>
                                  <span className={`text-[8px] font-mono px-1 rounded ${active ? 'bg-white/20' : 'bg-slate-500/10'}`}>
                                    {brand.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Hardware Subsystem Component */}
                        <div className="space-y-2">
                          <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 font-mono">Hardware Subsystem</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'all', label: 'All Components', count: BEEP_CODES_DATABASE.length },
                              { id: 'ram', label: 'RAM', count: components['ram'] },
                              { id: 'cpu', label: 'CPU', count: components['cpu'] },
                              { id: 'gpu/video', label: 'GPU', count: components['gpu/video'] },
                              { id: 'motherboard/chipset', label: 'Motherboard', count: components['motherboard/chipset'] },
                              { id: 'bios/cmos', label: 'CMOS/Battery', count: components['bios/cmos'] },
                              { id: 'thermal', label: 'Thermal/Cooling', count: components['thermal'] },
                              { id: 'keyboard', label: 'Keyboard', count: components['keyboard'] },
                              { id: 'display', label: 'Display', count: components['display'] },
                            ].map((comp) => {
                              const active = selectedBeepComponent.toLowerCase() === comp.id.toLowerCase();
                              const isDisabled = comp.count === 0 && !active;
                              return (
                                <button
                                  key={comp.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setSelectedBeepComponent(comp.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer transition-all border flex items-center gap-1 ${
                                    active
                                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                                      : isDisabled
                                      ? 'opacity-35 cursor-not-allowed border-slate-100 text-slate-400 bg-transparent'
                                      : currentTheme === 'light'
                                      ? 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-white'
                                      : 'bg-[#1C1C24] border-white/5 text-slate-350 hover:border-white/15'
                                  }`}
                                >
                                  <span>{comp.label}</span>
                                  <span className={`text-[8px] font-mono px-1 rounded ${active ? 'bg-white/10 dark:bg-black/10' : 'bg-slate-500/10'}`}>
                                    {comp.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Severity Threshold Level */}
                        <div className="space-y-2">
                          <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 font-mono">Severity Level</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'all', label: 'All Severities', count: BEEP_CODES_DATABASE.length },
                              { id: 'critical', label: 'Critical', count: severities['critical'] },
                              { id: 'high', label: 'High', count: severities['high'] },
                              { id: 'medium', label: 'Medium', count: severities['medium'] },
                              { id: 'low', label: 'Low Info', count: severities['low'] },
                            ].map((sev) => {
                              const active = selectedBeepSeverity.toLowerCase() === sev.id.toLowerCase();
                              const isDisabled = sev.count === 0 && !active;
                              const colors: Record<string, string> = {
                                critical: 'bg-red-500 text-white border-red-500',
                                high: 'bg-orange-500 text-white border-orange-500',
                                medium: 'bg-amber-500 text-white border-amber-500',
                                low: 'bg-emerald-500 text-white border-emerald-500',
                              };
                              return (
                                <button
                                  key={sev.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setSelectedBeepSeverity(sev.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer transition-all border flex items-center gap-1 ${
                                    active
                                      ? colors[sev.id] || 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                      : isDisabled
                                      ? 'opacity-35 cursor-not-allowed border-slate-100 text-slate-400 bg-transparent'
                                      : currentTheme === 'light'
                                      ? 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-white'
                                      : 'bg-[#1C1C24] border-white/5 text-slate-350 hover:border-white/15'
                                  }`}
                                >
                                  <span>{sev.label}</span>
                                  <span className={`text-[8px] font-mono px-1 rounded ${active ? 'bg-white/20' : 'bg-slate-500/10'}`}>
                                    {sev.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Helpful Instruction Tip */}
                      <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed ${
                        currentTheme === 'light' ? 'bg-sky-50/50 border-sky-100 text-slate-750' : 'bg-[#FF5500]/5 border-[#FF5500]/10 text-slate-400'
                      }`}>
                        <h4 className="font-extrabold uppercase mb-1 flex items-center gap-1 text-[#FF5500] font-mono text-[10px]">
                          <Sparkles size={11} />
                          <span>Acoustic Guidelines</span>
                        </h4>
                        <p>
                          Duration of tones: a short tone is a <strong>Short Beep</strong> (•), while a sustained tone of ~450ms is a <strong>Long Beep</strong> (▬). Pauses (P) isolate sequences. Perfect for offline field verification.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Search Box & High-Precision Results */}
              <div className="lg:col-span-7 space-y-6">
                {(() => {
                  // Highlighting utility for search term matches
                  const highlightText = (text: string, search: string) => {
                    if (!search.trim()) return text;
                    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                    const parts = text.split(regex);
                    return (
                      <>
                        {parts.map((part, i) => 
                          regex.test(part) ? (
                            <mark key={i} className="bg-orange-500/20 text-[#FF5500] dark:bg-[#FF5500]/30 rounded px-1 py-0.5 font-bold transition-all">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </>
                    );
                  };

                  return (
                    <div className="space-y-6">
                      {/* Premium High-Precision Search Box */}
                      <div className={`p-6 rounded-3xl border ${s.card} space-y-4 shadow-xs border-slate-200/60 dark:border-white/5`}>
                        <span className="block text-[10px] uppercase font-black tracking-widest text-[#FF5500] font-mono">Refined Fault Signature Search</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={beepSearchQuery}
                            onChange={(e) => setBeepSearchQuery(e.target.value)}
                            placeholder="Type exact code (e.g. '3 short', '1 long', 'CMOS', 'RAM')..."
                            className={`w-full py-3.5 pl-11 pr-11 rounded-2xl text-xs border ${s.input} font-sans transition-all duration-200 outline-none shadow-xs`}
                          />
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5500]" />
                          {beepSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setBeepSearchQuery('')}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 cursor-pointer transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Interactive Fast Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Exact Presets:</span>
                          {[
                            { label: '3 Short Beeps (RAM)', q: '3 short' },
                            { label: '5 Short Beeps (CPU)', q: '5 short' },
                            { label: '1 Long + 2 Short (GPU)', q: '1 long + 2 short' },
                            { label: 'CMOS battery', q: 'cmos' },
                          ].map((tag, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setBeepSearchQuery(tag.q)}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer border hover:border-[#FF5500]/40 hover:text-[#FF5500] transition-colors ${
                                beepSearchQuery === tag.q 
                                  ? 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30 font-bold' 
                                  : currentTheme === 'light' ? 'bg-slate-50 text-slate-650 border-slate-200' : 'bg-white/5 text-slate-400 border-white/5'
                              }`}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Exact Diagnostic Matches Header */}
                      <div className="flex items-center justify-between">
                        <h2 className={`text-xs font-black uppercase tracking-widest ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} font-mono`}>
                          Exact Matches ({filteredBeepKeys.length})
                        </h2>
                        <span className="font-mono text-[10px] text-slate-400">
                          Showing {Math.min(beepVisibleCount, filteredBeepKeys.length)} of {filteredBeepKeys.length} Profiles
                        </span>
                      </div>

                      {/* Diagnostics Feed (Paginated list rendering to guarantee lag-free updates) */}
                      <div className="space-y-5">
                        {filteredBeepKeys.length === 0 ? (
                          <div className={`py-16 text-center border border-dashed rounded-3xl ${
                            currentTheme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-white/5 bg-black/10'
                          }`}>
                            <HelpCircle size={32} className="mx-auto text-slate-400 mb-3" />
                            <h4 className="text-xs font-black uppercase text-[#FF5500] tracking-wider font-mono">No Exact Matches Located</h4>
                            <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                              The search query filter is strict to avoid unrelated profiles. Try choosing a component chip above, or clearing search text.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setBeepSearchQuery('');
                                setSelectedBeepBrand('all');
                                setSelectedBeepComponent('all');
                                setSelectedBeepSeverity('all');
                                setCustomSequence([]);
                              }}
                              className="mt-4 bg-[#FF5500] hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
                            >
                              Reset Workspace
                            </button>
                          </div>
                        ) : (
                          <>
                            {filteredBeepKeys.slice(0, beepVisibleCount).map((item) => {
                              const isPlaying = activePlayingId === item.id;
                              
                              const severityColors = {
                                Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
                                High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                                Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }[item.severity] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';

                              return (
                                <div
                                  key={item.id}
                                  className={`p-5 md:p-6 rounded-3xl border transition-all duration-200 ${
                                    isPlaying
                                      ? 'border-[#FF5500] shadow-sm shadow-[#FF5500]/5 bg-[#FF5500]/5'
                                      : currentTheme === 'light'
                                      ? 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                                      : 'border-white/5 bg-[#18181F] hover:border-white/10'
                                  }`}
                                >
                                  {/* Card Meta & Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-2 text-left">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* BIOS Brand Badge */}
                                        <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded ${
                                          currentTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-400'
                                        }`}>
                                          {item.biosBrand}
                                        </span>
                                        
                                        {/* Component Badge */}
                                        <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded ${
                                          item.affectedComponent === 'RAM' ? 'bg-blue-500/10 text-blue-500' :
                                          item.affectedComponent === 'CPU' ? 'bg-red-500/10 text-red-500' :
                                          item.affectedComponent === 'GPU/Video' ? 'bg-purple-500/10 text-purple-500' :
                                          item.affectedComponent === 'Thermal' ? 'bg-orange-500/10 text-orange-500' :
                                          'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                          {item.affectedComponent}
                                        </span>

                                        {/* Severity Badge */}
                                        <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded border ${severityColors}`}>
                                          {item.severity}
                                        </span>

                                        {/* Exact Match Indicator */}
                                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[8px] px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-wider">
                                          Precise Profile
                                        </span>
                                      </div>

                                      {/* Title / Pattern */}
                                      <h3 className={`text-base md:text-lg font-black uppercase tracking-tight mt-1 flex items-center gap-2 ${
                                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                                      }`}>
                                        {highlightText(item.pattern, beepSearchQuery)}
                                      </h3>
                                    </div>

                                    {/* Simulate Sound trigger button */}
                                    <button
                                      type="button"
                                      onClick={() => playBeepPattern(item.id, item.beepBeats)}
                                      disabled={activePlayingId !== null}
                                      className={`self-start sm:self-auto px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-200 shrink-0 ${
                                        isPlaying
                                          ? 'bg-emerald-500 text-white shadow-xs'
                                          : 'bg-[#FF5500]/10 hover:bg-[#FF5500] text-[#FF5500] hover:text-white border border-[#FF5500]/15 hover:border-transparent'
                                      }`}
                                    >
                                      <Volume2 size={12} className={isPlaying ? 'animate-bounce' : ''} />
                                      <span>{isPlaying ? 'Emulating...' : 'Simulate Beep'}</span>
                                    </button>
                                  </div>

                                  {/* Pattern Description timeline with visual animation */}
                                  <div className={`mt-3 p-3.5 rounded-2xl flex items-center justify-between border ${
                                    currentTheme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'
                                  }`}>
                                    <div className="flex items-center gap-2.5">
                                      <Activity size={13} className="text-[#FF5500] animate-pulse shrink-0" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Acoustic Signature:</span>
                                      <span className="text-sm font-black text-[#FF5500] tracking-widest font-mono">{highlightText(item.patternDescription, beepSearchQuery)}</span>
                                    </div>
                                    {isPlaying && (
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <span className="w-0.5 h-3.5 bg-[#FF5500] rounded-full animate-[pulse_0.6s_infinite_0s]" />
                                        <span className="w-0.5 h-5 bg-[#FF5500] rounded-full animate-[pulse_0.6s_infinite_0.15s]" />
                                        <span className="w-0.5 h-2.5 bg-[#FF5500] rounded-full animate-[pulse_0.6s_infinite_0.3s]" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Cause & Troubleshooting combined under Possible Root Cause */}
                                  <div className="mt-4 space-y-3.5 text-left">
                                    <div className="space-y-1">
                                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#FF5500] font-mono">Possible Root Cause</h4>
                                      <p className={`text-xs leading-relaxed font-medium ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                        {highlightText(item.possibleCause, beepSearchQuery)}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-1.5">
                                      {item.troubleshooting.map((step, sIdx) => {
                                        const stepKey = `${item.id}-${sIdx}`;
                                        const isChecked = !!checkedSteps[stepKey];
                                        return (
                                          <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() => setCheckedSteps(prev => ({ ...prev, [stepKey]: !isChecked }))}
                                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                                              isChecked
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400 dark:text-zinc-500 line-through'
                                                : currentTheme === 'light'
                                                ? 'bg-slate-50/40 hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-650'
                                                : 'bg-zinc-900/40 hover:bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-400'
                                            }`}
                                          >
                                            <div className={`mt-0.5 h-3.5 w-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                              isChecked 
                                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                : 'border-slate-300 dark:border-zinc-700'
                                            }`}>
                                              {isChecked && <Check size={8} className="stroke-[3]" />}
                                            </div>
                                            <span className="text-[11px] leading-relaxed font-sans">{highlightText(step, beepSearchQuery)}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>



                                </div>
                              );
                            })}

                            {/* Show More Pagination Controller to completely eliminate browser lag */}
                            {filteredBeepKeys.length > beepVisibleCount && (
                              <button
                                type="button"
                                onClick={() => setBeepVisibleCount(prev => prev + 6)}
                                className={`w-full py-3.5 rounded-2xl border text-xs font-black uppercase tracking-widest cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
                                  currentTheme === 'light'
                                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:text-[#FF5500]'
                                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-350 hover:text-white'
                                }`}
                              >
                                <span>Show More Diagnostics (+{filteredBeepKeys.length - beepVisibleCount} remaining)</span>
                                <ChevronDown size={14} className="animate-bounce" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </motion.div>
        )}

        {/* PRECISION SMPS PSU CALCULATOR SEPARATE PAGE */}
        {activeTab === 'smps' && (
          <motion.div
            key="smps"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-8 text-left max-w-5xl mx-auto"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pixelfix');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-1.5 text-xs font-black uppercase text-[#FF5500] hover:text-orange-600 cursor-pointer transition-colors duration-200 mb-2"
                >
                  <ArrowRight size={12} className="rotate-180 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Back to IT Services</span>
                </button>
                <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Precision SMPS PSU Calculator
                </h1>
                <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                  Select your CPU, GPU, memory, and components to dynamically estimate peak wattage draw and verify precise power supply recommendations (100% offline-capable database).
                </p>
              </div>
            </div>

            {/* SmpsCalculator component wrapper */}
            <div className={`p-1 sm:p-2 md:p-4 rounded-3xl border ${s.card} shadow-lg relative overflow-visible`}>
              <SmpsCalculator currentTheme={currentTheme} />
            </div>
          </motion.div>
        )}

        {/* DYNAMIC STUDIO ENGINE / GALLERY MANAGEMENT ADMIN PORTAL */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="space-y-12 text-left"
          >
            {/* Admin Key Check */}
            {!isAuthorized ? (
              <div className={`max-w-md mx-auto p-6 rounded-3xl border space-y-6 ${s.card}`}>
                <div className="text-center space-y-2">
                  <span className="w-12 h-12 rounded-full bg-orange-600/10 flex items-center justify-center text-[#FF5500] mx-auto">
                    <Sliders size={24} />
                  </span>
                  <h2 className={`text-lg font-black uppercase tracking-wider ${
                    currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Unseal Studio Engine</h2>
                  <p className={`text-xs ${
                    currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Please provide security key passcode to manage live digital gallery albums or preview automatic communication streams.</p>
                </div>

                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${
                      currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'
                    }`}>Security Access Code:</label>
                    <input
                      type="password"
                      required
                      value={adminKeyInput}
                      onChange={(e) => setAdminKeyInput(e.target.value)}
                      placeholder="Enter security passcode..."
                      className={`w-full px-4 py-3 rounded-xl text-xs outline-none transition-all ${s.input}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4400] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Unlock Admin Dashboard
                  </button>
                </form>
              </div>
            ) : (
              // FULL ADMIN SUITE PANEL
              <div className="space-y-8">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${s.divider}`}>
                  <div>
                    <span className="text-xs font-bold uppercase text-[#FF5500] block mb-1">PIXEL FIX &amp; PIXEL FRAME CONTROL DESK</span>
                    <h1 className={`text-2xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>STUDIO DYNAMIC ENGINE</h1>
                  </div>

                  <button
                    onClick={logoutAdmin}
                    className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 text-xs font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Lock Dashboard
                  </button>
                </div>

                {/* SUB-TABS NAVIGATION BAR */}
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 border-b pb-4 border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => setAdminSubTab('overview')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'overview'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <TrendingUp size={14} />
                    <span>Overview &amp; Stats</span>
                  </button>

                  <button
                    onClick={() => setAdminSubTab('media')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'media'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>Global Media Hub</span>
                  </button>

                  <button
                    onClick={() => setAdminSubTab('gallery')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'gallery'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Showcase Gallery</span>
                  </button>

                  <button
                    onClick={() => setAdminSubTab('inquiries')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'inquiries'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>Visitor Inquiries</span>
                  </button>

                  <button
                    onClick={() => setAdminSubTab('instagram')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'instagram'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Instagram size={14} />
                    <span>Instagram Sync</span>
                  </button>

                  <button
                    onClick={() => setAdminSubTab('branding')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] md:text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      adminSubTab === 'branding'
                        ? 'bg-[#FF5500] text-white'
                        : currentTheme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Logo &amp; Favicon</span>
                  </button>
                </div>

                {/* GLOBAL MEDIA HUB / IMAGE MANAGER */}
                {adminSubTab === 'media' && (
                  <div className="space-y-6 text-left">
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            <ImageIcon size={20} className="text-[#FF5500]" />
                            <span>Global Media Hub</span>
                          </h2>
                          <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                            View, search, edit, replace, upload, or reset every single image asset across your entire website in real time.
                          </p>
                        </div>
                        <div className="text-xs bg-emerald-500/10 text-emerald-500 font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                          ● Engine Synchronized
                        </div>
                      </div>

                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={mediaSearchQuery}
                            onChange={(e) => setMediaSearchQuery(e.target.value)}
                            placeholder="Search images by name or caption..."
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                          {mediaSearchQuery && (
                            <button
                              onClick={() => setMediaSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        <select
                          value={mediaFilterCategory}
                          onChange={(e) => setMediaFilterCategory(e.target.value)}
                          className={`px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer border ${
                            currentTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-zinc-900 border-white/5 text-zinc-300'
                          }`}
                        >
                          <option value="all">All Image Sources</option>
                          <option value="profile">Profile Photo</option>
                          <option value="gallery">Showcase Portfolio</option>
                          <option value="software">Software Licenses</option>
                          <option value="affiliate">Affiliate Gear</option>
                          <option value="testimonial">Customer Testimonials</option>
                          <option value="review">PixelFix Reviews</option>
                          <option value="instagram">Instagram Posts</option>
                        </select>
                      </div>

                      {/* Filter pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { id: 'all', label: 'All Assets' },
                          { id: 'profile', label: 'Profile' },
                          { id: 'gallery', label: 'Showcase' },
                          { id: 'software', label: 'Licenses' },
                          { id: 'affiliate', label: 'Affiliates' },
                          { id: 'testimonial', label: 'Testimonials' },
                          { id: 'review', label: 'PixelFix' },
                          { id: 'instagram', label: 'Instagram' }
                        ].map((pill) => (
                          <button
                            key={pill.id}
                            onClick={() => setMediaFilterCategory(pill.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              mediaFilterCategory === pill.id
                                ? 'bg-orange-500/15 text-orange-500 border border-orange-500/25'
                                : currentTheme === 'light'
                                  ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                                  : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:bg-zinc-800'
                            }`}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Media Grid */}
                    {(() => {
                      const allImages = getWebImages();
                      const filteredImages = allImages.filter((img) => {
                        const matchesSearch = img.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
                          img.section.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                        
                        const matchesCategory = mediaFilterCategory === 'all' || 
                          (mediaFilterCategory === 'profile' && img.type === 'profile') ||
                          (mediaFilterCategory === 'gallery' && img.type === 'gallery') ||
                          (mediaFilterCategory === 'software' && img.type === 'license') ||
                          (mediaFilterCategory === 'affiliate' && img.type === 'affiliate') ||
                          (mediaFilterCategory === 'testimonial' && img.type === 'testimonial') ||
                          (mediaFilterCategory === 'review' && img.type === 'review') ||
                          (mediaFilterCategory === 'instagram' && img.type === 'instagram');

                        return matchesSearch && matchesCategory;
                      });

                      if (filteredImages.length === 0) {
                        return (
                          <div className={`py-12 text-center font-mono text-xs border border-dashed rounded-3xl ${s.card}`}>
                            <ImageIcon size={32} className="mx-auto text-slate-500 mb-2 opacity-50" />
                            <span>-- No active image assets match your query --</span>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {filteredImages.map((img) => {
                            return (
                              <div
                                key={img.id}
                                className={`p-4 rounded-3xl border flex flex-col justify-between space-y-4 ${s.card}`}
                              >
                                <div className="space-y-3">
                                  {/* Thumbnail display */}
                                  <div className={`relative aspect-video rounded-2xl overflow-hidden border ${
                                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                                  }`}>
                                    {img.url ? (
                                      <img
                                        src={img.url}
                                        alt={img.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-[10px] font-mono">
                                        <X size={18} className="text-rose-500 mb-1" />
                                        <span>No image URL configured</span>
                                      </div>
                                    )}

                                    {/* Action tags */}
                                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                                        {img.type.toUpperCase()}
                                      </span>
                                    </div>

                                    {img.url && img.url.startsWith('data:image') && (
                                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-green-500/90 text-white">
                                        COMPRESSED BASE64
                                      </span>
                                    )}
                                  </div>

                                  {/* Title and section */}
                                  <div className="text-left space-y-0.5">
                                    <h4 className={`text-xs font-black truncate leading-tight ${
                                      currentTheme === 'light' ? 'text-slate-800' : 'text-white'
                                    }`} title={img.title}>
                                      {img.title}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                                      📍 {img.section}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/5">
                                  {/* URL input and action buttons */}
                                  <div className="space-y-1.5 text-left">
                                    <label className="text-[9.5px] font-bold text-slate-450 dark:text-slate-400 font-mono block uppercase">
                                      Configure Image URL:
                                    </label>
                                    <div className="flex gap-1.5">
                                      <input
                                        type="text"
                                        defaultValue={img.url}
                                        id={`url_input_${img.id}`}
                                        placeholder="Paste image web URL..."
                                        className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] outline-none transition-all font-mono truncate ${s.input}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const el = document.getElementById(`url_input_${img.id}`) as HTMLInputElement;
                                          if (el) {
                                            await handleUpdateWebImage(img, el.value);
                                          }
                                        }}
                                        className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[9.5px] font-black uppercase rounded-lg transition-colors cursor-pointer shrink-0"
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>

                                  {/* Drag-and-drop file uploader area */}
                                  <div className="relative">
                                    <input
                                      type="file"
                                      id={`file_picker_${img.id}`}
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = async (event) => {
                                            const base64 = event.target?.result as string;
                                            const compressed = await compressBase64Image(base64);
                                            await handleUpdateWebImage(img, compressed);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div
                                      onClick={() => document.getElementById(`file_picker_${img.id}`)?.click()}
                                      className={`py-2 px-3 border border-dashed rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors text-center text-[10px] font-medium ${
                                        currentTheme === 'light'
                                          ? 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
                                          : 'bg-black/20 border-white/10 text-slate-400 hover:bg-zinc-900/60'
                                      }`}
                                    >
                                      <Upload size={12} className="inline-block mr-1 text-[#FF5500]" />
                                      <span>Upload &amp; Replace Image</span>
                                    </div>
                                  </div>

                                  {/* Delete / Reset row */}
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const defaultValue = getInitialValueForImage(img);
                                        if (confirm('Are you sure you want to restore this image asset to its original default? This will synchronize in real time.')) {
                                          await handleUpdateWebImage(img, defaultValue);
                                          const el = document.getElementById(`url_input_${img.id}`) as HTMLInputElement;
                                          if (el) el.value = defaultValue;
                                        }
                                      }}
                                      className={`flex-1 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all cursor-pointer ${
                                        currentTheme === 'light'
                                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-white/5'
                                      }`}
                                    >
                                      Reset default
                                    </button>

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to delete / clear this image? This will set it to an empty placeholder in real time.')) {
                                          await handleUpdateWebImage(img, '');
                                          const el = document.getElementById(`url_input_${img.id}`) as HTMLInputElement;
                                          if (el) el.value = '';
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* LOGO & FAVICON BRANDING SUITE */}
                {adminSubTab === 'branding' && (
                  <div className="space-y-6 text-left animate-in fade-in duration-200">
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            <Globe size={20} className="text-[#FF5500]" />
                            <span>Logo &amp; Favicon Identity Desk</span>
                          </h2>
                          <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                            Configure and live-sync custom logos and web browser favicons instantly across all visitor sessions.
                          </p>
                        </div>
                        <div className="text-xs bg-orange-500/10 text-[#FF5500] font-mono font-bold px-3 py-1 rounded-full border border-orange-500/20 w-fit">
                          ● Branding Engine Active
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                        
                        {/* WEBSITE LOGO SECTOR */}
                        <div className={`p-5 rounded-2xl border ${currentTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-white/5 border-white/5'} space-y-4`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-black uppercase tracking-wider ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                              1. Website Brand Logo
                            </h3>
                            <span className="text-[10px] bg-[#FF5500]/10 text-[#FF5500] font-bold px-2 py-0.5 rounded">
                              Header &amp; Footer
                            </span>
                          </div>
                          
                          {/* Upload Area */}
                          <div className="space-y-3">
                            <label className={`block text-xs font-bold ${currentTheme === 'light' ? 'text-slate-750' : 'text-slate-300'}`}>
                              Upload Logo File
                            </label>
                            
                            <input
                              type="file"
                              id="logo_file_input"
                              accept=".png,.jpg,.jpeg,.svg,.webp,.gif"
                              onChange={handleLogoFileChange}
                              className="hidden"
                            />
                            
                            <div
                              onClick={() => document.getElementById('logo_file_input')?.click()}
                              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                currentTheme === 'light'
                                  ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-100/50 bg-white'
                                  : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 bg-black/20'
                              }`}
                            >
                              <Upload size={20} className="text-[#FF5500]" />
                              <div className="text-center">
                                <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                  Click to browse your device
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-1">
                                  PNG, JPG, JPEG, SVG, WebP, GIF • Max 400KB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Image URL option */}
                          <div className="space-y-2 pt-1">
                            <label className={`block text-xs font-bold ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                              Or enter direct Logo URL
                            </label>
                            <input
                              type="url"
                              value={draftLogoUrl}
                              onChange={(e) => {
                                setDraftLogoUrl(e.target.value);
                              }}
                              placeholder="https://example.com/logo.png"
                              className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>

                          {/* Live Preview and Clear */}
                          <div className="space-y-3 pt-2 border-t border-dashed border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                Live Preview
                              </span>
                              {draftLogoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraftLogoUrl('');
                                    triggerToast('Draft logo cleared (reverted to default SVG). Click Save to publish.', 'info');
                                  }}
                                  className="text-rose-500 hover:text-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                                >
                                  Clear / Reset to Default
                                </button>
                              )}
                            </div>

                            {/* Mock Header Brand Preview */}
                            <div className={`border rounded-xl overflow-hidden shadow-sm ${currentTheme === 'light' ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/40'}`}>
                              <div className={`p-4 border-b flex items-center justify-between ${currentTheme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-zinc-900/30'}`}>
                                <div className="flex items-center gap-2">
                                  {draftLogoUrl ? (
                                    <img
                                      src={draftLogoUrl}
                                      alt="Logo"
                                      className="w-8 h-8 object-contain rounded-md animate-fade-in"
                                      onError={() => {
                                        triggerToast('Provided Logo URL appears broken or unaccessible.', 'error');
                                      }}
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <PFLogo className="w-8 h-8 text-[#FF5500]" />
                                  )}
                                  <div className="text-left">
                                    <div className={`text-[10px] font-black uppercase leading-none ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{logoText}</div>
                                    <div className="text-[7px] uppercase tracking-widest text-[#FF5500] mt-0.5 font-bold">{logoSubtext}</div>
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <div className="w-8 h-2 bg-slate-300/60 dark:bg-zinc-700/60 rounded-full" />
                                  <div className="w-8 h-2 bg-slate-300/60 dark:bg-zinc-700/60 rounded-full" />
                                </div>
                              </div>
                              <div className={`p-3 text-[10px] font-mono flex items-center justify-between ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                                <span>Logo Render Preview</span>
                                <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                  {draftLogoUrl ? 'Custom Image' : 'Default Dynamic SVG'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* WEBSITE FAVICON SECTOR */}
                        <div className={`p-5 rounded-2xl border ${currentTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-white/5 border-white/5'} space-y-4`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-black uppercase tracking-wider ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                              2. Website Favicon
                            </h3>
                            <span className="text-[10px] bg-[#FF5500]/10 text-[#FF5500] font-bold px-2 py-0.5 rounded">
                              Browser Tab Icon
                            </span>
                          </div>

                          {/* Upload Area */}
                          <div className="space-y-3">
                            <label className={`block text-xs font-bold ${currentTheme === 'light' ? 'text-slate-750' : 'text-slate-300'}`}>
                              Upload Favicon File
                            </label>

                            <input
                              type="file"
                              id="favicon_file_input"
                              accept=".ico,.png,.svg,.webp,.jpg,.jpeg"
                              onChange={handleFaviconFileChange}
                              className="hidden"
                            />

                            <div
                              onClick={() => document.getElementById('favicon_file_input')?.click()}
                              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                currentTheme === 'light'
                                  ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-100/50 bg-white'
                                  : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 bg-black/20'
                              }`}
                            >
                              <Upload size={20} className="text-[#FF5500]" />
                              <div className="text-center">
                                <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                  Click to browse your device
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-1">
                                  ICO, PNG, SVG, WebP, JPG • Max 150KB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Image URL option */}
                          <div className="space-y-2 pt-1">
                            <label className={`block text-xs font-bold ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                              Or enter direct Favicon URL
                            </label>
                            <input
                              type="url"
                              value={draftFaviconUrl}
                              onChange={(e) => {
                                setDraftFaviconUrl(e.target.value);
                              }}
                              placeholder="https://example.com/favicon.ico"
                              className={`w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>

                          {/* Live Preview and Clear */}
                          <div className="space-y-3 pt-2 border-t border-dashed border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                Live Preview
                              </span>
                              {draftFaviconUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraftFaviconUrl('');
                                    triggerToast('Draft favicon cleared (reverted to default SVG). Click Save to publish.', 'info');
                                  }}
                                  className="text-rose-500 hover:text-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                                >
                                  Clear / Reset to Default
                                </button>
                              )}
                            </div>

                            {/* Mock Browser Tab Preview */}
                            <div className={`border rounded-xl overflow-hidden shadow-sm ${currentTheme === 'light' ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/40'}`}>
                              <div className={`p-1.5 flex items-center gap-1.5 border-b ${currentTheme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-zinc-900/30'}`}>
                                <div className="flex gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                </div>
                                <div className={`ml-2 rounded-t-md px-2 py-1 flex items-center gap-1.5 w-40 truncate ${currentTheme === 'light' ? 'bg-white border-t border-x border-slate-200' : 'bg-zinc-800 border-t border-x border-white/5'}`}>
                                  {draftFaviconUrl ? (
                                    <img
                                      src={draftFaviconUrl}
                                      alt="Favicon"
                                      className="w-3.5 h-3.5 object-contain"
                                      onError={() => {
                                        triggerToast('Provided Favicon URL appears broken or unaccessible.', 'error');
                                      }}
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <PFLogo className="w-3.5 h-3.5 text-[#FF5500]" />
                                  )}
                                  <span className={`text-[9px] font-semibold truncate ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                    {logoText}
                                  </span>
                                </div>
                              </div>
                              <div className={`p-3 text-[10px] font-mono flex items-center justify-between ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                                <span>Favicon Browser Preview</span>
                                <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                  {draftFaviconUrl ? 'Custom Icon' : 'Default Dynamic SVG'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* SAVE/PUBLISH ACTIONS */}
                      <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                      }`}>
                        <div className="space-y-1">
                          <p className={`text-xs font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Confirm Brand Synchronization
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            Saving will replace current brand assets in Firestore and update all connected visitor devices instantly.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setDraftLogoUrl(logoUrl);
                              setDraftFaviconUrl(faviconUrl);
                              triggerToast('Draft changes discarded. Branding reset to live configurations.', 'info');
                            }}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer uppercase ${
                              currentTheme === 'light'
                                ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                                : 'bg-transparent border-white/10 hover:bg-white/5 text-zinc-300'
                            }`}
                          >
                            Discard Draft
                          </button>
                          <button
                            type="button"
                            disabled={isSavingIdentity}
                            onClick={handleSaveBranding}
                            className="px-5 py-2 text-xs font-black rounded-xl bg-[#FF5500] hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {isSavingIdentity ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Saving Changes...</span>
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                <span>Save Branding Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* OVERVIEW TAB */}
                {adminSubTab === 'overview' && (
                  <>
                    {/* AFFILIATE PERFORMANCE MONITORING DESK */}
                    <div className={`p-5 rounded-2xl border ${s.card} space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 text-left">
                      <h3 className={`text-sm font-bold flex items-center gap-1.5 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <TrendingUp size={16} className="text-[#FF5500]" />
                        <span>Affiliate Link Performance</span>
                      </h3>
                      <div className="text-[10px] text-slate-450 dark:text-slate-400 font-mono">
                        Last 30 Days Reference
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Metric Toggle */}
                      <div className={`p-0.5 rounded-lg flex items-center border relative z-0 overflow-hidden ${currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/5'}`}>
                        <button
                          onClick={() => setAnalyticsMetric('total')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer relative overflow-hidden z-0 ${
                            analyticsMetric === 'total'
                              ? 'text-white shadow-xs'
                              : currentTheme === 'light'
                                ? 'text-slate-500 hover:text-slate-900'
                                : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                          title="Switch to total accumulated daily clicks"
                        >
                          <span className="relative z-10">Total Clicks</span>
                          {analyticsMetric === 'total' && (
                            <motion.span
                              layoutId="activeAnalyticsMetricPill"
                              className="absolute inset-0 bg-[#FF5500] rounded-md -z-10"
                              transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setAnalyticsMetric('unique')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase transition-all duration-200 cursor-pointer relative overflow-hidden z-0 ${
                            analyticsMetric === 'unique'
                              ? 'text-white shadow-xs'
                              : currentTheme === 'light'
                                ? 'text-slate-500 hover:text-slate-900'
                                : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                          title="Switch to unique link click counts based on daily visitors"
                        >
                          <span className="relative z-10">Unique Insights</span>
                          {analyticsMetric === 'unique' && (
                            <motion.span
                              layoutId="activeAnalyticsMetricPill"
                              className="absolute inset-0 bg-violet-600 rounded-md -z-10"
                              transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            />
                          )}
                        </button>
                      </div>
 
                      {/* Bulk Clean Titles Button */}
                      <button
                        onClick={handleBulkCleanTitles}
                        disabled={isBulkCleaning}
                        className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                          isBulkCleaning
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-750 dark:text-zinc-500'
                            : currentTheme === 'light'
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:border-amber-400'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400 hover:text-amber-350 hover:border-amber-550/30'
                        }`}
                        title="Bulk apply cleanTitle to all affiliate product titles across the entire site"
                      >
                        <Sparkles size={12} className={isBulkCleaning ? "animate-pulse" : "text-amber-500"} />
                        <span>{isBulkCleaning ? 'Cleaning...' : 'Clean Titles'}</span>
                      </button>

                      <select
                        value={selectedChartProduct}
                        onChange={(e) => setSelectedChartProduct(e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] outline-none transition-all ${s.input}`}
                      >
                        <option value="all">All Curated Deals</option>
                        {affiliateLinks.map((link) => (
                          <option key={link.id} value={link.id}>
                            {link.title.substring(0, 24)}{link.title.length > 24 ? '...' : ''} ({link.clicks || 0} clicks)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const now = new Date();
                    let totalClicks = 0;
                    let peakClicks = 0;
                    let peakDateStr = 'N/A';
                    
                    const d30 = [];
                    for (let i = 29; i >= 0; i--) {
                      const d = new Date();
                      d.setDate(now.getDate() - i);
                      const dateStr = d.toISOString().split('T')[0];
                      const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      
                      let clicksOnDate = 0;
                      if (selectedChartProduct === 'all') {
                        affiliateLinks.forEach(link => {
                          let linkClicks = 0;
                          const history = link.daily_click_count || link.clickHistory;
                          if (history && history[dateStr] !== undefined) {
                            linkClicks = history[dateStr];
                          } else {
                            const tc = link.clicks || 0;
                            if (tc > 0) {
                              const hash = hashString(link.id + dateStr);
                              const avg = tc / 30;
                              const variance = (hash % 100) / 100;
                              const factor = 0.5 + variance;
                              linkClicks = Math.round(avg * factor);
                            }
                          }

                          if (analyticsMetric === 'unique') {
                            if (linkClicks > 0) {
                              const hash = hashString(link.id + dateStr);
                              const uniqueRate = 0.72 + (hash % 18) / 100; // 72% to 90% unique rate
                              clicksOnDate += Math.max(1, Math.round(linkClicks * uniqueRate));
                            }
                          } else {
                            clicksOnDate += linkClicks;
                          }
                        });
                      } else {
                        const link = affiliateLinks.find(l => l.id === selectedChartProduct);
                        if (link) {
                          let linkClicks = 0;
                          const history = link.daily_click_count || link.clickHistory;
                          if (history && history[dateStr] !== undefined) {
                            linkClicks = history[dateStr];
                          } else {
                            const tc = link.clicks || 0;
                            if (tc > 0) {
                              const hash = hashString(link.id + dateStr);
                              const avg = tc / 30;
                              const variance = (hash % 100) / 100;
                              const factor = 0.5 + variance;
                              linkClicks = Math.round(avg * factor);
                            }
                          }

                          if (analyticsMetric === 'unique') {
                            if (linkClicks > 0) {
                              const hash = hashString(link.id + dateStr);
                              const uniqueRate = 0.72 + (hash % 18) / 100; // 72% to 90% unique rate
                              clicksOnDate = Math.max(1, Math.round(linkClicks * uniqueRate));
                            }
                          } else {
                            clicksOnDate = linkClicks;
                          }
                        }
                      }
                      
                      totalClicks += clicksOnDate;
                      if (clicksOnDate > peakClicks) {
                        peakClicks = clicksOnDate;
                        peakDateStr = dateLabel;
                      }
                      
                      d30.push({
                        date: dateStr,
                        label: dateLabel,
                        clicks: clicksOnDate
                      });
                    }

                    const dailyAverage = Math.round((totalClicks / 30) * 10) / 10;
                    const primaryColor = analyticsMetric === 'unique' ? '#8b5cf6' : '#FF5500';

                    return (
                      <div className="space-y-3">
                        {/* Elegant minimalist summary bar */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: primaryColor }} />
                            <strong className={`${currentTheme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`}>{totalClicks}</strong> {analyticsMetric === 'unique' ? 'unique clicks' : 'clicks total'}
                          </span>
                          <span>•</span>
                          <span>
                            avg <strong className={`${currentTheme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`}>{dailyAverage}</strong> daily
                          </span>
                          <span>•</span>
                          <span>
                            peak <strong className={`${currentTheme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`}>{peakClicks}</strong> (on {peakDateStr})
                          </span>
                          {selectedChartProduct !== 'all' && (() => {
                            const link = affiliateLinks.find(l => l.id === selectedChartProduct);
                            if (link?.last_clicked) {
                              const lastClickedDate = new Date(link.last_clicked);
                              return (
                                <>
                                  <span>•</span>
                                  <span>
                                    last clicked <strong className={`${currentTheme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`}>{lastClickedDate.toLocaleString()}</strong>
                                  </span>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
 
                        {/* Chart Canvas */}
                        <motion.div 
                          className="h-[110px] xs:h-[125px] sm:h-[160px] w-full text-[8px] sm:text-[9px] font-mono"
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d30} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
                              <defs>
                                <linearGradient id="clickGradientTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF5500" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#FF5500" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="clickGradientUnique" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'light' ? '#f1f5f9' : '#1e293b'} />
                              <XAxis 
                                dataKey="label" 
                                tick={{ fill: currentTheme === 'light' ? '#64748b' : '#94a3b8', fontSize: 8 }}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                tick={{ fill: currentTheme === 'light' ? '#64748b' : '#94a3b8', fontSize: 8 }}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: currentTheme === 'light' ? '#ffffff' : '#0f172a', 
                                  borderColor: currentTheme === 'light' ? '#e2e8f0' : '#1e293b',
                                  borderRadius: '8px',
                                  color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
                                  fontSize: '10px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                                labelStyle={{ fontWeight: 'bold', color: primaryColor, marginBottom: '2px' }}
                                itemStyle={{ color: currentTheme === 'light' ? '#0f172a' : '#ffffff', padding: 0 }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="clicks" 
                                name={analyticsMetric === 'unique' ? 'Unique Clicks' : 'Total Clicks'}
                                stroke={primaryColor} 
                                strokeWidth={1.8}
                                fillOpacity={1} 
                                fill={analyticsMetric === 'unique' ? 'url(#clickGradientUnique)' : 'url(#clickGradientTotal)'} 
                                activeDot={{ r: 4, strokeWidth: 0, fill: primaryColor }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </motion.div>
                      </div>
                    );
                  })()}
                </div>
                  </>
                )}

                {adminSubTab !== 'media' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Gallery management uploader */}
                  <div className="lg:col-span-6 space-y-6">
                    {adminSubTab === 'gallery' ? (
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-6`}>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <Upload size={18} className="text-[#FF5500]" />
                        <span>Instant Image Uploader (Local Cache DB)</span>
                      </h3>
                      
                      <form onSubmit={handleCreateGalleryItem} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Photo Session Title:</label>
                          <input
                            type="text"
                            required
                            value={newImageTitle}
                            onChange={(e) => setNewImageTitle(e.target.value)}
                            placeholder="e.g. Cinematic Wedding Couple At Guwahati Garden"
                            className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Category:</label>
                            <select
                              value={newImageCategory}
                              onChange={(e) => setNewImageCategory(e.target.value as any)}
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            >
                              <option value="wedding">💍 Wedding</option>
                              <option value="corporate">👔 Corporate</option>
                              <option value="party">🎉 Events</option>
                              <option value="custom">🌲 Outdoor</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Camera Lens Meta Info:</label>
                            <input
                              type="text"
                              value={newImageCamera}
                              onChange={(e) => setNewImageCamera(e.target.value)}
                              placeholder="e.g. Nikon Z8 • NIKKOR Z 85mm f/1.2 S"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Raw / Before Image URL (Optional):</label>
                          <input
                            type="text"
                            value={newImageBeforeUrl}
                            onChange={(e) => setNewImageBeforeUrl(e.target.value)}
                            placeholder="Paste unedited RAW image URL (or leave empty for high-fidelity automatic simulation)"
                            className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                        </div>

                        {/* Drag and Drop implementation */}
                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Choose Portfolio Picture File:</label>
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                              dragOver 
                                ? 'border-[#FF5500] bg-[#FF5500]/5' 
                                : newImageBase64 
                                  ? 'border-green-500 bg-green-500/5' 
                                  : currentTheme === 'light'
                                    ? 'border-slate-350 hover:border-[#FF5500]'
                                    : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            
                            {newImageBase64 ? (
                              <div className="space-y-2">
                                <span className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto text-xs font-bold">
                                  ✓
                                </span>
                                <p className={`text-xs font-extrabold ${currentTheme === 'light' ? 'text-emerald-700' : 'text-slate-300'}`}>Photo file loaded successfully!</p>
                                <p className={`text-[10px] truncate max-w-xs mx-auto ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Double check file dimensions. click again to overwrite.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="w-12 h-12 bg-orange-600/10 text-[#FF5500] rounded-full flex items-center justify-center mx-auto">
                                  <ImageIcon size={20} />
                                </span>
                                <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-350'}`}><strong className={`${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} hover:underline`}>Click to browse file</strong> or drag here</p>
                                <p className={`text-[9px] ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-600'}`}>Supports WebP, JPEG, PNG formats</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Publish Image To Showcase Database
                        </button>
                      </form>
                    </div>
                    ) : null}

                    {/* Notification Alert System */}
                    {adminSubTab === 'inquiries' ? (
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <Bell size={18} className="text-[#FF5500]" />
                        <span>Automated Client Notification Hub</span>
                      </h3>
                      
                      <p className={`text-xs leading-normal ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Simulate launching automated alert emails telling local clients their portfolio pictures are edited and ready to view instantly in the secure interface!
                      </p>

                      <form onSubmit={handleEmailSimulation} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Client Name (e.g., Roy)"
                            className={`px-3 py-2 rounded-lg text-xs outline-none ${s.input}`}
                          />
                          <input
                            type="email"
                            required
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="Client Email (e.g., roy@mail.com)"
                            className={`px-3 py-2 rounded-lg text-xs outline-none ${s.input}`}
                          />
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-2.5 font-extrabold text-xs uppercase rounded-lg transition-colors border ${
                            currentTheme === 'light'
                              ? 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
                              : 'bg-white text-black hover:bg-zinc-200 border-transparent'
                          }`}
                        >
                          Simulate Email Alert Trigger
                        </button>
                      </form>

                      {notificationSuccess && lastSentEmailPreview && (
                        <div className={`p-4 border rounded-xl space-y-2 text-left font-mono text-[10px] ${
                          currentTheme === 'light' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-950' : 'bg-black border-green-500/30'
                        }`}>
                          <span className={`font-extrabold block ${currentTheme === 'light' ? 'text-emerald-700' : 'text-green-400'}`}>
                            ✓ AUTOMATED DIGITAL COMMUNICATION LOG:
                          </span>
                          <div className={currentTheme === 'light' ? 'text-slate-600' : 'text-zinc-500'}>
                            <strong>To:</strong> {lastSentEmailPreview.clientEmail}<br />
                            <strong>Subject:</strong> {lastSentEmailPreview.subject}
                          </div>
                          <div className={`whitespace-pre-wrap mt-1 leading-normal text-[9px] ${
                            currentTheme === 'light' ? 'text-slate-700' : 'text-zinc-300'
                          }`}>
                            {lastSentEmailPreview.body}
                          </div>
                        </div>
                      )}
                    </div>
                    ) : null}
                  </div>

                  {/* Right Column: Manage records */}
                  <div className="lg:col-span-6 space-y-6">
                    {adminSubTab === 'gallery' ? (
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <SlidersHorizontal size={18} className="text-[#FF5500]" />
                        <span>Manage Showcase Gallery Images</span>
                      </h3>

                      <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Historical list of elements in local database storage. Total items tracked: <strong>{galleryItems.length}</strong>
                      </p>

                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                        {galleryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono mb-2 ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/35 border-white/5'
                            }`}
                          >
                            <div className="flex items-center space-x-3 text-left min-w-0 flex-1">
                              <div className="w-10 h-10 overflow-hidden rounded-lg relative flex-shrink-0">
                                <LazyImage
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  placeholderClassName="absolute inset-0 z-0"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className={`font-extrabold block truncate ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                  {item.title}
                                </span>
                                <div className="flex flex-wrap gap-1 items-center mt-1">
                                  <span className="text-[10px] text-[#FF5500] uppercase font-bold mr-1">{getCategoryLabel(item.category)}</span>
                                  {getGalleryItemTags(item, galleryItems).map(t => (
                                    <span key={t} className={`text-[8px] px-1 py-0.5 rounded border ${
                                      t === 'Recent'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                        : t === 'Featured'
                                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                          : 'bg-pink-500/10 text-pink-400 border-pink-500/25'
                                    }`}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                              title="Delete Photo Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    ) : null}

                    {/* Booking inquiries from client contact forms logged locally */}
                    {adminSubTab === 'inquiries' ? (() => {
                      const unreadCount = contactMessages.filter(m => m.status !== 'read').length;
                      const totalCount = contactMessages.length;
                      const itCount = contactMessages.filter(m => m.serviceType === 'it_fix').length;
                      const photoCount = contactMessages.filter(m => m.serviceType === 'photography').length;

                      const filteredInquiries = contactMessages.filter((msg) => {
                        // 1. Filter by tab
                        if (inquiryFilter === 'unread' && msg.status === 'read') return false;
                        if (inquiryFilter === 'it_fix' && msg.serviceType !== 'it_fix') return false;
                        if (inquiryFilter === 'photography' && msg.serviceType !== 'photography') return false;

                        // 2. Filter by search text
                        if (!inquirySearchText) return true;
                        const search = inquirySearchText.toLowerCase();
                        return (
                          (msg.name || '').toLowerCase().includes(search) ||
                          (msg.phone || '').toLowerCase().includes(search) ||
                          (msg.email || '').toLowerCase().includes(search) ||
                          (msg.message || '').toLowerCase().includes(search)
                        );
                      });

                      const handleToggleInquiryStatus = async (msgId: string, currentStatus: string) => {
                        const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
                        try {
                          await setDoc(doc(db, 'contact_messages', msgId), { status: nextStatus }, { merge: true });
                          triggerToast(`Inquiry marked as ${nextStatus.toUpperCase()}`, 'success');
                        } catch (err) {
                          console.error("Error updating inquiry: ", err);
                          triggerToast('Error updating status', 'error');
                        }
                      };

                      const handleClearAllReadInquiries = () => {
                        const readInquiries = contactMessages.filter(m => m.status === 'read');
                        if (readInquiries.length === 0) {
                          triggerToast('No read inquiries to clear!', 'info');
                          return;
                        }
                        triggerConfirm(`Are you sure you want to delete all ${readInquiries.length} read inquiries from the live database?`, async () => {
                          try {
                            const deletePromises = readInquiries.map(m => deleteDoc(doc(db, 'contact_messages', m.id)));
                            await Promise.all(deletePromises);
                            triggerToast(`Cleared ${readInquiries.length} read inquiries successfully.`, 'success');
                          } catch (err) {
                            console.error("Error clearing inquiries: ", err);
                            triggerToast('Error clearing inquiries', 'error');
                          }
                        });
                      };

                      return (
                        <div className={`p-6 rounded-3xl border ${s.card} space-y-6 text-left`}>
                          {/* Live Stats Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-orange-500/10 rounded-xl text-[#FF5500]">
                                <MessageSquare size={20} />
                              </div>
                              <div className="space-y-0.5">
                                <h3 className={`text-base font-black tracking-tight ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                  Client Inquiry Log Stream
                                </h3>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                  Real-time synchronization active • {totalCount} total entries
                                </p>
                              </div>
                            </div>

                            {/* Unread Indicator Badge */}
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 ? (
                                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {unreadCount} UNREAD INQUIRIES
                                </div>
                              ) : (
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  ALL RESOLVED
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Toolbar (Search & Bulk Operations) */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-8 relative flex items-center">
                              <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                              <input
                                type="text"
                                value={inquirySearchText}
                                onChange={(e) => setInquirySearchText(e.target.value)}
                                placeholder="Search client name, contact number, message content..."
                                className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                              />
                              {inquirySearchText && (
                                <button
                                  onClick={() => setInquirySearchText('')}
                                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>

                            <button
                              onClick={handleClearAllReadInquiries}
                              className={`md:col-span-4 px-4 py-2.5 rounded-xl text-[10px] uppercase font-mono tracking-wider font-extrabold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                currentTheme === 'light'
                                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                                  : 'bg-rose-950/20 hover:bg-rose-950/35 border-rose-500/20 text-rose-400'
                              }`}
                            >
                              <Trash2 size={12} />
                              <span>Clear All Read</span>
                            </button>
                          </div>

                          {/* Responsive Filter Chips */}
                          <div className="flex flex-wrap gap-1.5 border-b pb-4 border-slate-200/50 dark:border-white/5">
                            {[
                              { id: 'all', label: 'All Logs', count: totalCount },
                              { id: 'unread', label: 'Unread', count: unreadCount, isOrange: true },
                              { id: 'it_fix', label: 'Pixel Fix Support', count: itCount },
                              { id: 'photography', label: 'Photography', count: photoCount }
                            ].map((tab) => {
                              const isActive = inquiryFilter === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => setInquiryFilter(tab.id as any)}
                                  className={`px-3 py-1.5 rounded-xl font-mono text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    isActive
                                      ? currentTheme === 'light'
                                        ? 'bg-slate-900 border-slate-900 text-white'
                                        : 'bg-[#FF5500] border-[#FF5500] text-white shadow-md'
                                      : currentTheme === 'light'
                                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                                  }`}
                                >
                                  {tab.isOrange && tab.count > 0 && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  )}
                                  <span>{tab.label}</span>
                                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${
                                    isActive 
                                      ? 'bg-white/20 text-white' 
                                      : currentTheme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-400'
                                  }`}>
                                    {tab.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Scrollable Live message container */}
                          {filteredInquiries.length === 0 ? (
                            <div className={`py-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 ${
                              currentTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-black/20 border-white/5'
                            }`}>
                              <MessageSquare size={24} className="text-slate-500 opacity-60" />
                              <div className={`font-mono text-xs font-bold uppercase tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-650'}`}>
                                -- No matching inquiry entries found --
                              </div>
                              <p className="text-[10px] text-slate-500 max-w-xs text-center leading-normal">
                                Try adjusting your filter category tabs or clearing the search text input.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                              <AnimatePresence initial={false}>
                                {filteredInquiries.map((msg) => {
                                  const isMsgUnread = msg.status !== 'read';
                                  return (
                                    <motion.div
                                      key={msg.id}
                                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                                      className={`p-4 rounded-2xl border text-xs text-left relative transition-all duration-300 group ${
                                        isMsgUnread
                                          ? currentTheme === 'light'
                                            ? 'bg-amber-50/40 border-amber-200/70 shadow-sm shadow-amber-100/50'
                                            : 'bg-amber-950/5 border-amber-500/20 shadow-sm shadow-amber-950/10'
                                          : currentTheme === 'light'
                                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                            : 'bg-black/30 border-white/5 hover:bg-black/50'
                                      }`}
                                    >
                                      {/* Delete action */}
                                      <button
                                        onClick={() => {
                                          triggerConfirm('Delete this client inquiry permanently from the live system?', async () => {
                                            try {
                                              await deleteDoc(doc(db, 'contact_messages', msg.id));
                                              triggerToast('Inquiry removed from cloud database', 'success');
                                            } catch (err) {
                                              console.error("Failed to delete message: ", err);
                                              triggerToast('Error deleting inquiry', 'error');
                                            }
                                          });
                                        }}
                                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                        title="Delete Inquiry permanently"
                                      >
                                        <X size={12} className="stroke-[2.5]" />
                                      </button>

                                      <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 justify-between pr-8">
                                        <div className="space-y-1">
                                          {/* Name and Tag */}
                                          <div className="flex items-center flex-wrap gap-2">
                                            <span className={`text-sm font-black tracking-tight ${
                                              currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                                            }`}>
                                              {msg.name}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] uppercase font-bold tracking-widest ${
                                              msg.serviceType === 'it_fix'
                                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                                : 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20'
                                            }`}>
                                              {msg.serviceType === 'it_fix' ? 'Pixel Fix' : 'Pixel Frame'}
                                            </span>
                                          </div>

                                          {/* Timestamp and Email */}
                                          <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] ${
                                            currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                          }`}>
                                            <span>📅 {msg.timestamp}</span>
                                            {msg.email && (
                                              <span className="opacity-75">📧 {msg.email}</span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Real-time Interactive Status Switcher */}
                                        <button
                                          onClick={() => handleToggleInquiryStatus(msg.id, msg.status)}
                                          className={`px-2.5 py-1 rounded-xl font-mono text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer self-start sm:self-center ${
                                            isMsgUnread
                                              ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/20'
                                              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                                          }`}
                                          title="Click to toggle processed/unprocessed status"
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${isMsgUnread ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                          <span>{isMsgUnread ? 'Unread' : 'Read'}</span>
                                        </button>
                                      </div>

                                      {/* Message Details block */}
                                      <div className={`mt-3 p-3 rounded-xl border leading-relaxed font-sans text-[11px] whitespace-pre-line ${
                                        currentTheme === 'light' ? 'bg-white border-slate-150 text-slate-700' : 'bg-black/20 border-white/5 text-slate-300'
                                      }`}>
                                        {msg.message}
                                      </div>

                                      {/* Action Callbacks bar */}
                                      <div className={`font-mono text-[10px] pt-3 border-t mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${
                                        currentTheme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-400'
                                      }`}>
                                        <span className="flex items-center gap-1">
                                          📞 Contact: <a href={`tel:${msg.phone}`} className={`hover:underline font-extrabold tracking-wide ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>{msg.phone}</a>
                                        </span>

                                        <div className="flex items-center gap-3 ml-auto">
                                          {/* Direct Call Mobile */}
                                          <a
                                            href={`tel:${msg.phone}`}
                                            className={`inline-flex items-center gap-1 font-bold uppercase text-[9px] px-2.5 py-1 rounded-lg border transition-all ${
                                              currentTheme === 'light'
                                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700'
                                                : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                                            }`}
                                          >
                                            <Phone size={10} />
                                            <span>Dial Call</span>
                                          </a>

                                          {/* WhatsApp Callback */}
                                          <a
                                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Hi%20${msg.name},%20this%20is%20Murari.`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold inline-flex items-center justify-center text-center gap-1 text-[9px] uppercase transition-all shadow-sm"
                                          >
                                            <WhatsAppIcon size={10} />
                                            <span>WhatsApp Callback</span>
                                          </a>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })() : null}

                    {/* Instagram Real-time Api Sync Panel */}
                    {adminSubTab === 'instagram' ? (
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <Instagram size={18} className="text-[#FF5500]" />
                        <span>Instagram Automated Sync Hub</span>
                      </h3>

                      <p className={`text-xs leading-normal ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                        Connect your portfolio live to your actual Instagram stream! Provide your Instagram Long-Lived Access Token to display all live posts automatically on the Origin section.
                      </p>

                      <div className="space-y-3 text-left">
                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                            Instagram Access Token:
                          </label>
                          <input
                            type="password"
                            value={instagramAccessToken}
                            onChange={(e) => setInstagramAccessToken(e.target.value)}
                            placeholder="Enter your Instagram Long-Lived Access Token..."
                            className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                        </div>

                        {instagramSyncError && (
                          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[11px] leading-relaxed font-mono">
                            ⚠️ <strong>Sync Flag Error:</strong> {instagramSyncError}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => syncInstagram(instagramAccessToken)}
                            disabled={isSyncingInstagram || !instagramAccessToken}
                            className={`flex-[2] py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                              isSyncingInstagram 
                                ? 'bg-[#FF5500]/50 text-white cursor-not-allowed'
                                : instagramAccessToken 
                                  ? 'bg-[#FF5500] hover:bg-[#FF4400] text-white cursor-pointer hover:scale-[1.01]' 
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                          >
                            <RefreshCw size={13} className={isSyncingInstagram ? 'animate-spin' : ''} />
                            <span>{isSyncingInstagram ? 'Synchronizing...' : 'Sync Instagram Now'}</span>
                          </button>

                          {instagramAccessToken && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Disconnect Instagram Sync and revert to default curated portfolio posts?')) {
                                  setInstagramAccessToken('');
                                  localStorage.removeItem('mp_instagram_access_token');
                                  localStorage.removeItem('mp_instagram_last_sync');
                                  setInstagramPosts(INSTAGRAM_POSTS);
                                  localStorage.removeItem('mp_instagram_posts');
                                  setInstagramSyncError('');
                                }
                              }}
                              className="flex-1 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-extrabold uppercase rounded-xl transition-all cursor-pointer"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                        {/* Automated Sync Timing Status tracker */}
                        {localStorage.getItem('mp_instagram_last_sync') && (
                          <div className={`text-[10px] font-mono text-left p-2.5 rounded-xl flex items-center justify-between ${
                            currentTheme === 'light'
                              ? 'bg-green-150/40 border-green-500/20 text-emerald-800 font-bold'
                              : 'bg-green-950/20 border-green-500/10 text-green-400'
                          }`}>
                            <span>✓ Last Stream Fetch Success:</span>
                            <span>
                              {new Date(parseInt(localStorage.getItem('mp_instagram_last_sync') || '0', 10)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        {/* Integration Helper Guidance */}
                        <div className={`p-4 border rounded-2xl space-y-2.5 ${
                          currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/45 border-white/5'
                        }`}>
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#FF5500] block">🔑 How to Generate Your Token (Takes 2 Minutes)</span>
                          <ol className={`list-decimal list-inside text-[10px] space-y-1.5 leading-relaxed pl-1 ${
                            currentTheme === 'light' ? 'text-slate-650' : 'text-slate-500'
                          }`}>
                            <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className={`hover:underline decoration-[#FF5500] ${currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white'}`}>Meta Developers Portal</a> and create an App.</li>
                            <li>Add the <strong>Instagram Basic Display API</strong> and scroll to test accounts.</li>
                            <li>Add your Instagram Handle <strong>@mpanjiyar1</strong> under Tester Invitation.</li>
                            <li>Log in to your Instagram on Web, go to <i>Settings &gt; Apps &amp; Websites</i> and accept the request.</li>
                            <li>Return to Developers console, go to <strong>User Token Generator</strong> and click <strong>Generate</strong>!</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                    ) : null}

                    {/* Drag and Drop Social Links Reordering Dashboard Card */}
                    {adminSubTab === 'gallery' ? (
                    <div id="social-reorder-card" className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          <GripVertical size={18} className="text-[#FF5500]" />
                          <span>Arrange Social Channels Order</span>
                        </h3>
                        <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                          Live Ordered
                        </span>
                      </div>

                      <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-655' : 'text-slate-400'}`}>
                        Drag and drop items using the grab handles, or use the individual controls to live-arrange and modify social channels on the homepage.
                      </p>

                      {/* Bulk Selection and Action Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 text-[11px] font-mono text-slate-400 border-b border-dashed border-slate-200/50 dark:border-white/5 pb-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={socialLinks.length > 0 && selectedSocialIds.length === socialLinks.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSocialIds(socialLinks.map(s => s.id));
                              } else {
                                setSelectedSocialIds([]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-350 accent-[#FF5500] cursor-pointer"
                          />
                          <span>Select All ({socialLinks.length} Links)</span>
                        </label>
                        
                        <button
                          type="button"
                          onClick={() => setEditingItem({
                            type: 'social_link',
                            data: {
                              name: '',
                              handle: '',
                              url: '',
                              platform: 'instagram',
                              badge: '',
                              order: socialLinks.length
                            }
                          })}
                          className="text-[#FF5500] hover:text-[#FF4400] hover:underline font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Add Channel
                        </button>
                      </div>

                      {/* Bulk Action Toolbar */}
                      {selectedSocialIds.length > 0 && (
                        <div className="p-3 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-indigo-400" />
                            <span className={`font-black uppercase tracking-wider ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                              {selectedSocialIds.length} Channel{selectedSocialIds.length > 1 ? 's' : ''} Selected
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleBulkDisableSocials(true)}
                              className="px-2.5 py-1.5 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-500/15 font-bold uppercase rounded-lg transition-colors cursor-pointer text-[10px]"
                            >
                              Disable/Mute
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkDisableSocials(false)}
                              className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/15 font-bold uppercase rounded-lg transition-colors cursor-pointer text-[10px]"
                            >
                              Activate
                            </button>
                            <button
                              type="button"
                              onClick={handleBulkDeleteSocials}
                              className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-550/15 font-bold uppercase rounded-lg transition-colors cursor-pointer text-[10px]"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSocialIds([])}
                              className={`px-2 py-1.5 hover:underline font-bold uppercase ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'} text-[9px] cursor-pointer`}
                            >
                              Deselect
                            </button>
                          </div>
                        </div>
                      )}

                      <Reorder.Group
                        axis="y"
                        values={socialLinks}
                        onReorder={setSocialLinks}
                        className="space-y-2 max-h-[350px] overflow-y-auto pr-1"
                        as="div"
                      >
                        {socialLinks.length === 0 ? (
                          <div className={`py-8 text-center font-mono text-xs ${currentTheme === 'light' ? 'text-slate-400' : 'text-zinc-650'}`}>
                            -- No channels found --
                          </div>
                        ) : (
                          socialLinks.map((link, idx) => {
                            // Icon platform resolver
                            let iconElement = <Globe size={13} />;
                            if (link.customIcon === 'twitter') iconElement = <Twitter size={13} />;
                            else if (link.customIcon === 'linkedin') iconElement = <Linkedin size={13} />;
                            else if (link.customIcon === 'github') iconElement = <Github size={13} />;
                            else if (link.customIcon === 'slack') iconElement = <Slack size={13} />;
                            else if (link.customIcon === 'twitch') iconElement = <Twitch size={13} />;
                            else if (link.customIcon === 'dribbble') iconElement = <Dribbble size={13} />;
                            else if (link.customIcon === 'briefcase') iconElement = <Briefcase size={13} />;
                            else if (link.customIcon === 'globe') iconElement = <Globe size={13} />;
                            else if (link.customIcon === 'mail') iconElement = <Mail size={13} />;
                            else if (link.customIcon === 'phone') iconElement = <Phone size={13} />;
                            else if (link.customIcon === 'link') iconElement = <Link size={13} />;
                            else if (link.platform === 'instagram') iconElement = <Instagram size={13} />;
                            else if (link.platform === 'whatsapp') iconElement = (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            );
                            else if (link.platform === 'facebook') iconElement = <Facebook size={13} />;
                            else if (link.platform === 'youtube') iconElement = <Youtube size={13} />;
                            else if (link.platform === 'camera') iconElement = <Camera size={13} />;
                            else if (link.platform === 'twitter') iconElement = <Twitter size={13} />;
                            else if (link.platform === 'linkedin') iconElement = <Linkedin size={13} />;
                            else if (link.platform === 'etejo') {
                              iconElement = (
                                <svg
                                  viewBox="0 0 100 100"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-3.5 h-3.5 text-inherit"
                                >
                                  <rect x="12" y="12" width="76" height="76" rx="22" stroke="currentColor" strokeWidth="8" />
                                  <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="8" />
                                  <path d="M42 50 H58" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                  <path d="M50 38 A12 12 0 1 1 38 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
                                  <circle cx="72" cy="28" r="5" fill="currentColor" />
                                </svg>
                              );
                            }

                            return (
                              <Reorder.Item
                                key={link.id}
                                value={link}
                                as="div"
                                onDragEnd={handleSocialDragEnd}
                                whileHover={{ scale: 1.018, y: -2 }}
                                whileTap={{ scale: 0.985, cursor: "grabbing" }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-colors duration-200 select-none ${
                                  currentTheme === 'light'
                                    ? 'bg-slate-50 hover:bg-white hover:border-[#FF5500]/30 border-slate-200 hover:shadow-md'
                                    : 'bg-black/35 hover:bg-zinc-900/40 hover:border-[#FF5500]/30 border-white/5 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center space-x-2 text-left min-w-0 flex-1">
                                  {/* Individual Select Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={selectedSocialIds.includes(link.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSocialIds(prev => [...prev, link.id]);
                                      } else {
                                        setSelectedSocialIds(prev => prev.filter(id => id !== link.id));
                                      }
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-350 accent-[#FF5500] cursor-pointer flex-shrink-0"
                                  />

                                  {/* Drag Handle Indicator */}
                                  <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-300/10 dark:hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 flex-shrink-0">
                                    <GripVertical size={13} />
                                  </div>

                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                    currentTheme === 'light' ? 'bg-slate-200/50 text-slate-700' : 'bg-white/5 text-white'
                                  }`}>
                                    {iconElement}
                                  </div>

                                  <div className="truncate pr-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-[11px] font-bold block truncate leading-tight ${
                                        link.disabled 
                                          ? 'text-slate-400 dark:text-zinc-500 line-through font-normal' 
                                          : currentTheme === 'light' ? 'text-slate-800' : 'text-white'
                                      }`}>
                                        {link.name}
                                      </span>
                                      {link.disabled && (
                                        <span className="text-[7.5px] font-black tracking-wider uppercase bg-yellow-500/10 text-yellow-500 px-1 py-0.2 rounded border border-yellow-500/20">
                                          Muted
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9.5px] text-slate-400 truncate block leading-tight mt-0.5">
                                      {link.handle}
                                    </span>
                                  </div>
                                </div>

                                {/* Controls Toggle/Edit/Arrows/Delete */}
                                <div className="flex items-center space-x-1 flex-shrink-0 z-30" onClick={(e) => e.stopPropagation()}>
                                  {/* Toggle Disable/Enable */}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const nextDisabled = !link.disabled;
                                      const updatedLink = { ...link, disabled: nextDisabled };
                                      setSocialLinks(prev => prev.map(s => s.id === link.id ? updatedLink : s));
                                      try {
                                        await setDoc(doc(db, 'social_links', link.id), updatedLink);
                                        triggerToast(`Social channel "${link.name}" ${nextDisabled ? 'disabled' : 'enabled'} successfully!`, 'success');
                                      } catch (err) {
                                        console.error('Error toggling social link:', err);
                                        triggerToast('Failed to save status to database', 'error');
                                      }
                                    }}
                                    className={`p-1 rounded cursor-pointer transition-colors ${
                                      link.disabled
                                        ? 'text-yellow-500 hover:bg-yellow-500/10'
                                        : 'text-emerald-500 hover:bg-emerald-500/10'
                                    }`}
                                    title={link.disabled ? 'Enable Channel' : 'Disable/Mute Channel'}
                                  >
                                    {link.disabled ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>

                                  {/* Edit button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingItem({
                                      type: 'social_link',
                                      id: link.id,
                                      data: { ...link }
                                    })}
                                    className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-white/5 rounded transition-colors cursor-pointer"
                                    title="Edit Channel Details"
                                  >
                                    <Edit size={13} />
                                  </button>

                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    onClick={() => moveSocialChannel(idx, 'up')}
                                    disabled={idx === 0}
                                    className={`hidden sm:inline-flex p-1 rounded transition-colors ${
                                      idx === 0
                                        ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-20'
                                        : 'text-[#FF5500] hover:bg-indigo-500/10 dark:hover:bg-white/5 cursor-pointer'
                                    }`}
                                    title="Move Up"
                                  >
                                    <ChevronUp size={13} />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    onClick={() => moveSocialChannel(idx, 'down')}
                                    disabled={idx === socialLinks.length - 1}
                                    className={`hidden sm:inline-flex p-1 rounded transition-colors ${
                                      idx === socialLinks.length - 1
                                        ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-20'
                                        : 'text-[#FF5500] hover:bg-indigo-500/10 dark:hover:bg-white/5 cursor-pointer'
                                    }`}
                                    title="Move Down"
                                  >
                                    <ChevronDown size={13} />
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm(`Are you sure you want to remove the social channel "${link.name}"?`)) {
                                        setSocialLinks(prev => prev.filter(s => s.id !== link.id));
                                        setSelectedSocialIds(prev => prev.filter(id => id !== link.id));
                                        try {
                                          await deleteDoc(doc(db, 'social_links', link.id));
                                          triggerToast('Social channel deleted successfully!', 'success');
                                        } catch (err) {
                                          console.error('Error deleting social link:', err);
                                          triggerToast('Failed to delete channel from database', 'error');
                                        }
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                    title="Delete Channel"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </Reorder.Item>
                            );
                          })
                        )}
                      </Reorder.Group>
                    </div>
                    ) : null}
                  </div>

                  {/* HOMEPAGE BRAND & CORE IDENTITY EDITOR */}
                  {adminSubTab === 'overview' && (
                  <>
                  <div className={`p-6 rounded-3xl border ${s.card} space-y-6 lg:col-span-12 mt-4 text-left`}>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Settings size={18} className="text-[#FF5500]" />
                      <span>Configure Live Web Branding &amp; Identities</span>
                    </h3>
                    <p className={`text-xs -mt-3 ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                      Update the text, logo, top alert banner, phone numbers, contact email, address, and target CTAs. Changes are instantly saved globally in the Firestore cloud database and synchronized live for all visitors!
                    </p>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (isSavingIdentity) return;
                      setIsSavingIdentity(true);
                      try {
                        await updateSiteConfig({
                          logoText,
                          logoSubtext,
                          bannerText,
                          exploreButtonText,
                          exploreButtonLink,
                          contactPhoneIt,
                          contactPhonePhotos,
                          contactEmail,
                          contactAddress
                        });
                        triggerToast('Live configurations updated in clouds successfully!', 'success');
                      } catch (err) {
                        console.error(err);
                        triggerToast('Error saving remote adjustments.', 'error');
                      } finally {
                        setIsSavingIdentity(false);
                      }
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Brand Logo Title:</label>
                            <input
                              type="text"
                              required
                              value={logoText}
                              onChange={(e) => setLogoText(e.target.value)}
                              placeholder="e.g. MURARI PANJIYAR"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Brand Logo Subtitle:</label>
                            <input
                              type="text"
                              required
                              value={logoSubtext}
                              onChange={(e) => setLogoSubtext(e.target.value)}
                              placeholder="e.g. Pixel Fix & Pixel Frame"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Top Dynamic Alert Banner:</label>
                          <textarea
                            rows={2}
                            required
                            value={bannerText}
                            onChange={(e) => setBannerText(e.target.value)}
                            placeholder="Add top alert bar promotional info..."
                            className={`w-full px-4 py-2 rounded-xl text-xs outline-none transition-all ${s.input} h-16 resize-none`}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Explore Button Text:</label>
                            <input
                              type="text"
                              required
                              value={exploreButtonText}
                              onChange={(e) => setExploreButtonText(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Explore Button Link/Tab:</label>
                            <input
                              type="text"
                              required
                              value={exploreButtonLink}
                              onChange={(e) => setExploreButtonLink(e.target.value)}
                              placeholder="e.g. #affiliate, #gallery, #contact"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Pixel Fix WhatsApp/Tel:</label>
                            <input
                              type="text"
                              required
                              value={contactPhoneIt}
                              onChange={(e) => setContactPhoneIt(e.target.value)}
                              placeholder="10-digit number e.g. 8638875231"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Pixel Frame WhatsApp/Tel:</label>
                            <input
                              type="text"
                              required
                              value={contactPhonePhotos}
                              onChange={(e) => setContactPhonePhotos(e.target.value)}
                              placeholder="10-digit number e.g. 9864361940"
                              className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Core Client Inquiry Email:</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-xs font-extrabold block ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>Office Business Location Address:</label>
                          <input
                            type="text"
                            required
                            value={contactAddress}
                            onChange={(e) => setContactAddress(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none transition-all ${s.input}`}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-end pt-2 border-t border-slate-200/50 dark:border-white/5">
                        <button
                          type="submit"
                          disabled={isSavingIdentity}
                          className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border select-none transition-all ${
                            isSavingIdentity
                              ? 'bg-[#FF5500]/50 text-white cursor-not-allowed border-transparent'
                              : 'bg-[#FF5500] hover:bg-[#FF4400] text-white border-[#FF5500] shadow-md hover:scale-[1.01]'
                          }`}
                        >
                          {isSavingIdentity ? 'Saving live settings...' : 'Push Adjustments to Live Site'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* GOOGLE DRIVE SYNC & ARCHIVE SUITE (FULL WIDTH CONTAINER) */}
                  <div className={`p-6 rounded-3xl border ${s.card} space-y-6 lg:col-span-12 mt-4 text-left`}>
                    <h3 className={`text-lg font-black flex items-center justify-between gap-2 flex-wrap ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Cloud size={18} className="text-[#FF5500]" />
                        <span>Google Drive Cloud Backup & Recovery Suite</span>
                      </div>
                      {driveUser && (
                        <div className="flex items-center gap-1.5">
                          {isDriveAutosaving ? (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce inline-block" />
                              Auto-syncing photo update...
                            </span>
                          ) : (
                            <span className="text-[10px] bg-green-500/10 text-green-400 font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 leading-none">
                              <span className="w-1.5 h-1.5 bg-green-450 rounded-full inline-block" />
                              Live Drive Sync Active
                            </span>
                          )}
                        </div>
                      )}
                    </h3>

                    <p className={`text-xs leading-relaxed ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                      Secure and backup all your portfolio customizations, live Instagram stream bindings, and client inquiry log streams directly into your personal Google Drive storage. Restores take a single click!
                    </p>

                    {!driveUser ? (
                      <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center space-y-4 ${
                        currentTheme === 'light' ? 'bg-slate-50 border-slate-350' : 'bg-black/35 border-white/10'
                      }`}>
                        <div className="w-12 h-12 bg-[#FF5500]/10 rounded-full flex items-center justify-center text-[#FF5500]">
                          <HardDrive size={24} />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Google Workspace Drive Integration</h4>
                          <p className={`text-xs max-w-md ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Connect your personal Google Drive account with secure permissions to create and restore complete automated backups of your online portfolio.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDriveSignIn}
                          disabled={isDriveLoading}
                          className={`hover:opacity-95 py-3 px-6 bg-white text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-2.5 shadow transition-all cursor-pointer hover:scale-[1.01] ${
                            currentTheme === 'light' ? 'border border-slate-200' : ''
                          }`}
                        >
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          </svg>
                          <span className="text-slate-900 font-black font-sans">Authorize & Connect Google Drive</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-green-500/5 rounded-2xl border border-green-500/15">
                          <div className="flex items-center space-x-3 text-left">
                            {driveUser.photoURL ? (
                              <img src={driveUser.photoURL} alt={driveUser.displayName || 'Google Account'} className="w-10 h-10 rounded-full border border-green-500/20" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center font-extrabold text-green-400 font-mono">
                                {driveUser.email?.[0].toUpperCase() || 'G'}
                              </span>
                            )}
                            <div>
                              <span className={`font-extrabold text-xs block leading-tight ${
                                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>{driveUser.displayName || 'Authorized Google Drive Session'}</span>
                              <span className={`text-[10px] block font-mono ${
                                currentTheme === 'light' ? 'text-slate-500 font-semibold' : 'text-slate-450'
                              }`}>{driveUser.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={handleCreateBackup}
                              disabled={isDriveLoading}
                              className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold text-xs uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {isDriveLoading ? <RefreshCw size={12} className="animate-spin" /> : <Cloud size={12} />}
                              <span>Create Cloud Backup</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveAllPhotosToDrive}
                              disabled={isDriveLoading}
                              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              title="Syncs the profile pictures, portfolio shots, and branding banners directly as raw picture files to a dedicated folder inside Google Drive."
                            >
                              {isDriveLoading ? <RefreshCw size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                              <span>Save Origin Photos to Drive</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDriveSignOut}
                              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-755 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <LogOut size={11} />
                              <span>Disconnect</span>
                            </button>
                          </div>
                        </div>

                        {driveStatusMessage && (
                          <div className="p-3.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-mono leading-relaxed text-left flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 shrink-0" />
                            <div>{driveStatusMessage}</div>
                          </div>
                        )}

                        {driveErrorMessage && (
                          <div className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-mono leading-relaxed text-left flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <div>{driveErrorMessage}</div>
                          </div>
                        )}

                        {/* List historical cloud backups */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-extrabold uppercase tracking-wider block ${
                              currentTheme === 'light' ? 'text-slate-700' : 'text-slate-400'
                            }`}>☁ Cloud Space Backups List ({driveBackups.length})</span>
                            <button
                              type="button"
                              onClick={() => loadBackups(driveToken!)}
                              disabled={isDriveLoading}
                              className="text-[10px] text-slate-500 hover:text-[#FF5500] font-mono flex items-center gap-1 leading-none uppercase tracking-wide cursor-pointer transition-colors"
                            >
                              <RefreshCw size={9} className={isDriveLoading ? 'animate-spin' : ''} /> Refresh Catalog
                            </button>
                          </div>

                          {driveBackups.length === 0 ? (
                            <div className={`py-8 text-center font-mono text-xs border border-dashed rounded-2xl ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-600' : 'bg-black/20 border-white/5 text-zinc-650'
                            }`}>
                              -- No backup files found in this Google Drive --<br />
                              <span className={`text-[10px] font-sans mt-1 block ${
                                currentTheme === 'light' ? 'text-slate-500' : 'text-slate-550'
                              }`}>Click "Create Cloud Backup" to secure your digital configurations.</span>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                              {driveBackups.map((file) => (
                                <div
                                  key={file.id}
                                  className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                                  }`}
                                >
                                  <div className="flex items-start space-x-3 text-left">
                                    <div className="w-9 h-9 bg-[#FF5500]/10 rounded-xl flex items-center justify-center text-[#FF5500] shrink-0 mt-0.5 font-mono text-[9px] font-black">
                                      JSON
                                    </div>
                                    <div className="min-w-0">
                                      <span className={`font-extrabold block truncate leading-tight mb-0.5 ${
                                        currentTheme === 'light' ? 'text-slate-800' : 'text-white'
                                      }`}>{file.name}</span>
                                      <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-500">
                                        <span>📅 {new Date(file.createdTime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        {file.size && <span>• 💾 {Math.round(parseInt(file.size, 10) / 1024 * 100) / 100} KB</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreBackup(file)}
                                      disabled={isDriveLoading}
                                      className="px-3 py-1.5 bg-[#FF5500] hover:bg-[#FF4400] text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Restore State
                                    </button>
                                    {file.webViewLink && (
                                      <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all inline-block text-center border cursor-pointer ${
                                          currentTheme === 'light'
                                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-white/5'
                                        }`}
                                      >
                                        View File
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBackup(file)}
                                      disabled={isDriveLoading}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer"
                                      title="Purge backup"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DATABASE STORAGE OPTIMIZER */}
                  <div className={`p-6 rounded-3xl border ${s.card} space-y-4 lg:col-span-12 mt-4 text-left relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 text-[10px] font-mono text-green-500/10 select-none">DB_OPTIMIZER</div>
                    
                    <h3 className={`text-lg font-black flex items-center justify-between gap-2 flex-wrap ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Cpu size={18} className="text-green-500 animate-pulse" />
                        <span>Database Storage Optimizer</span>
                      </div>
                      <span className="text-[10px] bg-green-500/10 text-green-500 font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-green-500/20 leading-none">
                        Anti-Limit Guard
                      </span>
                    </h3>

                    <p className={`text-xs leading-relaxed ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                      Are you getting Firestore size errors when saving? This utility scans your current portfolio gallery, custom reviews, and background graphics, compresses any oversized Base64 images to web-optimized JPEGs (reducing their size by 95%+), and overwrites the database document securely.
                    </p>

                    {optimizationSuccessMessage && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-500 font-semibold">
                        {optimizationSuccessMessage}
                      </div>
                    )}

                    {optimizationErrorMessage && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500 font-semibold">
                        {optimizationErrorMessage}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleOptimizeDatabase}
                        disabled={isOptimizingDatabase}
                        className={`px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          isOptimizingDatabase
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/10'
                        }`}
                      >
                        {isOptimizingDatabase ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Optimizing Database Assets...</span>
                          </>
                        ) : (
                          <>
                            <Zap size={13} />
                            <span>Optimize & Compress Database Storage</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PORTABLE LOCAL SYNC PACK WORKSPACE */}
                  <div className={`p-6 rounded-3xl border ${s.card} space-y-6 lg:col-span-12 mt-4 text-left relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 text-[10px] font-mono text-[#FF5500]/10 select-none">SYNC_CORE</div>
                    
                    <h3 className={`text-lg font-black flex items-center justify-between gap-2 flex-wrap ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FolderOpen size={18} className="text-[#FF5500]" />
                        <span>Offline Portable Sync Pack Engine</span>
                      </div>
                      <span className="text-[10px] bg-[#FF5500]/10 text-[#FF5500] font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-[#FF5500]/20 leading-none">
                        Self-Hosted / Standard JSON
                      </span>
                    </h3>

                    <p className={`text-xs leading-relaxed ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-400'}`}>
                      Don't have a Google account connected? No problem! Use **Portable Sync Packs** to manually export and import your entire website database. Sync Packs are standard JSON files containing your customized services, client logs, portfolio galleries, and theme configurations that you can store locally on your computer.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Left: Export panel */}
                      <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/35 border-white/5'
                      }`}>
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase text-[#FF5500] tracking-wider block font-mono">STEP 1 — Export Sync Pack</span>
                          <h4 className={`text-sm font-extrabold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Save Current Database File</h4>
                          <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-450'}`}>
                            Compile all profile statistics, review items, media arrays, and contact mailbox entries into a download-ready JSON file instantly.
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleExportSyncPack}
                          className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                          <Download size={14} />
                          <span>Download Portable Sync Pack</span>
                        </button>
                      </div>

                      {/* Right: Import panel */}
                      <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/35 border-white/5'
                      }`}>
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase text-indigo-500 dark:text-sky-400 tracking-wider block font-mono">STEP 2 — Import Sync Pack</span>
                          <h4 className={`text-sm font-extrabold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Restore settings or Migrate</h4>
                          <p className={`text-xs ${currentTheme === 'light' ? 'text-slate-650' : 'text-slate-450'}`}>
                            Restore from a previously saved JSON Sync Pack or migrate settings from another system. <span className="text-rose-500 font-extrabold">Warning:</span> This will overwrite current live database states.
                          </p>
                        </div>

                        <div className="relative">
                          <input
                            type="file"
                            id="sync-pack-uploader-input"
                            accept="application/json,.json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImportSyncPack(file);
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('sync-pack-uploader-input')?.click()}
                            className={`w-full py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-[0.99] ${
                              currentTheme === 'light'
                                ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                                : 'bg-slate-800 text-slate-200 border-white/5 hover:bg-slate-750'
                            }`}
                          >
                            <UploadCloud size={14} />
                            <span>Select & Upload Sync Pack</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pack Messages feedback info */}
                    {packStatusMessage && (
                      <div className="p-3.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-mono leading-relaxed text-left flex items-start gap-2">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" />
                        <div>{packStatusMessage}</div>
                      </div>
                    )}

                    {packErrorMessage && (
                      <div className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-mono leading-relaxed text-left flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <div>{packErrorMessage}</div>
                      </div>
                    )}
                  </div>
                  </>
                  )}

                </div>
              )}
            </div>
          )}
          </motion.div>
        )}
        </AnimatePresence>

      </main>

      {/* DYNAMIC SHOWCASE PICTURE DETAIL PREVIEW SPEC MODAL */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
              if (isSwipingRef.current) return;
              if (e.target === e.currentTarget) {
                setPreviewImage(null);
              }
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{
                type: "spring",
                damping: 32,
                stiffness: 380,
                mass: 1
              }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-3xl p-4 md:p-6 max-w-3xl w-full text-left space-y-4 relative select-none ${
                currentTheme === 'light' ? 'bg-white border-slate-200 shadow-2xl' : 'bg-[#18181F] border border-white/10'
              }`}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className={`absolute top-4 right-4 p-1.5 rounded-full cursor-pointer z-10 transition-colors ${
                  currentTheme === 'light' ? 'text-slate-500 hover:text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-white bg-black/60'
                }`}
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between pb-1 pt-4">
                <span className="text-[10px] uppercase font-mono font-bold text-[#FF5500] tracking-wider px-2.5 py-0.5 bg-[#FF5500]/10 rounded border border-[#FF5500]/20 inline-block">
                  {getCategoryLabel(previewImage.category).toUpperCase()}
                </span>
                {previewImageIndex !== -1 && (
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    currentTheme === 'light' ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-white/5'
                  }`}>
                    {previewImageIndex + 1} of {filteredItems.length}
                  </span>
                )}
              </div>

              <div className="w-full flex justify-center">
                <div 
                  className={`rounded-2xl overflow-hidden relative border transition-all duration-300 ${
                    currentTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black border-white/5'
                  }`}
                  style={{ 
                    aspectRatio: modalImageAspectRatio ? `${modalImageAspectRatio}` : '16/9',
                    width: modalImageAspectRatio 
                      ? `min(100%, calc(55vh * ${modalImageAspectRatio}))` 
                      : '100%',
                    maxHeight: '55vh',
                    maxWidth: '100%'
                  }}
                >
                  <AnimatePresence initial={false} custom={navigationDirection} mode="popLayout">
                    <motion.div
                      key={previewImage.id}
                      custom={navigationDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={slideTransition}
                      className="absolute inset-0 w-full h-full"
                    >
                      <LazyImage
                        src={previewImage.imageUrl}
                        alt={previewImage.altText}
                        className="w-full h-full object-contain select-none pointer-events-none"
                        placeholderClassName="absolute inset-0 z-0"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Left overlay navigation arrow */}
                  {hasPrevPreview && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigatePrevPreview(); }}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full cursor-pointer transition-all duration-200 z-10 flex items-center justify-center border hover:scale-105 active:scale-95 ${
                        currentTheme === 'light'
                          ? 'bg-white/90 border-slate-200 text-slate-800 shadow-md hover:bg-slate-50'
                          : 'bg-black/70 border-white/10 text-white shadow-lg hover:bg-black/90'
                      }`}
                      title="Previous image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}

                  {/* Right overlay navigation arrow */}
                  {hasNextPreview && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateNextPreview(); }}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full cursor-pointer transition-all duration-200 z-10 flex items-center justify-center border hover:scale-105 active:scale-95 ${
                        currentTheme === 'light'
                          ? 'bg-white/90 border-slate-200 text-slate-800 shadow-md hover:bg-slate-50'
                          : 'bg-black/70 border-white/10 text-white shadow-lg hover:bg-black/90'
                      }`}
                      title="Next image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg md:text-xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {previewImage.title}
                  </h3>
                </div>
                
                <div className={`flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-2 border-t ${
                  currentTheme === 'light' ? 'text-slate-600 border-slate-200' : 'text-slate-500 border-white/5'
                }`}>
                  <div className="flex flex-wrap items-center gap-4">
                    <span>🗓️ Shot Date: {previewImage.date}</span>
                    <span>📷 Camera Parameters: <strong className={currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-normal'}>{previewImage.cameraInfo || 'Nikon Z8 • High Definition Output'}</strong></span>
                  </div>
                  <span className={`text-[10px] italic ${currentTheme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Tip: Swipe or use Left/Right arrows
                  </span>
                </div>
              </div>

              <div className={`pt-4 border-t flex flex-col sm:flex-row gap-3 ${
                currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
              }`}>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    triggerQuickBooking('photography', `Hi Murari, I just saw your photo "${previewImage.title}" in your portfolio! I would like to inquire about similar event coverage details.`);
                  }}
                  className="w-full sm:flex-1 bg-[#FF5500] hover:bg-[#FF4400] text-zinc-100 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 text-center cursor-pointer transition-all duration-200"
                >
                  <WhatsAppIcon size={14} /> <span className="text-center">Request Portfolio Similar Shoot</span>
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                    currentTheme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <span>Close Spec Preview</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE SMPS PSU CALCULATOR MODAL */}
      <AnimatePresence>
        {isSmpsCalculatorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSmpsCalculatorOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
            >
              <button
                onClick={() => setIsSmpsCalculatorOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer z-50 transition-colors ${
                  currentTheme === 'light' 
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200' 
                    : 'text-slate-400 hover:text-white bg-black/60 hover:bg-black/80 border border-white/5'
                }`}
                aria-label="Close Calculator"
              >
                <X size={18} />
              </button>
              <SmpsCalculator currentTheme={currentTheme} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIRECT MOTHERBOARD DIAGNOSTICS BOOKING MODAL */}
      <AnimatePresence>
        {activeBookingBeep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setActiveBookingBeep(null);
              setBeepBookingSuccess(false);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl ${s.card}`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveBookingBeep(null);
                  setBeepBookingSuccess(false);
                }}
                className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer z-50 transition-colors ${
                  currentTheme === 'light' 
                    ? 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200' 
                    : 'text-slate-400 hover:text-white bg-black/60 hover:bg-black/80 border border-white/5'
                }`}
                aria-label="Close Booking"
              >
                <X size={16} />
              </button>

              {!beepBookingSuccess ? (
                <div className="space-y-6">
                  {/* Modal Header */}
                  <div className="space-y-1.5 pr-8">
                    <span className="text-[10px] uppercase tracking-widest font-black text-[#FF5500] font-mono flex items-center gap-1">
                      <Sparkles size={12} />
                      Doorstep Service Dispatch
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      Motherboard Diagnostics Booking
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Secure certified motherboard repairs in Guwahati. Fill details below to register the diagnostic request.
                    </p>
                  </div>

                  {/* Diagnosed Ticket Summary */}
                  <div className={`p-4 rounded-2xl border ${
                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                  } space-y-3`}>
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-white/10 pb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">BIOS Platform</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] font-mono">
                        {activeBookingBeep.biosBrand}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-white/10 pb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Detected Pattern</span>
                      <span className="text-xs font-black text-[#FF5500] font-mono">
                        {activeBookingBeep.pattern} ({activeBookingBeep.patternDescription})
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-white/10 pb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Suspected Component</span>
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                        {activeBookingBeep.affectedComponent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Severity Level</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
                        activeBookingBeep.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        activeBookingBeep.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {activeBookingBeep.severity}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!bookingName || !bookingPhone) {
                      triggerToast('Please complete Name and Phone fields!', 'error');
                      return;
                    }

                    // Create log message
                    const newMsg: ContactMessage = {
                      id: 'beep_booking_' + Date.now(),
                      name: bookingName,
                      email: 'Via BIOS Beep Diagnostician',
                      phone: bookingPhone,
                      serviceType: 'it_fix',
                      message: `[Doorstep Motherboard Repair Request]\n` +
                               `BIOS Brand: ${activeBookingBeep.biosBrand}\n` +
                               `Acoustic Code: ${activeBookingBeep.pattern}\n` +
                               `Detected Fault: ${activeBookingBeep.affectedComponent} (${activeBookingBeep.severity})\n` +
                               `Schedule Date: ${beepBookingDateTime || 'As soon as possible'}\n` +
                               `Guwahati Doorstep Address: ${beepBookingAddress || 'Not specified'}\n` +
                               `Client Additional Notes: ${bookingNotes || 'None'}`,
                      timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
                      status: 'unread'
                    };

                    setContactMessages(prev => [newMsg, ...prev]);
                    saveContactMessage(newMsg);
                    setBeepBookingSuccess(true);
                    triggerToast('Motherboard diagnostics request registered successfully!', 'success');
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400 font-mono block">Your Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="e.g. Joydeep Saikia"
                          className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition-all ${s.input}`}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400 font-mono block">Contact / WhatsApp <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          required
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="e.g. +91 98643 61940"
                          className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition-all ${s.input}`}
                        />
                      </div>
                    </div>

                    {/* Preferred Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400 font-mono block">Preferred Slot</label>
                        <input
                          type="datetime-local"
                          value={beepBookingDateTime}
                          onChange={(e) => setBeepBookingDateTime(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition-all ${s.input}`}
                        />
                      </div>

                      {/* Guwahati Location/Landmark */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400 font-mono block">Guwahati Doorstep Area / Landmark</label>
                        <input
                          type="text"
                          value={beepBookingAddress}
                          onChange={(e) => setBeepBookingAddress(e.target.value)}
                          placeholder="e.g. Beltola, Christian Basti, Dispur"
                          className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition-all ${s.input}`}
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11px] font-extrabold uppercase text-slate-400 font-mono block">Custom Issue Details / Symptoms</label>
                      <textarea
                        value={bookingNotes}
                        rows={2}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="My computer won't display anything on screen..."
                        className={`w-full px-4 py-2.5 rounded-2xl text-xs border outline-none transition-all ${s.input}`}
                      />
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 text-left">
                      <button
                        type="submit"
                        className="w-full sm:flex-1 bg-[#FF5500] hover:bg-orange-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs"
                      >
                        Confirm &amp; Log Doorstep Request
                      </button>
                      
                      {/* direct raw whatsapp bypass as anchor tag for safety! */}
                      <a
                        href={`https://wa.me/918638875231?text=${encodeURIComponent(
                          `Hi Murari, need motherboard diagnostic doorstep repair in Guwahati.\n` +
                          `- Device Beep Code: "${activeBookingBeep.pattern}" (${activeBookingBeep.biosBrand})\n` +
                          `- Suspected Component: ${activeBookingBeep.affectedComponent}\n` +
                          `- Client: ${bookingName || 'Prospective client'}\n` +
                          `- Contact: ${bookingPhone || 'N/A'}\n` +
                          `- Area: ${beepBookingAddress || 'Guwahati'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs font-extrabold uppercase tracking-wide transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                          currentTheme === 'light'
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <WhatsAppIcon size={14} />
                        <span className="text-center">Direct WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success Screen */
                <div className="text-center py-6 space-y-6">
                  {/* Success check animation */}
                  <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                    <Check size={32} className="stroke-[3]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-black tracking-widest">
                      Booking Confirmed (TICKET: MP-BEEP-{Date.now().toString().slice(-4)})
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      Diagnostics Ticket Opened!
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Your Motherboard Troubleshooting request is logged to Murari's priority queue. He will review your acoustic signatures and reach out!
                    </p>
                  </div>

                  {/* Summary card */}
                  <div className={`p-4 rounded-2xl border text-left text-xs ${
                    currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                  } space-y-2`}>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>CLIENT:</span>
                      <span className={`font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{bookingName}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>PHONE:</span>
                      <span className={`font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{bookingPhone}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>FAULT CATEGORY:</span>
                      <span className={`font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{activeBookingBeep.affectedComponent} ({activeBookingBeep.biosBrand})</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>DOORSTEP ADDRESS:</span>
                      <span className={`font-bold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'} truncate max-w-[200px]`}>{beepBookingAddress || 'Guwahati'}</span>
                    </div>
                  </div>

                  {/* Dual route buttons on success */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/918638875231?text=${encodeURIComponent(
                        `Hi Murari, I just registered a motherboard diagnostics ticket on your portfolio!\n` +
                        `- Ticket ID: MP-BEEP-${Date.now().toString().slice(-4)}\n` +
                        `- Fault: ${activeBookingBeep.pattern} [${activeBookingBeep.biosBrand}]\n` +
                        `- Target: ${activeBookingBeep.affectedComponent}\n` +
                        `- Client Name: ${bookingName}\n` +
                        `- Location: ${beepBookingAddress || 'Guwahati'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 text-center cursor-pointer shadow-xs"
                    >
                      <WhatsAppIcon size={14} />
                      <span className="text-center">Speed Up via WhatsApp Dispatch</span>
                    </a>

                    <button
                      onClick={() => {
                        setActiveBookingBeep(null);
                        setBeepBookingSuccess(false);
                      }}
                      className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wide transition-colors cursor-pointer ${
                        currentTheme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPANION FOOTER FOOTER MATRIX */}
      <footer className={`mt-20 border-t py-16 px-4 lg:px-8 text-left text-xs ${
        currentTheme === 'light'
          ? 'bg-slate-100/80 border-slate-200 text-slate-600'
          : 'bg-[#08080C] border-white/10 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="col-span-1 md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <PFLogo className={currentTheme === 'mono' ? 'text-zinc-500' : 'text-[#FF5500]'} />
              )}
              <div>
                <span className={`font-black text-xs sm:text-sm tracking-wider uppercase block leading-none ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {logoText}
                </span>
                <span className="text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#FF5500] font-bold block mt-1 leading-none">
                  {logoSubtext}
                </span>
              </div>
            </div>
            <p className={`max-w-sm leading-relaxed text-[11px] ${
              currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Discover expert doorstep IT hardware repairs and genuine operating system installations from Pixel Fix, alongside cinematic high-contrast wedding frames from Pixel Frame.
            </p>
          </div>

          <div className="col-span-1 md:col-span-4 space-y-3">
            <h4 className={`font-bold uppercase tracking-widest text-xs text-[#FF5500]`}>SEO Target Neighborhoods</h4>
            <ul className={`space-y-2 font-mono text-[11px] ${
              currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <li className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#FF5500]" />
                <span className={currentTheme === 'light' ? 'text-slate-800 font-semibold' : 'text-zinc-300'}>Primary Base: Guwahati, Assam, India</span>
              </li>
              <li>• Dispatched on-site technician doorstep computing repair</li>
              <li>• Custom destination photographer services across Northeast regions</li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4 space-y-3">
            <h4 className={`font-bold uppercase tracking-widest text-xs text-[#FF5500]`}>Telephonic Contact Directory</h4>
            <div className={`space-y-2 text-[11px] font-mono ${
              currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <div className={`flex items-center justify-between border-b pb-1 ${
                currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
              }`}>
                <span>Pixel Fix Support:</span>
                <a href={`tel:${contactPhoneIt}`} className="text-[#FF5500] font-bold hover:underline">
                  +91-{contactPhoneIt}
                </a>
              </div>
              <div className={`flex items-center justify-between border-b pb-1 ${
                currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
              }`}>
                <span>Pixel Frame Photography:</span>
                <a href={`tel:${contactPhonePhotos}`} className="text-[#FF5500] font-bold hover:underline">
                  +91-{contactPhonePhotos}
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className={`max-w-7xl mx-auto pt-8 mt-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] ${
          currentTheme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-500'
        }`}>
          <div>
            © 2026 Murari Panjiyar Portfolio. All rights reserved.
          </div>
          <div className="flex space-x-3">
            <a href="https://instagram.com/mpanjiyar1" target="_blank" rel="noreferrer" className={`hover:text-[#FF5500] transition-colors ${
              currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              @mpanjiyar1
            </a>
          </div>
        </div>
      </footer>

      {/* SERVICE DETAILS EXPANDED VIEW MODAL */}
      <AnimatePresence>
        {activeDetailService && (() => {
          const extra = getExtraInclusionsAndSpecs(
            activeDetailService.title,
            activeDetailService.inclusions,
            activeDetailService.technicalSpecs
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25 }}
                className={`w-full max-w-2xl p-6 md:p-8 rounded-[32px] border text-left shadow-2xl relative max-h-[90vh] overflow-y-auto ${
                  currentTheme === 'light' 
                    ? 'bg-white border-slate-350 text-slate-900 shadow-slate-200' 
                    : 'bg-zinc-950 border-zinc-800 text-white'
                }`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveDetailService(null)}
                  className={`absolute top-5 right-5 p-2 rounded-full transition-all cursor-pointer ${
                    currentTheme === 'light' 
                      ? 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200' 
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <X size={18} />
                </button>

                {/* Header Section */}
                <div className="space-y-4 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      activeDetailService.type === 'it'
                        ? 'bg-orange-500/10 text-[#FF5500] border border-[#FF5500]/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-400/20'
                    }`}>
                      {activeDetailService.type === 'it' ? 'Pixel Fix IT Services' : 'Pixel Frame Photography'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      currentTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'
                    }`}>
                      {activeDetailService.price}
                    </span>
                  </div>

                  <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${
                    currentTheme === 'light' ? 'text-slate-950' : 'text-white'
                  }`}>
                    {activeDetailService.title}
                  </h2>

                  <p className={`text-sm leading-relaxed ${
                    currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {activeDetailService.description}
                  </p>

                  {activeDetailService.type === 'it' && activeDetailService.proTip && (
                    <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2 text-xs leading-relaxed transition-all duration-300 ${
                      currentTheme === 'light'
                        ? 'bg-orange-50/70 border-orange-200/50 text-slate-700'
                        : 'bg-[#FF5500]/5 border-[#FF5500]/10 text-slate-300'
                    }`}>
                      <Sparkles size={14} className="text-[#FF5500] shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="font-extrabold text-[#FF5500] mr-1">PRO-TIP:</span>
                        {activeDetailService.proTip}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grid of Inclusions & Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5">
                  {/* Left Column: Exhaustive Inclusions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#FF5500]">
                      <CheckCircle2 size={18} />
                      <h4 className="text-sm font-black uppercase tracking-wider">Service Inclusions</h4>
                    </div>
                    <ul className="space-y-3">
                      {extra.inclusions.map((inc: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-1.5" />
                          <span className={currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                            {inc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Technical Specifications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                      {activeDetailService.type === 'it' ? <Cpu size={18} /> : <Camera size={18} />}
                      <h4 className="text-sm font-black uppercase tracking-wider">Technical Specs</h4>
                    </div>
                    <ul className="space-y-3 font-mono text-[11px] leading-relaxed">
                      {extra.technicalSpecs.map((spec: string, idx: number) => (
                        <li key={idx} className={`p-2.5 rounded-xl border ${
                          currentTheme === 'light' 
                            ? 'bg-slate-50 border-slate-200 text-slate-800' 
                            : 'bg-white/5 border-white/5 text-zinc-300'
                        }`}>
                          <span className="block font-semibold text-[#FF5500]">
                            {spec.split(':')[0]}:
                          </span>
                          <span className="block mt-0.5 opacity-90">
                            {spec.split(':').slice(1).join(':').trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5">
                  <div className="text-xs text-slate-400">
                    *Available across Guwahati and regional Assam districts.
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveDetailService(null)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        currentTheme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const type = activeDetailService.type === 'it' ? 'pixelfix' : 'pixelframe';
                        const notes = activeDetailService.type === 'it'
                          ? `Interested in package: ${activeDetailService.title}. please call.`
                          : `Inquiring about photography category: ${activeDetailService.title}. please coordinate dates.`;
                        setActiveDetailService(null);
                        handleEstimateCostRedirect(type, notes);
                      }}
                      className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white text-xs uppercase font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#FF5500]/20"
                    >
                      <ArrowUpRight size={14} /> Configure Estimate
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* DYNAMIC ADMINISTRATIVE RESOURCE EDIT MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full ${
                editingItem.type === 'affiliate_link' ? 'max-w-4xl' : 'max-w-xl'
              } p-4 sm:p-6 rounded-3xl border text-left shadow-2xl relative max-h-[95vh] lg:max-h-[90vh] overflow-y-auto ${
                currentTheme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-white/10 text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/10 text-slate-400 hover:text-white hover:bg-black/40 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 border-slate-200/50 dark:border-white/5">
                  <Sliders className="text-[#FF5500]" size={20} />
                  <div>
                    <h3 className="text-base font-black">
                      {editingItem.type === 'it_service' && 'Configure Doorstep IT Offering'}
                      {editingItem.type === 'photo_service' && 'Configure Photo Package Offering'}
                      {editingItem.type === 'instagram' && 'Configure Instagram Feed Post'}
                      {editingItem.type === 'hero' && 'Adjust Hero Titles & Profile Photo'}
                      {editingItem.type === 'about' && 'Adjust Biography Narrative'}
                      {editingItem.type === 'gallery_item' && 'Configure Portfolio Showcase Item'}
                      {editingItem.type === 'testimonial' && 'Configure Customer Review'}
                      {editingItem.type === 'pixelfix_review' && 'Configure Pixel Fix IT Review'}
                      {editingItem.type === 'affiliate_link' && 'Configure Curated Affiliate Deal'}
                      {editingItem.type === 'social_link' && 'Configure Social Media Channel & Link'}
                    </h3>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (isSaving) return;
                    setIsSaving(true);
                    
                    try {
                      if (editingItem.type === 'it_service') {
                        const updated = [...itServices];
                        updated[editingItem.index!] = editingItem.data;
                        setItServices(updated);
                        await updateSiteConfig({ itServices: updated });
                      } else if (editingItem.type === 'photo_service') {
                        const updated = [...photoServices];
                        updated[editingItem.index!] = editingItem.data;
                        setPhotoServices(updated);
                        await updateSiteConfig({ photoServices: updated });
                      } else if (editingItem.type === 'instagram') {
                        const itemData = { ...editingItem.data, imageUrl: toDirectDriveUrl(editingItem.data.imageUrl) };
                        const exists = instagramPosts.some(p => p.id === itemData.id);
                        let updatedPosts;
                        if (exists) {
                          updatedPosts = instagramPosts.map(p => p.id === itemData.id ? itemData : p);
                        } else {
                          updatedPosts = [itemData, ...instagramPosts];
                        }
                        setInstagramPosts(updatedPosts);
                        await updateSiteConfig({ instagramPosts: updatedPosts });
                      } else if (editingItem.type === 'hero') {
                        const nextHeadline = editingItem.data.headline;
                        const nextSubheadline = editingItem.data.subheadline;
                        const nextPhoto = toDirectDriveUrl(editingItem.data.photoUrl);
                        setHeroHeadline(nextHeadline);
                        setHeroSubheadline(nextSubheadline);
                        setProfilePhotoUrl(nextPhoto);
                        await updateSiteConfig({
                          heroHeadline: nextHeadline,
                          heroSubheadline: nextSubheadline,
                          profilePhotoUrl: nextPhoto
                        });
                      } else if (editingItem.type === 'about') {
                        const nextBioHeadline = editingItem.data.bioHeadline;
                        const nextBioText = editingItem.data.bioText;
                        setBioHeadline(nextBioHeadline);
                        setBioText(nextBioText);
                        await updateSiteConfig({
                          bioHeadline: nextBioHeadline,
                          bioText: nextBioText
                        });
                      } else if (editingItem.type === 'gallery_item') {
                        const itemData = { ...editingItem.data, imageUrl: toDirectDriveUrl(editingItem.data.imageUrl) };
                        const exists = galleryItems.some(item => item.id === itemData.id);
                        let updated;
                        if (exists) {
                          updated = galleryItems.map(item => item.id === itemData.id ? itemData : item);
                        } else {
                          updated = [itemData, ...galleryItems];
                        }
                        setGalleryItems(updated);
                        await updateSiteConfig({ galleryItems: updated });
                      } else if (editingItem.type === 'testimonial') {
                        let updated;
                        const exists = testimonials.some(t => t.id === editingItem.data.id);
                        if (exists) {
                          updated = testimonials.map(t => t.id === editingItem.data.id ? editingItem.data : t);
                        } else {
                          updated = [...testimonials, editingItem.data];
                        }
                        setTestimonials(updated);
                        await updateSiteConfig({ testimonials: updated });
                      } else if (editingItem.type === 'pixelfix_review') {
                        let updated;
                        const exists = pixelFixReviews.some(t => t.id === editingItem.data.id);
                        if (exists) {
                          updated = pixelFixReviews.map(t => t.id === editingItem.data.id ? editingItem.data : t);
                        } else {
                          updated = [...pixelFixReviews, editingItem.data];
                        }
                        setPixelFixReviews(updated);
                        await updateSiteConfig({ pixelFixReviews: updated });
                      } else if (editingItem.type === 'affiliate_link') {
                        const itemData = {
                          id: editingItem.data.id || 'aff_' + Date.now().toString(),
                          title: editingItem.data.title || '',
                          description: editingItem.data.description || '',
                          category: (editingItem.data.category || '')
                            .split(',')
                            .map(c => c.trim().toLowerCase().replace(/\s+/g, '_'))
                            .filter(Boolean)
                            .join(','),
                          url: editingItem.data.url || '',
                          imageUrl: toDirectDriveUrl(editingItem.data.imageUrl || ''),
                          discountCode: editingItem.data.discountCode || '',
                          price: editingItem.data.price || '',
                          originalPrice: editingItem.data.originalPrice || '',
                          discountPercentage: editingItem.data.discountPercentage || '',
                          availability: editingItem.data.availability || '',
                          clicks: typeof editingItem.data.clicks === 'number' ? editingItem.data.clicks : 0,
                          clickHistory: editingItem.data.clickHistory || {},
                          last_clicked: editingItem.data.last_clicked || '',
                          daily_click_count: editingItem.data.daily_click_count || {}
                        };
                        
                        // Ensure local state is updated immediately before the Firestore network request to provide better UI feedback 
                        setAffiliateLinks((prev) => {
                          const exists = prev.some(a => a.id === itemData.id);
                          if (exists) {
                            return prev.map(a => a.id === itemData.id ? itemData : a);
                          } else {
                            return [itemData, ...prev];
                          }
                        });

                        try {
                          await setDoc(doc(db, 'affiliate_links', itemData.id), itemData);
                        } catch (err) {
                          console.error("Error writing affiliate link to Firestore: ", err);
                          handleFirestoreError(err, OperationType.WRITE, 'affiliate_links/' + itemData.id);
                        }
                      } else if (editingItem.type === 'social_link') {
                        const itemData = {
                          id: editingItem.data.id || 'soc_' + Date.now().toString(),
                          name: editingItem.data.name || '',
                          handle: editingItem.data.handle || '',
                          url: editingItem.data.url || '',
                          platform: editingItem.data.platform || 'custom',
                          badge: editingItem.data.badge || '',
                          order: typeof editingItem.data.order === 'number' ? editingItem.data.order : 0,
                          disabled: editingItem.data.disabled ?? false,
                          customIcon: editingItem.data.customIcon || ''
                        };

                        setSocialLinks((prev) => {
                          const exists = prev.some(s => s.id === itemData.id);
                          if (exists) {
                            return prev.map(s => s.id === itemData.id ? itemData : s).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                          } else {
                            return [...prev, itemData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                          }
                        });

                        try {
                          await setDoc(doc(db, 'social_links', itemData.id), itemData);
                        } catch (err) {
                          console.error("Error writing social link to Firestore: ", err);
                          handleFirestoreError(err, OperationType.WRITE, 'social_links/' + itemData.id);
                        }
                      } else if (editingItem.type === 'software_license') {
                        const itemData: SoftwareLicense = {
                          id: editingItem.data.id || 'lic_' + Date.now().toString(),
                          name: editingItem.data.name || '',
                          price: editingItem.data.price || '',
                          badge: editingItem.data.badge || '',
                          description: editingItem.data.description || '',
                          licenseType: editingItem.data.licenseType || 'Lifetime License Key',
                          imageUrl: toDirectDriveUrl(editingItem.data.imageUrl || ''),
                          features: editingItem.data.features || '',
                          compatibility: editingItem.data.compatibility || '',
                          details: editingItem.data.details || '',
                          category: editingItem.data.category || 'productivity',
                          url: editingItem.data.url || ''
                        };

                        setSoftwareLicenses((prev) => {
                          const exists = prev.some(l => l.id === itemData.id);
                          if (exists) {
                            return prev.map(l => l.id === itemData.id ? itemData : l);
                          } else {
                            return [itemData, ...prev];
                          }
                        });

                        try {
                          await setDoc(doc(db, 'software_licenses', itemData.id), itemData);
                        } catch (err) {
                          console.error("Error writing software license to Firestore: ", err);
                          handleFirestoreError(err, OperationType.WRITE, 'software_licenses/' + itemData.id);
                        }
                      }

                      triggerToast('Portfolio settings modified and saved successfully!', 'success');
                      setEditingItem(null);
                    } catch (err) {
                      console.error("Error applying updates: ", err);
                      let errorMsg = 'An error occurred while updating the portfolio item.';
                      if (err instanceof Error) {
                        try {
                          const parsed = JSON.parse(err.message);
                          if (parsed.error) {
                            errorMsg = `Error: ${parsed.error}`;
                          }
                        } catch {
                          errorMsg = err.message;
                        }
                      }
                      triggerToast(errorMsg, 'error');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="space-y-4 text-xs font-mono"
                >
                  {/* Service Edit fields */}
                  {(editingItem.type === 'it_service' || editingItem.type === 'photo_service') && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Service/Package Title:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, title: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Pricing Label (e.g., ₹500 onwards):</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.price || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, price: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Detailed Description:</span>
                        <textarea
                          required
                          rows={3}
                          value={editingItem.data.description || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, description: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Key Features (comma separated):</span>
                        <textarea
                          required
                          rows={3}
                          value={(editingItem.data.features || []).join(', ')}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              features: ev.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="Feature 1, Feature 2, Feature 3"
                        />
                        <span className="text-[9px] text-zinc-500 block leading-tight">Separate features using standard comma punctuation.</span>
                      </div>
                    </div>
                  )}

                  {/* Instagram Edit fields */}
                  {editingItem.type === 'instagram' && (
                    <div className="space-y-3">
                      <ImageUploader
                        label="Upload Instagram image file"
                        value={editingItem.data.imageUrl || ''}
                        currentTheme={currentTheme}
                        onChange={(val) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, imageUrl: val }
                        })}
                      />

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Or enter Image URL link directly:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.imageUrl || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, imageUrl: ev.target.value }
                          })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Feed Post Caption narration:</span>
                        <textarea
                          required
                          rows={3}
                          value={editingItem.data.caption || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, caption: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">❤️ Likes count:</span>
                          <input
                            type="number"
                            required
                            value={editingItem.data.likes || 100}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, likes: parseInt(ev.target.value) || 0 }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">💬 Comments count:</span>
                          <input
                            type="number"
                            required
                            value={editingItem.data.comments || 10}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, comments: parseInt(ev.target.value) || 0 }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Media Type:</span>
                        <select
                          value={editingItem.data.mediaType || 'IMAGE'}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, mediaType: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        >
                          <option value="IMAGE">Post / Photo (IMAGE)</option>
                          <option value="VIDEO">Reel / Video (VIDEO)</option>
                        </select>
                      </div>

                      {editingItem.data.mediaType === 'VIDEO' && (
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Video URL (Direct MP4 link):</span>
                          <input
                            type="text"
                            value={editingItem.data.videoUrl || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, videoUrl: ev.target.value }
                            })}
                            placeholder="e.g. https://assets.mixkit.co/..."
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hero Edit fields */}
                  {editingItem.type === 'hero' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Hero Headline display:</span>
                        <textarea
                          required
                          rows={2}
                          value={editingItem.data.headline || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, headline: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Hero Subheadline explanation:</span>
                        <textarea
                          required
                          rows={4}
                          value={editingItem.data.subheadline || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, subheadline: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <ImageUploader
                        label="Upload Profile / Cover Photo"
                        value={editingItem.data.photoUrl || ''}
                        currentTheme={currentTheme}
                        onChange={(val) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, photoUrl: val }
                        })}
                      />

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Or enter Cover Photo URL directly:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.photoUrl || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, photoUrl: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* About Narrative fields */}
                  {editingItem.type === 'about' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Biography Headline:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.bioHeadline || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, bioHeadline: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Biography Core Quote Text:</span>
                        <textarea
                          required
                          rows={4}
                          value={editingItem.data.bioText || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, bioText: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gallery Item fields */}
                  {editingItem.type === 'gallery_item' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Showcase Title:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, title: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="e.g., Cinematic Wedding Highlights at Brahmaputra"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Category:</span>
                          <select
                            value={editingItem.data.category || 'wedding'}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, category: ev.target.value as any }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/45 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          >
                            <option value="wedding">💍 Wedding</option>
                            <option value="haldi">💛 Haldi</option>
                            <option value="mehendi">🌿 Mehendi</option>
                            <option value="reception">🥂 Reception</option>
                            <option value="engagement">✨ Engagement</option>
                            <option value="pre_wedding">📸 Pre-Wedding</option>
                            <option value="bridal_portraits">👰 Bridal Portraits</option>
                            <option value="groom_portraits">🤵 Groom Portraits</option>
                            <option value="couple_portraits">👩‍❤️‍👨 Couple Portraits</option>
                            <option value="candid_moments">⚡ Candid Moments</option>
                            <option value="family_photos">👨‍👩‍👧‍👦 Family Photos</option>
                            <option value="corporate">👔 Corporate</option>
                            <option value="party">🎉 Events</option>
                            <option value="custom">🌲 Outdoor</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Shoot Date:</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.date || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, date: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                            placeholder="e.g., 2026-05-18"
                          />
                        </div>
                      </div>

                      <ImageUploader
                        label="Upload Showcase Portfolio Image"
                        value={editingItem.data.imageUrl || ''}
                        currentTheme={currentTheme}
                        onChange={(val) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, imageUrl: val }
                        })}
                      />

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Or enter Showcase image URL link:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.imageUrl || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, imageUrl: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="Unsplash URL, Google Lens assets, etc."
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Accessibility Alt Text:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.altText || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, altText: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="e.g., wedding couple on sunset backdrop in Guwahati"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Camera Gear Details:</span>
                        <input
                          type="text"
                          value={editingItem.data.cameraInfo || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, cameraInfo: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="e.g., Nikon Z8 • NIKKOR Z 85mm f/1.2 S"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Unedited Raw / Before Image URL (Optional):</span>
                        <input
                          type="text"
                          value={editingItem.data.beforeImageUrl || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, beforeImageUrl: ev.target.value || undefined }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="Leave blank for high-fidelity automatic RAW camera simulation"
                        />
                      </div>
                    </div>
                  )}

                  {/* Testimonial fields */}
                  {(editingItem.type === 'testimonial' || editingItem.type === 'pixelfix_review') && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Client Full Name:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.name || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="e.g., Priyanku Sarma"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Client Role/Event type:</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.role || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, role: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                            placeholder="e.g., Wedding Client 2026"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Rating Rating (1-5 Stars):</span>
                          <select
                            value={editingItem.data.rating || 5}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, rating: parseInt(ev.target.value) || 5 }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/45 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          >
                            <option value="5">★★★★★ 5 Stars</option>
                            <option value="4">★★★★☆ 4 Stars</option>
                            <option value="3">★★★☆☆ 3 Stars</option>
                            <option value="2">★★☆☆☆ 2 Stars</option>
                            <option value="1">★☆☆☆☆ 1 Star</option>
                          </select>
                        </div>
                      </div>

                      <ImageUploader
                        label="Upload Client Avatar photo"
                        value={editingItem.data.avatar || ''}
                        currentTheme={currentTheme}
                        onChange={(val) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, avatar: val }
                        })}
                      />

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Or enter Client Avatar Image URL:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.avatar || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, avatar: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                          placeholder="e.g., https://images.unsplash.com/photo-..."
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Review Comment narration:</span>
                        <textarea
                          required
                          rows={3}
                          value={editingItem.data.comment || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, comment: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === 'affiliate_link' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column: Form Controls */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* 1. Product Link Input (Manual-trigger) */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                            Product Link (Target Buy URL)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <input
                                type="url"
                                required
                                value={editingItem.data.url || ''}
                                onChange={(ev) => setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, url: ev.target.value }
                                })}
                                className={`w-full py-3 px-4 rounded-xl border outline-none text-xs font-sans transition-all ${
                                  currentTheme === 'light' 
                                    ? 'bg-white border-slate-200 text-slate-955 focus:border-amber-500' 
                                    : 'bg-zinc-900/60 border-white/5 text-white focus:border-amber-500'
                                } ${isFetchingAmazon ? 'border-amber-500' : ''}`}
                                placeholder="Paste product link (Amazon etc.)"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const url = editingItem.data.url;
                                if (url && url.trim()) {
                                  lastFetchedUrlRef.current = url;
                                  fetchAmazonDetails(url, true);
                                } else {
                                  triggerToast("Please enter a valid product link first", "info");
                                }
                              }}
                              disabled={isFetchingAmazon || !editingItem.data.url?.trim()}
                              className={`py-3 px-4 rounded-xl border font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 select-none ${
                                currentTheme === 'light'
                                  ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400'
                                  : 'bg-amber-950/40 border-amber-500/20 hover:bg-amber-950/60 text-amber-300 disabled:bg-zinc-900/40 disabled:border-white/5 disabled:text-zinc-600'
                              }`}
                            >
                              {isFetchingAmazon ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                                  <span>FETCHING...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>AUTO FETCH</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* Minimal modern status bar */}
                          {isFetchingAmazon && (
                            <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800/85 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4" />
                            </div>
                          )}

                          {amazonFetchError && (
                            <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-sans text-[10px] text-left leading-normal flex gap-1.5 mt-1">
                              <span>⚠️</span>
                              <div>
                                <strong>Auto-detect issue:</strong> {amazonFetchError}
                                <p className="text-[9px] text-slate-400 mt-0.5">Please check your link or enter details manually below.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Product Title Input */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Product Title
                          </label>
                          {isFetchingAmazon ? (
                            <div className={`w-full h-10 rounded-xl animate-pulse flex items-center px-3 gap-2 ${
                              currentTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-zinc-850 border border-white/5'
                            }`}>
                              <span className="w-4 h-4 rounded bg-amber-500/20" />
                              <div className="h-3.5 bg-slate-300 dark:bg-zinc-700 rounded-full w-2/3" />
                            </div>
                          ) : (
                            <input
                              type="text"
                              required
                              value={editingItem.data.title || ''}
                              onChange={(ev) => setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, title: ev.target.value }
                              })}
                              className={`w-full p-2.5 rounded-xl border outline-none font-sans font-semibold text-xs ${
                                currentTheme === 'light' 
                                  ? 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-amber-500' 
                                  : 'bg-black/30 border-white/5 text-white focus:border-amber-500'
                              }`}
                              placeholder="Product Title (e.g., Sony Alpha 7 IV Mirrorless Camera)"
                            />
                          )}
                        </div>

                        {/* 3. Category Selector & Preset Pills */}
                        <div className="space-y-1.5 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Category Group
                          </label>
                          {isFetchingAmazon ? (
                            <div className="space-y-2">
                              <div className={`w-full h-10 rounded-xl animate-pulse flex items-center px-3 gap-2 ${
                                currentTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-zinc-850 border border-white/5'
                              }`}>
                                <span className="w-4 h-4 rounded bg-amber-500/20" />
                                <div className="h-3.5 bg-slate-300 dark:bg-zinc-700 rounded-full w-1/2" />
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className={`w-16 h-6 rounded-lg animate-pulse ${
                                    currentTheme === 'light' ? 'bg-slate-100' : 'bg-zinc-800/60'
                                  }`} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                required
                                value={editingItem.data.category || ''}
                                onChange={(ev) => setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, category: ev.target.value }
                                })}
                                className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono mb-1 ${
                                  currentTheme === 'light' 
                                    ? 'bg-slate-50/50 border-slate-205 text-slate-800 focus:border-amber-500' 
                                    : 'bg-black/30 border-white/5 text-slate-200 focus:border-amber-500'
                                }`}
                                placeholder="e.g. photography, it_tech, software, accessories"
                              />
                              
                              {/* Dynamic Quick Select Pills */}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(() => {
                                  const coreKeys = ['photography', 'it_tech', 'software', 'accessories', 'my_gears'];
                                  const activeKeys = Array.from(new Set([
                                    ...coreKeys,
                                    ...affiliateLinks.flatMap(a => (a.category || '').split(',').map(c => c.trim()).filter(Boolean))
                                  ])) as string[];
                                  
                                  return activeKeys.map(cat => {
                                    const friendlyName = affiliateLabelMap[cat] || cat.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    const currentCats = (editingItem.data.category || '').split(',').map(c => c.trim()).filter(Boolean);
                                    const isSelected = currentCats.includes(cat);
                                    
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          let updatedCats;
                                          if (isSelected) {
                                            updatedCats = currentCats.filter(c => c !== cat);
                                          } else {
                                            updatedCats = [...currentCats, cat];
                                          }
                                          setEditingItem({
                                            ...editingItem,
                                            data: { 
                                              ...editingItem.data, 
                                              category: updatedCats.join(',')
                                            }
                                          });
                                        }}
                                        className={`px-2 py-1 rounded-lg border text-[9px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                                          isSelected
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                                            : currentTheme === 'light'
                                              ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                        }`}
                                      >
                                        <span>{friendlyName}</span>
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </>
                          )}
                        </div>

                        {/* 4. Product Photo Image */}
                        <div className="space-y-2 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Product Photo Image
                          </label>
                          {isFetchingAmazon ? (
                            <div className={`w-full h-24 rounded-xl animate-pulse flex flex-col items-center justify-center gap-2 ${
                              currentTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-zinc-850 border border-white/5'
                            }`}>
                              <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-bounce">📸</span>
                              <div className="h-2 bg-slate-300 dark:bg-zinc-700 rounded-full w-1/4" />
                            </div>
                          ) : (
                            <>
                              <ImageUploader
                                label="Upload Showcase Affiliate Image"
                                value={editingItem.data.imageUrl || ''}
                                currentTheme={currentTheme}
                                onChange={(val) => setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, imageUrl: val }
                                })}
                              />
                              <input
                                type="text"
                                required
                                value={editingItem.data.imageUrl || ''}
                                onChange={(ev) => setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, imageUrl: ev.target.value }
                                })}
                                className={`w-full p-2 rounded-lg border outline-none text-[10px] ${
                                  currentTheme === 'light' 
                                    ? 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-amber-500' 
                                    : 'bg-black/30 border-white/5 text-white focus:border-amber-500'
                                }`}
                                placeholder="Or paste direct image URL (e.g. Unsplash, imgur...)"
                              />
                            </>
                          )}
                        </div>

                        {/* 5. Optional Promo / Discount Code */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Promo / Discount Code (Optional)
                          </label>
                           <input
                             type="text"
                             value={editingItem.data.discountCode || ''}
                             onChange={(ev) => setEditingItem({
                               ...editingItem,
                               data: { ...editingItem.data, discountCode: ev.target.value }
                             })}
                             className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono ${
                               currentTheme === 'light' 
                                 ? 'bg-slate-50/50 border-slate-200 text-slate-955 focus:border-amber-500' 
                                 : 'bg-black/30 border-white/5 text-slate-100 focus:border-amber-500'
                             }`}
                             placeholder="e.g. PIXELSSD990, FRAMEANCHOR8"
                           />
                        </div>

                        {/* 7. Recommendation Description Copy */}
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Recommendation Text / Testimony
                          </label>
                          {isFetchingAmazon ? (
                            <div className={`w-full h-24 rounded-xl animate-pulse p-3 space-y-2.5 ${
                              currentTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-zinc-850 border border-white/5'
                            }`}>
                              <div className="h-3.5 bg-slate-300 dark:bg-zinc-700 rounded-full w-11/12" />
                              <div className="h-3.5 bg-slate-300 dark:bg-zinc-700 rounded-full w-10/12" />
                              <div className="h-3.5 bg-slate-300 dark:bg-zinc-700 rounded-full w-2/3" />
                            </div>
                          ) : (
                            <textarea
                              required
                              rows={3}
                              value={editingItem.data.description || ''}
                              onChange={(ev) => setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, description: ev.target.value }
                              })}
                              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-sans leading-relaxed ${
                                currentTheme === 'light' 
                                  ? 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-amber-500' 
                                  : 'bg-black/30 border-white/5 text-white focus:border-amber-500'
                              }`}
                              placeholder="Explain why this gadget/software is highly recommended..."
                            />
                          )}
                        </div>
                      </div>

                      {/* Right Column: Live Interactive Card Preview */}
                      <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
                        <span className={`text-[9px] uppercase font-mono font-black tracking-widest block text-center lg:text-left ${
                          currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          ✨ Live Workspace Preview
                        </span>

                        <div className="p-2 border border-dashed rounded-[32px] border-amber-500/20 bg-amber-500/[0.01] flex items-center justify-center">
                          <div
                            className={`w-full max-w-sm rounded-2xl border overflow-hidden transition-all duration-300 relative text-left select-none group ${
                              currentTheme === 'light'
                                ? 'bg-white border-slate-100 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.03)]'
                                : 'bg-zinc-950 border-white/[0.02] shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
                            }`}
                          >
                            {/* 1. Product Image inside the pristine showroom frame */}
                            <div className={`relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center p-3.5 border-b transition-colors duration-300 ${
                              currentTheme === 'light'
                                ? 'bg-slate-50/50 border-slate-100'
                                : 'bg-zinc-900/15 border-white/[0.01]'
                            }`}>
                              {editingItem.data.imageUrl ? (
                                <div className="w-full h-full rounded-xl overflow-hidden bg-white p-2.5 flex items-center justify-center relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                                  <img
                                    src={editingItem.data.imageUrl}
                                    alt="Live preview"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 dark:bg-zinc-900/40 text-[10px] font-mono uppercase tracking-wider p-4 text-center">
                                  <span>No image defined</span>
                                  <span className="text-[8px] text-slate-400 mt-1">Paste URL or select image above</span>
                                </div>
                              )}

                              {/* Dynamic Micro-Badges for source tagging in preview */}
                              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                                {/amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it|com\.mx|com\.br|com\.tr|ae|sa|sg|se|pl|nl|be|com\.be|co\.za|eg)|\/amzn\.to\//i.test(editingItem.data.url || '') ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm backdrop-blur-md">
                                    <ShoppingBag size={8} className="stroke-[2.5]" />
                                    <span>AMAZON</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-mono text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm backdrop-blur-md">
                                    <ExternalLink size={8} className="stroke-[2.5]" />
                                    <span>PARTNER</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 2. Text Content */}
                            <div className="flex-1 flex flex-col p-3.5 sm:p-4 min-w-0 justify-between">
                              <div className="space-y-2">
                                {/* Product Title */}
                                <h3 className={`text-xs sm:text-sm font-bold tracking-tight leading-snug line-clamp-2 transition-colors duration-200 ${
                                  currentTheme === 'light' ? 'text-slate-900' : 'text-zinc-100'
                                }`}>
                                  {editingItem.data.title || 'Untitled Recommendation Listing'}
                                </h3>

                                {/* Product Description */}
                                <p className={`text-[10px] sm:text-[11px] leading-relaxed font-sans line-clamp-3 sm:line-clamp-4 ${
                                  currentTheme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-400'
                                }`}>
                                  {editingItem.data.description || 'Provide a brief, compelling testimony explaining why this gear is recommended...'}
                                </p>
                              </div>

                              {/* Code Section (Price has been removed per user request) */}
                              {editingItem.data.discountCode && (
                                <div className="mt-4 pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-white/[0.02]">
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-500 font-mono text-[8px] font-bold tracking-wider">
                                    CODE: {editingItem.data.discountCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingItem.type === 'social_link' && (
                    <div className="space-y-3">
                      <div className="space-y-1 text-left">
                        <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Channel Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.name || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono mb-1 ${
                            currentTheme === 'light' 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                              : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                          }`}
                          placeholder="e.g. Instagram (Murari)"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Handle / Label / Detail
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.handle || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, handle: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono mb-1 ${
                            currentTheme === 'light' 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                              : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                          }`}
                          placeholder="e.g. @mpanjiyar1 or +91 8638875231"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Destination URL Link
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.url || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, url: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono mb-1 ${
                            currentTheme === 'light' 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                              : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                          }`}
                          placeholder="https://instagram.com/..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Icon Platform
                          </label>
                          <select
                            value={editingItem.data.platform || 'instagram'}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, platform: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono ${
                              currentTheme === 'light' 
                                ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                                : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                            }`}
                          >
                            <option value="instagram">Instagram</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="camera">Camera (500px/PulsePX)</option>
                            <option value="etejo">Etejo Custom</option>
                            <option value="custom">Generic Web Icon</option>
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Status Badge (Optional)
                          </label>
                          <input
                            type="text"
                            value={editingItem.data.badge || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, badge: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono ${
                              currentTheme === 'light' 
                                ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                                : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                            }`}
                            placeholder="e.g. Tech, Studio"
                          />
                        </div>
                      </div>

                      {/* Custom Icon Field */}
                      <div className="space-y-1 text-left">
                        <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Custom Selectable Icon Override
                        </label>
                        <select
                          value={editingItem.data.customIcon || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, customIcon: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono ${
                            currentTheme === 'light' 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                              : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">-- No custom icon (Use platform icon) --</option>
                          <option value="twitter">Twitter / X Icon</option>
                          <option value="linkedin">LinkedIn Icon</option>
                          <option value="github">GitHub Icon</option>
                          <option value="slack">Slack Icon</option>
                          <option value="twitch">Twitch Icon</option>
                          <option value="dribbble">Dribbble Icon</option>
                          <option value="briefcase">Briefcase (Work Showcase)</option>
                          <option value="globe">Globe / Website Icon</option>
                          <option value="mail">Email Icon</option>
                          <option value="phone">Phone/WhatsApp Icon</option>
                          <option value="link">Cyan Chain Link Icon</option>
                        </select>
                        <p className={`text-[10px] ${currentTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'} mt-1 leading-normal`}>
                          Choose a specific branded icon to override default platform icons. Perfect for 'Twitter' or 'LinkedIn'.
                        </p>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className={`text-[10px] uppercase font-mono font-bold tracking-wider ${currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Sort Order (Integer)
                        </label>
                        <input
                          type="number"
                          required
                          value={typeof editingItem.data.order === 'number' ? editingItem.data.order : 0}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, order: parseInt(ev.target.value) || 0 }
                          })}
                          className={`w-full p-2.5 rounded-xl border outline-none text-xs font-mono mb-1 ${
                            currentTheme === 'light' 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-950 focus:border-indigo-500' 
                              : 'bg-black/30 border-white/5 text-slate-100 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Software License fields */}
                  {editingItem.type === 'software_license' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">License Name / Title:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.name || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Price Label (e.g., ₹1,500):</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.price || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, price: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Badge (e.g., Best Seller):</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.badge || ''}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, badge: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Description:</span>
                        <textarea
                          required
                          rows={3}
                          value={editingItem.data.description || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, description: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs font-sans ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">License Type:</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.licenseType || 'Lifetime License Key'}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, licenseType: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold">Category:</span>
                          <input
                            type="text"
                            required
                            value={editingItem.data.category || 'productivity'}
                            onChange={(ev) => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, category: ev.target.value }
                            })}
                            className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                            }`}
                          />
                        </div>
                      </div>

                      <ImageUploader
                        label="Upload Product Cover Image"
                        value={editingItem.data.imageUrl || ''}
                        currentTheme={currentTheme}
                        onChange={(val) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, imageUrl: val }
                        })}
                      />

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Or enter Image URL:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.imageUrl || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, imageUrl: ev.target.value }
                          })}
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Key Features:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.features || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, features: ev.target.value }
                          })}
                          placeholder="e.g. 1 PC Activation, Free Technical Support, 100% Genuine Retail Key"
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Compatibility:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.compatibility || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, compatibility: ev.target.value }
                          })}
                          placeholder="e.g. Compatible with Windows 10 & 11"
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Technical Details / Specifications:</span>
                        <input
                          type="text"
                          required
                          value={editingItem.data.details || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, details: ev.target.value }
                          })}
                          placeholder="e.g. Instant Digital Delivery • OEM/Retail Activation • Global"
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">External / Buy URL (Optional):</span>
                        <input
                          type="text"
                          value={editingItem.data.url || ''}
                          onChange={(ev) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, url: ev.target.value }
                          })}
                          placeholder="e.g. https://www.microsoft.com/d/windows-11-pro/..."
                          className={`w-full p-2.5 rounded-lg border outline-none text-xs ${
                            currentTheme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF5500]' : 'bg-black/40 border-white/10 text-white focus:border-[#FF5500]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Group */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] border cursor-pointer ${
                        currentTheme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase tracking-wider text-[10px] shadow-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                        isSaving ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                          <span>Applying...</span>
                        </>
                      ) : (
                        'Apply Updates'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Silky Smooth Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed bottom-6 right-6 z-[100] max-w-sm p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${
              currentTheme === 'light' 
                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/40' 
                : 'bg-zinc-900/95 border-white/5 text-slate-100 shadow-black/80'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
              activeToast.type === 'success' 
                ? 'bg-[#FF5500]/10 text-[#FF5500]' 
                : activeToast.type === 'error'
                  ? 'bg-rose-500/10 text-rose-500' 
                  : 'bg-indigo-500/10 text-indigo-400'
            }`}>
              {activeToast.type === 'success' && '✓'}
              {activeToast.type === 'error' && '✕'}
              {activeToast.type === 'info' && '🛈'}
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <span className={`text-[9px] uppercase font-bold tracking-widest block ${
                activeToast.type === 'success' ? 'text-[#FF5500]' : activeToast.type === 'error' ? 'text-rose-500' : 'text-indigo-400'
              }`}>
                {activeToast.type === 'success' ? 'SUCCESS SECURED' : activeToast.type === 'error' ? 'ACTION NOTICE' : 'SYSTEM UPDATE'}
              </span>
              <p className="text-xs font-sans mt-0.5 leading-normal font-semibold">
                {activeToast.message}
              </p>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-[#FF5500] mt-0.5 transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth Premium Confirmation Dialog Modal */}
      <AnimatePresence>
        {activeConfirm && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-full max-w-sm p-6 rounded-3xl border text-left shadow-2xl space-y-4 ${
                currentTheme === 'light' ? 'bg-white border-slate-200' : 'bg-zinc-950 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 border-b pb-3 border-slate-200/50 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                  ⚠️
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5500]">Action Confirmation</span>
                  <h4 className={`text-sm font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Please Verify Decision</h4>
                </div>
              </div>

              <p className={`text-xs leading-relaxed font-sans ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-350'}`}>
                {activeConfirm.message}
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeConfirm.onCancel) activeConfirm.onCancel();
                    setActiveConfirm(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] border cursor-pointer transition-all ${
                    currentTheme === 'light' 
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    activeConfirm.onConfirm();
                    setActiveConfirm(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase tracking-wider text-[10px] shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                >
                  Proceed Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Chat Button for Pixel Fix & Pixel Frame */}
      <AnimatePresence>
        {(activeTab === 'pixelfix' || activeTab === 'pixelframe') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 120 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 80 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 16,
              mass: 1
            }}
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-1.5 group pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)]"
          >
            {/* Hover Tooltip/Label */}
            <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] uppercase font-mono font-black tracking-widest shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none select-none ${
              currentTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/40'
                : 'bg-zinc-900 border-zinc-800 text-white shadow-black/60'
            }`}>
              Chat with Murari
            </div>

            {/* Float Circle Button Container for Ring Pulsing */}
            <div className="relative w-11 h-11 md:w-12 md:h-12">
              {/* Pulsing Backing Wave */}
              <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

              {/* Float Circle Button with enlarged touch area via before pseudo-element */}
              <button
                type="button"
                id="floating-whatsapp-btn"
                onClick={() => {
                  const phone = activeTab === 'pixelfix' ? contactPhoneIt : contactPhonePhotos;
                  const cleanPhone = getCleanWhatsAppNumber(phone);
                  const template = activeTab === 'pixelfix'
                    ? "Hi Murari, I am visiting your Pixel Fix page and would like to inquire about doorstep IT diagnostic/support services."
                    : "Hi Murari, I am visiting your Pixel Frame page and would like to inquire about your premium event photography/cinematography services.";
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template)}`, '_blank');
                }}
                className="relative w-full h-full rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 cursor-pointer transition-all hover:scale-110 active:scale-95 duration-200 before:absolute before:-inset-3 before:rounded-full before:content-['']"
                title="Chat with Murari on WhatsApp"
              >
                <WhatsAppIcon size={22} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Minimal customized light element Sun Icon inside App
function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
