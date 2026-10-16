import React, { useState, useEffect } from 'react';
import { LagFreeInput } from './LagFreeInputs';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Crosshair,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  Plus,
  Minus,
  Lock,
  Unlock,
  Layers,
  ArrowRight
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface LocalityInfo {
  status: 'fully_covered' | 'extended_coverage' | 'photography_only' | 'not_covered';
  name: string;
  desc: string;
  coords?: [number, number];
  eta?: string;
}

export const DISPATCH_NODES: {
  id: string;
  name: string;
  coords: [number, number];
  type: 'central_hub' | 'core_node' | 'extended_node';
  eta: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'central-dispur',
    name: 'Dispur Central Hub',
    coords: [26.1445, 91.7362],
    type: 'central_hub',
    eta: '15-25 Mins',
    desc: 'Pixel Fix & Pixel Frame Central Headquarters. Immediate doorstep technician departure.',
    badge: 'HQ Base',
  },
  {
    id: 'paltan-bazaar',
    name: 'Paltan Bazaar & Station',
    coords: [26.1758, 91.7539],
    type: 'core_node',
    eta: '20-30 Mins',
    desc: 'Core transit node for central city computer repairs and commercial bookings.',
    badge: 'Downtown',
  },
  {
    id: 'pan-bazaar',
    name: 'Pan Bazaar & Fancy Bazaar',
    coords: [26.1835, 91.7450],
    type: 'core_node',
    eta: '20-30 Mins',
    desc: 'Commercial market district, corporate office setups, and waterfront studio photography.',
    badge: 'Commercial',
  },
  {
    id: 'ganeshguri',
    name: 'Ganeshguri Node',
    coords: [26.1528, 91.7850],
    type: 'core_node',
    eta: '15-20 Mins',
    desc: 'High-density doorstep diagnostic perimeter. Zero travel surcharge.',
    badge: 'Core Node',
  },
  {
    id: 'six-mile',
    name: 'Six Mile & VIP Road',
    coords: [26.1285, 91.8020],
    type: 'core_node',
    eta: '20-30 Mins',
    desc: 'East Guwahati residential estates, hospital network tech support, and event coverage.',
    badge: 'East Zone',
  },
  {
    id: 'khanapara',
    name: 'Khanapara Gateway',
    coords: [26.1158, 91.8153],
    type: 'core_node',
    eta: '25-35 Mins',
    desc: 'Assam-Meghalaya boundary gateway. Doorstep hardware diagnostics & event photography.',
    badge: 'South-East',
  },
  {
    id: 'maligaon',
    name: 'Maligaon & Kamakhya',
    coords: [26.1557, 91.6892],
    type: 'core_node',
    eta: '25-40 Mins',
    desc: 'Railway headquarters zone, residential societies, and heritage photography coverage.',
    badge: 'West Zone',
  },
  {
    id: 'jalukbari',
    name: 'Jalukbari & Univ.',
    coords: [26.1492, 91.6631],
    type: 'core_node',
    eta: '30-45 Mins',
    desc: 'Gauhati University campus, college lab setups, and West Guwahati gateway.',
    badge: 'Academic',
  },
  {
    id: 'beltola',
    name: 'Beltola & Basistha',
    coords: [26.1230, 91.7850],
    type: 'core_node',
    eta: '20-30 Mins',
    desc: 'Southern residential corridors, apartment complexes, and fast technician dispatch.',
    badge: 'South Core',
  },
  {
    id: 'chandmari',
    name: 'Chandmari & Zoo Road',
    coords: [26.1812, 91.7765],
    type: 'core_node',
    eta: '20-30 Mins',
    desc: 'Central residential spine, engineering institutes, and creative studios.',
    badge: 'Central Spine',
  },
  {
    id: 'borjhar',
    name: 'Borjhar (Airport Area)',
    coords: [26.1061, 91.5859],
    type: 'extended_node',
    eta: '45-60 Mins',
    desc: 'LGBI Airport vicinity. Nominal transit charge (₹150). Photography fully covered.',
    badge: 'Extended',
  },
];

export const LOCALITY_DATA: Record<string, LocalityInfo> = {
  dispur: { status: 'fully_covered', name: 'Dispur (Core Area)', desc: 'Central Base. Doorstep IT Repair & Photography. Zero dispatch fees!', coords: [26.1445, 91.7362], eta: '15-20 Mins' },
  'paltan bazaar': { status: 'fully_covered', name: 'Paltan Bazaar Hub', desc: 'Core Doorstep IT Support & Photography. Instant dispatch.', coords: [26.1758, 91.7539], eta: '20-25 Mins' },
  ganeshguri: { status: 'fully_covered', name: 'Ganeshguri', desc: 'Core Doorstep IT Diagnostics & Photography. Zero travel charges.', coords: [26.1528, 91.7850], eta: '15-20 Mins' },
  maligaon: { status: 'fully_covered', name: 'Maligaon Node', desc: 'Core Doorstep IT Support & Photography.', coords: [26.1557, 91.6892], eta: '25-35 Mins' },
  khanapara: { status: 'fully_covered', name: 'Khanapara Border Node', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1158, 91.8153], eta: '25-35 Mins' },
  'six mile': { status: 'fully_covered', name: 'Six Mile', desc: 'Core Doorstep IT Support & Photography.', coords: [26.1285, 91.8020], eta: '20-25 Mins' },
  beltola: { status: 'fully_covered', name: 'Beltola Area', desc: 'Core Doorstep IT Repair & Photography. Quick dispatch.', coords: [26.1230, 91.7850], eta: '20-30 Mins' },
  'pan bazaar': { status: 'fully_covered', name: 'Pan Bazaar', desc: 'Core Doorstep IT Support & Photography.', coords: [26.1835, 91.7450], eta: '20-30 Mins' },
  'fancy bazaar': { status: 'fully_covered', name: 'Fancy Bazaar', desc: 'Core Doorstep IT Support & Commercial Photography.', coords: [26.1835, 91.7410], eta: '20-30 Mins' },
  chandmari: { status: 'fully_covered', name: 'Chandmari Area', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1812, 91.7765], eta: '20-25 Mins' },
  hatigaon: { status: 'fully_covered', name: 'Hatigaon', desc: 'Core Doorstep IT Repair & Photography.', coords: [26.1360, 91.7910], eta: '20-25 Mins' },
  kahilipara: { status: 'fully_covered', name: 'Kahilipara', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1380, 91.7650], eta: '20-25 Mins' },
  jalukbari: { status: 'fully_covered', name: 'Jalukbari (Guwahati Univ.)', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1492, 91.6631], eta: '30-40 Mins' },
  'zoo road': { status: 'fully_covered', name: 'Zoo Road / R.G. Baruah', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1700, 91.7770], eta: '20-25 Mins' },
  bhangagarh: { status: 'fully_covered', name: 'Bhangagarh', desc: 'Core Doorstep IT Support & Photography.', coords: [26.1590, 91.7680], eta: '15-20 Mins' },
  ulubari: { status: 'fully_covered', name: 'Ulubari Area', desc: 'Core Doorstep IT Repair & Photography.', coords: [26.1710, 91.7580], eta: '20-25 Mins' },
  noonmati: { status: 'fully_covered', name: 'Noonmati', desc: 'Core Doorstep IT Diagnostics & Photography.', coords: [26.1950, 91.8010], eta: '25-35 Mins' },
  borjhar: { status: 'extended_coverage', name: 'Borjhar (Airport Area)', desc: 'Extended Area - Doorstep IT available with nominal transit fee (₹150). Photography covered.', coords: [26.1061, 91.5859], eta: '45-60 Mins' },
  airport: { status: 'extended_coverage', name: 'Guwahati Airport Area', desc: 'Extended Area - Doorstep IT available with nominal transit fee (₹150). Photography covered.', coords: [26.1061, 91.5859], eta: '45-60 Mins' },
  'north guwahati': { status: 'extended_coverage', name: 'North Guwahati', desc: 'Extended Area - Doorstep IT available with nominal transit fee (₹200). Photography covered.', coords: [26.2085, 91.7190], eta: '45-60 Mins' },
  shillong: { status: 'photography_only', name: 'Shillong (Meghalaya)', desc: 'Destination photography & events fully covered.', eta: 'Pre-booked' },
};

const GUWAHATI_CENTER: [number, number] = [26.1445, 91.7362];

/**
 * Map Controller Helper for auto-resizing, flying to coordinates, and handling gesture locking
 */
function MapController({
  targetCoords,
  isLocked,
}: {
  targetCoords?: [number, number] | null;
  isLocked: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const handleInvalidate = () => {
      try {
        map.invalidateSize();
      } catch (_) {}
    };

    handleInvalidate();
    const timers = [100, 300, 800].map(ms => setTimeout(handleInvalidate, ms));

    const container = map.getContainer();
    let ro: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleInvalidate);
      ro.observe(container);
    }

    window.addEventListener('resize', handleInvalidate);
    return () => {
      timers.forEach(clearTimeout);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleInvalidate);
    };
  }, [map]);

  // Sync touch and dragging capability with lock state
  useEffect(() => {
    if (isLocked) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
      if (map.doubleClickZoom) map.doubleClickZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
    }
  }, [map, isLocked]);

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 13, { duration: 1.0 });
    }
  }, [map, targetCoords]);

  return null;
}

/**
 * Custom Floating Map Controls Component that safely controls zoom and recenter without UI overlap
 */
function FloatingMapActions({
  onRecenter,
  isLocked,
  onToggleLock,
  mapStyle,
  onSelectStyle,
}: {
  onRecenter: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  mapStyle: 'streets' | 'dark' | 'satellite';
  onSelectStyle: (style: 'streets' | 'dark' | 'satellite') => void;
}) {
  const map = useMap();

  return (
    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-[500] flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 pointer-events-auto">
      {/* Map Style Switcher (Compact & Responsive) */}
      <div className="flex items-center p-0.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 shadow-lg">
        <button
          type="button"
          onClick={() => onSelectStyle('streets')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
            mapStyle === 'streets'
              ? 'bg-[#FF5500] text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Street View"
        >
          <span className="sm:hidden">St</span>
          <span className="hidden sm:inline">Streets</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectStyle('dark')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
            mapStyle === 'dark'
              ? 'bg-[#FF5500] text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Dark View"
        >
          <span className="sm:hidden">Dk</span>
          <span className="hidden sm:inline">Dark</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectStyle('satellite')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
            mapStyle === 'satellite'
              ? 'bg-[#FF5500] text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Satellite Imagery"
        >
          <span className="sm:hidden">Sat</span>
          <span className="hidden sm:inline">Sat</span>
        </button>
      </div>

      {/* Zoom In/Out Buttons (Zero overlap, mobile tap friendly) */}
      <div className="flex items-center rounded-xl bg-black/85 backdrop-blur-md border border-white/20 shadow-lg p-0.5">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-1 sm:p-1.5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus size={13} />
        </button>
        <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="p-1 sm:p-1.5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Recenter Button */}
      <button
        type="button"
        onClick={onRecenter}
        className="p-1 sm:px-2.5 sm:py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors"
        title="Reset to Central Dispur HQ"
      >
        <Crosshair size={13} className="text-[#FF5500]" />
        <span className="hidden sm:inline">Recenter</span>
      </button>

      {/* Mobile Lock / Unlock Touch Toggle */}
      <button
        type="button"
        onClick={onToggleLock}
        className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all border ${
          isLocked
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
        }`}
        title={isLocked ? 'Map locked to allow smooth page scrolling. Click to explore.' : 'Map active. Click to lock and scroll page freely.'}
      >
        {isLocked ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} className="text-emerald-400" />}
        <span className="hidden md:inline">{isLocked ? 'Scroll Safe' : 'Interactive'}</span>
      </button>
    </div>
  );
}

export interface CoverageMapProps {
  currentTheme?: 'light' | 'dark' | 'normal' | 'mono' | string;
  onSelectLocality?: (localityName: string) => void;
  compact?: boolean;
}

export default function CoverageMap({
  currentTheme = 'dark',
  onSelectLocality,
  compact = false,
}: CoverageMapProps) {
  const isLight = currentTheme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedResult, setCheckedResult] = useState<LocalityInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite'>(isLight ? 'streets' : 'dark');
  
  // Default map gestures to locked so mobile users can easily scroll past without map trapping
  const [isLocked, setIsLocked] = useState(true);

  const createMapMarkerIcon = (color: string, label: string, isCentral: boolean = false) => {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          ${isCentral ? `<span class="animate-ping absolute inline-flex h-7 w-7 rounded-full" style="background-color: ${color}; opacity: 0.35;"></span>` : ''}
          <div class="px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1.5" style="background-color: #090a10; border: 1.5px solid ${color}; color: #ffffff; white-space: nowrap;">
            <span class="w-2 h-2 rounded-full" style="background-color: ${color};"></span>
            <span style="font-size: 10px; font-weight: 700; font-family: monospace;">${label}</span>
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] mx-auto -mt-0.5" style="border-t-color: ${color};"></div>
        </div>
      `,
      className: 'custom-leaflet-marker-clean',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -28],
    });
  };

  const handleCheckCoverage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryClean = searchQuery.trim().toLowerCase();
    if (!queryClean) {
      setCheckedResult(null);
      setSearched(false);
      setFlyTarget(GUWAHATI_CENTER);
      return;
    }

    const foundKey = Object.keys(LOCALITY_DATA).find(
      key => key === queryClean || queryClean.includes(key) || key.includes(queryClean)
    );

    if (foundKey) {
      const match = LOCALITY_DATA[foundKey];
      setCheckedResult(match);
      if (match.coords) setFlyTarget(match.coords);
    } else {
      const isAssam = ['assam', 'guwahati', 'nagaon', 'bongaigaon', 'tinsukia', 'sivasagar', 'barpeta'].some(k => queryClean.includes(k));
      if (isAssam) {
        setCheckedResult({
          status: 'photography_only',
          name: searchQuery,
          desc: 'Photography assignments fully covered throughout Assam. For IT doorstep support, schedule with support.',
          coords: GUWAHATI_CENTER,
        });
      } else {
        setCheckedResult({
          status: 'not_covered',
          name: searchQuery,
          desc: 'Outside standard 12KM doorstep IT perimeter. Professional photography is available across Northeast India.',
        });
      }
    }
    setSearched(true);
  };

  const handleQuickJump = (loc: string) => {
    setSearchQuery(loc);
    const key = loc.toLowerCase();
    const match = LOCALITY_DATA[key];
    if (match) {
      setCheckedResult(match);
      setSearched(true);
      if (match.coords) setFlyTarget(match.coords);
    }
  };

  const tileConfig = {
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: ['a', 'b', 'c', 'd'],
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: ['a', 'b', 'c', 'd'],
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      subdomains: ['a', 'b', 'c', 'd'],
    },
  }[mapStyle];

  const popularChips = ['Dispur', 'Ganeshguri', 'Six Mile', 'Beltola', 'Paltan Bazaar', 'Maligaon', 'Airport'];

  return (
    <div className="space-y-4 w-full" id="dispatch-coverage-widget">
      {/* 1. TOP BAR: SEARCH & LOCALITY CHIPS (Responsive, No Overlap) */}
      <div className="space-y-2.5">
        <form onSubmit={handleCheckCoverage} className="relative w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <LagFreeInput
            type="text"
            placeholder="Search Guwahati area (Dispur, Ganeshguri, Six Mile, Beltola, Ulubari)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs py-2.5 pl-9 pr-9 rounded-xl border outline-none font-mono transition-all ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 focus:border-[#FF5500] shadow-xs'
                : 'bg-zinc-950 border-white/15 text-white focus:border-[#FF5500]'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCheckedResult(null);
                setSearched(false);
                setFlyTarget(GUWAHATI_CENTER);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Quick-jump locality chips with clean touch scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x w-full">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 shrink-0 mr-0.5">
            Quick:
          </span>
          {popularChips.map(loc => {
            const isCurrent = searchQuery.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleQuickJump(loc)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                  isCurrent
                    ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-xs'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-white/10'
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SEARCH RESULT BANNER (Responsive Mobile Breakdown) */}
      {searched && checkedResult && (
        <div
          className={`p-3.5 rounded-2xl border text-left transition-all text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            checkedResult.status === 'fully_covered'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : checkedResult.status === 'extended_coverage'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            {checkedResult.status === 'fully_covered' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-white uppercase font-bold">{checkedResult.name}</strong>
                {checkedResult.status === 'fully_covered' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Zero Dispatch Surcharge
                  </span>
                )}
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {checkedResult.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
            {checkedResult.eta && (
              <span className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-black/50 border border-white/10 text-amber-300">
                ⚡ ETA: {checkedResult.eta}
              </span>
            )}
            {onSelectLocality && (
              <button
                type="button"
                onClick={() => onSelectLocality(checkedResult.name)}
                className="px-2.5 py-1 rounded-lg bg-[#FF5500] hover:bg-orange-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Select for Booking</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTAINED MAP CONTAINER (No Page Scroll Hijacking) */}
      <div
        className={`rounded-2xl sm:rounded-3xl overflow-hidden border ${
          isLight ? 'border-slate-200 shadow-md' : 'border-white/15 shadow-xl'
        } relative ${compact ? 'h-[340px] sm:h-[400px]' : 'h-[380px] sm:h-[460px] md:h-[500px]'} flex flex-col bg-[#090a10]`}
      >
        {/* Subtle status banner when locked on mobile */}
        {isLocked && (
          <div className="absolute bottom-3 left-3 z-[450] pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsLocked(false)}
              className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl cursor-pointer transition-transform active:scale-95"
            >
              <Unlock size={12} className="text-emerald-400" />
              <span>Tap to explore &amp; pan map</span>
            </button>
          </div>
        )}

        {/* Leaflet Canvas */}
        <div className={`w-full h-full flex-1 relative z-0 ${isLocked ? 'leaflet-touch-scroll-safe' : ''}`}>
          <MapContainer
            center={GUWAHATI_CENTER}
            zoom={12}
            style={{ height: '100%', width: '100%', backgroundColor: '#090a10' }}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
          >
            <MapController targetCoords={flyTarget} isLocked={isLocked} />

            <FloatingMapActions
              onRecenter={() => setFlyTarget([...GUWAHATI_CENTER])}
              isLocked={isLocked}
              onToggleLock={() => setIsLocked(!isLocked)}
              mapStyle={mapStyle}
              onSelectStyle={(s) => setMapStyle(s)}
            />

            <TileLayer
              key={mapStyle}
              url={tileConfig.url}
              attribution={tileConfig.attribution}
              subdomains={tileConfig.subdomains}
              maxZoom={19}
            />

            {/* 12KM Core Free Dispatch Radius (Orange) */}
            <Circle
              center={GUWAHATI_CENTER}
              radius={12000}
              pathOptions={{
                fillColor: '#FF5500',
                fillOpacity: 0.12,
                color: '#FF5500',
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Tooltip direction="top" opacity={0.9}>
                <div className="font-mono text-xs font-bold text-slate-900">
                  ⚡ 12KM Core Free Dispatch Zone (Zero Travel Fee)
                </div>
              </Tooltip>
            </Circle>

            {/* 20KM Extended Regional Radius (Indigo) */}
            <Circle
              center={GUWAHATI_CENTER}
              radius={20000}
              pathOptions={{
                fillColor: '#6366f1',
                fillOpacity: 0.05,
                color: '#818cf8',
                weight: 1.5,
                dashArray: '4, 6',
              }}
            >
              <Tooltip direction="top" opacity={0.85}>
                <div className="font-mono text-xs text-slate-900">
                  🚗 20KM Extended Support Zone (Airport, Baihata, N. Guwahati)
                </div>
              </Tooltip>
            </Circle>

            {/* Landmark Pins */}
            {DISPATCH_NODES.map(node => {
              const isCentral = node.type === 'central_hub';
              const color = isCentral ? '#FF5500' : node.type === 'extended_node' ? '#38bdf8' : '#fbbf24';

              return (
                <Marker
                  key={node.id}
                  position={node.coords}
                  icon={createMapMarkerIcon(color, node.name, isCentral)}
                >
                  <Popup autoPan={true} autoPanPadding={[20, 20]}>
                    <div className="p-1 text-xs font-sans text-slate-900 space-y-2 min-w-[200px] max-w-[240px]">
                      <div className="flex items-center justify-between border-b pb-1.5 gap-2">
                        <strong className="font-black text-sm text-[#FF5500] truncate">
                          {node.name}
                        </strong>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 font-bold shrink-0">
                          {node.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {node.desc}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 border-t border-slate-100">
                        <span>ETA:</span>
                        <span className="text-emerald-700 font-black">{node.eta}</span>
                      </div>

                      {onSelectLocality && (
                        <button
                          type="button"
                          onClick={() => onSelectLocality(node.name)}
                          className="w-full mt-1 py-1.5 px-2 bg-[#FF5500] hover:bg-orange-600 text-white rounded-lg text-[10.5px] font-bold text-center cursor-pointer transition-colors"
                        >
                          Select for Doorstep Booking
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* 4. CLEAN COVERAGE SUMMARY FOOTER (Responsive, Anti-Slop) */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-zinc-950 border-white/10 text-zinc-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shrink-0" />
            <span className="font-bold">12 KM Core:</span>
            <span className="text-zinc-400">Zero Travel Surcharge</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="font-bold">20 KM Zone:</span>
            <span className="text-zinc-400">Nominal ₹150 Transit</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold">Photography:</span>
            <span className="text-zinc-400">All Assam</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 sm:text-right shrink-0">
          📍 Base Hub: Dispur, Guwahati
        </div>
      </div>
    </div>
  );
}
