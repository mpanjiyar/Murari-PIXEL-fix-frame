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
    ],
    inclusions: [
      'Complete physical cleaning of laptop/PC cooling fans & vents',
      'Thermal paste replacement (with high-grade thermal compound)',
      'Component diagnostic sweep (RAM, SSD/HDD integrity check)',
      'Local network integration & custom Wi-Fi setup',
      'Secure data extraction from legacy, unbootable drives'
    ],
    technicalSpecs: [
      'Supported OS: Windows 10, Windows 11, macOS, Linux (Ubuntu/Debian)',
      'Storage Diagnostic Engines: CrystalDiskInfo, HD Tune Pro',
      'Network Auditing Range: 2.4GHz & 5.0GHz dual-band wireless networks',
      'Thermal Compounds Utilized: Noctua NT-H1, Arctic MX-4',
      'Standard Diagnostic TAT: Under 60 minutes on-site'
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
    ],
    inclusions: [
      'Full drive partition alignment and GPT/MBR sector optimization',
      'Clean installation of official Microsoft Windows 10/11 operating system',
      'Essential runtime drivers (Intel/AMD chipset, realtek audio, proprietary graphics)',
      'Pre-installation manual secure user backup & post-installation restoration',
      'Custom system performance registry tuning & junk telemetry disabling'
    ],
    technicalSpecs: [
      'Platform Security: UEFI Secure Boot enabled, TPM 2.0 configuration',
      'File System Standard: NTFS (system drives), exFAT (shared storage)',
      'Hardware Minimums Verified: 4GB RAM, 64GB SSD storage, 1GHz dual-core 64-bit CPU',
      'Driver Registry: Official vendor repositories (NVIDIA, AMD, Intel, Realtek)',
      'Windows Update State: Fully patched to latest stable biannual channel build'
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
    ],
    inclusions: [
      'Genuine MS Office 2019/2021/2024 license deployment assistance',
      'Complete IMAP/SMTP corporate and personal email integration (Outlook/Thunderbird)',
      'Full Adobe PDF toolkit setup with seamless digital signature certificate workflows',
      'Advanced Excel calculation optimization (rebuilding faulty macro files or VLOOKUPs)',
      'Custom browser optimization (secure password managers & hardware-accelerated rendering)'
    ],
    technicalSpecs: [
      'Suite Compatibility: Microsoft 365, Office Home & Business standalone editions',
      'Encryption Standards: TLS 1.2 / TLS 1.3 for secure email transmissions',
      'Scripting Environment: VBA (Visual Basic for Applications) debugging enabled',
      'PDF Standard: ISO 32000 compliant digital document containers',
      'Performance Profile: Tailored memory allocation for large data sheets'
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
    ],
    inclusions: [
      'Dual-photographer coverage (Murari Panjiyar as lead candid photographer + 1 traditional assistant)',
      'Comprehensive high-speed cinematic lens setups (wide angles, prime portraiture optics)',
      'Complete editing (color correction, cinematic film presets, and skin-tone optimization)',
      'Seamless high-resolution web gallery download link available for 12 months',
      '1 Deluxe hand-stitched leatherette coffee-table album with 40-sheet lay-flat printing'
    ],
    technicalSpecs: [
      'Primary Camera Bodies: Dual Nikon Z9 & Nikon Z8 mirrorless architectures',
      'Optic Assortment: NIKKOR Z 85mm f/1.2 S, Z 50mm f/1.2 S, Z 135mm f/1.8 S Plena',
      'Resolution Delivery: 45.7 Megapixel RAW captures exported to high-fidelity WebP/JPEG',
      'Lighting Gear: Godox AD600Pro off-camera outdoor strobe and multiple on-camera speedlights',
      'Color Standards: Customized sRGB & Adobe RGB presets tailored for high-contrast traditional prints'
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
    ],
    inclusions: [
      'Lead coverage by Murari Panjiyar with a dedicated indoor lighting assistant',
      'Creative props & beautiful custom backdrops coordination assistance',
      'Detailed close-up shots of delicate traditional hand henna designs (Mehndi) and floral setups',
      'Artistic maternal portraits with family, friends, and ritual participants',
      'High-speed digital transfer of edited images within 7 business days'
    ],
    technicalSpecs: [
      'Main Body: Nikon Z8 with silent electronic shutter (zero disturbance during sacred rites)',
      'Optics Utilized: NIKKOR Z 35mm f/1.8 S, Z 85mm f/1.2 S',
      'Color Space: High-contrast warm, pastel, and glowing golden-hour tones',
      'Flash Power: Balanced on-camera bounce flashes with soft diffusers',
      'Output Formats: 24MP optimized digital copies & ultra-high-resolution print files'
    ]
  },
  {
    title: 'Parties & Celebrations',
    price: 'Flexible Packages',
    description: 'Birthdays, anniversaries, family gatherings, and social celebrations captured with vibrant, high-energy storytelling shots.',
    features: [
      'High-energy documentation of candid action and guest reactions',
      'Professional portrait setups & dynamic party photo corners',
      'Express photo correction & digital album transfer within 48h',
      'Low-light customized lens configuration for ambient party lights',
      'Group shots and detail-oriented decor photography'
    ],
    inclusions: [
      'Solo photographer coverage by Murari Panjiyar',
      'Live guest portrait-booth corner setup with dynamic lighting',
      'Express selection gallery with immediate social media sharing folder (within 48 hours)',
      'Interactive digital photo-album portal with simple guest downloads',
      'Candid coverage of events, cake cutting, dancing, and décor'
    ],
    technicalSpecs: [
      'Camera Gear: Nikon Z8 mirrorless paired with rapid-focus autofocus lines',
      'Optics: NIKKOR Z 24-70mm f/2.8 S for dynamic focal versatility',
      'Focus Performance: Dual eye-tracking auto-focus (dogs, babies, moving crowds)',
      'Night Performance: Specialized ISO 6400 high-noise-cleansing optimization',
      'Format: Web-optimized digital delivery for smartphones and iPads'
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
    ],
    inclusions: [
      'Unobtrusive, professional on-site coverage by Murari Panjiyar',
      'High-speed edit-delivery loop (same-day or next-morning PR releases)',
      'Clean headshot setup on location for keynote speakers or executives',
      'Event branding elements & sponsor logo placement focus',
      'Full commercial-use license and print release documentation'
    ],
    technicalSpecs: [
      'Camera Gear: Silent dual-card backup Nikon Z9 master system',
      'Optics: NIKKOR Z 70-200mm f/2.8 VR S telephoto & NIKKOR Z 14-24mm f/2.8 S ultra-wide',
      'ISO Noise Guard: Pin-sharp indoor performance up to ISO 12800',
      'Corporate Palette: Elegant, crisp, cool-neutral color profile suited for business reports',
      'Resolution: High-definition 300 DPI files for billboards, press kits, and print annuals'
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
    ],
    inclusions: [
      'Guided pre-shoot mood boards, styling consultations, and location selection',
      '2 hours of comprehensive solo or couple portrait shoot in Guwahati scenic locations',
      'Unlimited wardrobe adjustments within the session duration',
      'Fully post-processed, magazine-style professional airbrushed portraits',
      'Access to download digital portfolio files in premium color-grading styles'
    ],
    technicalSpecs: [
      'Camera System: Nikon Z9 with medium-format mimicking portrait optics',
      'Optics: NIKKOR Z 135mm f/1.8 S Plena & Z 50mm f/1.2 S',
      'Portrait Bokeh: Gorgeous, natural f/1.2 - f/1.8 optical bokeh rendering',
      'Lighting System: Ultra-portable Godox AD200Pro strobe with collapsible octabox diffuser',
      'File Standard: 16-bit TIFF master files and web-ready compressed formats'
    ]
  }
];

export function getExtraInclusionsAndSpecs(title: string, currentInclusions?: string[], currentSpecs?: string[]): { inclusions: string[], technicalSpecs: string[] } {
  if (currentInclusions && currentInclusions.length > 0 && currentSpecs && currentSpecs.length > 0) {
    return { inclusions: currentInclusions, technicalSpecs: currentSpecs };
  }

  const lowercaseTitle = title.toLowerCase();

  if (lowercaseTitle.includes('doorstep') || lowercaseTitle.includes('troubleshoot') || lowercaseTitle.includes('repair')) {
    return {
      inclusions: INITIAL_IT_SERVICES[0].inclusions || [],
      technicalSpecs: INITIAL_IT_SERVICES[0].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('os') || lowercaseTitle.includes('windows') || lowercaseTitle.includes('setup')) {
    return {
      inclusions: INITIAL_IT_SERVICES[1].inclusions || [],
      technicalSpecs: INITIAL_IT_SERVICES[1].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('software') || lowercaseTitle.includes('office') || lowercaseTitle.includes('productivity') || lowercaseTitle.includes('microsoft')) {
    return {
      inclusions: INITIAL_IT_SERVICES[2].inclusions || [],
      technicalSpecs: INITIAL_IT_SERVICES[2].technicalSpecs || []
    };
  }

  if (lowercaseTitle.includes('wedding') || lowercaseTitle.includes('pre-wedding') || lowercaseTitle.includes('marriage')) {
    return {
      inclusions: INITIAL_PHOTO_SERVICES[0].inclusions || [],
      technicalSpecs: INITIAL_PHOTO_SERVICES[0].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('baby') || lowercaseTitle.includes('shower') || lowercaseTitle.includes('godh') || lowercaseTitle.includes('bharai') || lowercaseTitle.includes('maternity')) {
    return {
      inclusions: INITIAL_PHOTO_SERVICES[1].inclusions || [],
      technicalSpecs: INITIAL_PHOTO_SERVICES[1].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('party') || lowercaseTitle.includes('celebration') || lowercaseTitle.includes('birthday') || lowercaseTitle.includes('anniversary')) {
    return {
      inclusions: INITIAL_PHOTO_SERVICES[2].inclusions || [],
      technicalSpecs: INITIAL_PHOTO_SERVICES[2].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('corporate') || lowercaseTitle.includes('meeting') || lowercaseTitle.includes('conference') || lowercaseTitle.includes('seminar') || lowercaseTitle.includes('headshot')) {
    return {
      inclusions: INITIAL_PHOTO_SERVICES[3].inclusions || [],
      technicalSpecs: INITIAL_PHOTO_SERVICES[3].technicalSpecs || []
    };
  }
  if (lowercaseTitle.includes('custom') || lowercaseTitle.includes('outdoor') || lowercaseTitle.includes('portrait') || lowercaseTitle.includes('solo')) {
    return {
      inclusions: INITIAL_PHOTO_SERVICES[4].inclusions || [],
      technicalSpecs: INITIAL_PHOTO_SERVICES[4].technicalSpecs || []
    };
  }

  return {
    inclusions: currentInclusions || [
      'Comprehensive on-site coverage & professional consultation',
      'Dynamic equipment calibration tailored to environment requirements',
      'Polished post-processing optimization and color adjustment',
      'High-resolution digital delivery via rapid secure links'
    ],
    technicalSpecs: currentSpecs || [
      'Diagnostic Platforms: Industry-standard professional tools',
      'System Configuration: Tailored to bespoke project performance benchmarks',
      'Standard Timeline: Prompt delivery within agreed scheduling profiles'
    ]
  };
}

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Devotional Moments & Sacred Wedding Rituals',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/10-HoXkMa_X3axop53ogpiPEyDv_w3Nbn',
    altText: 'A beautiful traditional Indian wedding ceremony highlighting sacred rituals and quiet devotion, photographed with Nikon Z9.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 50mm f/1.2 S • Beautiful Traditional Light'
  },
  {
    id: 'g2',
    title: 'Elegant Traditional Assamese Bride & Silk Mekhela Chador',
    category: 'bridal_portraits',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Lf19vDAD8mmFtpI2GH2t8v0IFd2s7hZU',
    altText: 'Exquisite bridal portrait featuring rich golden embroidered red silk and traditional ornaments, showcasing Assamese elegance.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Beautiful Rim Lighting'
  },
  {
    id: 'g3',
    title: 'Joyful Outdoor Pre-Wedding Shoot, Guwahati',
    category: 'pre_wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NDzHguseCZyHVR57bnsOwtdu8kuZTa9n',
    altText: 'Spontaneous laughing candid captured outdoors against the lush green landscapes of Assam during a dreamy pre-wedding shoot.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 135mm f/1.8 S Plena • Dreamy Bokeh'
  },
  {
    id: 'g4',
    title: 'Imperial Bridal Entry Under Phoolon Ki Chadar',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NZ5KZgS7OnNAlh-2LK73Z5vFxQEXqHBF',
    altText: 'Elegant grand bridal entry under a beautifully handcrafted fresh flower canopy, surrounded by loving family.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Flash Mix'
  },
  {
    id: 'g5',
    title: 'Grand Corporate Summit Ballroom Setup',
    category: 'corporate',
    imageUrl: 'https://lh3.googleusercontent.com/d/17AUU6FGOxRaje1nElUUDqGKQTboJ5kYX',
    altText: 'Professional wide-angle capture of a corporate awards banquet setup with spectacular architectural and stage lighting.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 14-24mm f/2.8 S • Professional Event Coverage'
  },
  {
    id: 'g6',
    title: 'Captivating Bridal Mehendi Henna Artistry',
    category: 'mehendi',
    imageUrl: 'https://lh3.googleusercontent.com/d/159c6sugb6tfSr8LLyEax4VHSP5MUnQnI',
    altText: 'Fine details of intricate bridal henna patterns on the hands of the bride during her joyful Mehendi ceremony.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Close-up Micro Focus'
  },
  {
    id: 'g7',
    title: 'Groom Portrait in Custom Designer Sherwani',
    category: 'groom_portraits',
    imageUrl: 'https://lh3.googleusercontent.com/d/1WLA_PUnuRhc182D-Ch0mX25wWASXC7-E',
    altText: 'Poised and elegant studio-lit portrait of the groom wearing a regal embroidered sherwani with classic details.',
    date: '2026-06-08',
    cameraInfo: 'Nikon D850 • AF-S NIKKOR 105mm f/1.4E • Soft Portrait Keylight'
  },
  {
    id: 'g8',
    title: 'Warm Family Blessings Ceremony',
    category: 'family_photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1dhsMr79VPK1J0Uq_gpYz2uqy7WOJZ3ut',
    altText: 'A heart-touching candid moment showcasing family elders blessing the couple with heartfelt smiles and pure gold gifts.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 35mm f/1.8 S • Soft Speedlight Fill'
  },
  {
    id: 'g9',
    title: 'High-Energy Sangeet & Reception Celebration',
    category: 'reception',
    imageUrl: 'https://lh3.googleusercontent.com/d/1GxdfLNiDk_-pACb3JMSv08TzFGNL7woS',
    altText: 'Dynamic group dance performance capture on stage with colorful light beams during a grand Sangeet celebration.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Motion Lock'
  },
  {
    id: 'g10',
    title: 'Auspicious Varmala Garland Exchange Ceremony',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/1SDFtvLDtPOMwBV7zPtRJ_uIfVB9mcSXR',
    altText: 'The beautiful and traditional exchange of fresh rose garlands under a spectacular mandap adorned with rich flora.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • High Contrast Flare Sync'
  },
  {
    id: 'g11',
    title: 'Classic Bridal Veil & Intricate Gold Jewelry Detail',
    category: 'bridal_portraits',
    imageUrl: 'https://lh3.googleusercontent.com/d/1BrmUP0gZJ1-k8qhkOWteNMNB4fxirA2D',
    altText: 'Close-up focus on the bride\'s sheer red veil and detailed wedding ornaments in romantic warm ambient lighting.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 85mm f/1.2 S • Professional Portrait Light'
  },
  {
    id: 'g12',
    title: 'Vibrant Haldi Ceremony Celebration & Marigold Rain',
    category: 'haldi',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ZVDqvzzWSrJ_NZsku_evg29MeOK69Prr',
    altText: 'Candid shot of family splashing turmeric water and yellow marigold flowers on the happy couple in a lively lawn setup.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z8 • NIKKOR Z 50mm f/1.2 S • Fast Action Freeze'
  },
  {
    id: 'g13',
    title: 'Sacred Vermilion Sindoor Ritual of Eternal Commitment',
    category: 'wedding',
    imageUrl: 'https://lh3.googleusercontent.com/d/19CKvI4tsQ7-OCNbjaMMTh4e7QVAxzuJu',
    altText: 'A timeless wedding moment capturing the groom applying vermilion to the bride\'s parting under auspicious family blessings.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 50mm f/1.2 S • Soft Studio Ring Light'
  },
  {
    id: 'g14',
    title: 'Elegant Ring Exchange & Engagement Ceremony',
    category: 'engagement',
    imageUrl: 'https://lh3.googleusercontent.com/d/1tdGCsa4KwKyrCMl9F4cMLaMNPfzQqFmB',
    altText: 'Close-up capturing the emotional moment of ring exchange and commitment during the couple\'s cozy engagement party.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 24-70mm f/2.8 S • Dynamic Action Track'
  },
  {
    id: 'g15',
    title: 'Dreamy Candid Couple Portrait during Nuptials',
    category: 'couple_portraits',
    imageUrl: 'https://lh3.googleusercontent.com/d/1kig015zZ81sKM_eG_Bn523aFCsLf812w',
    altText: 'A beautiful candid shot of the bride and groom sharing a quiet, joyful look amidst their busy wedding festivities.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z9 • NIKKOR Z 85mm f/1.2 S • Creative Speedlight'
  },
  {
    id: 'g16',
    title: 'Authentic Saptapadi Wedding Rituals & Holy Fire',
    category: 'candid_moments',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ujSDKi4hwO5sN6L_tEVpzfn80k1L35d4',
    altText: 'Detailed capture of sacred vows taken around the holy fire, documenting traditional brass utensils and pure devotion.',
    date: '2026-06-08',
    cameraInfo: 'Nikon Z7 II • NIKKOR Z 50mm f/1.2 S • Ambient Warm Light'
  }
];

export const INITIAL_TESTIMONIALS: Testimony[] = [
  {
    id: 't1',
    name: 'Pranab Borah',
    role: 'Traditional Wedding Client, Guwahati',
    comment: 'Pixel Frame made our Assamese wedding memories absolutely eternal! From the traditional biya customs to our families wearing beautiful silk Mekhela Chador, Murari captured every candid laugh and authentic emotion flawlessly. His doorstep professionalism in Guwahati is unmatched.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'
  },
  {
    id: 't2',
    name: 'Priyanka & Anand',
    role: 'Post-Wedding Session, Jorhat',
    comment: 'Simply incredible! Pixel Frame shot our traditional reception near Jorhat beautifully. Every single photograph feels alive, and he holds an amazing eye for candid expressions under ambient lighting. Best traditional wedding photographer in all of Assam, plus he delivered our digital gallery so fast!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'
  },
  {
    id: 't3',
    name: 'Himakshi Saikia',
    role: 'Cultural Portfolio, Tezpur',
    comment: 'Murari did an outdoor cultural Bihu portfolio for me near Tezpur, and the result was stunning! Crisp high-speed shutter capture, gorgeous background depth, and elegant warm color grading. He even helped diagnose my laptop network configuration right after the shoot. Highly talented professional!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  }
];

// Curated Instagram placeholder posts with 3 photos and 3 reels/videos
export const INSTAGRAM_POSTS = [
  {
    id: 'i1',
    imageUrl: 'https://lh3.googleusercontent.com/d/10-HoXkMa_X3axop53ogpiPEyDv_w3Nbn',
    likes: 452,
    comments: 28,
    caption: 'Chasing timeless moments and candid smiles under the morning sun. Truly beautiful. ✨🌸 #PixelFrame #GuwahatiWeddings #AssamDiaries',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'IMAGE'
  },
  {
    id: 'i2',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Lf19vDAD8mmFtpI2GH2t8v0IFd2s7hZU',
    likes: 389,
    comments: 21,
    caption: 'The majestic grandeur of high-energy celebration beats! Drum rolls and rich traditional dances. 🥁🤵‍♂️ #PixelFrame #GuwahatiEvents #BaraatJoy',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'IMAGE'
  },
  {
    id: 'i3',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NDzHguseCZyHVR57bnsOwtdu8kuZTa9n',
    likes: 512,
    comments: 34,
    caption: 'Intricate ornaments, detailed silk embroidery, and elegance of the traditional Assamese bridal wear. 💍🌾 #MekhelaChador #BridalPortraits #AssamesePride',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'IMAGE'
  },
  {
    id: 'v1',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NZ5KZgS7OnNAlh-2LK73Z5vFxQEXqHBF',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-videographer-with-a-camera-at-a-wedding-40118-large.mp4',
    likes: 685,
    comments: 42,
    caption: 'Cinematic wedding highlight reel. Experience the raw emotion, beautiful color grading, and transition magic. 🎥✨ #AssamWeddings #GuwahatiPhotographer #Reels',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'VIDEO'
  },
  {
    id: 'v2',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ZVDqvzzWSrJ_NZsku_evg29MeOK69Prr',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-bride-and-groom-40120-large.mp4',
    likes: 521,
    comments: 31,
    caption: 'Behind the scenes: capturing candid couple smiles in the lush green tea gardens of Assam. 🌿🍵 #AssamTourism #CandidMoments #BTS',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'VIDEO'
  },
  {
    id: 'v3',
    imageUrl: 'https://lh3.googleusercontent.com/d/159c6sugb6tfSr8LLyEax4VHSP5MUnQnI',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-capturing-a-video-of-a-dancing-couple-40114-large.mp4',
    likes: 742,
    comments: 53,
    caption: 'Dynamic gimbal sweeps and focus tracking. Cinematic storytelling that brings memories back to life. 🎬✨ #Storytelling #GimbalSweeps #PixelFrame',
    permalink: 'https://www.instagram.com/mpanjiyar1',
    mediaType: 'VIDEO'
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

export const INITIAL_AFFILIATE_LINKS: any[] = [
  {
    id: 'aff-1',
    title: 'Samsung 990 PRO Gen4 NVMe M.2 SSD',
    description: 'The absolute speed champion for workstation laptop and desktop upgrades. Boasts blistering 7450MB/s speeds. Highly recommended for Pixel Fix speed transformations.',
    category: 'it_tech, my_gears',
    url: 'https://amazon.in/dp/B0BHJDY57J',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=300',
    discountCode: 'PIXELSSD990',
    clicks: 142
  },
  {
    id: 'aff-2',
    title: 'Peak Design Slide Camera Strap (Ash)',
    description: 'The world\'s most versatile quick-connecting camera strap. Features security anchor links. Essential for long, demanding Pixel Frame wedding shoots.',
    category: 'accessories, my_gears',
    url: 'https://amazon.in/dp/B07519ZMK3',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300',
    discountCode: 'FRAMEANCHOR8',
    clicks: 89
  },
  {
    id: 'aff-3',
    title: 'Crucial RAM 16GB DDR5 4800MHz Dual-Rank',
    description: 'Boost multitasking workflows and eliminate Adobe Lightroom lag. Perfect upgrade companion for developers, designers, and dual-monitor multitasking.',
    category: 'it_tech, my_gears',
    url: 'https://amazon.in/dp/B5HXQD29',
    imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e33ae587?auto=format&fit=crop&q=80&w=300',
    discountCode: 'FIXSPEEDRAM',
    clicks: 118
  },
  {
    id: 'aff-4',
    title: 'SanDisk Extreme PRO UHS-II SDXC Card 128GB',
    description: 'Ultra-fast read/write speeds up to 300MB/s. Captures seamless high-speed raw continuous bursts on Nikon Z8/Z9 without filling the internal camera buffer.',
    category: 'photography, my_gears',
    url: 'https://amazon.in/dp/B010NE3O1G',
    imageUrl: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?auto=format&fit=crop&q=80&w=300',
    discountCode: 'FRAMEBURST22',
    clicks: 205
  },
  {
    id: 'aff-5',
    title: 'Adobe Creative Cloud Photography Plan',
    description: 'Access the world\'s premium photo retouching suite, including Adobe Photoshop, Lightroom Classic, and 20GB cloud storage. Create flawless compositions.',
    category: 'software',
    url: 'https://adobe.com/creativecloud/photography',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
    discountCode: 'ADOBEDISC5',
    clicks: 94
  }
];

