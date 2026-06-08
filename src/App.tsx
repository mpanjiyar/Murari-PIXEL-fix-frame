/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  CheckCircle2,
  Laptop,
  Check,
  Instagram,
  Facebook,
  Youtube,
  ArrowUpRight,
  Sliders,
  X,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_GALLERY_ITEMS,
  INITIAL_IT_SERVICES,
  INITIAL_PHOTO_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_PIXELFIX_REVIEWS,
  INSTAGRAM_POSTS
} from './data';
import { GalleryItem, ContactMessage, NotificationLog } from './types';
import PFLogo from './components/PFLogo';
import CursorEffect from './components/CursorEffect';
import WhatsAppIcon from './components/WhatsAppIcon';
import { ImageUploader } from './components/ImageUploader';
import { ScrollReveal, ScrollRevealText } from './components/ScrollReveal';
import { initAuth, googleSignIn, googleSignOut } from './lib/driveAuth';
import { uploadBackupToDrive, listBackupsOnDrive, downloadBackupFromDrive, deleteBackupFromDrive, upsertLiveSyncBackup, getOrCreateFolder, uploadPhotoFileToDrive } from './lib/driveService';
import type { DriveBackupFile } from './lib/driveService';
import type { User as FirebaseUser } from 'firebase/auth';
import { HardDrive, Cloud, LogOut, AlertCircle, FolderOpen } from 'lucide-react';

// Structuring our Theme Styles
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

export default function App() {
  // Navigation & Primary Settings
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'pixelfix' | 'pixelframe' | 'gallery' | 'contact' | 'dashboard'>('home');
  const [currentTheme, setCurrentTheme] = useState<'normal' | 'mono' | 'light'>(() => {
    const saved = localStorage.getItem('mp_portfolio_theme');
    return (saved as any) || 'light';
  });

  // Client dynamic visual database (uploaded by client / managed inside dashboard)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('mp_gallery_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasNewItems = parsed.some((p: any) => p.id === 'g9') && parsed.some((p: any) => p.id === 'g10');
        const hasNewTitles = parsed.some((p: any) => p.title && p.title.includes('Royal Bridal Elegance & Crimson Lehenga'));
        if (!hasNewItems || !hasNewTitles || parsed.some((p: any) => p.title && (p.title.includes('Enterprise Server Assembly') || p.title.includes('Executive Portraiture') || p.title.includes('Tech Summit') || p.cameraInfo?.includes('Sony') || p.title.includes('Traditional Wedding Ceremony')))) {
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
      try { return JSON.parse(saved); } catch (e) { return INSTAGRAM_POSTS; }
    }
    return INSTAGRAM_POSTS;
  });

  const [instagramAccessToken, setInstagramAccessToken] = useState<string>(() => {
    return localStorage.getItem('mp_instagram_access_token') || '';
  });
  const [instagramSyncError, setInstagramSyncError] = useState<string>('');
  const [isSyncingInstagram, setIsSyncingInstagram] = useState<boolean>(false);
  const [instagramViewMode, setInstagramViewMode] = useState<'grid' | 'embed'>('grid');

  // Google Drive Integration States
  const [driveUser, setDriveUser] = useState<FirebaseUser | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDriveLoading, setIsDriveLoading] = useState<boolean>(false);
  const [isDriveAutosaving, setIsDriveAutosaving] = useState<boolean>(false);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [driveStatusMessage, setDriveStatusMessage] = useState<string>('');
  const [driveErrorMessage, setDriveErrorMessage] = useState<string>('');

  const isRestoringRef = useRef<boolean>(false);
  const isInitialMountRef = useRef<boolean>(true);

  const [testimonials, setTestimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('mp_testimonials_custom');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_TESTIMONIALS; }
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

  const [heroHeadline, setHeroHeadline] = useState<string>(() => {
    return localStorage.getItem('mp_hero_headline') || 'Empowering Your Tech. Framing Your Memories.';
  });

  const [heroSubheadline, setHeroSubheadline] = useState<string>(() => {
    return localStorage.getItem('mp_hero_subheadline') || "Hi, I'm Murari Panjiyar. Guwahati's dual solution specialist. Through Pixel Fix, I deliver professional, certified home-visit IT diagnostic and operating setups. Through Pixel Frame, I provide premium visual storytelling for weddings, corporate milestones, and private celebrations.";
  });

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(() => {
    return localStorage.getItem('mp_profile_photo_url') || 'https://images.unsplash.com/photo-1618018352910-72bdafdc72a8?auto=format&fit=crop&q=80&w=600';
  });

  const [bioHeadline, setBioHeadline] = useState<string>(() => {
    return localStorage.getItem('mp_bio_headline') || 'THE CREATIVE LOGIC OF A DUAL ARTIST';
  });

  const [bioText, setBioText] = useState<string>(() => {
    return localStorage.getItem('mp_bio_text') || '"Through my dual business structures, I aim to offer seamless tech support that keeps your home-office or corporate workstation running smoothly on-demand via Pixel Fix, alongside stunning cinematography from Pixel Frame that helps you cherish life\'s biggest milestones forever."';
  });

  const [editingItem, setEditingItem] = useState<{
    type: 'it_service' | 'photo_service' | 'instagram' | 'hero' | 'about' | 'gallery_item' | 'testimonial' | 'pixelfix_review';
    index?: number;
    id?: string;
    data: any;
  } | null>(null);
  
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

  // Photo uploader triggers
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<'wedding' | 'party' | 'corporate' | 'custom'>('wedding');
  const [newImageBase64, setNewImageBase64] = useState('');
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
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<'all' | 'wedding' | 'party' | 'corporate' | 'custom'>('all');

  // Contact form state
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync state & Theme updates
  useEffect(() => {
    localStorage.setItem('mp_portfolio_theme', currentTheme);
  }, [currentTheme]);

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
      console.error('Error syncing Instagram:', err);
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

  // --- Google Drive Backup, List, Sync, and Restore Handlers ---
  const loadBackups = async (token: string) => {
    try {
      const list = await listBackupsOnDrive(token);
      setDriveBackups(list);
    } catch (err: any) {
      console.error('Failed to retrieve cloud backups list:', err);
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

    const confirmed = window.confirm(
      `Are you sure you want to restore the backup "${backupFile.name}" created at ${new Date(backupFile.createdTime).toLocaleString()}?\n\nThis will overwrite all current services, headlines, custom gallery images, and message logs with the backed-up data.`
    );
    if (!confirmed) return;

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
      
      if (backupData.heroHeadline !== undefined) setHeroHeadline(backupData.heroHeadline);
      if (backupData.heroSubheadline !== undefined) setHeroSubheadline(backupData.heroSubheadline);
      if (backupData.profilePhotoUrl !== undefined) setProfilePhotoUrl(backupData.profilePhotoUrl);
      if (backupData.bioHeadline !== undefined) setBioHeadline(backupData.bioHeadline);
      if (backupData.bioText !== undefined) setBioText(backupData.bioText);
      if (backupData.instagramAccessToken !== undefined) setInstagramAccessToken(backupData.instagramAccessToken);

      setDriveStatusMessage('Congratulations! All settings, custom portfolio images, and message logs were successfully restored directly from Google Drive!');
      
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 1500);
    } catch (err: any) {
      isRestoringRef.current = false;
      setDriveErrorMessage('Failed to parse backup or restore states: ' + (err.message || err));
    } finally {
      setIsDriveLoading(false);
    }
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
        console.error('Automated back up failed:', err);
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
            console.error(`Failed uploading ${photo.name}:`, err);
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

    window.open(`https://wa.me/919864361940?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  // Rapid Quick Contact WhatsApp triggers without quote customization
  const triggerQuickBooking = (service: 'it_fix' | 'photography', customText: string) => {
    const number = service === 'it_fix' ? '918638875231' : '919864361940';
    const text = encodeURIComponent(customText);
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput === 'Dispur123@') {
      setIsAuthorized(true);
      localStorage.setItem('mp_admin_authorized', 'true');
    } else {
      alert('Invalid access credentials. Please enter the correct password.');
    }
  };

  const logoutAdmin = () => {
    setIsAuthorized(false);
    localStorage.removeItem('mp_admin_authorized');
  };

  // Image upload base64 process
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewImageBase64(reader.result);
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

  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageBase64) {
      alert('Please select or drag an image showcase file to publish first!');
      return;
    }
    const newItem: GalleryItem = {
      id: 'gallery_' + Date.now(),
      title: newImageTitle || 'Premium Shoot Frame',
      category: newImageCategory,
      imageUrl: newImageBase64,
      altText: newImageTitle || 'Custom portfolio capture',
      cameraInfo: newImageCamera,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setGalleryItems(prev => [newItem, ...prev]);
    setNewImageTitle('');
    setNewImageBase64('');
    alert('Successfully added custom portfolio picture into showcase!');
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio photo from the live website?')) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Manual trigger email simulations
  const handleEmailSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientName) {
      alert('Please fill in client details to simulate notification emails.');
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

  const filteredItems = activeGalleryFilter === 'all'
    ? galleryItems
    : galleryItems.filter(p => p.category === activeGalleryFilter);

  return (
    <div className={`min-h-screen ${s.bg} transition-colors duration-300 relative selection:bg-[#FF5500] selection:text-white pb-12`}>
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
                if (confirm('Apply system defaults? Warning: This restores standard prices and captions.')) {
                  localStorage.removeItem('mp_it_services_custom');
                  localStorage.removeItem('mp_photo_services_custom');
                  localStorage.removeItem('mp_instagram_posts');
                  localStorage.removeItem('mp_testimonials_custom');
                  localStorage.removeItem('mp_pixelfix_reviews_custom');
                  localStorage.removeItem('mp_gallery_items');
                  localStorage.removeItem('mp_hero_headline');
                  localStorage.removeItem('mp_hero_subheadline');
                  localStorage.removeItem('mp_profile_photo_url');
                  localStorage.removeItem('mp_bio_headline');
                  localStorage.removeItem('mp_bio_text');
                  window.location.reload();
                }
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
        <span>🚨 Guwahati local area doorstep dispatcher • Booking & Live Quote Estimator Engine Active 📱</span>
      </div>

      {/* HEADER SECTION WITH ADVANCED THEME CONTROLLERS */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${s.headerBg} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <PFLogo size={38} className={currentTheme === 'mono' ? 'filter grayscale brightness-200' : ''} />
            <div>
              <span className={`font-black text-base md:text-xl tracking-tight block uppercase leading-none ${
                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                MURARI PANJIYAR <span className="text-[#FF5500] font-mono select-none">.</span>
              </span>
              <span className={`text-[9px] uppercase tracking-[0.3em] font-extrabold block leading-none mt-1 ${
                currentTheme === 'mono' ? 'text-zinc-500' : 'text-[#FF5500]'
              }`}>
                Pixel Fix &amp; Pixel Frame
              </span>
            </div>
          </div>

          {/* Desktop and Mobile Tabs Container */}
          <div className={`flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-lg border ${
            currentTheme === 'light' ? 'bg-slate-100 border-slate-200/60' : 'bg-black/20 border-white/5'
          }`}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'pixelfix', label: 'Pixel Fix (IT)' },
              { id: 'pixelframe', label: 'Pixel Frame (Photo)' },
              { id: 'gallery', label: 'Live Gallery' },
              { id: 'about', label: 'Origin' },
              { id: 'contact', label: 'Direct Booking' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3 py-1.5 rounded-md text-xs uppercase tracking-wider font-extrabold transition-all duration-200 outline-none cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-white'
                    : currentTheme === 'light'
                      ? 'text-slate-600 hover:text-[#FF5500] hover:bg-slate-200/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-md -z-10 bg-[#FF5500]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* EYE MATCHING DUAL CONTROL MATRIX */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 hidden lg:inline">Theme Profile:</span>
            <div className={`flex items-center rounded-full p-1 self-stretch border ${
              currentTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'
            }`}>
              <button
                onClick={() => setCurrentTheme('normal')}
                title="Sleek Cyber Orange (Default)"
                className={`p-1.5 rounded-full text-xs transition-all ${
                  currentTheme === 'normal' 
                    ? 'bg-[#FF5500] text-white scale-110' 
                    : currentTheme === 'light' 
                      ? 'text-slate-500 hover:text-[#FF5500]' 
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles size={13} />
              </button>
              <button
                onClick={() => setCurrentTheme('mono')}
                title="Noir Monochrome (Black & White)"
                className={`p-1.5 rounded-full text-xs transition-all ${
                  currentTheme === 'mono' 
                    ? 'bg-white text-black scale-110' 
                    : currentTheme === 'light'
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Hash size={13} />
              </button>
              <button
                onClick={() => setCurrentTheme('light')}
                title="Alabaster Elegant (Eye-friendly Light)"
                className={`p-1.5 rounded-full text-xs transition-all ${
                  currentTheme === 'light' 
                    ? 'bg-slate-900 text-white scale-110' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <SunIcon size={13} />
              </button>
            </div>

            {/* Studio backend panel triggers */}
            <button
               onClick={() => setActiveTab('dashboard')}
               className={`p-1.5 rounded-full border transition-all ${
                 activeTab === 'dashboard'
                   ? 'bg-[#FF5500] text-white border-[#FF5500]'
                   : currentTheme === 'light'
                     ? 'border-slate-300 hover:border-[#FF5500] text-slate-500 hover:text-slate-800 bg-white'
                     : 'border-white/10 hover:border-[#FF5500] text-slate-400 hover:text-white'
               }`}
              title="Studio Management Dashboard"
            >
              <Sliders size={14} />
            </button>
          </div>
        </div>
      </header>

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
                        setQuoteType('pixelfix');
                        const element = document.getElementById('interactive-calculator-widget');
                        if (element) {element.scrollIntoView({ behavior: 'smooth' });}
                      }}
                      className="bg-[#FF5500] hover:bg-[#FF4400] text-white px-6 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Laptop size={16} />
                      <span>Configure IT Support Quote</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuoteType('pixelframe');
                        const element = document.getElementById('interactive-calculator-widget');
                        if (element) {element.scrollIntoView({ behavior: 'smooth' });}
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
                      <a href="tel:8638875231" className={`hover:text-[#FF5500] font-black text-sm block mt-1 ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        📞 +91 8638875231
                      </a>
                    </div>
                    <div className={`p-3 rounded-xl border text-left ${
                      currentTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-white/5 border-white/5'
                    }`}>
                      <span className="text-[10px] text-zinc-500 uppercase block">Pixel Frame wedding:</span>
                      <a href="tel:9864361940" className={`hover:text-[#FF5500] font-black text-sm block mt-1 ${
                        currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        📸 +91 9864361940
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

            {/* DYNAMIC WHATSAPP INTERACTIVE CALCULATOR (The Core Feature of Client Request) */}
            <section id="interactive-calculator-widget" className={`p-6 md:p-8 rounded-3xl border ${s.card} relative overflow-hidden text-left`}>
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
                              { id: 'wedding', label: '💍 Wedding Ceremony' },
                              { id: 'party', label: '🎂 Celebrations & Party' },
                              { id: 'corporate', label: '👔 Corporate Summit' },
                              { id: 'custom', label: '📸 Custom Outdoors' }
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
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                      >
                        <WhatsAppIcon size={16} />
                        <span>Send Details to WhatsApp</span>
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
              <div className="text-left">
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-1 ${s.tagline}`}>
                  CONNECT WITH MURARI PANJIYAR
                </span>
                <h2 className={`text-2xl md:text-3xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Social Media Channels &amp; Handles
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Connect instantly via digital streams or directly through dedicated WhatsApp communication nodes.
                </p>
              </div>

              {/* Compact Inline Row of Social Handles */}
              <div className="flex flex-wrap gap-3">
                
                {/* Instagram Handle */}
                <a
                  href="https://instagram.com/mpanjiyar1"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Instagram size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>Instagram (Murari)</p>
                    <p className="text-[10px] text-pink-500 font-semibold tracking-tight">@mpanjiyar1</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-pink-500 transition-colors flex-shrink-0" />
                </a>

                {/* Instagram Studio Handle */}
                <a
                  href="https://www.instagram.com/pixel_frames1/"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Instagram size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>Instagram (Studio)</p>
                    <p className="text-[10px] text-pink-500 font-semibold tracking-tight">@pixel_frames1</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-pink-500 transition-colors flex-shrink-0" />
                </a>

                {/* WhatsApp - IT Support Number */}
                <a
                  href="https://wa.me/918638875231"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[240px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <WhatsAppIcon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>WhatsApp (IT Fix)</p>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-bold px-1 rounded border border-indigo-500/20 uppercase tracking-widest scale-90">Tech</span>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-semibold tracking-tight">+91 8638875231</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </a>

                {/* WhatsApp - Photo Bookings Number */}
                <a
                  href="https://wa.me/919864361940"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[240px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <WhatsAppIcon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>WhatsApp (Photos)</p>
                      <span className="text-[8px] bg-rose-500/10 text-rose-400 font-bold px-1 rounded border border-rose-500/20 uppercase tracking-widest scale-90">Studio</span>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-semibold tracking-tight">+91 9864361940</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </a>

                {/* Facebook Handle */}
                <a
                  href="https://www.facebook.com/mpanjiyar100/"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Facebook size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>Facebook</p>
                    <p className="text-[10px] text-blue-500 font-semibold tracking-tight">Murari Panjiyar</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </a>

                {/* YouTube Handle */}
                <a
                  href="https://www.youtube.com/channel/UCoZOM_gfrukJgZlBra0l-6w"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Youtube size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>YouTube</p>
                    <p className="text-[10px] text-red-500 font-semibold tracking-tight">Murari Panjiyar Media</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </a>

                {/* 500px Handle */}
                <a
                  href="https://500px.com/p/mpanjiyar100?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnsKsfdZEWJR4k577cF6K4J8TCsvpyahiSQji0CVp3ZOuP9xn5XDXqA1HFmFU_aem_Tc8o9AsvjyWr3kP0-ZekUw&view=photos"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Camera size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>500px Gallery</p>
                    <p className="text-[10px] text-teal-500 font-semibold tracking-tight">mpanjiyar100</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                </a>

                {/* PulsePX Handle */}
                <a
                  href="https://pulsepx.com/profile/mpanjiyar100?view=entries"
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${s.card} ${s.cardHover} min-w-[200px] flex-1 max-w-sm`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#FF5500] group-hover:scale-105 transition-transform flex-shrink-0">
                    <Camera size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>PulsePX Profile</p>
                    <p className="text-[10px] text-[#FF5500] font-semibold tracking-tight">mpanjiyar100</p>
                  </div>
                  <ArrowUpRight size={12} className="text-slate-400 group-hover:text-[#FF5500] transition-colors flex-shrink-0" />
                </a>

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
            className="space-y-12 text-left"
          >
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
              
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => triggerQuickBooking('it_fix', 'Hi Murari, I want to book doorstep PC support!')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                >
                  <WhatsAppIcon size={14} /> Send WhatsApp Support Ticket
                </button>
                <a
                  href="tel:8638875231"
                  className="bg-white hover:bg-zinc-200 text-black text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                >
                  <Phone size={14} /> Call Support Now
                </a>
              </div>
            </div>

            {/* List offerings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {itServices.map((srv, index) => (
                <ScrollReveal
                  key={index}
                  variant="fade-up"
                  delay={index * 0.1}
                  className={`p-6 rounded-3xl border ${s.card} flex flex-col justify-between hover:border-[#FF5500]/40 transition-all duration-300`}
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
                          onClick={() => setEditingItem({
                            type: 'it_service',
                            index,
                            data: { ...srv }
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow cursor-pointer transition-colors"
                        >
                          <Sliders size={8} /> Edit
                        </button>
                      )}
                    </div>
                    <h3 className={`text-xl font-black mt-1 ${currentTheme === 'light' ? 'text-slate-950 font-black' : 'text-white font-black'}`}>{srv.title}</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{srv.description}</p>
                    
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
                      onClick={() => {
                        setBookingName('');
                        setBookingNotes(`Interested in standard package: ${srv.title}. please call.`);
                        setQuoteType('pixelfix');
                        const element = document.getElementById('interactive-calculator-widget');
                        if (element) {element.scrollIntoView({ behavior: 'smooth' });}
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
                        currentTheme === 'light' 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 font-semibold' 
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      Configure Estimate
                    </button>
                  </div>
                </ScrollReveal>
              ))}
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
                <div className="text-left">
                  <span className="text-[#FF5500] text-[10px] uppercase tracking-[0.2em] font-bold block mb-1">CUSTOMER ACCLAIM</span>
                  <h2 className={`text-2xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Assam Doorstep IT Client Reviews
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    See how local businesses and homeowners across Assam evaluate our on-demand operating setups and speed diagnostics.
                  </p>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pixelFixReviews.map((t, index) => (
                  <div key={t.id || index} className={`p-5 rounded-2xl border ${s.card} text-left space-y-4 flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200/40 dark:border-white/5">
                        <span className="text-[10px] text-amber-500 block">{'★'.repeat(t.rating || 5)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-extrabold max-w-[120px] truncate">
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
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Delete this IT review?')) {
                                    setPixelFixReviews(pixelFixReviews.filter((_, idx) => idx !== index));
                                  }
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                              >
                                Del
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs italic leading-relaxed ${
                        currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        "{t.comment}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 pt-4 border-t border-slate-200/20 dark:border-white/5">
                      <img
                        src={t.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                        alt={`${t.name} avatar`}
                        className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                          currentTheme === 'light' ? 'border-slate-200' : 'border-white/10'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <strong className={`text-xs font-black block truncate ${
                          currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>{t.name}</strong>
                        <p className="text-[10px] text-slate-500 truncate">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
            className="space-y-12 text-left"
          >
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
                  Discover candidacy portraiture, high-contrast wedding frames, post-production cinematic retouching, and aerial drone recording. Check custom budget estimates and secure your booking date instantly on WhatsApp at +919864361940.
                </p>
              </ScrollReveal>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => triggerQuickBooking('photography', 'Hello Murari, I want to book photography coverage!')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                >
                  <WhatsAppIcon size={14} /> Send WhatsApp Photo Ticket
                </button>
                <a
                  href="tel:9864361940"
                  className={`bg-white hover:bg-zinc-200 text-black text-xs uppercase font-extrabold px-5 py-2.5 rounded-lg flex items-center gap-1.5 ${
                    currentTheme === 'light' ? 'border border-slate-200 shadow-sm' : ''
                  }`}
                >
                  <Phone size={14} /> Dial Photographer Now
                </a>
              </div>
            </div>

            {/* Matrix of services */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {photoServices.map((srv, index) => (
                <ScrollReveal
                  key={index}
                  variant="fade-up"
                  delay={index * 0.08}
                  className={`p-5 rounded-2xl border ${s.card} flex flex-col justify-between hover:border-[#FF5500]/30 transition-all duration-300`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase font-mono text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-0.5 rounded-full inline-block font-extrabold">
                        {srv.price}
                      </span>
                      {isAuthorized && (
                        <button
                          type="button"
                          onClick={() => setEditingItem({
                            type: 'photo_service',
                            index,
                            data: { ...srv }
                          })}
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
                      currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>{srv.description}</p>
                    
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
                    onClick={() => {
                      setBookingName('');
                      setBookingNotes(`Inquiring about photography category: ${srv.title}. please coordinate dates.`);
                      setQuoteType('pixelframe');
                      const element = document.getElementById('interactive-calculator-widget');
                      if (element) {element.scrollIntoView({ behavior: 'smooth' });}
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

            {/* Testimonials list */}
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, index) => (
                  <motion.div
                    key={t.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10px" }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`p-5 rounded-2xl border ${s.card} text-left space-y-4`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] text-amber-500 block">{'★'.repeat(t.rating || 5)}</span>
                      {isAuthorized && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem({
                              type: 'testimonial',
                              index,
                              data: { ...t }
                            })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders size={8} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this testimonial review?')) {
                                setTestimonials(testimonials.filter((_, idx) => idx !== index));
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={8} /> Del
                          </button>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs italic leading-relaxed ${
                      currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      "{t.comment}"
                    </p>
                    <div className="flex items-center space-x-3 pt-2">
                      <img
                        src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                        alt="customer avatar reviews"
                        className={`w-10 h-10 rounded-full object-cover border ${
                          currentTheme === 'light' ? 'border-slate-200' : 'border-white/10'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <strong className={`text-xs font-black block ${
                          currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>{t.name}</strong>
                        <span className="text-[10px] text-slate-500 block">{t.role}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
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
                { id: 'wedding', label: '💍 Weddings' },
                { id: 'party', label: '🎂 Celebrations & Events' },
                { id: 'corporate', label: '👔 Corporate Summit' },
                { id: 'custom', label: '📸 Custom Outdoors' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveGalleryFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all ${
                    activeGalleryFilter === filter.id
                      ? 'bg-[#FF5500] text-white shadow-md'
                      : currentTheme === 'light'
                        ? 'bg-slate-100 text-slate-700 border border-slate-205/70 hover:bg-slate-200'
                        : 'bg-black/20 text-slate-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Pictures layout list */}
            {filteredItems.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    onClick={() => setPreviewImage(item)}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className={`group rounded-2xl overflow-hidden border ${s.card} flex flex-col justify-between aspect-square relative cursor-pointer`}
                  >
                    {isAuthorized && (
                      <div className="absolute top-3 right-3 z-20 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setEditingItem({
                            type: 'gallery_item',
                            id: item.id,
                            data: { ...item }
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders size={8} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this gallery item?')) {
                              setGalleryItems(galleryItems.filter(g => g.id !== item.id));
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={8} /> Del
                        </button>
                      </div>
                    )}
                    <img
                      src={item.imageUrl}
                      alt={item.altText}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#FF5500]">
                        {item.category.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-black text-white mt-1 leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-white/5 mt-2">
                        <span>🗓️ {item.date}</span>
                        <span className="font-mono text-[9px] uppercase text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                          {item.cameraInfo || 'Nikon Z Master Series'}
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
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-[#FF5500] rounded-3xl opacity-20 blur-2xl pointer-events-none" />
                <div className={`relative z-10 p-2 rounded-3xl border ${
                  currentTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-white/10'
                }`}>
                  <div className="relative rounded-2xl overflow-hidden group">
                    <img
                      src={profilePhotoUrl}
                      alt="Murari Panjiyar - smiling young Indian technical artist with a short beard and mustache"
                      className="rounded-2xl w-full h-[400px] object-cover hover:scale-[1.02] transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
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
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF5500] block">ENTREPRENEUR PROFILE &amp; WORK PHILOSOPHY</span>
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
                    className={`text-3xl md:text-4xl font-black uppercase leading-none ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                    text="The Mind Behind the Lens and the Machine"
                  />
                </div>

                <div className={`space-y-4 text-xs md:text-sm leading-relaxed ${
                  currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <ScrollReveal variant="fade-up" delay={0.1}>
                    <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5500] mb-2">{bioHeadline}</h2>
                    <p className="whitespace-pre-line leading-relaxed italic border-l-2 border-[#FF5500]/55 pl-4 py-1">
                      {bioText}
                    </p>
                  </ScrollReveal>
                  <p className="text-slate-500 italic text-xs">
                    *Pictured above: Murari Panjiyar, presenting his technical expertise and artistic perspective.*
                  </p>
                </div>

                <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${s.divider}`}>
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
            <div className={`p-6 rounded-3xl border ${s.card} space-y-6`}>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b ${s.divider}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-[#FF5500] to-purple-600 p-[2px] flex items-center justify-center">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${
                      currentTheme === 'light' ? 'bg-white' : 'bg-[#18181F]'
                    }`}>
                      <Instagram size={16} className="text-[#FF5500]" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`font-extrabold text-sm flex items-center gap-2 pt-0.5 ${
                      currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      <span>Instagram Visuals feed</span>
                      <a href="https://instagram.com/mpanjiyar1" target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-[#FF5500] transition-colors">
                        @mpanjiyar1 <ExternalLink size={10} className="inline ml-1" />
                      </a>
                      {instagramAccessToken && (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md border border-green-500/20 font-mono">
                          Live Sync Link
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-500 flex items-center flex-wrap gap-2 leading-none mt-1">
                      <span>Discover live photographic assignments, edits, and portfolio outtakes</span>
                      {isSyncingInstagram && (
                        <span className="text-[10px] text-[#FF5500] font-black flex items-center gap-1 animate-pulse font-mono bg-[#FF5500]/10 px-1.5 py-0.5 rounded">
                          <RefreshCw size={9} className="animate-spin" /> Auto-Updating Feed...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <a
                  href="https://instagram.com/mpanjiyar1"
                  target="_blank"
                  rel="noreferrer"
                  className={`text-xs font-extrabold uppercase px-4 py-2 rounded-lg transition-all ${
                    currentTheme === 'light' ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm' : 'bg-white hover:bg-zinc-200 text-black'
                  }`}
                >
                  Follow @mpanjiyar1
                </a>
              </div>

              {/* Grid map */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {instagramPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    onClick={() => {
                      if (!isAuthorized && (post.permalink || post.imageUrl)) {
                        window.open(post.permalink || post.imageUrl, '_blank');
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className={`group rounded-xl overflow-hidden aspect-square relative transition-all cursor-pointer border ${
                      currentTheme === 'light' ? 'bg-slate-50 border-slate-200 hover:border-slate-400' : 'bg-black border-white/5 hover:border-zinc-500'
                    }`}
                  >
                    {isAuthorized && (
                      <div className="absolute top-2 right-2 z-20 flex gap-1">
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
                          className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] shadow"
                          title="Edit Post"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this Instagram post?')) {
                              setInstagramPosts(instagramPosts.filter(p => p.id !== post.id));
                            }
                          }}
                          className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] shadow"
                          title="Delete Post"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                    <img
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400'}
                      alt="instagram portfolio post by murari mpanjiyar1"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between text-left z-10">
                      <p className="text-[9px] text-slate-300 line-clamp-4 leading-normal font-mono">
                        {post.caption}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                        <span className="flex items-center gap-1">❤️ {post.likes}</span>
                        <span className="flex items-center gap-1">💬 {post.comments}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isAuthorized && (
                  <div
                    onClick={() => setEditingItem({
                      type: 'instagram',
                      data: { id: 'insta_' + Date.now(), imageUrl: '', caption: 'Caption of your original instagram post here. #PixelFrame #Guwahati', likes: 140, comments: 12 }
                    })}
                    className={`group rounded-xl overflow-hidden aspect-square border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-3 cursor-pointer transition-all hover:scale-[1.02] ${
                      currentTheme === 'light'
                        ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-100 text-slate-500'
                        : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 text-slate-450'
                    }`}
                  >
                    <Plus size={20} className="text-[#FF5500]" />
                    <span className="text-[9px] font-black uppercase text-center block">Add Live Post</span>
                  </div>
                )}
              </div>
            </div>
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
                    <div>📞 Mobile support: +91 8638875231</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => triggerQuickBooking('it_fix', 'Hello Murari, I want to book standard doorstep computer repair support!')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon size={14} /> Send WhatsApp Support Ticket
                  </button>
                  <a
                    href="tel:8638875231"
                    className={`w-full font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 border ${
                      currentTheme === 'light' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    <Phone size={14} /> Dial +91 8638875231
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
                    <div>📞 Mobile hotline: +91 9864361940</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => triggerQuickBooking('photography', 'Hello Murari, I am inquiring about wedding, anniversary, or corporate event photography packages!')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon size={14} /> WhatsApp Photographer
                  </button>
                  <a
                    href="tel:9864361940"
                    className={`w-full font-extrabold text-xs uppercase py-3.5 tracking-wider rounded-lg flex items-center justify-center gap-2 border ${
                      currentTheme === 'light' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    <Phone size={14} /> Dial +91 9864361940
                  </a>
                </div>
              </div>

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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Gallery management uploader */}
                  <div className="lg:col-span-6 space-y-6">
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
                              <option value="party">🎂 Celebration Party</option>
                              <option value="corporate">👔 Corporate</option>
                              <option value="custom">📸 Custom Solo</option>
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

                    {/* Notification Alert System */}
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
                  </div>

                  {/* Right Column: Manage records */}
                  <div className="lg:col-span-6 space-y-6">
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
                            <div className="flex items-center space-x-3 text-left">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                              <div className="max-w-[200px]">
                                <span className={`font-extrabold block truncate ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-[#FF5500] uppercase font-bold">{item.category}</span>
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

                    {/* Booking inquiries from client contact forms logged locally */}
                    <div className={`p-6 rounded-3xl border ${s.card} space-y-4`}>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        <MessageSquare size={18} className="text-[#FF5500]" />
                        <span>Client Inquiry Log Stream</span>
                      </h3>

                      {contactMessages.length === 0 ? (
                        <div className={`py-8 text-center font-mono text-xs ${currentTheme === 'light' ? 'text-slate-400' : 'text-zinc-650'}`}>
                          -- No logging operations stream yet --
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {contactMessages.map((msg) => (
                            <div key={msg.id} className={`p-3 rounded-xl border text-xs text-left relative ${
                              currentTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                            }`}>
                              <button
                                onClick={() => {
                                  if (confirm('Delete inquiry entry?')) {
                                    setContactMessages(prev => prev.filter(c => c.id !== msg.id));
                                  }
                                }}
                                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                              
                              <div className={`font-extrabold flex items-center gap-2 ${
                                currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>
                                <span>{msg.name}</span>
                                <span className={`text-[10px] font-mono font-normal ${currentTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                  ({msg.timestamp})
                                </span>
                              </div>
                              <div className="text-[#FF5500] font-mono text-[9px] uppercase tracking-wider mt-0.5">
                                {msg.serviceType === 'it_fix' ? 'Pixel Fix Service' : 'Pixel Frame shoot'}
                              </div>
                              <div className={`text-[11px] leading-relaxed mt-1 font-sans ${
                                currentTheme === 'light' ? 'text-slate-700' : 'text-slate-350'
                              }`}>
                                {msg.message}
                              </div>
                              <div className={`font-mono text-[10px] pt-1.5 border-t mt-1.5 flex gap-3 ${
                                currentTheme === 'light' ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-400'
                              }`}>
                                <span>📞 Mobile: <a href={`tel:${msg.phone}`} className={`hover:underline ${currentTheme === 'light' ? 'text-slate-900 font-semibold' : 'text-white'}`}>{msg.phone}</a></span>
                                <a
                                  href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Hi%20${msg.name},%20this%20is%20Murari.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-green-500 hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <WhatsAppIcon size={12} /> WhatsApp Callback
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Instagram Real-time Api Sync Panel */}
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
                            currentTheme === 'light' ? 'text-slate-600' : 'text-slate-500'
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

                </div>
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
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-3xl p-4 md:p-6 max-w-3xl w-full text-left space-y-4 relative ${
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

              <div className={`aspect-video w-full rounded-2xl overflow-hidden relative border ${
                currentTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black border-white/5'
              }`}>
                <img
                  src={previewImage.imageUrl}
                  alt={previewImage.altText}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-mono font-bold text-[#FF5500] tracking-wider px-2 py-0.5 bg-[#FF5500]/10 rounded border border-[#FF5500]/20 inline-block">
                  {previewImage.category.toUpperCase()}
                </span>
                <h3 className={`text-lg md:text-xl font-black ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {previewImage.title}
                </h3>
                
                <div className={`flex flex-wrap items-center gap-4 text-xs font-mono pt-2 border-t ${
                  currentTheme === 'light' ? 'text-slate-600 border-slate-200' : 'text-slate-500 border-white/5'
                }`}>
                  <span>🗓️ Shot Date: {previewImage.date}</span>
                  <span>📷 Camera Parameters: <strong className={currentTheme === 'light' ? 'text-slate-900 font-bold' : 'text-white font-normal'}>{previewImage.cameraInfo || 'Nikon Z8 • High Definition Output'}</strong></span>
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
                  className="bg-[#FF5500] hover:bg-[#FF4400] text-zinc-100 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <WhatsAppIcon size={14} /> Request Portfolio Similar Shoot
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                    currentTheme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  Close Spec Preview
                </button>
              </div>
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
            <div className="flex items-center space-x-3">
              <PFLogo size={34} />
              <div>
                <span className={`font-extrabold text-sm tracking-wider uppercase block leading-none ${
                  currentTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  MURARI PANJIYAR
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#FF5500] font-bold block mt-1">
                  Pixel Fix &amp; Pixel Frame
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
                <a href="tel:8638875231" className="text-[#FF5500] font-bold hover:underline">
                  +91-8638875231
                </a>
              </div>
              <div className={`flex items-center justify-between border-b pb-1 ${
                currentTheme === 'light' ? 'border-slate-200' : 'border-white/5'
              }`}>
                <span>Pixel Frame Photography:</span>
                <a href="tel:9864361940" className="text-[#FF5500] font-bold hover:underline">
                  +91-9864361940
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

      {/* DYNAMIC ADMINISTRATIVE RESOURCE EDIT MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-xl p-6 rounded-3xl border text-left shadow-2xl relative ${
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
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5500]">Secure Admin Editor</span>
                    <h3 className="text-base font-black">
                      {editingItem.type === 'it_service' && 'Configure Doorstep IT Offering'}
                      {editingItem.type === 'photo_service' && 'Configure Photo Package Offering'}
                      {editingItem.type === 'instagram' && 'Configure Instagram Feed Post'}
                      {editingItem.type === 'hero' && 'Adjust Hero Titles & Profile Photo'}
                      {editingItem.type === 'about' && 'Adjust Biography Narrative'}
                      {editingItem.type === 'gallery_item' && 'Configure Portfolio Showcase Item'}
                      {editingItem.type === 'testimonial' && 'Configure Customer Review'}
                      {editingItem.type === 'pixelfix_review' && 'Configure Pixel Fix IT Review'}
                    </h3>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    
                    if (editingItem.type === 'it_service') {
                      const updated = [...itServices];
                      updated[editingItem.index!] = editingItem.data;
                      setItServices(updated);
                    } else if (editingItem.type === 'photo_service') {
                      const updated = [...photoServices];
                      updated[editingItem.index!] = editingItem.data;
                      setPhotoServices(updated);
                    } else if (editingItem.type === 'instagram') {
                      const exists = instagramPosts.some(p => p.id === editingItem.data.id);
                      if (exists) {
                        setInstagramPosts(instagramPosts.map(p => p.id === editingItem.data.id ? editingItem.data : p));
                      } else {
                        setInstagramPosts([editingItem.data, ...instagramPosts]);
                      }
                    } else if (editingItem.type === 'hero') {
                      setHeroHeadline(editingItem.data.headline);
                      setHeroSubheadline(editingItem.data.subheadline);
                      setProfilePhotoUrl(editingItem.data.photoUrl);
                    } else if (editingItem.type === 'about') {
                      setBioHeadline(editingItem.data.bioHeadline);
                      setBioText(editingItem.data.bioText);
                    } else if (editingItem.type === 'gallery_item') {
                      const exists = galleryItems.some(item => item.id === editingItem.data.id);
                      if (exists) {
                        setGalleryItems(galleryItems.map(item => item.id === editingItem.data.id ? editingItem.data : item));
                      } else {
                        setGalleryItems([editingItem.data, ...galleryItems]);
                      }
                    } else if (editingItem.type === 'testimonial') {
                      const exists = testimonials.some(t => t.id === editingItem.data.id);
                      if (exists) {
                        setTestimonials(testimonials.map(t => t.id === editingItem.data.id ? editingItem.data : t));
                      } else {
                        setTestimonials([...testimonials, editingItem.data]);
                      }
                    } else if (editingItem.type === 'pixelfix_review') {
                      const exists = pixelFixReviews.some(t => t.id === editingItem.data.id);
                      if (exists) {
                        setPixelFixReviews(pixelFixReviews.map(t => t.id === editingItem.data.id ? editingItem.data : t));
                      } else {
                        setPixelFixReviews([...pixelFixReviews, editingItem.data]);
                      }
                    }

                    setEditingItem(null);
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
                            <option value="wedding">💍 Weddings</option>
                            <option value="party">🎂 Celebrations & Events</option>
                            <option value="corporate">👔 Corporate Summit</option>
                            <option value="custom">📸 Custom Outdoors</option>
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
                      className="px-5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF4400] text-white font-extrabold uppercase tracking-wider text-[10px] shadow-lg cursor-pointer"
                    >
                      Apply Updates
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
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
