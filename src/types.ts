/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Testimony {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  beforeImageUrl?: string; // Optional raw photography image URL
  altText: string;
  date: string;
  cameraInfo?: string;
}

export interface ServiceDetail {
  title: string;
  price?: string;
  description: string;
  features: string[];
  inclusions?: string[];
  technicalSpecs?: string[];
  proTip?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: 'it_fix' | 'photography' | 'general';
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
}

export interface NotificationLog {
  id: string;
  clientEmail: string;
  clientName: string;
  galleryTitle: string;
  serviceType: 'it_fix' | 'photography';
  sentAt: string;
  subject: string;
  body: string;
}

export interface AffiliateLink {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  imageUrl: string;
  discountCode?: string;
  price?: string;
  originalPrice?: string;
  discountPercentage?: string;
  availability?: string;
  partnerSource?: 'Amazon' | 'Flipkart' | 'Direct' | 'Other' | string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  clicks: number;
  clickHistory?: Record<string, number>;
  last_clicked?: string;
  daily_click_count?: Record<string, number>;
  isSyncedLicense?: boolean;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  price: string;
  badge: string;
  description: string;
  licenseType: string;
  imageUrl: string;
  features: string;
  compatibility: string;
  details: string;
  category: string;
  url?: string;
}

export interface SocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  platform: string;
  badge?: string;
  order: number;
  disabled?: boolean;
  customIcon?: string;
}

export interface VaultLink {
  title: string;
  url: string;
  status?: 'valid' | 'invalid' | 'warning';
  valid?: boolean;
  type?: string;
  isDrive?: boolean;
}

export interface VaultItem {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: 'text' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'other';
  itemType?: string;
  originalFileName?: string;
  storedFileName?: string;
  mimeType?: string;
  content?: string;
  links?: VaultLink[];
  sizeBytes: number;
  size?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  folder?: string;
  fileDataUrl?: string;
  isProtected?: boolean;
}

export interface VaultAuthorizedUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export interface VaultAuditLog {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  ip?: string;
}

export type ReelOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_FAILED'
  | 'REFUNDED'
  | 'paid'
  | 'pending';

export interface ReelPurchaseOrder {
  id: string;
  productId: string;
  productName: string;
  campaign: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: ReelOrderStatus;
  paymentMethod: 'UPI_BHARATPE';
  upiId: string;
  receiverName: string;
  utrReference?: string;
  customerNotes?: string;
  transactionId?: string;
  verificationSource?: 'manual_admin' | 'merchant_webhook' | 'instant_verify';
  submittedAt?: string;
  paymentVerifiedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewedByAdminId?: string;
  rejectionReason?: string;
  downloadToken?: string;
  downloadExpiresAt?: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  auditLogs: {
    action: string;
    timestamp: string;
    actor: string;
    details?: string;
  }[];
}

export type AdminNotificationType = 'MANUAL_VERIFICATION_REQUEST' | 'FAILED_WEBHOOK' | 'SYSTEM_WARNING';
export type AdminNotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AdminAlertNotification {
  id: string;
  type: AdminNotificationType;
  severity: AdminNotificationSeverity;
  title: string;
  message: string;
  relatedOrderId?: string;
  customerName?: string;
  customerPhone?: string;
  amount?: number;
  utrReference?: string;
  createdAt: string;
  readAt?: string | null;
  resolvedAt?: string | null;
  eventFingerprint?: string;
}

export type ResourceAvailabilityStatus =
  | 'verified'
  | 'auth_required'
  | 'permission_denied'
  | 'not_found'
  | 'invalid_url'
  | 'temp_unavailable'
  | 'inconclusive'
  | 'admin_review';

export interface ResourceAuditEntry {
  timestamp: string;
  adminId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface MegaPackResource {
  id: string;
  title: string;
  category: 'quick_access' | 'core' | 'creative' | 'trending' | 'ai_gadgets' | 'bonuses';
  categoryLabel: string;
  categoryColor: string;
  description: string;
  destinationUrl?: string | null;
  isLocked?: boolean;
  resourceType: 'drive_folder' | 'drive_file' | 'telegram' | 'pdf_guide' | 'ebook' | 'tool' | 'link';
  thumbnail?: string;
  badge?: string;
  countBadge?: string;
  isActive: boolean;
  sortOrder: number;
  lastCheckedAt?: string;
  availabilityStatus: ResourceAvailabilityStatus;
  notes?: string;
  updatedAt: string;
  auditHistory?: ResourceAuditEntry[];
}

export interface OfferPopupCategoryItem {
  id: string;
  label: string;
  count: string;
  link?: string;
}

export type FestivalThemeType = 'durga' | 'diwali' | 'orange' | 'emerald' | 'purple' | 'gold';

export interface OfferPopupConfig {
  enabled: boolean;
  floatingBadgeEnabled: boolean;
  festivalTheme: FestivalThemeType;
  customLogoUrl: string;
  customLogoLink?: string;
  masterVaultLink?: string;
  supportLink?: string;
  floatingBadgeLink?: string;
  badgeText: string;
  discountBadge: string;
  headline: string;
  subheadline: string;
  originalPrice: number;
  offerPrice: number;
  currency: string;
  pricingBadge: string;
  paymentType: string;
  deliveryNote: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  floatingBadgeTitle: string;
  floatingBadgeSubtext: string;
  trustBadges: string[];
  categories: OfferPopupCategoryItem[];
  updatedAt?: string;
}

export const DEFAULT_OFFER_POPUP_CONFIG: OfferPopupConfig = {
  enabled: true,
  floatingBadgeEnabled: true,
  festivalTheme: 'durga',
  customLogoUrl: '',
  customLogoLink: '',
  masterVaultLink: 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing',
  supportLink: 'https://wa.me/919954000000?text=Hi%20Pixel%20Fix,%20I%20have%20a%20question%20about%20the%20150K%2B%20Reels%20Festive%20Pack',
  floatingBadgeLink: '',
  badgeText: '🎉 DURGA PUJA SPECIAL OFFER',
  discountBadge: '90% OFF LIMITED TIME',
  headline: '150K+ MEGA PACK — REELS & SHORTS',
  subheadline: 'Take your content creation to the next level with a massive collection of high-retention vertical videos. Ready for Instagram Reels, YouTube Shorts, and TikTok.',
  originalPrice: 1999,
  offerPrice: 199,
  currency: 'INR',
  pricingBadge: 'Special Festive Deal',
  paymentType: 'One-Time Payment',
  deliveryNote: 'Google Drive Master Vault',
  primaryButtonText: 'UNLOCK YOUR PACK',
  primaryButtonLink: '',
  secondaryButtonText: 'Explore Categories',
  secondaryButtonLink: '',
  floatingBadgeTitle: '🎉 DURGA PUJA OFFER',
  floatingBadgeSubtext: '150K+ Reels Pack · ₹199',
  trustBadges: [
    '100% Watermark Free',
    '1080x1920 9:16 Full HD',
    'Verified BharatPe UPI'
  ],
  categories: [
    { id: '1', label: 'Anime & Shonen', count: '20K+', link: '' },
    { id: '2', label: 'Cartoons Classic', count: '18K+', link: '' },
    { id: '3', label: 'Motivation & Mindset', count: '25K+', link: '' },
    { id: '4', label: 'Woodworking Craft', count: '15K+', link: '' },
    { id: '5', label: 'Satisfying Videos', count: '22K+', link: '' },
    { id: '6', label: '3D & CGI Motion', count: '16K+', link: '' },
    { id: '7', label: 'Cars & Automotive', count: '14K+', link: '' },
    { id: '8', label: 'Travel & Nature 4K', count: '20K+', link: '' },
    { id: '9', label: 'Tech & Lifestyle', count: '10K+', link: '' }
  ]
};



