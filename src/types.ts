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
  category: 'wedding' | 'party' | 'corporate' | 'custom';
  imageUrl: string;
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
  clicks: number;
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
