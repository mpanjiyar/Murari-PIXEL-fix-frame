import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LagFreeInput } from './LagFreeInputs';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  FileText,
  HardDrive,
  Camera,
  Layers,
  Database,
  UserCheck,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Cookie,
  AlertCircle,
  Search,
  Share2,
  ChevronRight,
  Sparkles,
  Server,
  KeyRound,
  FileSpreadsheet,
  Check,
  Copy,
  ChevronDown,
  Info
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  currentTheme: 'normal' | 'mono' | 'light';
  onNavigateHome: () => void;
  onNavigateContact: () => void;
  contactPhoneIt?: string;
  contactPhonePhotos?: string;
}

interface SectionMeta {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  badge: string;
  summary: string;
  keywords: string[];
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  currentTheme,
  onNavigateHome,
  onNavigateContact,
  contactPhoneIt = '8638875231',
  contactPhonePhotos = '8638875231'
}) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const isLight = currentTheme === 'light';
  const isMono = currentTheme === 'mono';

  // Dynamic Theme Palette
  const accentColor = isMono ? 'text-zinc-200' : 'text-[#FF5500]';
  const accentBg = isMono ? 'bg-zinc-800 text-white' : 'bg-[#FF5500] text-white';
  const accentBorder = isMono ? 'border-zinc-700' : 'border-[#FF5500]/30';
  const accentLightBg = isMono
    ? 'bg-zinc-800/40 text-zinc-300'
    : isLight
      ? 'bg-[#FF5500]/10 text-[#FF5500]'
      : 'bg-[#FF5500]/15 text-[#FF5500]';

  const cardBg = isLight
    ? 'bg-white border-slate-200/80 shadow-xs'
    : 'bg-[#151518] border-white/5 shadow-md';
  const innerCardBg = isLight
    ? 'bg-slate-50 border-slate-200/70'
    : 'bg-[#1a1a1f] border-white/5';
  const subText = isLight ? 'text-slate-600' : 'text-slate-400';
  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const mutedBorder = isLight ? 'border-slate-200' : 'border-white/10';

  const sections: SectionMeta[] = useMemo(
    () => [
      {
        id: 'overview',
        num: '01',
        title: 'Overview & Enterprise Scope',
        shortTitle: 'Scope & Overview',
        icon: Layers,
        badge: 'General',
        summary: 'Business structure, service jurisdiction, and digital policy fundamentals.',
        keywords: ['overview', 'scope', 'business', 'assam', 'guwahati', 'pixel fix', 'pixel frame', 'services']
      },
      {
        id: 'collection',
        num: '02',
        title: 'Information We Collect & Process',
        shortTitle: 'Data Collection',
        icon: Database,
        badge: 'Data Intake',
        summary: 'Direct user details, technical parameters, and hardware diagnostic logs.',
        keywords: ['collect', 'information', 'name', 'phone', 'email', 'address', 'whatsapp', 'specs', 'motherboard', 'smps']
      },
      {
        id: 'it-confidentiality',
        num: '03',
        title: 'Pixel Fix: IT Repair & Hardware Confidentiality',
        shortTitle: 'IT Confidentiality',
        icon: HardDrive,
        badge: 'Zero-Intrusion',
        summary: 'Rigid zero-drive-inspection guarantee, doorstep confidentiality, and OEM software policy.',
        keywords: ['it repair', 'doorstep', 'drive', 'hard drive', 'ssd', 'laptop', 'desktop', 'confidentiality', 'files', 'oem', 'windows']
      },
      {
        id: 'photo-rights',
        num: '04',
        title: 'Pixel Frame: Photography & Client Media Rights',
        shortTitle: 'Media & Photo Rights',
        icon: Camera,
        badge: 'Media Privacy',
        summary: 'Showcase consent, 24-hour media takedown pledge, and encrypted private deliveries.',
        keywords: ['photo', 'photography', 'gallery', 'wedding', 'portrait', 'raw', 'client', 'consent', 'takedown', 'portfolio']
      },
      {
        id: 'partner-deals',
        num: '05',
        title: 'Partner Deals & Affiliate Referral Transparency',
        shortTitle: 'Affiliate & Deals',
        icon: ExternalLink,
        badge: 'Disclosures',
        summary: 'Affiliate commissions, zero user data transfer to merchants, and verified link audits.',
        keywords: ['partner', 'affiliate', 'amazon', 'software', 'license', 'links', 'referral', 'commission']
      },
      {
        id: 'cookies-storage',
        num: '06',
        title: 'Cookies, Local Storage & Analytics',
        shortTitle: 'Cookies & Storage',
        icon: Cookie,
        badge: 'Zero Trackers',
        summary: 'No third-party cross-site trackers; browser localStorage for theme & calculator speed.',
        keywords: ['cookie', 'storage', 'localstorage', 'analytics', 'tracking', 'telemetry', 'theme']
      },
      {
        id: 'retention-matrix',
        num: '07',
        title: 'Data Retention & Lifecycle Schedule',
        shortTitle: 'Retention Schedule',
        icon: FileSpreadsheet,
        badge: 'Lifecycle',
        summary: 'Definitive storage timelines for diagnostic data, invoices, and photo deliverables.',
        keywords: ['retention', 'lifecycle', 'duration', 'schedule', 'invoice', 'gst', 'backup', 'cloud']
      },
      {
        id: 'user-rights',
        num: '08',
        title: 'Your Legal Rights (DPDP & GDPR Standards)',
        shortTitle: 'User Rights',
        icon: UserCheck,
        badge: 'Compliance',
        summary: 'Right to access, correct, export, and erase your personal records anytime.',
        keywords: ['rights', 'dpdp', 'gdpr', 'erasure', 'delete', 'export', 'access', 'consent', 'india']
      },
      {
        id: 'security-measures',
        num: '09',
        title: 'Security Architecture & Cloud Protection',
        shortTitle: 'Security & Cloud',
        icon: Lock,
        badge: 'Encryption',
        summary: 'TLS 1.3 encryption, Google Cloud infrastructure, and strict role-based access.',
        keywords: ['security', 'encryption', 'tls', 'ssl', 'firebase', 'cloud', 'google drive', 'protection']
      },
      {
        id: 'officer-contact',
        num: '10',
        title: 'Grievance Redressal & Privacy Officer',
        shortTitle: 'Officer & Contact',
        icon: Mail,
        badge: 'Assistance',
        summary: 'Direct contact coordinates for rapid privacy queries and official requests.',
        keywords: ['contact', 'officer', 'grievance', 'email', 'phone', 'murari', 'help', 'address']
      }
    ],
    []
  );

  // Active section scroll tracking via IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Set up intersection observer for sections
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('privacy-sec-', '');
          if (id) {
            setActiveSection(id);
          }
        }
      });
    }, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(`privacy-sec-${sec.id}`);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setIsMobileNavOpen(false);
    const element = document.getElementById(`privacy-sec-${id}`);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copySectionLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#privacy-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2500);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery, sections]);

  return (
    <div className="w-full max-w-7xl mx-auto py-2 text-left transition-colors duration-300">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-200/20 dark:bg-white/5 z-[100] pointer-events-none">
        <div
          className={`h-full transition-all duration-150 ${isMono ? 'bg-zinc-300' : 'bg-[#FF5500]'}`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header Breadcrumb & Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-dashed border-slate-200 dark:border-white/10 text-xs font-mono"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <ArrowLeft size={13} />
            <span>Return to Studio</span>
          </button>
          <span className="text-slate-400 hidden sm:inline">/</span>
          <span className="text-slate-400 hidden sm:inline">Legal Compliance</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} className={accentColor} />
            <span>Updated: Jan 2026</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <CheckCircle2 size={13} />
            <span>DPDP & GDPR Standard</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`p-6 sm:p-10 rounded-3xl border relative overflow-hidden mb-8 ${cardBg}`}
      >
        {/* Subtle background ambient graphic */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
            <Lock size={12} />
            <span>Customer Data Sovereignty &amp; Trust</span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${headingText}`}>
            Privacy Policy &amp; Digital Governance
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${subText} max-w-2xl`}>
            Official governance, hardware confidentiality safeguards, and photographic copyright protocol for <strong className={headingText}>Murari Panjiyar Portfolio</strong>, encompassing <strong className={headingText}>Pixel Fix</strong> IT engineering and <strong className={headingText}>Pixel Frame</strong> visual productions.
          </p>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60 dark:border-white/5 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Jurisdiction</span>
              <span className={`font-bold ${headingText}`}>Guwahati, Assam</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Drive Access</span>
              <span className="font-bold text-emerald-500">Zero-Intrusion</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Media Takedown</span>
              <span className="font-bold text-[#FF5500]">Within 24 Hours</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Read Duration</span>
              <span className={`font-bold ${headingText}`}>~4 Minutes</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Sticky Quick-Jump Trigger Bar */}
      <div className="lg:hidden sticky top-20 z-30 mb-6">
        <div className={`p-2 rounded-2xl border shadow-lg backdrop-blur-md flex items-center justify-between gap-2 ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-[#151518]/95 border-white/10'
        }`}>
          <div className="flex items-center gap-2 px-2 overflow-hidden">
            <Layers size={14} className={accentColor} />
            <span className="text-xs font-mono font-bold truncate">
              {sections.find((s) => s.id === activeSection)?.shortTitle || 'Table of Contents'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              isMobileNavOpen ? accentBg : isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-white'
            }`}
          >
            <span>Jump to Section</span>
            <ChevronDown size={14} className={`transform transition-transform ${isMobileNavOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Dropdown Section List */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className={`mt-2 p-3 rounded-2xl border shadow-xl max-h-[60vh] overflow-y-auto space-y-1 font-mono text-xs ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#151518] border-white/10'
              }`}
            >
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    activeSection === sec.id
                      ? `${accentBg} font-bold`
                      : `${subText} hover:${headingText} hover:bg-slate-100 dark:hover:bg-white/5`
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="opacity-60">{sec.num}.</span>
                    <span>{sec.title}</span>
                  </span>
                  <ChevronRight size={13} className="opacity-40" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Responsive Grid Layout: Sidebar Navigation + Legal Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR NAVIGATION (Sticky Left Panel) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-5">
          <div className={`p-5 rounded-3xl border ${cardBg} space-y-4`}>
            {/* Sidebar Title & Search Bar */}
            <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={15} className={accentColor} />
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${headingText}`}>
                    Document Navigation
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400">
                  {sections.length} Sections
                </span>
              </div>

              {/* Quick Legal Clause Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <LagFreeInput
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter clauses (e.g. drive, consent, gdpr)..."
                  className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-mono outline-none border transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 focus:border-[#FF5500] text-slate-900 placeholder:text-slate-400'
                      : 'bg-black/30 border-white/10 focus:border-[#FF5500] text-white placeholder:text-slate-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Section Link List */}
            <nav className="space-y-1 font-mono text-xs max-h-[52vh] overflow-y-auto pr-1">
              {filteredSections.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs space-y-1">
                  <AlertCircle size={18} className="mx-auto opacity-50 mb-1" />
                  <p>No matching legal clauses found.</p>
                </div>
              ) : (
                filteredSections.map((section) => {
                  const isActive = activeSection === section.id;
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer border ${
                        isActive
                          ? `${accentBg} font-bold shadow-xs border-transparent`
                          : `${subText} hover:${headingText} hover:bg-slate-100 dark:hover:bg-white/5 border-transparent`
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className={`text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                          {section.num}
                        </span>
                        <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white shrink-0'} />
                        <span className="truncate">{section.shortTitle}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                          isActive
                            ? 'bg-black/20 text-white'
                            : isLight
                              ? 'bg-slate-200/80 text-slate-600'
                              : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {section.badge}
                      </span>
                    </button>
                  );
                })
              )}
            </nav>

            {/* Quick Contact & WhatsApp Box */}
            <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-3 pt-3`}>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Have a Data Inquiry?
                </span>
                <p className={`text-xs ${subText}`}>
                  Need immediate media takedown or a data audit report?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={onNavigateContact}
                  className={`p-2 rounded-xl text-center font-bold transition-all cursor-pointer ${
                    isLight ? 'bg-slate-900 text-white hover:bg-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Contact Form
                </button>
                <a
                  href={`https://wa.me/91${contactPhoneIt}?text=${encodeURIComponent(
                    'Hello Murari, I have a query regarding personal data protection and your privacy policy.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-center font-bold bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-all border border-[#25D366]/30"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN LEGAL DOCUMENT BODY */}
        <main className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* SECTION 1: Overview & Enterprise Scope */}
          <section
            id="privacy-sec-overview"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#FF5500]/10 text-[#FF5500]">
                  <Layers size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold block">
                    Section 01
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Overview &amp; Enterprise Scope
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('overview')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'overview'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
                title="Copy section link"
              >
                {copiedSection === 'overview' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'overview' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                This Privacy Policy establishes the binding privacy practices, digital governance rules, and customer data protections enforced by <strong className={headingText}>Murari Panjiyar</strong> across all client engagements. Our operations encompass two specialized business sectors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                    <span className={`font-bold text-xs ${headingText}`}>Pixel Fix Engineering</span>
                  </div>
                  <p className="text-xs leading-normal">
                    Doorstep laptop/desktop repairs, chip-level motherboards, thermal servicing, OS setup, and hardware maintenance in Guwahati & regional Assam.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className={`font-bold text-xs ${headingText}`}>Pixel Frame Productions</span>
                  </div>
                  <p className="text-xs leading-normal">
                    Professional cinematography, wedding photojournalism, pre-wedding destination shoots, portraits, and digital color grading.
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1 text-xs text-blue-600 dark:text-blue-300`}>
                <div className="flex items-center gap-2 font-bold">
                  <Info size={15} />
                  <span>Compliance Mandate</span>
                </div>
                <p>
                  This policy is formulated in full alignment with the <strong className={headingText}>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong> and international consumer data protection standards.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: Information We Collect */}
          <section
            id="privacy-sec-collection"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <Database size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold block">
                    Section 02
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Information We Collect &amp; Process
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('collection')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'collection'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'collection' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'collection' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                We adhere to the principle of <strong className={headingText}>strict data minimization</strong>. We only gather information directly necessary to perform our services:
              </p>

              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${headingText}`}>1. Direct User Intake</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] font-bold">Booking Form</span>
                  </div>
                  <ul className="space-y-1.5 text-xs list-disc list-inside">
                    <li><strong>Contact Coordinates:</strong> Client name, telephone number, WhatsApp contact, and email address.</li>
                    <li><strong>Doorstep Logistics:</strong> Physical address, landmark, and apartment details for on-site dispatch.</li>
                    <li><strong>Service Specifications:</strong> Computer symptom descriptions, shoot dates, venues, and custom deliverables.</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${headingText}`}>2. Hardware Diagnostics Parameters</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">Local Utility</span>
                  </div>
                  <ul className="space-y-1.5 text-xs list-disc list-inside">
                    <li><strong>Motherboard &amp; BIOS Keys:</strong> Brand lookups executed in browser without user tracking.</li>
                    <li><strong>SMPS Power Load:</strong> Component calculations executed purely client-side without storing personal data.</li>
                    <li><strong>System Log Summaries:</strong> Crash dump error codes analyzed exclusively for hardware troubleshooting.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Pixel Fix Hardware Confidentiality */}
          <section
            id="privacy-sec-it-confidentiality"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                  <HardDrive size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold block">
                    Section 03
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Pixel Fix: IT Repair &amp; Hardware Confidentiality
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('it-confidentiality')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'it-confidentiality'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'it-confidentiality' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'it-confidentiality' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                Under the <strong className={headingText}>Pixel Fix Zero-Intrusion Standard</strong>, customer digital privacy is treated with the highest technical and ethical rigor:
              </p>

              <div className={`p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 text-xs`}>
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  <ShieldCheck size={18} />
                  <span>The Doorstep Confidentiality Pledge</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-emerald-500/10 space-y-1">
                    <span className={`font-bold block ${headingText}`}>Zero Drive Inspection</span>
                    <p>Technicians never browse, preview, copy, or transfer customer documents, private photos, or personal browser databases.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-emerald-500/10 space-y-1">
                    <span className={`font-bold block ${headingText}`}>Open-View Servicing</span>
                    <p>All doorstep hardware repairs, thermal repasting, and SSD installations are carried out openly in front of the customer.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-emerald-500/10 space-y-1">
                    <span className={`font-bold block ${headingText}`}>Genuine OEM Software</span>
                    <p>Zero unauthorized cracks or insecure keygens. All installations utilize genuine Microsoft OEM tools and certified hardware drivers.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-emerald-500/10 space-y-1">
                    <span className={`font-bold block ${headingText}`}>Immediate Remote Termination</span>
                    <p>Remote diagnostics via AnyDesk/TeamViewer are only initiated with one-time customer approval and terminated immediately post-fix.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Pixel Frame Media Rights */}
          <section
            id="privacy-sec-photo-rights"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                  <Camera size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
                    Section 04
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Pixel Frame: Photography &amp; Client Media Rights
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('photo-rights')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'photo-rights'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'photo-rights' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'photo-rights' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                Visual content captured by <strong className={headingText}>Pixel Frame</strong> is handled under stringent copyright and personal portrait consent protocols:
              </p>

              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-2`}>
                  <span className={`font-bold text-xs block ${headingText}`}>Portfolio Showcase &amp; 24-Hour Removal Protocol</span>
                  <p className="text-xs">
                    Showcase images featured in our public portfolio are displayed with client goodwill. If any client or event participant wishes to have their image removed or anonymized from our public gallery, simply submit a request and we guarantee removal within <strong className="text-[#FF5500]">24 hours</strong>.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-2`}>
                  <span className={`font-bold text-xs block ${headingText}`}>Encrypted Private Gallery Delivery</span>
                  <p className="text-xs">
                    Client deliverables (master RAW captures and edited 4K HDR stills) are provided via private, passkey-secured cloud links (Google Drive / specialized client portals). These links are never made public.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Partner Deals & Affiliate Transparency */}
          <section
            id="privacy-sec-partner-deals"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-500">
                  <ExternalLink size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-500 font-bold block">
                    Section 05
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Partner Deals &amp; Affiliate Referral Transparency
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('partner-deals')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'partner-deals'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'partner-deals' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'partner-deals' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                Our <strong className={headingText}>Partner Deals</strong> section contains curated recommendations for genuine software licenses (Microsoft Office, Antivirus Suites), PC cooling solutions, thermal pastes, cameras, and studio equipment.
              </p>

              <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-2 text-xs`}>
                <span className={`font-bold text-xs block ${headingText}`}>Affiliate Disclosure Notice</span>
                <p>
                  Some outbound product links include affiliate referral tracking codes. If you purchase through these links, we may receive a nominal referral compensation from merchant platforms (e.g., Amazon Associates, official software distributors) at zero extra cost to you.
                </p>
                <p className="font-semibold text-emerald-500">
                  ✓ We never transmit your personal contact details, IP address, or payment records to merchant platforms.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 6: Storage, Cookies & Analytics */}
          <section
            id="privacy-sec-cookies-storage"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-500/10 text-teal-500">
                  <Cookie size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-500 font-bold block">
                    Section 06
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Cookies, Local Storage &amp; Analytics
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('cookies-storage')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'cookies-storage'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'cookies-storage' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'cookies-storage' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                We do not employ invasive third-party cross-site advertising trackers or tracking pixels. Storage mechanisms are purely functional:
              </p>

              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-left border rounded-2xl overflow-hidden ${mutedBorder}`}>
                  <thead className={isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/5 text-slate-200'}>
                    <tr>
                      <th className="p-3 font-mono font-bold">Storage Key</th>
                      <th className="p-3 font-mono font-bold">Type</th>
                      <th className="p-3 font-mono font-bold">Purpose</th>
                      <th className="p-3 font-mono font-bold">Lifespan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    <tr>
                      <td className="p-3 font-mono font-semibold">mp_portfolio_theme_v2</td>
                      <td className="p-3">localStorage</td>
                      <td className="p-3">Saves your preferred UI theme (Cyber / Noir / Light)</td>
                      <td className="p-3">Persistent</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold">mp_auth_session</td>
                      <td className="p-3">Session</td>
                      <td className="p-3">Secures temporary admin portfolio management sessions</td>
                      <td className="p-3">Browser Close</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 7: Data Retention Matrix */}
          <section
            id="privacy-sec-retention-matrix"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 font-bold block">
                    Section 07
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Data Retention &amp; Lifecycle Schedule
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('retention-matrix')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'retention-matrix'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'retention-matrix' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'retention-matrix' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                We enforce automated and manual lifecycle expiration schedules across all customer records:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Inquiry Logs</span>
                  <span className={`text-sm font-bold block ${headingText}`}>90 Days</span>
                  <p className="text-xs">Contact inquiries purged after quote confirmation or job closure.</p>
                </div>
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Photo RAW Deliverables</span>
                  <span className={`text-sm font-bold block ${headingText}`}>12 Months</span>
                  <p className="text-xs">Complimentary cloud gallery archive guarantee for photo clients.</p>
                </div>
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Invoices &amp; Receipts</span>
                  <span className={`text-sm font-bold block ${headingText}`}>7 Years</span>
                  <p className="text-xs">Retained strictly for statutory tax &amp; commercial compliance in India.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: User Rights (DPDP & GDPR) */}
          <section
            id="privacy-sec-user-rights"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500">
                  <UserCheck size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-bold block">
                    Section 08
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Your Legal Rights (DPDP &amp; GDPR Standards)
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('user-rights')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'user-rights'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'user-rights' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'user-rights' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                As a client or visitor, you possess unequivocal sovereignty over your personal data:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <CheckCircle2 size={15} />
                    <span className={headingText}>Right to Access &amp; Portability</span>
                  </div>
                  <p>Request an encrypted copy of all service records, invoices, and diagnostic notes.</p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <CheckCircle2 size={15} />
                    <span className={headingText}>Right to Erasure ("To Be Forgotten")</span>
                  </div>
                  <p>Request permanent deletion of contact logs, appointment addresses, and portfolio media.</p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <CheckCircle2 size={15} />
                    <span className={headingText}>Right to Rectification</span>
                  </div>
                  <p>Update or correct any outdated phone numbers, delivery addresses, or invoice details.</p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1`}>
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <CheckCircle2 size={15} />
                    <span className={headingText}>Right to Withdraw Consent</span>
                  </div>
                  <p>Opt out of WhatsApp notifications or photo showcase permissions at any time.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 9: Security Architecture */}
          <section
            id="privacy-sec-security-measures"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-500">
                  <Lock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 font-bold block">
                    Section 09
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Security Architecture &amp; Cloud Protection
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('security-measures')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'security-measures'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'security-measures' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'security-measures' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                All data transmission between your browser and our infrastructure is shielded with industry-standard protocols:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1.5`}>
                  <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <Server size={16} />
                    <span className={headingText}>TLS 1.3 Encryption</span>
                  </div>
                  <p>In-transit encryption prevents interception of booking forms and hardware inquiry packets.</p>
                </div>

                <div className={`p-4 rounded-2xl border ${innerCardBg} space-y-1.5`}>
                  <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <KeyRound size={16} />
                    <span className={headingText}>Role-Based Authentication</span>
                  </div>
                  <p>Administrative actions and gallery updates require multi-factor cloud credentials.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10: Officer & Grievance Contact */}
          <section
            id="privacy-sec-officer-contact"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg} space-y-6`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#FF5500]/10 text-[#FF5500]">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold block">
                    Section 10
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${headingText}`}>
                    Grievance Redressal &amp; Privacy Officer
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copySectionLink('officer-contact')}
                className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedSection === 'officer-contact'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                }`}
              >
                {copiedSection === 'officer-contact' ? <Check size={13} /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedSection === 'officer-contact' ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${subText}`}>
              <p>
                In compliance with the Digital Personal Data Protection Act, 2023, direct your privacy inquiries or data erasure requests to our designated Data Officer:
              </p>

              <div className={`p-5 sm:p-6 rounded-3xl border ${innerCardBg} grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs`}>
                <div className="space-y-2">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Appointed Data Officer:</span>
                  <span className={`text-sm font-bold block ${headingText}`}>Murari Panjiyar</span>
                  <span className="text-slate-400 block leading-relaxed">
                    Lead IT Engineer (Pixel Fix) &amp; Director of Photography (Pixel Frame)<br />
                    Guwahati, Assam — 781001, India
                  </span>
                </div>

                <div className="space-y-2 sm:border-l sm:border-slate-200 sm:dark:border-white/5 sm:pl-6">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Direct Redressal Channels:</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#FF5500]" />
                      <a href={`tel:${contactPhoneIt}`} className="font-bold text-[#FF5500] hover:underline">
                        +91-{contactPhoneIt}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-[#FF5500]" />
                      <span className={headingText}>mpanjiyar100@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateContact}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${accentBg} hover:opacity-90 shadow-sm flex items-center gap-2`}
                >
                  <Mail size={14} />
                  <span>Open Contact &amp; Booking Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  Back to Top ↑
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};
