/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GalleryItem, ServiceDetail, Testimony } from './types';

export const INITIAL_IT_SERVICES: ServiceDetail[] = [
  {
    title: 'Doorstep IT Support',
    price: '₹500 onwards',
    description: 'Hardware troubleshooting, PC/Laptop repairs, and network setups right at your home or office at a reasonable price.',
    features: [
      'At-doorstep diagnosis & troubleshooting',
      'Laptop/Desktop hardware upgrades (RAM, SSD)',
      'Wi-Fi router configuration and signal optimization',
      'Data recovery & backup services',
      'Virus, adware, and bloatware clean-up'
    ]
  },
  {
    title: 'OS Upgrades & Setup',
    price: '₹350 onwards',
    description: 'Genuine operating system installation and configuration for both Windows 10 and Windows 11 with driver setups.',
    features: [
      'Official Windows 10 or Windows 11 installation',
      'Secure drive partitioning & format alignment',
      'Essential driver installations (Graphics, Sound, Network)',
      'Backup of important files before clean install',
      'Performance optimization and fast-boot registry setup'
    ]
  },
  {
    title: 'Productivity Software Support',
    price: '₹250 onwards',
    description: 'Licensing advisory and configuration for Microsoft Office (2019, 2021, and 2024 suites) tailored to your business or home workflow.',
    features: [
      'MS Office 2019 / 2021 / 2024 genuine configuration assistance',
      'Email client setups (Outlook, Thunderbird, IMAP/SMTP)',
      'Acrobat Reader & PDF tool chain installations',
      'Tailored troubleshooting for spreadsheet automation macros',
      'Multi-device activation advice and support'
    ]
  }
];

export const INITIAL_PHOTO_SERVICES: ServiceDetail[] = [
  {
    title: 'Wedding & Pre-Wedding',
    price: 'Custom Packages',
    description: 'Emotional, candid, and cinematic high-definition coverage of your wedding day to capture timeless human memories.',
    features: [
      'Full-day candid & traditional photography coverage',
      'Stunning cinematic couples shoot at premium locations',
      'High-resolution edited WebP image galleries',
      'Fully interactive responsive showcase for guests with prompt delivery',
      'Optional premium print coffee-table photobook album'
    ]
  },
  {
    title: 'Parties & Celebrations',
    price: 'Flexible Packages',
    description: 'Birthdays, anniversaries, family gatherings, and social celebrations captured with vibrant, high-energy storytelling shots.',
    features: [
      'High-energy documentation of candidate action and guest reactions',
      'Professional portrait setups & dynamic party photo corners',
      'Express photo correction & digital album transfer within 48h',
      'Low-light customized lens configuration for ambient party lights',
      'Group shots and detail-oriented decor photography'
    ]
  },
  {
    title: 'Corporate Events & Meetings',
    price: 'Professional Quotations',
    description: 'Crisp, professional photography optimized for corporate branding, formal conferences, seminars, panels, and corporate headshots.',
    features: [
      'Polished formal event documentation suitable for PR and social media',
      'Professional corporate headshots on-location',
      'Speeches, awards, panel discussions, and milestone activities',
      'High-speed deliverable flow for instant social media scheduling',
      'Sleek, professional aesthetic styled with soft, neutral lighting'
    ]
  },
  {
    title: 'Custom Outdoor Sessions',
    price: 'Tailored Budgeting',
    description: 'Artistic solo portraits, family memories, maternity shoots, and fashion portfolios customized to match your theme and location preference.',
    features: [
      'Tailored shoots in scenic gardens, historical places, or indoor studios',
      'Creative direction & customized mood counseling',
      'Flexible digital resolution outputs optimized for digital/print use',
      'Color tone customized themes (moody dark, glowing warm, high-fictional)',
      'Multi-concept wardrobe change flexibility'
    ]
  }
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Bridal Elegance, Guwahati, Assam, India',
    category: 'wedding',
    imageUrl: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=800&auto=format&fit=crop',
    altText: 'Stunning cinematic Indian bridal portrait shoot by Murari Panjiyar',
    date: '2026-04-12',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S'
  },
  {
    id: 'g2',
    title: 'Enterprise Server Assembly, Bengaluru, India',
    category: 'corporate',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    altText: 'Doorstep advanced network integration and server cabling in Bengaluru tech park by Pixel Fix',
    date: '2026-05-18',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 24-70mm f/2.8 S'
  },
  {
    id: 'g3',
    title: 'Vibrant Mehndi Festivities, New Delhi, India',
    category: 'wedding',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
    altText: 'Candid laughter during Indian mehndi ceremony festivities by Murari Panjiyar',
    date: '2026-02-14',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 50mm f/1.2 S'
  },
  {
    id: 'g4',
    title: 'Pre-Wedding Sunset, Marine Drive, Mumbai, India',
    category: 'wedding',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    altText: 'Cinematic Indian pre-wedding couple silhouette at sunset beach at Marine Drive',
    date: '2026-05-10',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 135mm f/1.8 S Plena'
  },
  {
    id: 'g5',
    title: 'Executive Portraiture, BKC Corporate Hub, Mumbai, India',
    category: 'corporate',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    altText: 'Professional corporate headshot by Indian IT & media photographer Murari Panjiyar',
    date: '2026-03-22',
    cameraInfo: 'Nikon D850 • AF-S NIKKOR 105mm f/1.4E ED'
  },
  {
    id: 'g6',
    title: 'Sangeet Choreography, Kolkata Palace, India',
    category: 'party',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
    altText: 'Vibrant Indian sangeet musical night celebrations with dancing guests',
    date: '2026-01-05',
    cameraInfo: 'Nikon Z6 II • NIKKOR Z 35mm f/1.8 S'
  },
  {
    id: 'g7',
    title: 'Fine-Art Portraiture, Munnar Tea Estates, Kerala, India',
    category: 'custom',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    altText: 'Aesthetic female solo portrait amongst lush green tea gardens of Munnar',
    date: '2026-04-30',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 85mm f/1.2 S'
  },
  {
    id: 'g8',
    title: 'Tech Summit Keynote Panel, Hyderabad, India',
    category: 'corporate',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    altText: 'Corporate panel discussion photography at India Tech Summit Hyderabad',
    date: '2026-05-02',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 70-200mm f/2.8 VR S'
  }
];

export const INITIAL_TESTIMONIALS: Testimony[] = [
  {
    id: 't1',
    name: 'Rajinder Sharma',
    role: 'Small Business Owner, IT Client',
    comment: 'Murari is extremely swift with tech troubleshooting! He came directly to my home-office, diagnosed a complex network error and successfully configured genuine Windows 11 and MS Office 2024 within two hours. Superb service of Pixel Fix!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'
  },
  {
    id: 't2',
    name: 'Priyanka & Anand',
    role: 'Wedding Clients',
    comment: 'Pixel Frame captured our wedding wonderfully! The candid shots are full of sheer raw emotion and beautiful lighting. Best photographer near Guwahati. He delivered the final WebP web gallery super fast, which our guests loved viewing immediately!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'
  },
  {
    id: 't3',
    name: 'Vikram Phukan',
    role: 'Event Organizer',
    comment: 'For our annual regional startup meetup, Pixel Frame handled the executive portrait corner. Crisp lighting, pristine background work, and high-quality files. Also, Murari helped us fix our office network setup right before the conference! True multi-talented professional!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150'
  }
];

// Curated Instagram placeholder posts
export const INSTAGRAM_POSTS = [
  {
    id: 'i1',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300',
    likes: 342,
    comments: 18,
    caption: 'Chasing sunsets and timeless emotions. Pre-wedding stories. ✨ #PixelFrame'
  },
  {
    id: 'i2',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300',
    likes: 198,
    comments: 11,
    caption: 'Precision check: Aligning motherboard configuration for optimal high-load server speed. #PixelFix #ITGuru'
  },
  {
    id: 'i3',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=300',
    likes: 412,
    comments: 24,
    caption: 'Bridges of laughter, framing the bridal elegance! 💍 @mpanjiyar1 #GuwahatiWedding'
  },
  {
    id: 'i4',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300',
    likes: 276,
    comments: 15,
    caption: 'On-site home setup deployment. Fast SSD integrations, diagnostic logs, operating system setups. Get yours done! #PixelFix'
  },
  {
    id: 'i5',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=300',
    likes: 320,
    comments: 14,
    caption: 'High energy events, corporate networking and branding shoots. Crafting visual representations. 📸 #CorporatePhotography'
  },
  {
    id: 'i6',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
    likes: 489,
    comments: 31,
    caption: 'Fine art outdoor sessions. Golden hours and soft silhouettes. Let us frame your dream canvas. #PortraitArtist'
  }
];

export const INITIAL_PIXELFIX_REVIEWS: Testimony[] = [
  {
    id: 'pfr1',
    name: 'Abhijit Das',
    role: 'Zoo Road, Guwahati',
    comment: 'Murari upgraded my home office PC with an SSD and original Windows 11 setup at Zoo Road, Guwahati. Extremely quick and humble doorstep service!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pfr2',
    name: 'Priyakshi Borah',
    role: 'Jorhat Town',
    comment: 'Amazing service! He came right to my shop near Jorhat Bypass and fixed our slow billing system within an hour. Highly recommended for any IT emergency.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pfr3',
    name: 'Rahul Saikia',
    role: 'HS Road, Dibrugarh',
    comment: 'Doorstep laptop cleaning and MS Office configuration done perfectly. Very reasonable prices compared to bulky laptop service centers in Dibrugarh.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pfr4',
    name: 'Bhaskar Jyoti Baruah',
    role: 'Silpukhuri, Guwahati',
    comment: 'Fastest motherboard cleaning and RAM upgrade in Guwahati. Called in the morning, laptop fixed by noon. Professional, punctual, and highly transparent on rates!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'pfr5',
    name: 'Anannya Gogoi',
    role: 'Tezpur',
    comment: 'Helpfully configured Microsoft Office and performed official secure Windows activation for my online teaching setup in Tezpur. Outstanding doorstep assistance!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  }
];
