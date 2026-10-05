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

