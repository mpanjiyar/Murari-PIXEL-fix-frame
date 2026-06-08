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
    title: 'Wedding & Pre-Wedding (Sacred Rasams)',
    price: 'Custom Packages',
    description: 'Emotional, candid, and cinematic high-definition coverage of your wedding day and traditional pre-wedding rituals (Haldi, Mehendi, Sangeet).',
    features: [
      'Full architectural coverage of traditional Indian Wedding Rasams & Rituals',
      'Candid & traditional photography captures of Haldi and Varmala',
      'Stunning cinematic couples shoot at premium heritage locations',
      'High-resolution edited WebP image collections delivered quickly',
      'Optional premium print coffee-table photobook album'
    ]
  },
  {
    title: 'Baby Shower & Godh Bharai',
    price: 'Flexible Packages',
    description: 'Divine, candid documentation of your traditional baby shower, maternity memories, and auspicious Godh Bharai ceremonies.',
    features: [
      'Artistic maternal portraiture of the expectant mother in elegant saree',
      'Warm family rituals, sweet blessings, and playful ceremony events',
      'Beautiful details of intricate henna designs and floral backdrops',
      'Nikon high-contrast low-light optimization for indoor events',
      'Vibrant digital photo registry delivered seamlessly'
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
    title: 'Devotional Moments & Traditional Festivities, Guwahati, Assam, India',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/10-HoXkMa_X3axop53ogpiPEyDv_w3Nbn',
    altText: 'Stunning celebratory capture displaying devotional traditional Indian wedding festivities, photographed beautifully by Murari Panjiyar',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 50mm f/1.2 S • Beautiful Traditional Light'
  },
  {
    id: 'g2',
    title: 'Elegant Traditional Assamese Bride & Handwoven Silk Mekhela Chador',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Lf19vDAD8mmFtpI2GH2t8v0IFd2s7hZU',
    altText: 'Detailed bridal portrait highlighting the exquisite handwoven zari embroidery, traditional Assamese jewelry, and serene expressions of the bride',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Beautiful Rim Lighting'
  },
  {
    id: 'g3',
    title: 'Joyful Outdoor Candid Laughs & Authentic Wedding Moments, Guwahati',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NDzHguseCZyHVR57bnsOwtdu8kuZTa9n',
    altText: 'Spontaneous laughing candid captured beautiful outdoors against luxurious lush greenery of Guwahati, showcasing genuine emotions',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 135mm f/1.8 S Plena • Dreamy Bokeh'
  },
  {
    id: 'g4',
    title: 'Royal Imperial Bridal Entry Under Hand-Crafted Phoolon Ki Chaadar',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NZ5KZgS7OnNAlh-2LK73Z5vFxQEXqHBF',
    altText: 'Dramatic wide-angle coverage of the grand bridal gateway entry surrounded by brothers holding a beautifully decorated floral canopy',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Flash Mix'
  },
  {
    id: 'g5',
    title: 'Grand Reception Elegance, Imperial Ballroom Setup, Assam',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/17AUU6FGOxRaje1nElUUDqGKQTboJ5kYX',
    altText: 'Cinematic wide frame showcasing the grandeur of the reception stage setup with warm ambient lighting, beautiful candles, and majestic floral arches',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 14-24mm f/2.8 S • Ultrawide Perspective'
  },
  {
    id: 'g6',
    title: 'Captivating Bride Portrait with Intricate Mehndhi & Custom Henna Art',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/159c6sugb6tfSr8LLyEax4VHSP5MUnQnI',
    altText: 'Stunning close-up view highlighting the detailed bridal henna patterns on hands, showcasing fine artwork and elegant traditional bangles',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Close-up Micro Focus'
  },
  {
    id: 'g7',
    title: 'Groom Imperial Portrait & Classic Designer Sherwani Details',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1WLA_PUnuRhc182D-Ch0mX25wWASXC7-E',
    altText: 'Polished studio-lit portrait of the groom showcasing authentic red and gold sherwani, pearl garlands, and poised look',
    date: '2026-06-08',
    cameraInfo: 'Nikon D850 • AF-S NIKKOR 105mm f/1.4E • Soft Portrait Keylight'
  },
  {
    id: 'g8',
    title: 'Warm Family Smiles, Auspicious Blessings Ceremony, Assam',
    category: 'custom',
    imageUrl: 'https://lh3.googleusercontent.com/d/1dhsMr79VPK1J0Uq_gpYz2uqy7WOJZ3ut',
    altText: 'Warm-toned picture celebrating togetherness, authentic smiles and family elders gifting pure gold blessings to the couple',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 35mm f/1.8 S • Soft Speedlight Fill'
  },
  {
    id: 'g9',
    title: 'Vibrant Traditional Festivity Sangeet Dance & High Energy Beats',
    category: 'party',
    imageUrl: 'https://lh3.googleusercontent.com/d/1GxdfLNiDk_-pACb3JMSv08TzFGNL7woS',
    altText: 'Action-packed celebration group shot under glowing fairy lights, capturing full of joy and beautiful traditional attire',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Motion Lock'
  },
  {
    id: 'g10',
    title: 'Auspicious Varmala Garland Exchange Under Floral Mandap',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1SDFtvLDtPOMwBV7zPtRJ_uIfVB9mcSXR',
    altText: 'Beautiful wide lens portrait of the grand varmala custom under a lavish stage styled with countless imported white and red roses',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • High Contrast Flare Sync'
  },
  {
    id: 'g11',
    title: 'Elegant Bridal Veil Details & Classic Hand Jewelry, India',
    category: 'custom',
    imageUrl: 'https://lh3.googleusercontent.com/d/1BrmUP0gZJ1-k8qhkOWteNMNB4fxirA2D',
    altText: 'Stunning artistic close-up of intricate gold jewelry, traditional red attire, henna, and fine wedding ornaments in ambient golden lighting',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 85mm f/1.2 S • Professional Portrait Light'
  },
  {
    id: 'g12',
    title: 'Vibrant Haldi Ceremony Celebration & Golden Turmeric Blessings',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ZVDqvzzWSrJ_NZsku_evg29MeOK69Prr',
    altText: 'Candid joyful shot of family showering turmeric water and celebratory marigold flowers onto the couple in their custom modern lawn setup',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 50mm f/1.2 S • Fast Action Freeze'
  },
  {
    id: 'g13',
    title: 'Sacred Vermilion Sindoor Ritual, Classical Wedding Assam, India',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/19CKvI4tsQ7-OCNbjaMMTh4e7QVAxzuJu',
    altText: 'Capturing a timeless and devotional traditional Indian wedding moment with close-up focus on the gold accents, vermilion, and beautiful family blessings',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 50mm f/1.2 S • Soft Studio Ring Light'
  },
  {
    id: 'g14',
    title: 'Groom Entrance & Traditional Baraat Procession, Guwahati',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1tdGCsa4KwKyrCMl9F4cMLaMNPfzQqFmB',
    altText: 'An energetic baraat dance capture with vibrant colors, lively expressions, and beautiful natural environment coverage by Murari Panjiyar Portfolio',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Action Track'
  },
  {
    id: 'g15',
    title: 'Premium Candid Wedding Expressions & Ceremonial Joy, Assam',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1kig015zZ81sKM_eG_Bn523aFCsLf812w',
    altText: 'Breathtaking close-up of a smiling bride and groom sharing raw emotions during an auspicious ritual, shot beautifully by Murari Panjiyar',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Creative Speedlight'
  },
  {
    id: 'g16',
    title: 'Authentic Traditional Ceremony Rituals, Guwahati, Assam',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ujSDKi4hwO5sN6L_tEVpzfn80k1L35d4',
    altText: 'Detailed capture of auspicious wedding customs, traditional brass utensils, holy fire blessings, and emotional family participations',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 50mm f/1.2 S • Ambient Warm Light'
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
    imageUrl: 'https://lh3.googleusercontent.com/d/1TI7y2H4O31gv3qOdwxg2oUY_r2mK4-kz',
    likes: 452,
    comments: 28,
    caption: 'Chasing timeless moments and candid smiles under the morning sun. Truly beautiful. ✨🌸 #PixelFrame #GuwahatiWeddings #AssamDiaries',
    permalink: 'https://www.instagram.com/p/C-TI7y2H4O31/'
  },
  {
    id: 'i2',
    imageUrl: 'https://lh3.googleusercontent.com/d/1JgyjpBwh_raC84MVgEVDzjkBpHGyAkl0',
    likes: 389,
    comments: 21,
    caption: 'The majestic grandeur of high-energy celebration beats! Drum rolls and rich traditional dances. 🥁🤵‍♂️ #PixelFrame #GuwahatiEvents #BaraatJoy',
    permalink: 'https://www.instagram.com/p/C-JgyjpBwhra/'
  },
  {
    id: 'i3',
    imageUrl: 'https://lh3.googleusercontent.com/d/1OlD8wVZo4-3ly9YsAEwqKYLCDpglqld6',
    likes: 512,
    comments: 34,
    caption: 'Intricate ornaments, detailed silk embroidery, and elegance of the traditional Assamese bridal wear. 💍🌾 #MekhelaChador #BridalPortraits #AssamesePride',
    permalink: 'https://www.instagram.com/p/C-OlD8wVZo43/'
  },
  {
    id: 'i4',
    imageUrl: 'https://lh3.googleusercontent.com/d/1RpZqOPwkNcgjOX-VeRnniwE-ZL4YaNiM',
    likes: 421,
    comments: 19,
    caption: 'Bound by sacred vows and holy fire blessings, custom designed stages crafted with pure white roses. 🔥💒 #CandidVows #SanskritBlessings #GuwahatiPhotographer',
    permalink: 'https://www.instagram.com/p/C-RpZqOPwkNc/'
  },
  {
    id: 'i5',
    imageUrl: 'https://lh3.googleusercontent.com/d/1S7ucq14Q1YNWx6vG39OEemiw9PUCFTVv',
    likes: 378,
    comments: 15,
    caption: 'Raw expressions of pure love and blissful family smiles during classic traditional morning customs. 😍✨ #PureMoments #PixelFramePortraits #Guwahati',
    permalink: 'https://www.instagram.com/p/C-S7ucq14Q1Y/'
  },
  {
    id: 'i6',
    imageUrl: 'https://lh3.googleusercontent.com/d/1M36Zil8-MtGCeL3bAfcRridcvK6KB-Gl',
    likes: 495,
    comments: 42,
    caption: 'Immersive majestic ballroom reception setup with flickering candles and beautiful high-contrast floral design. 🍿🕯️ #BallroomSetup #ReceptionAesthetics #PixelFrame',
    permalink: 'https://www.instagram.com/p/C-M36Zil8MtG/'
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
