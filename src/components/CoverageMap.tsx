import React, { useState, useEffect } from 'react';
import { LagFreeInput } from './LagFreeInputs';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, CheckCircle2, AlertTriangle, HelpCircle, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocalityInfo {
  status: 'fully_covered' | 'extended_coverage' | 'photography_only' | 'not_covered';
  name: string;
  desc: string;
}

const LOCALITY_DATA: Record<string, LocalityInfo> = {
  dispur: { status: 'fully_covered', name: 'Dispur (Core Area)', desc: 'Core Doorstep IT Repair & Wedding/Corporate Photography. No dispatch fees!' },
  'paltan bazaar': { status: 'fully_covered', name: 'Paltan Bazaar Hub', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography. Instant dispatch.' },
  ganeshguri: { status: 'fully_covered', name: 'Ganeshguri', desc: 'Core Doorstep IT Diagnostics & Wedding/Corporate Photography. Zero travel charges.' },
  maligaon: { status: 'fully_covered', name: 'Maligaon Node', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  khanapara: { status: 'fully_covered', name: 'Khanapara Border Node', desc: 'Core Doorstep IT Diagnostics & Wedding/Corporate Photography.' },
  'six mile': { status: 'fully_covered', name: 'Six Mile', desc: 'Core Doorstep IT Support & Professional Photography.' },
  beltola: { status: 'fully_covered', name: 'Beltola Area', desc: 'Core Doorstep IT Repair & Professional photography. Quick dispatch.' },
  'pan bazaar': { status: 'fully_covered', name: 'Pan Bazaar', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  'fancy bazaar': { status: 'fully_covered', name: 'Fancy Bazaar', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  chandmari: { status: 'fully_covered', name: 'Chandmari Area', desc: 'Core Doorstep IT Diagnostic & Wedding/Corporate Photography.' },
  hatigaon: { status: 'fully_covered', name: 'Hatigaon', desc: 'Core Doorstep IT Repair & Professional photography.' },
  kahilipara: { status: 'fully_covered', name: 'Kahilipara', desc: 'Core Doorstep IT Diagnostics & Professional photography.' },
  jalukbari: { status: 'fully_covered', name: 'Jalukbari (Guwahati University Area)', desc: 'Core Doorstep IT Diagnostics & Wedding/Corporate Photography.' },
  'zoo road': { status: 'fully_covered', name: 'Zoo Road', desc: 'Core Doorstep IT Diagnostics & Wedding/Corporate Photography.' },
  'rg baruah road': { status: 'fully_covered', name: 'R.G. Baruah Road', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  bhangagarh: { status: 'fully_covered', name: 'Bhangagarh', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  ulubari: { status: 'fully_covered', name: 'Ulubari Area', desc: 'Core Doorstep IT Repair & Wedding/Corporate Photography.' },
  noonmati: { status: 'fully_covered', name: 'Noonmati', desc: 'Core Doorstep IT Diagnostics & Wedding/Corporate Photography.' },
  narengi: { status: 'fully_covered', name: 'Narengi Node', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  nrb: { status: 'fully_covered', name: 'Narengi Refinery Area', desc: 'Core Doorstep IT Support & Wedding/Corporate Photography.' },
  borjhar: { status: 'extended_coverage', name: 'Borjhar (Airport Area)', desc: 'Extended Area - Doorstep IT available with nominal transit charge (₹150). Photography covered.' },
  airport: { status: 'extended_coverage', name: 'Airport Area', desc: 'Extended Area - Doorstep IT available with nominal transit charge (₹150). Photography covered.' },
  'north guwahati': { status: 'extended_coverage', name: 'North Guwahati', desc: 'Extended Area - Doorstep IT available with nominal travel charge (₹200) depending on bridge/ferry routing. Photography fully covered.' },
  shillong: { status: 'photography_only', name: 'Shillong (Meghalaya)', desc: 'Photography assignments fully covered (Destination wedding/fashion). Doorstep IT diagnostics not available.' },
  jorhat: { status: 'photography_only', name: 'Jorhat (Upper Assam)', desc: 'Photography assignments fully covered (Cinematography/events). Doorstep IT diagnostics not available.' },
  dibrugarh: { status: 'photography_only', name: 'Dibrugarh (Upper Assam)', desc: 'Photography assignments fully covered (Cinematography/events). Doorstep IT diagnostics not available.' },
  tezpur: { status: 'photography_only', name: 'Tezpur (Sonitpur)', desc: 'Photography assignments fully covered (Cinematography/events). Doorstep IT diagnostics not available.' },
  silchar: { status: 'photography_only', name: 'Silchar (Barak Valley)', desc: 'Photography assignments fully covered (Cinematography/events). Doorstep IT diagnostics not available.' }
};

interface CoverageMapProps {
  currentTheme?: 'light' | 'dark' | 'normal' | 'mono' | string;
}

export default function CoverageMap({ currentTheme }: CoverageMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedResult, setCheckedResult] = useState<LocalityInfo | null>(null);
  const [searched, setSearched] = useState(false);

  // Fix Leaflet marker icon asset mapping issues in Vite using custom HTML divIcons
  const createMapMarkerIcon = (color: string) => {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full" style="background-color: ${color}; opacity: 0.4;"></span>
          <div class="relative bg-zinc-950 p-1.5 rounded-full shadow-lg flex items-center justify-center" style="border: 2px solid ${color};">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.74a1.095 1.095 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker-wrapper',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    });
  };

  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    const queryClean = searchQuery.trim().toLowerCase();
    if (!queryClean) {
      setCheckedResult(null);
      setSearched(false);
      return;
    }

    // Try exact or partial matches
    let foundKey = Object.keys(LOCALITY_DATA).find(key => 
      key === queryClean || queryClean.includes(key) || key.includes(queryClean)
    );

    if (foundKey) {
      setCheckedResult(LOCALITY_DATA[foundKey]);
    } else {
      // General heuristic for Assam places
      const isAssamKeywords = ['assam', 'guwahati', 'nagaon', 'bongaigaon', 'tinsukia', 'sivasagar', 'barpeta', 'goalpara'];
      const matchesAssam = isAssamKeywords.some(kw => queryClean.includes(kw));

      if (matchesAssam) {
        setCheckedResult({
          status: 'photography_only',
          name: searchQuery,
          desc: 'Photography dispatch is fully available. Doorstep IT audits can be organized for enterprise clients. Contact Murari for details!'
        });
      } else {
        setCheckedResult({
          status: 'not_covered',
          name: searchQuery,
          desc: 'Outside standard doorstep IT support area. However, high-end photography assignments are open to nationwide bookings! Drop a message to request custom dispatch quotes.'
        });
      }
    }
    setSearched(true);
  };

  const mapCenter: L.LatLngExpression = [26.1445, 91.7362]; // Central Guwahati (Dispur/Ganeshguri area)
  
  // Choose beautiful minimalist tile layer styles matching the theme
  const tileLayerUrl = currentTheme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const tileLayerAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="space-y-6" id="dispatch-coverage-widget">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Locality Dispatch Verification Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF5500]/10 text-[#FF5500]">
                <Navigation size={18} className="animate-pulse" />
              </span>
              <h4 className="text-xs uppercase font-mono tracking-widest text-[#FF5500] font-bold">
                Local Dispatch Checker
              </h4>
            </div>

            <p className={`text-xs leading-relaxed ${
              currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Murari is physically based in the heart of Guwahati and operates a specialized 
              home-dispatch IT support vehicle alongside wedding/corporate camera gear kits. 
              Confirm your coverage level instantaneously below.
            </p>

            <form onSubmit={handleCheckCoverage} className="relative mt-2">
              <LagFreeInput
                type="text"
                placeholder="Type your locality (e.g., Ganeshguri, Paltan Bazaar, Borjhar...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs py-3 pl-3 pr-10 rounded-xl border outline-none transition-all font-mono ${
                  currentTheme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900 focus:border-[#FF5500]'
                    : 'bg-zinc-950 border-zinc-850 text-white focus:border-[#FF5500]'
                }`}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                <Search size={16} />
              </button>
            </form>

            {searched && checkedResult && (
              <div className={`p-4 rounded-2xl border text-left animate-in fade-in slide-in-from-top-3 duration-250 ${
                checkedResult.status === 'fully_covered'
                  ? 'bg-green-500/5 border-green-500/25 text-green-500'
                  : checkedResult.status === 'extended_coverage'
                  ? 'bg-amber-500/5 border-amber-500/25 text-amber-500'
                  : checkedResult.status === 'photography_only'
                  ? 'bg-indigo-500/5 border-indigo-500/25 text-indigo-400'
                  : 'bg-slate-500/5 border-slate-500/25 text-slate-400'
              }`}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {checkedResult.status === 'fully_covered' && <CheckCircle2 size={16} />}
                    {checkedResult.status === 'extended_coverage' && <AlertTriangle size={16} />}
                    {checkedResult.status === 'photography_only' && <CheckCircle2 size={16} />}
                    {checkedResult.status === 'not_covered' && <HelpCircle size={16} />}
                  </div>
                  <div className="space-y-1">
                    <strong className="text-xs uppercase font-mono tracking-wider block">
                      {checkedResult.name} — {
                        checkedResult.status === 'fully_covered' ? 'Core Area (100% Covered)' :
                        checkedResult.status === 'extended_coverage' ? 'Extended Tech Support Area' :
                        checkedResult.status === 'photography_only' ? 'Photography Dispatch Only' :
                        'Special Dispatch Booking'
                      }
                    </strong>
                    <p className={`text-[11px] leading-relaxed ${
                      currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {checkedResult.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
            <div className={`p-3 rounded-2xl border ${
              currentTheme === 'light' ? 'bg-slate-50 border-slate-150' : 'bg-white/5 border-white/5'
            }`}>
              <div className="text-lg font-black text-[#FF5500]">12 KM</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">IT Service Area</div>
            </div>
            <div className={`p-3 rounded-2xl border ${
              currentTheme === 'light' ? 'bg-slate-50 border-slate-150' : 'bg-white/5 border-white/5'
            }`}>
              <div className="text-lg font-black text-indigo-400">Assam</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Photo Coverage</div>
            </div>
            <div className={`p-3 rounded-2xl border ${
              currentTheme === 'light' ? 'bg-slate-50 border-slate-150' : 'bg-white/5 border-white/5'
            }`}>
              <div className="text-lg font-black text-emerald-400">&lt; 1 HR</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Guwahati Dispatch</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map Container */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/5 relative min-h-[350px] shadow-lg flex flex-col justify-between">
          <div className="absolute inset-0 z-0">
            <MapContainer
              center={mapCenter}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer
                attribution={tileLayerAttribution}
                url={tileLayerUrl}
              />
              
              {/* Highlight Core 12KM Support Dispatch Zone */}
              <Circle
                center={mapCenter}
                radius={12000} // 12km radius
                pathOptions={{
                  fillColor: '#FF5500',
                  fillOpacity: 0.12,
                  color: '#FF5500',
                  weight: 1.5,
                  dashArray: '5, 8'
                }}
              />

              {/* Central base node */}
              <Marker position={mapCenter} icon={createMapMarkerIcon('#FF5500')}>
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-900 leading-relaxed">
                    <strong className="font-extrabold text-[#FF5500] block text-[13px] mb-0.5">Pixel Fix Central Hub</strong>
                    Guwahati Dispatch Headquarters.<br />
                    Doorstep IT services arrive within 60 minutes.
                  </div>
                </Popup>
              </Marker>

              {/* Node 2: Paltan Bazaar */}
              <Marker position={[26.1758, 91.7539]} icon={createMapMarkerIcon('#FF5500')}>
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-900 leading-relaxed">
                    <strong className="font-bold text-[#FF5500] block">Paltan Bazaar Node</strong>
                    Guwahati core transport & transit dispatch alignment.
                  </div>
                </Popup>
              </Marker>

              {/* Node 3: Maligaon */}
              <Marker position={[26.1557, 91.6892]} icon={createMapMarkerIcon('#FF5500')}>
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-900 leading-relaxed">
                    <strong className="font-bold text-[#FF5500] block">Maligaon Node</strong>
                    West Guwahati core service endpoint.
                  </div>
                </Popup>
              </Marker>

              {/* Node 4: Khanapara */}
              <Marker position={[26.1158, 91.8153]} icon={createMapMarkerIcon('#FF5500')}>
                <Popup>
                  <div className="p-1 text-xs font-sans text-slate-900 leading-relaxed">
                    <strong className="font-bold text-[#FF5500] block">Khanapara Node</strong>
                    East Guwahati core dispatch terminal.
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Floating Map Legend/Labels */}
          <div className={`absolute bottom-3 left-3 z-[400] p-3 rounded-2xl border backdrop-blur-md text-[10px] font-mono leading-relaxed pointer-events-auto max-w-[210px] ${
            currentTheme === 'light' ? 'bg-white/90 border-slate-200 text-slate-800 shadow-md' : 'bg-black/85 border-zinc-800 text-white shadow-xl'
          }`}>
            <div className="font-bold uppercase text-[9px] text-[#FF5500] tracking-wider mb-1">Coverage Legend</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]/15 border border-[#FF5500] flex-shrink-0" />
                <span>Orange Circle: Core doorstep IT support (12KM free dispatch)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse" />
                <span>Indigo Nodes: High-density dispatch focus points</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
