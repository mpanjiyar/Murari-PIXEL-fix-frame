import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Link, 
  FileText, 
  Share2, 
  RefreshCw, 
  Info,
  ExternalLink,
  Smartphone,
  Palette,
  Wifi,
  User,
  Mail,
  MessageSquare,
  MapPin,
  Upload,
  Image as ImageIcon,
  Sun,
  Moon,
  Printer,
  Sliders,
  CheckSquare,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Tv,
  Compass,
  AtSign,
  Heart,
  Globe
} from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  currentTheme?: 'light' | 'normal' | 'mono';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

type QRContentType = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'sms' | 'geo';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  brandColor: string;
  placeholder: string;
  prefix: string;
}

interface PrebuiltLogo {
  name: string;
  label: string;
  svgPath: string;
  color: string;
}

const PREBUILT_LOGOS: PrebuiltLogo[] = [
  {
    name: 'pixel-frame',
    label: 'Pixel Frame',
    color: '#FF5500',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
  },
  {
    name: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
  },
  {
    name: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    svgPath: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
  },
  {
    name: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
  }
];

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  currentTheme = 'normal',
  triggerToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<QRContentType>('url');
  
  // Custom states for each dynamic QR Type
  const [urlInput, setUrlInput] = useState('https://mpanjiyar100.wixsite.com/pixel-frame');
  const [textInput, setTextInput] = useState('Pixel Frame Studio — Premium Cinematography');
  
  // Wi-Fi inputs
  const [wifiSsid, setWifiSsid] = useState('Pixel_Frame_5G');
  const [wifiPassword, setWifiPassword] = useState('creativeflow2026');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard inputs
  const [contactName, setContactName] = useState('Murari Panjiyar');
  const [contactOrg, setContactOrg] = useState('Pixel Frame Guwahati');
  const [contactPhone, setContactPhone] = useState('+918638875231');
  const [contactEmail, setContactEmail] = useState('Mpanjiyar100@gmail.com');
  const [contactUrl, setContactUrl] = useState('https://mpanjiyar100.wixsite.com/pixel-frame');

  // Email inputs
  const [emailTo, setEmailTo] = useState('Mpanjiyar100@gmail.com');
  const [emailSubject, setEmailSubject] = useState('Photography Inquiry - Pixel Frame');
  const [emailBody, setEmailBody] = useState('Hi Murari, I would like to book a photography session.');

  // SMS inputs
  const [smsPhone, setSmsPhone] = useState('+918638875231');
  const [smsMessage, setSmsMessage] = useState('Hi Murari, checking availability for a cinematic shoot!');

  // Geo inputs
  const [geoLat, setGeoLat] = useState('26.1445');
  const [geoLng, setGeoLng] = useState('91.7362');

  // Visual Customizations
  const [foregroundColor, setForegroundColor] = useState('#FF5500');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [dotStyle, setDotStyle] = useState<'square' | 'dots' | 'rounded'>('rounded');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [marginSize, setMarginSize] = useState(4);
  const [darkPreview, setDarkPreview] = useState(false);
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'circle'>('rounded');

  // Logo settings
  const [logoOption, setLogoOption] = useState<'none' | 'prebuilt' | 'custom'>('prebuilt');
  const [selectedPrebuiltLogo, setSelectedPrebuiltLogo] = useState<string>('pixel-frame');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [logoScale, setLogoScale] = useState(0.22);
  const [includeLogoBg, setIncludeLogoBg] = useState(true);

  // Frame choices
  const [frameStyle, setFrameStyle] = useState<'none' | 'border' | 'scan_me' | 'luxury'>('none');
  const [frameText, setFrameText] = useState('SCAN TO VIEW');
  const [frameColor, setFrameColor] = useState('#FF5500');

  // Output URLs
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLight = currentTheme === 'light';
  const isMono = currentTheme === 'mono';

  // Social platform database list
  const socialPlatforms: SocialPlatform[] = [
    { id: 'youtube', name: 'YouTube', icon: <Youtube size={14} />, brandColor: '#FF0000', placeholder: 'YouTube Channel/Video URL (https://youtube.com/...)', prefix: 'https://youtube.com/' },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare size={14} />, brandColor: '#25D366', placeholder: 'WhatsApp Phone Number with country code (e.g. +918638875231)', prefix: 'https://wa.me/' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={14} />, brandColor: '#1877F2', placeholder: 'Facebook Profile or Page URL (https://facebook.com/...)', prefix: 'https://facebook.com/' },
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={14} />, brandColor: '#E1306C', placeholder: 'Instagram Profile URL (https://instagram.com/...)', prefix: 'https://instagram.com/' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={14} />, brandColor: '#0A66C2', placeholder: 'LinkedIn Profile URL (https://linkedin.com/in/...)', prefix: 'https://linkedin.com/in/' },
    { id: 'telegram', name: 'Telegram', icon: <Compass size={14} />, brandColor: '#0088CC', placeholder: 'Telegram Username or link (e.g. https://t.me/...)', prefix: 'https://t.me/' },
    { id: 'github', name: 'GitHub', icon: <Github size={14} />, brandColor: '#181717', placeholder: 'GitHub Profile or Repo URL (https://github.com/...)', prefix: 'https://github.com/' },
    { id: 'spotify', name: 'Spotify', icon: <Tv size={14} />, brandColor: '#1DB954', placeholder: 'Spotify Artist, Playlist or Album link (https://open.spotify.com/...)', prefix: 'https://open.spotify.com/' },
    { id: 'threads', name: 'Threads', icon: <AtSign size={14} />, brandColor: '#000000', placeholder: 'Threads Account Link (https://threads.net/@...)', prefix: 'https://threads.net/@' }
  ];

  // Helper: Compile raw input to standard QR format
  const getCompiledText = (): string => {
    switch (activeType) {
      case 'url':
        return urlInput.trim() || 'https://mpanjiyar100.wixsite.com/pixel-frame';
      case 'text':
        return textInput || 'Pixel Frame';
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nORG:${contactOrg}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nURL:${contactUrl}\nEND:VCARD`;
      case 'email':
        const encodedSubject = encodeURIComponent(emailSubject);
        const encodedBody = encodeURIComponent(emailBody);
        return `mailto:${emailTo}?subject=${encodedSubject}&body=${encodedBody}`;
      case 'sms':
        return `SMSTO:${smsPhone}:${smsMessage}`;
      case 'geo':
        return `geo:${geoLat},${geoLng}?q=${geoLat},${geoLng}`;
      default:
        return 'https://mpanjiyar100.wixsite.com/pixel-frame';
    }
  };

  // Live validation feedback helper
  const getValidationMessage = (): { valid: boolean; text: string } => {
    const raw = getCompiledText();
    if (!raw || !raw.trim()) return { valid: false, text: 'Input cannot be empty' };

    switch (activeType) {
      case 'url':
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
        return urlPattern.test(urlInput)
          ? { valid: true, text: 'Perfect Destination URL' }
          : { valid: false, text: 'Please enter a valid web URL' };
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(emailTo)
          ? { valid: true, text: 'Verified Email Destination' }
          : { valid: false, text: 'Invalid email address syntax' };
      case 'wifi':
        return wifiSsid.trim().length > 0
          ? { valid: true, text: `Ready to connect to SSID: ${wifiSsid}` }
          : { valid: false, text: 'Wi-Fi network name is required' };
      case 'contact':
        return contactName.trim().length > 0 && contactPhone.trim().length > 0
          ? { valid: true, text: 'vCard standard business card complete' }
          : { valid: false, text: 'Name & Phone numbers are mandatory' };
      default:
        return { valid: true, text: 'Ready and fully encoded' };
    }
  };

  // Re-generate QR Code onto local canvas reference
  useEffect(() => {
    const rawContent = getCompiledText();
    if (!rawContent.trim()) {
      setQrPngUrl('');
      setQrSvgString('');
      return;
    }

    const drawCanvas = async () => {
      try {
        // Create matrix from data
        const qr = QRCode.create(rawContent, { errorCorrectionLevel: errorCorrection });
        const matrixSize = qr.modules.size;

        // Create standard high-res Canvas element
        const qrCanvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        
        // Dynamic padding based on margin
        const rawMargin = marginSize * 8;
        const cellSize = 12; // High definition resolution scaling
        const qrBaseSize = matrixSize * cellSize;
        
        // Extra height for frames if enabled
        let frameHeight = 0;
        if (frameStyle === 'scan_me') frameHeight = 55;
        if (frameStyle === 'luxury') frameHeight = 70;

        const canvasWidth = qrBaseSize + rawMargin * 2;
        const canvasHeight = qrBaseSize + rawMargin * 2 + frameHeight;

        qrCanvas.width = canvasWidth;
        qrCanvas.height = canvasHeight;
        
        const ctx = qrCanvas.getContext('2d');
        if (!ctx) return;

        // Background fill
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Drawing custom stylized eye finders (eyes are at [0,0], [size-7, 0], [0, size-7])
        const isEyeModule = (r: number, c: number): boolean => {
          if (r < 7 && c < 7) return true;
          if (r < 7 && c >= matrixSize - 7) return true;
          if (r >= matrixSize - 7 && c < 7) return true;
          return false;
        };

        // Standard QR code payload renderer
        for (let r = 0; r < matrixSize; r++) {
          for (let c = 0; c < matrixSize; c++) {
            // Safe matrix explorer
            const isDark = qr.modules.get ? qr.modules.get(c, r) : (qr.modules.data ? qr.modules.data[c * matrixSize + r] : false);
            
            if (isDark) {
              const x = rawMargin + r * cellSize;
              const y = rawMargin + c * cellSize;

              // Skip eye modules so we can draw custom nested eye markers
              if (isEyeModule(r, c)) continue;

              ctx.fillStyle = foregroundColor;

              if (dotStyle === 'dots') {
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize / 2) * 0.85, 0, 2 * Math.PI);
                ctx.fill();
              } else if (dotStyle === 'rounded') {
                ctx.beginPath();
                const radius = cellSize * 0.38;
                ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, radius);
                ctx.fill();
              } else {
                ctx.fillRect(x, y, cellSize, cellSize);
              }
            }
          }
        }

        // Helper: Draw custom styled Finder Eyes
        const drawEye = (ox: number, oy: number) => {
          const x = rawMargin + ox * cellSize;
          const y = rawMargin + oy * cellSize;
          const fullEyeSize = 7 * cellSize;

          ctx.fillStyle = foregroundColor;

          if (eyeStyle === 'circle') {
            // Circular Outer Ring
            ctx.beginPath();
            ctx.arc(x + fullEyeSize / 2, y + fullEyeSize / 2, fullEyeSize / 2 - 2, 0, 2 * Math.PI);
            ctx.lineWidth = cellSize * 0.95;
            ctx.strokeStyle = foregroundColor;
            ctx.stroke();

            // Clear space in between
            ctx.beginPath();
            ctx.arc(x + fullEyeSize / 2, y + fullEyeSize / 2, fullEyeSize / 2 - cellSize - 1, 0, 2 * Math.PI);
            ctx.fillStyle = backgroundColor;
            ctx.fill();

            // Circular Inner Dot
            ctx.beginPath();
            ctx.arc(x + fullEyeSize / 2, y + fullEyeSize / 2, fullEyeSize / 2 - cellSize * 2, 0, 2 * Math.PI);
            ctx.fillStyle = foregroundColor;
            ctx.fill();
          } else if (eyeStyle === 'rounded') {
            // Outer Rounded Ring
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, fullEyeSize - 2, fullEyeSize - 2, cellSize * 1.5);
            ctx.strokeStyle = foregroundColor;
            ctx.lineWidth = cellSize * 0.95;
            ctx.stroke();

            // Clear center space
            ctx.beginPath();
            ctx.roundRect(x + cellSize + 0.5, y + cellSize + 0.5, fullEyeSize - cellSize * 2 - 1, fullEyeSize - cellSize * 2 - 1, cellSize * 0.7);
            ctx.fillStyle = backgroundColor;
            ctx.fill();

            // Inner Core Solid Dot
            ctx.beginPath();
            ctx.roundRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3, cellSize * 0.7);
            ctx.fillStyle = foregroundColor;
            ctx.fill();
          } else {
            // Classic Square Outer Ring
            ctx.strokeStyle = foregroundColor;
            ctx.lineWidth = cellSize * 0.95;
            ctx.strokeRect(x + cellSize * 0.5, y + cellSize * 0.5, fullEyeSize - cellSize, fullEyeSize - cellSize);

            // Inner Core Solid Dot
            ctx.fillStyle = foregroundColor;
            ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
          }
        };

        // Draw the 3 finder eyes
        drawEye(0, 0); // Top-Left
        drawEye(matrixSize - 7, 0); // Top-Right
        drawEye(0, matrixSize - 7); // Bottom-Left

        // 3. Central Brand Logo Overlay Helper
        const drawLogoOnCanvas = async () => {
          let loadedImg: HTMLImageElement | null = null;

          if (logoOption === 'prebuilt') {
            const prebuilt = PREBUILT_LOGOS.find(p => p.name === selectedPrebuiltLogo);
            if (prebuilt) {
              const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent(prebuilt.color)}"><path d="${prebuilt.svgPath}"/></svg>`;
              const blob = new Blob([svgStr], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              loadedImg = await loadImage(url);
              URL.revokeObjectURL(url);
            }
          } else if (logoOption === 'custom' && customLogoUrl) {
            loadedImg = await loadImage(customLogoUrl);
          }

          if (loadedImg) {
            // Center calculation
            const qrCenter = rawMargin + qrBaseSize / 2;
            const logoMaxDimension = qrBaseSize * logoScale;
            
            // Scaled calculations preserving aspect ratio
            let logoW = logoMaxDimension;
            let logoH = logoMaxDimension;
            if (loadedImg.width > loadedImg.height) {
              logoH = logoMaxDimension * (loadedImg.height / loadedImg.width);
            } else {
              logoW = logoMaxDimension * (loadedImg.width / loadedImg.height);
            }

            const lx = qrCenter - logoW / 2;
            const ly = qrCenter - logoH / 2;

            if (includeLogoBg) {
              // Draw a soft backdrop patch to clear out QR lines behind logo
              ctx.beginPath();
              ctx.roundRect(lx - 6, ly - 6, logoW + 12, logoH + 12, 12);
              ctx.fillStyle = backgroundColor;
              ctx.fill();
              
              ctx.beginPath();
              ctx.roundRect(lx - 6, ly - 6, logoW + 12, logoH + 12, 12);
              ctx.strokeStyle = foregroundColor + '1a';
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            // Draw center logo image
            ctx.drawImage(loadedImg, lx, ly, logoW, logoH);
          }
        };

        // Draw central logo
        if (logoOption !== 'none') {
          await drawLogoOnCanvas();
        }

        // 4. Draw customizable aesthetic frames / captions
        if (frameStyle === 'border') {
          ctx.strokeStyle = frameColor;
          ctx.lineWidth = 4;
          ctx.strokeRect(6, 6, canvasWidth - 12, canvasHeight - 12);
        } else if (frameStyle === 'scan_me') {
          // Bottom elegant banner
          const bannerY = qrBaseSize + rawMargin * 2;
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, bannerY, canvasWidth, frameHeight);

          // Render clean white modern heading
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'black 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameText.toUpperCase() || 'SCAN ME', canvasWidth / 2, bannerY + frameHeight / 2);
        } else if (frameStyle === 'luxury') {
          // Double lines top and bottom
          ctx.strokeStyle = frameColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(8, 8, canvasWidth - 16, canvasHeight - 16);

          const bannerY = qrBaseSize + rawMargin * 2;
          ctx.fillStyle = frameColor;
          ctx.fillRect(16, bannerY + 6, canvasWidth - 32, frameHeight - 22);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameText.toUpperCase() || 'LIFETIME QR CODE', canvasWidth / 2, bannerY + (frameHeight - 10) / 2);
        }

        // Extract PNG URL from Canvas
        setQrPngUrl(qrCanvas.toDataURL('image/png'));

        // Generate dynamic lossless vector SVG
        const svgStr = await QRCode.toString(rawContent, {
          type: 'svg',
          errorCorrectionLevel: errorCorrection,
          margin: marginSize,
          color: {
            dark: foregroundColor,
            light: backgroundColor
          }
        });
        setQrSvgString(svgStr);

      } catch (err) {
        console.error('Error in Canvas generation cycle:', err);
      }
    };

    const timer = setTimeout(() => {
      drawCanvas();
    }, 120);

    return () => clearTimeout(timer);
  }, [
    activeType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    contactName,
    contactOrg,
    contactPhone,
    contactEmail,
    contactUrl,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    geoLat,
    geoLng,
    foregroundColor,
    backgroundColor,
    dotStyle,
    errorCorrection,
    marginSize,
    eyeStyle,
    logoOption,
    selectedPrebuiltLogo,
    customLogoUrl,
    logoScale,
    includeLogoBg,
    frameStyle,
    frameText,
    frameColor
  ]);

  // Load image utility helper
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.crossOrigin = 'Anonymous';
      img.src = src;
    });
  };

  // Quick Action: Upload custom watermark logo file
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (triggerToast) triggerToast("File too large. Max size is 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoUrl(event.target.result as string);
        setLogoOption('custom');
        if (triggerToast) triggerToast("Watermark logo loaded into memory!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy textual content payload
  const handleCopyText = async () => {
    const raw = getCompiledText();
    try {
      await navigator.clipboard.writeText(raw);
      setCopiedText(true);
      if (triggerToast) triggerToast("Raw data payload copied!", "success");
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      if (triggerToast) triggerToast("Failed to copy data.", "error");
    }
  };

  // Download actions
  const handleDownloadPNG = () => {
    if (!qrPngUrl) return;
    const link = document.createElement('a');
    link.href = qrPngUrl;
    link.download = `pixel_frame_studio_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (triggerToast) triggerToast("Premium PNG downloaded in high resolution!", "success");
  };

  const handleDownloadSVG = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixel_frame_studio_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (triggerToast) triggerToast("Scalable vector SVG downloaded!", "success");
  };

  // Print & PDF Layout trigger
  const handlePrintPDF = () => {
    if (!qrPngUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (triggerToast) triggerToast("Popup blocked! Enable popups to save as PDF.", "error");
      return;
    }

    const raw = getCompiledText();

    printWindow.document.write(`
      <html>
        <head>
          <title>Pixel Frame Studio QR Export</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #ffffff;
              color: #0f172a;
              text-align: center;
            }
            .container {
              border: 1px solid #e2e8f0;
              padding: 40px;
              border-radius: 24px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            img {
              width: 320px;
              height: auto;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 22px;
              margin: 0 0 8px 0;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #FF5500;
            }
            p {
              font-size: 11px;
              color: #64748b;
              margin: 0 0 16px 0;
              font-family: monospace;
              word-break: break-all;
              max-width: 350px;
            }
            .badge {
              font-size: 10px;
              font-weight: bold;
              background: #f1f5f9;
              padding: 6px 12px;
              border-radius: 99px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrPngUrl}" />
            <h1>Pixel Frame</h1>
            <p>${raw}</p>
            <div class="badge">Lifetime Verified • Scan Active</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy QR Image directly as image block to clipboard
  const handleCopyQRImage = async () => {
    if (!qrPngUrl) return;
    try {
      const response = await fetch(qrPngUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      if (triggerToast) triggerToast("QR code image copied to clipboard!", "success");
    } catch (err) {
      // Fallback to text copy of Base64 URL
      try {
        await navigator.clipboard.writeText(qrPngUrl);
        if (triggerToast) triggerToast("Base64 string copied (Clipboard Image not supported on this browser)!", "info");
      } catch (_) {
        if (triggerToast) triggerToast("Failed to copy image.", "error");
      }
    }
  };

  // Quick Action: Pre-populate content with custom social templates
  const handleSocialSelect = (platform: SocialPlatform) => {
    setActiveType('url');
    setUrlInput(platform.prefix);
    if (triggerToast) {
      triggerToast(`Loaded ${platform.name} template!`, "info");
    }
  };

  return (
    <>
      {/* 1. Icon-only trigger button positioned beautifully in top-right of Pixel Frame section */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute top-4 right-4 md:top-6 md:right-6 z-25 p-3 rounded-full transition-all duration-300 border flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 group ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700 hover:text-[#FF5500] hover:border-[#FF5500]/40'
            : isMono
            ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            : 'bg-black/40 backdrop-blur-sm border-white/10 text-slate-300 hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-[#FF5500]/5 hover:shadow-2xl hover:shadow-[#FF5500]/15'
        }`}
        title="Open Pixel Frame QR Studio"
        id="pixel-frame-qr-generator-trigger"
      >
        <QrCode size={18} className="transition-transform duration-500 group-hover:rotate-12" />
        <span className="w-0 overflow-hidden group-hover:w-auto group-hover:ml-2 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 ease-out font-sans select-none whitespace-nowrap">
          QR Studio
        </span>
      </button>

      {/* 2. Overhauled Fullscreen Dialog overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Main Studio Body Card */}
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`relative w-full max-w-4xl rounded-3xl border shadow-3xl overflow-hidden p-6 md:p-8 z-10 max-h-[92vh] overflow-y-auto ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : isMono
                  ? 'bg-zinc-950 border-zinc-850 text-zinc-100'
                  : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-white/5 text-slate-100'
              }`}
            >
              {/* Corner accent glow for luxury/tech aesthetic matching Pixel Frame */}
              {!isLight && !isMono && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF5500]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
              )}

              {/* Header block */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/25 text-[#FF5500] shadow-sm">
                    <QrCode size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black uppercase tracking-wider ${isLight ? 'text-slate-950' : 'text-white'}`}>
                      Pixel Frame QR Studio
                    </h3>
                    <p className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 ${
                      isLight ? 'text-slate-500' : 'text-amber-500'
                    }`}>
                      <Sparkles size={11} className="animate-spin" style={{ animationDuration: '10s' }} /> High-End Client-Side Vector Generation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/5 text-slate-400 hover:text-white'
                  }`}
                  title="Close Studio"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* LEFT COLUMN: Controls (7/12) */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  
                  {/* Category Type Tab select */}
                  <div className="space-y-2">
                    <label className={`text-[9px] uppercase font-mono font-black tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      1. Choose QR Payload Format
                    </label>
                    <div className="flex flex-wrap gap-1 bg-black/15 p-1 rounded-xl border border-white/5">
                      {([
                        { id: 'url', label: 'Link/URL', icon: <Link size={12} /> },
                        { id: 'text', label: 'Plain Text', icon: <FileText size={12} /> },
                        { id: 'wifi', label: 'Wi-Fi Network', icon: <Wifi size={12} /> },
                        { id: 'contact', label: 'Contact/vCard', icon: <User size={12} /> },
                        { id: 'email', label: 'Email', icon: <Mail size={12} /> },
                        { id: 'sms', label: 'SMS Message', icon: <MessageSquare size={12} /> },
                        { id: 'geo', label: 'Location coordinates', icon: <MapPin size={12} /> }
                      ] as { id: QRContentType; label: string; icon: React.ReactNode }[]).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveType(tab.id);
                            // Avoid clobbering input
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeType === tab.id
                              ? 'bg-[#FF5500] text-white shadow-md'
                              : isLight
                              ? 'hover:bg-slate-100 text-slate-600'
                              : 'hover:bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Payload Form rendering */}
                  <div className={`p-5 rounded-2xl border ${
                    isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-black/30 border-white/5'
                  } space-y-4`}>
                    
                    {activeType === 'url' && (
                      <div className="space-y-4">
                        {/* Compact social select quicklinks bar */}
                        <div className="space-y-1.5">
                          <span className={`text-[8px] uppercase font-mono font-bold tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Social Quick Launch Templates
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5">
                            {socialPlatforms.map((platform) => (
                              <button
                                key={platform.id}
                                onClick={() => handleSocialSelect(platform)}
                                className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 group relative ${
                                  isLight 
                                    ? 'bg-white border-slate-100 hover:border-slate-300 text-slate-700 shadow-xs' 
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08]'
                                }`}
                                title={platform.placeholder}
                              >
                                <span className="transition-transform duration-300 group-hover:scale-110" style={{ color: platform.brandColor }}>
                                  {platform.icon}
                                </span>
                                <span className="text-[8px] tracking-tight truncate max-w-full font-sans font-bold text-slate-400 group-hover:text-white">
                                  {platform.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Link Input field */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Destination URL</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              placeholder="e.g. https://mpanjiyar100.wixsite.com/pixel-frame"
                              className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                                isLight
                                  ? 'bg-white border-slate-200 text-slate-950 focus:border-[#FF5500]'
                                  : 'bg-black/40 border-white/5 text-slate-100 focus:border-[#FF5500]'
                              }`}
                            />
                            <button
                              onClick={handleCopyText}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              title="Copy value"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeType === 'text' && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Plain Text Content</label>
                        <textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type any arbitrary text, notes, instructions, or payload data..."
                          rows={3}
                          className={`w-full p-3 rounded-xl border outline-none text-xs font-mono resize-none transition-all ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-950 focus:border-[#FF5500]'
                              : 'bg-black/40 border-white/5 text-slate-100 focus:border-[#FF5500]'
                          }`}
                        />
                      </div>
                    )}

                    {activeType === 'wifi' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Network Name (SSID)</label>
                          <input
                            type="text"
                            value={wifiSsid}
                            onChange={(e) => setWifiSsid(e.target.value)}
                            placeholder="e.g. MyHomeWiFi"
                            className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Network Password</label>
                          <input
                            type="password"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                            placeholder="Wi-Fi Password"
                            className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Security / Encryption</label>
                          <select
                            value={wifiEncryption}
                            onChange={(e: any) => setWifiEncryption(e.target.value)}
                            className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          >
                            <option value="WPA">WPA / WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Unsecured (Open)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id="wifi-hidden"
                            checked={wifiHidden}
                            onChange={(e) => setWifiHidden(e.target.checked)}
                            className="rounded accent-[#FF5500]"
                          />
                          <label htmlFor="wifi-hidden" className="text-[11px] font-bold text-slate-400 uppercase tracking-wide cursor-pointer">
                            Hidden network
                          </label>
                        </div>
                      </div>
                    )}

                    {activeType === 'contact' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Full Name</label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Murari Panjiyar"
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Company / Org</label>
                          <input
                            type="text"
                            value={contactOrg}
                            onChange={(e) => setContactOrg(e.target.value)}
                            placeholder="Pixel Frame Guwahati"
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Phone Number</label>
                          <input
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+918638875231"
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Email Address</label>
                          <input
                            type="text"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="Mpanjiyar100@gmail.com"
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {activeType === 'email' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Recipient Email</label>
                            <input
                              type="text"
                              value={emailTo}
                              onChange={(e) => setEmailTo(e.target.value)}
                              placeholder="Mpanjiyar100@gmail.com"
                              className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                                isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Subject Line</label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              placeholder="Photography Inquiry"
                              className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                                isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Message Body</label>
                          <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Type the pre-populated body text here..."
                            rows={2}
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {activeType === 'sms' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Mobile Number</label>
                          <input
                            type="text"
                            value={smsPhone}
                            onChange={(e) => setSmsPhone(e.target.value)}
                            placeholder="+918638875231"
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">SMS Text Payload</label>
                          <input
                            type="text"
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="Enter text..."
                            className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {activeType === 'geo' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Latitude Coordinates</label>
                          <input
                            type="text"
                            value={geoLat}
                            onChange={(e) => setGeoLat(e.target.value)}
                            placeholder="e.g. 26.1445"
                            className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold">Longitude Coordinates</label>
                          <input
                            type="text"
                            value={geoLng}
                            onChange={(e) => setGeoLng(e.target.value)}
                            placeholder="e.g. 91.7362"
                            className={`w-full p-3 rounded-xl border outline-none text-xs font-mono transition-all ${
                              isLight ? 'bg-white border-slate-200 text-slate-950' : 'bg-black/40 border-white/5 text-slate-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Validator text feedback */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className={`w-2 h-2 rounded-full ${getValidationMessage().valid ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-mono uppercase font-black text-slate-400">
                        {getValidationMessage().text}
                      </span>
                    </div>

                  </div>

                  {/* 2. Visual Theme & Stylings Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <Palette size={12} className="text-[#FF5500]" />
                      <label className={`text-[9px] uppercase font-mono font-black tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        2. Aesthetic QR Customizations
                      </label>
                    </div>

                    <div className={`p-5 rounded-2xl border ${
                      isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-black/30 border-white/5'
                    } grid grid-cols-1 md:grid-cols-2 gap-6`}>
                      
                      {/* Left Block: Colors & Style */}
                      <div className="space-y-4">
                        
                        {/* Foreground Pickers */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Foreground</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={foregroundColor}
                                onChange={(e) => setForegroundColor(e.target.value)}
                                className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer overflow-hidden p-0"
                              />
                              <input
                                type="text"
                                value={foregroundColor}
                                onChange={(e) => setForegroundColor(e.target.value)}
                                className={`w-full p-2.5 rounded-lg border text-xs font-mono ${
                                  isLight ? 'bg-white text-slate-950' : 'bg-black/40 border-white/5 text-slate-200'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Background</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer overflow-hidden p-0"
                              />
                              <input
                                type="text"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className={`w-full p-2.5 rounded-lg border text-xs font-mono ${
                                  isLight ? 'bg-white text-slate-950' : 'bg-black/40 border-white/5 text-slate-200'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dot style selection */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Matrix Dot Shape</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['square', 'dots', 'rounded'] as ('square' | 'dots' | 'rounded')[]).map((style) => (
                              <button
                                key={style}
                                onClick={() => setDotStyle(style)}
                                className={`p-2 rounded-lg text-[9px] uppercase font-extrabold tracking-wide transition-all border cursor-pointer ${
                                  dotStyle === style
                                    ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500]'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08] text-slate-300'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Eye Style Selection */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Finder Eye Frame</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['square', 'rounded', 'circle'] as ('square' | 'rounded' | 'circle')[]).map((style) => (
                              <button
                                key={style}
                                onClick={() => setEyeStyle(style)}
                                className={`p-2 rounded-lg text-[9px] uppercase font-extrabold tracking-wide transition-all border cursor-pointer ${
                                  eyeStyle === style
                                    ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500]'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08] text-slate-300'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right Block: Frame, Logo Watermark & Margins */}
                      <div className="space-y-4">
                        
                        {/* Logo option select */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Brand Logo Watermark</label>
                            {logoOption === 'custom' && (
                              <button
                                onClick={() => setCustomLogoUrl('')}
                                className="text-[8px] font-mono uppercase font-black text-amber-500 hover:underline"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {(['none', 'prebuilt', 'custom'] as ('none' | 'prebuilt' | 'custom')[]).map((option) => (
                              <button
                                key={option}
                                onClick={() => setLogoOption(option)}
                                className={`p-2 rounded-lg text-[9px] uppercase font-extrabold tracking-wide transition-all border cursor-pointer ${
                                  logoOption === option
                                    ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500]'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.08] text-slate-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Logo Selection UI dynamically */}
                        {logoOption === 'prebuilt' && (
                          <div className="space-y-1.5 bg-black/15 p-2 rounded-xl border border-white/5">
                            <label className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Select prebuilt brand</label>
                            <div className="grid grid-cols-5 gap-1">
                              {PREBUILT_LOGOS.map((p) => (
                                <button
                                  key={p.name}
                                  onClick={() => setSelectedPrebuiltLogo(p.name)}
                                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                    selectedPrebuiltLogo === p.name
                                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                      : 'bg-white/[0.01] border-transparent hover:border-white/10'
                                  }`}
                                  title={p.label}
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={p.color}>
                                    <path d={p.svgPath} />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {logoOption === 'custom' && (
                          <div className="space-y-1.5 bg-black/15 p-2.5 rounded-xl border border-white/5">
                            <label className="text-[8px] uppercase font-mono font-bold text-slate-400 block">Upload Logo File (.png, .jpg)</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#E04B00] text-white text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Upload size={10} /> <span>Upload file</span>
                              </button>
                              <span className="text-[8px] text-slate-400 truncate">
                                {customLogoUrl ? 'Logo Uploaded' : 'No file selected'}
                              </span>
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                          </div>
                        )}

                        {/* Slider controls: Margin Size & Error correction */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-mono font-bold text-slate-400">
                              <span>Quiet Zone</span>
                              <span>{marginSize}x</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={8}
                              step={1}
                              value={marginSize}
                              onChange={(e) => setMarginSize(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Error Limit</label>
                            <select
                              value={errorCorrection}
                              onChange={(e: any) => setErrorCorrection(e.target.value)}
                              className={`w-full p-1.5 rounded-lg border text-[10px] font-mono ${
                                isLight ? 'bg-white text-slate-950' : 'bg-black/40 border-white/5 text-slate-200'
                              }`}
                            >
                              <option value="L">L (7% Recovery)</option>
                              <option value="M">M (15% Recovery)</option>
                              <option value="Q">Q (25% Best with logo)</option>
                              <option value="H">H (30% Max safety)</option>
                            </select>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Interactive Live Mockup (5/12) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-6">
                  
                  {/* Visual Mockup Stage card */}
                  <div className={`w-full p-6 rounded-3xl border flex flex-col items-center justify-center relative transition-all duration-300 ${
                    darkPreview 
                      ? 'bg-slate-950 border-white/5 shadow-2xl shadow-black/60' 
                      : isLight 
                      ? 'bg-slate-50 border-slate-200/60 shadow-inner' 
                      : 'bg-gradient-to-b from-slate-900/60 to-black/90 border-white/5 shadow-2xl shadow-black/40'
                  }`}>
                    
                    {/* Dark/Light Preview Card Toggle button top-right */}
                    <button
                      onClick={() => setDarkPreview(!darkPreview)}
                      className="absolute top-4 right-4 p-2 rounded-full border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
                      title="Toggle Mockup Dark/Light Canvas Background"
                    >
                      {darkPreview ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} />}
                    </button>

                    {/* Stage Heading */}
                    <div className="text-center mb-5">
                      <span className="text-[8px] font-mono uppercase bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 px-2 py-0.5 rounded-full font-black tracking-widest">
                        LIVE HIGH-RES MOCKUP
                      </span>
                    </div>

                    {/* Outer Poster Frame design preview container */}
                    <div className="relative p-6 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center select-none max-w-[240px] border border-slate-150">
                      {qrPngUrl ? (
                        <div className="relative flex flex-col items-center">
                          <img
                            src={qrPngUrl}
                            alt="Live QR Barcode"
                            className="w-48 h-auto object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center text-center gap-1.5 text-slate-400 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <QrCode size={28} className="text-slate-300 animate-spin" style={{ animationDuration: '4s' }} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Content</span>
                        </div>
                      )}
                    </div>

                    {/* Inline Logo custom toggle controls */}
                    {qrPngUrl && logoOption !== 'none' && (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => setIncludeLogoBg(!includeLogoBg)}
                          className={`text-[9px] uppercase tracking-wider font-mono font-bold px-3 py-1 rounded-full transition-all cursor-pointer border ${
                            includeLogoBg
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-slate-500/5 text-slate-400 border-transparent hover:border-slate-500/20'
                          }`}
                          title="Toggle transparent background behind watermarked logo"
                        >
                          {includeLogoBg ? '✓ Solid Logo Backdrop' : '+ Transparent Logo'}
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Actions Deck for instant exporting */}
                  <div className="w-full space-y-3">
                    
                    {/* Main High-Res PNG Button */}
                    <button
                      onClick={handleDownloadPNG}
                      disabled={!qrPngUrl}
                      className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-[11px] uppercase font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5500]/10 hover:shadow-[#FF5500]/25 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Download size={14} />
                      <span>Download High-Res PNG</span>
                    </button>

                    {/* Secondary Actions Deck (4 grid split) */}
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* SVG download */}
                      <button
                        onClick={handleDownloadSVG}
                        disabled={!qrSvgString}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-[10px] uppercase font-extrabold flex items-center justify-center gap-1.5 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200 hover:text-white'
                        } disabled:opacity-50`}
                        title="Download lossless vector SVG"
                      >
                        <RefreshCw size={11} className="shrink-0" />
                        <span>Vector SVG</span>
                      </button>

                      {/* Print PDF */}
                      <button
                        onClick={handlePrintPDF}
                        disabled={!qrPngUrl}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-[10px] uppercase font-extrabold flex items-center justify-center gap-1.5 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200 hover:text-white'
                        } disabled:opacity-50`}
                        title="Print PDF standard report"
                      >
                        <Printer size={11} className="shrink-0" />
                        <span>Export PDF</span>
                      </button>

                      {/* Copy image payload */}
                      <button
                        onClick={handleCopyQRImage}
                        disabled={!qrPngUrl}
                        className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-[10px] uppercase font-extrabold flex items-center justify-center gap-1.5 col-span-2 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200 hover:text-white'
                        } disabled:opacity-50`}
                        title="Copy image directly to clipboard"
                      >
                        {copiedCode ? (
                          <Check size={11} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Share2 size={11} className="shrink-0" />
                        )}
                        <span>{copiedCode ? 'Image Copied!' : 'Copy QR Image to Clipboard'}</span>
                      </button>

                    </div>

                  </div>

                  {/* Extra Helpful Note */}
                  <div className={`p-4 rounded-2xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-150 text-slate-500' : 'bg-white/[0.02] border-white/5 text-slate-400'
                  } text-[9px] leading-relaxed w-full`}>
                    💡 <strong>Did you know?</strong> This QR Studio generates permanent <strong>non-expiring, unlimited-scan</strong> codes. Ideal for storefronts, wedding flyers, vehicle decals, or business cards.
                  </div>

                </div>

              </div>

              {/* Footer info blocks */}
              <div className="mt-8 pt-4 border-t border-white/5 text-center flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] font-mono text-slate-500">
                <span>PIXEL FRAME GUWAHATI • COMPACT QR STUDIO v2.0</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  PERMANENT LIFETIME SCAN COMPLIANT
                </span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
