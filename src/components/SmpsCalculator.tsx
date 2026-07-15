import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Layers, 
  HardDrive, 
  Wind, 
  Sliders, 
  Info, 
  Plus, 
  Minus, 
  RotateCcw, 
  Check, 
  ShieldAlert, 
  TrendingUp, 
  Gauge, 
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  ChevronDown,
  X,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  CPU_DATABASE, 
  GPU_DATABASE, 
  CHIPSET_DATABASE, 
  CpuModel, 
  GpuModel, 
  MotherboardChipset 
} from './HardwareDb';
import WhatsAppIcon from './WhatsAppIcon';

interface SmpsCalculatorProps {
  currentTheme: 'light' | 'dark' | 'mono';
}

export default function SmpsCalculator({ currentTheme }: SmpsCalculatorProps) {
  // Theme helpers
  const isDark = currentTheme === 'dark' || currentTheme === 'mono';
  const isMono = currentTheme === 'mono';

  // 1. Processors (CPU) State
  const [selectedCpuId, setSelectedCpuId] = useState<string>(''); // Empty by default
  const [isCpuOpen, setIsCpuOpen] = useState(false);
  const [cpuSearch, setCpuSearch] = useState('');
  const [cpuCategory, setCpuCategory] = useState<string>('all');
  const [overclockCpu, setOverclockCpu] = useState(false);

  // 2. Graphics (GPU) State
  const [selectedGpuId, setSelectedGpuId] = useState<string>(''); // Empty by default
  const [isGpuOpen, setIsGpuOpen] = useState(false);
  const [gpuSearch, setGpuSearch] = useState('');
  const [gpuCategory, setGpuCategory] = useState<string>('all');
  const [overclockGpu, setOverclockGpu] = useState(false);

  // Refs and Click-Outside handler for dropdowns
  const cpuRef = useRef<HTMLDivElement>(null);
  const gpuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cpuRef.current && !cpuRef.current.contains(event.target as Node)) {
        setIsCpuOpen(false);
      }
      if (gpuRef.current && !gpuRef.current.contains(event.target as Node)) {
        setIsGpuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 3. Motherboard State (Linked dynamically to socket compatibility!)
  const [selectedChipsetId, setSelectedChipsetId] = useState<string>('b650');
  const [customFormFactor, setCustomFormFactor] = useState<'EATX' | 'ATX' | 'mATX' | 'ITX' | ''>('');

  // 4. Memory (RAM) State
  const [ramType, setRamType] = useState<'ddr5' | 'ddr4' | 'ddr3' | ''>('ddr5');
  const [ramSticks, setRamSticks] = useState<number>(2);
  const [ramProfile, setRamProfile] = useState<'standard' | 'xmp' | 'rgb'>('xmp');

  // 5. Storage State (Counters)
  const [nvmeGen5Count, setNvmeGen5Count] = useState(0);
  const [nvmeGen4Count, setNvmeGen4Count] = useState(1);
  const [sataSsdCount, setSataSsdCount] = useState(0);
  const [hdd7200Count, setHdd7200Count] = useState(0);
  const [hdd5400Count, setHdd5400Count] = useState(0);
  const [sasEnterpriseCount, setSasEnterpriseCount] = useState(0);

  // 6. Cooling Equipment
  const [coolingType, setCoolingType] = useState<string>('aio_240');
  const [caseFanType, setCaseFanType] = useState<'std_120' | 'argb_120' | 'std_140' | 'argb_140' | 'industrial'>('argb_120');
  const [caseFans, setCaseFans] = useState(3);

  // 7. Aesthetics & Add-ons
  const [rgbStrips, setRgbStrips] = useState(2);
  const [rgbController, setRgbController] = useState(true);
  const [usbHighDrawCount, setUsbHighDrawCount] = useState(1);

  // PCIe Expanders
  const [hasSoundCard, setHasSoundCard] = useState(false);
  const [hasCaptureCard, setHasCaptureCard] = useState(false);
  const [hasWifiCard, setHasWifiCard] = useState(false);

  // Headroom Overheads
  const [safetyMargin, setSafetyMargin] = useState<number>(25);

  // Selected Entities
  const selectedCpu = useMemo(() => CPU_DATABASE.find(c => c.id === selectedCpuId) || null, [selectedCpuId]);
  const selectedGpu = useMemo(() => GPU_DATABASE.find(g => g.id === selectedGpuId) || null, [selectedGpuId]);

  // AUTO-FILTER Motherboard compatibility based on selected CPU socket
  const compatibleChipsets = useMemo(() => {
    if (!selectedCpu) return CHIPSET_DATABASE;
    return CHIPSET_DATABASE.filter(board => board.socket === selectedCpu.socket);
  }, [selectedCpu]);

  // Adjust compatibility automatically when CPU socket changes
  useEffect(() => {
    if (selectedCpu) {
      const isStillCompatible = compatibleChipsets.some(chip => chip.id === selectedChipsetId);
      if (!isStillCompatible && compatibleChipsets.length > 0) {
        setSelectedChipsetId(compatibleChipsets[0].id);
        setCustomFormFactor('');
      }
    }
  }, [selectedCpu, compatibleChipsets, selectedChipsetId]);

  const selectedChipset = useMemo(() => CHIPSET_DATABASE.find(board => board.id === selectedChipsetId) || null, [selectedChipsetId]);

  // Smart baseline form factor
  const activeFormFactor = customFormFactor || (selectedChipset ? selectedChipset.formFactor : 'ATX');

  // Filtered lists for processors
  const filteredCpus = useMemo(() => {
    return CPU_DATABASE.filter(cpu => {
      const matchesSearch = cpu.name.toLowerCase().includes(cpuSearch.toLowerCase()) || 
                            cpu.socket.toLowerCase().includes(cpuSearch.toLowerCase()) ||
                            cpu.series.toLowerCase().includes(cpuSearch.toLowerCase());
      const matchesCategory = cpuCategory === 'all' || cpu.category === cpuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [cpuSearch, cpuCategory]);

  const groupedCpus = useMemo(() => {
    const groups: { [key: string]: CpuModel[] } = {};
    filteredCpus.forEach(cpu => {
      if (!groups[cpu.series]) {
        groups[cpu.series] = [];
      }
      groups[cpu.series].push(cpu);
    });
    return groups;
  }, [filteredCpus]);

  // Filtered lists for Graphics
  const filteredGpus = useMemo(() => {
    return GPU_DATABASE.filter(gpu => {
      const matchesSearch = gpu.name.toLowerCase().includes(gpuSearch.toLowerCase()) || 
                            gpu.vram.toLowerCase().includes(gpuSearch.toLowerCase()) ||
                            gpu.series.toLowerCase().includes(gpuSearch.toLowerCase());
      const matchesCategory = gpuCategory === 'all' || gpu.category === gpuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [gpuSearch, gpuCategory]);

  const groupedGpus = useMemo(() => {
    const groups: { [key: string]: GpuModel[] } = {};
    filteredGpus.forEach(gpu => {
      if (!groups[gpu.series]) {
        groups[gpu.series] = [];
      }
      groups[gpu.series].push(gpu);
    });
    return groups;
  }, [filteredGpus]);

  // Power Calculation Formulas
  const wattageBreakdown = useMemo(() => {
    // 1. Processor (CPU) Draw
    let cpuDraw = 0;
    if (selectedCpu) {
      cpuDraw = selectedCpu.peak;
      if (overclockCpu) cpuDraw += 50; // extra overclock overhead
    }

    // 2. Graphics (GPU) Draw
    let gpuDraw = 0;
    if (selectedGpu) {
      gpuDraw = selectedGpu.wattage;
      if (overclockGpu) gpuDraw += 80;
    }

    // 3. Motherboard Draw
    let moboDraw = 0;
    if (selectedChipset) {
      const motherboardBaselines = { EATX: 45, ATX: 35, mATX: 25, ITX: 18 };
      moboDraw = motherboardBaselines[activeFormFactor] || 30;
      if (selectedChipset.overclockSupport) {
        moboDraw += 15; // beefier VRM power draw
      }
    }

    // 4. Memory (RAM) Draw
    let ramDraw = 0;
    if (ramType) {
      const baseRamDraw = { ddr5: 4, ddr4: 3, ddr3: 3 }[ramType];
      let perStickDraw = baseRamDraw;
      if (ramProfile === 'xmp') perStickDraw += 2.5; // XMP/EXPO dynamic overhead
      if (ramProfile === 'rgb') perStickDraw += 4.5; // High-wattage RGB heatsinks
      ramDraw = ramSticks * perStickDraw;
    }

    // 5. Storage Draw
    const nvmeGen5Draw = nvmeGen5Count * 12;
    const nvmeGen4Draw = nvmeGen4Count * 7.5;
    const sataSsdDraw = sataSsdCount * 4;
    const hdd7200Draw = hdd7200Count * 10;
    const hdd5400Draw = hdd5400Count * 6;
    const sasEnterpriseDraw = sasEnterpriseCount * 15;
    const storageDraw = nvmeGen5Draw + nvmeGen4Draw + sataSsdDraw + hdd7200Draw + hdd5400Draw + sasEnterpriseDraw;

    // 6. Cooling Draw
    let coolingDraw = 0;
    const coolingBaseline = {
      stock: 4,
      air_single: 6,
      air_dual: 12,
      aio_120: 15,
      aio_240: 22,
      aio_360: 30,
      custom_loop: 35,
      extreme_loop: 60
    }[coolingType] || 0;
    coolingDraw += coolingBaseline;

    // Fans Draw
    const fanBaseline = {
      std_120: 2.0,
      argb_120: 3.5,
      std_140: 2.5,
      argb_140: 4.5,
      industrial: 8.0
    }[caseFanType] || 2.5;
    coolingDraw += caseFans * fanBaseline;

    // 7. Peripherals & Aesthetics
    let accessoriesDraw = 0;
    accessoriesDraw += rgbStrips * 4.5;
    if (rgbController) accessoriesDraw += 8;
    accessoriesDraw += usbHighDrawCount * 10;

    // PCIe add-on cards
    if (hasSoundCard) accessoriesDraw += 10;
    if (hasCaptureCard) accessoriesDraw += 15;
    if (hasWifiCard) accessoriesDraw += 12;

    const totalPeak = Math.round(cpuDraw + gpuDraw + moboDraw + ramDraw + storageDraw + coolingDraw + accessoriesDraw);

    return {
      cpu: cpuDraw,
      gpu: gpuDraw,
      mobo: moboDraw,
      ram: ramDraw,
      storage: storageDraw,
      cooling: coolingDraw,
      accessories: accessoriesDraw,
      totalPeak
    };
  }, [
    selectedCpu, overclockCpu,
    selectedGpu, overclockGpu,
    selectedChipset, activeFormFactor,
    ramType, ramSticks, ramProfile,
    nvmeGen5Count, nvmeGen4Count, sataSsdCount, hdd7200Count, hdd5400Count, sasEnterpriseCount,
    coolingType, caseFanType, caseFans,
    rgbStrips, rgbController, usbHighDrawCount,
    hasSoundCard, hasCaptureCard, hasWifiCard
  ]);

  const recommendedPower = useMemo(() => {
    if (wattageBreakdown.totalPeak === 0) {
      return { rawRecommended: 0, suggestedPsuSize: 0 };
    }
    const rawRecommended = Math.round(wattageBreakdown.totalPeak * (1 + safetyMargin / 100));
    // Round to nearest logical power supply increment (e.g. 450W, 550W, 650W, 750W, 850W, 1000W, 1200W, 1300W, 1600W)
    const incrementalSizes = [450, 500, 550, 600, 650, 700, 750, 800, 850, 1000, 1200, 1300, 1600];
    let suggestedPsuSize = 1600;
    for (const size of incrementalSizes) {
      if (size >= rawRecommended) {
        suggestedPsuSize = size;
        break;
      }
    }
    return { rawRecommended, suggestedPsuSize };
  }, [wattageBreakdown.totalPeak, safetyMargin]);

  // Is Form Empty?
  const isFormEmpty = wattageBreakdown.totalPeak === 0;

  // Real-time transient spike calculation (vital for next-gen RTX GPUs!)
  const estimatedTransientSpike = useMemo(() => {
    if (!selectedGpu) return wattageBreakdown.totalPeak;
    const basePeak = wattageBreakdown.totalPeak;
    const extraGpuSpike = Math.round(selectedGpu.wattage * (selectedGpu.transientMultiplier - 1));
    return basePeak + extraGpuSpike;
  }, [selectedGpu, wattageBreakdown]);

  // 80 Plus Certification Recommendations
  const psuEfficiencyAdvice = useMemo(() => {
    const peak = wattageBreakdown.totalPeak;
    if (peak === 0) {
      return { tier: '80 Plus Standard', color: 'from-zinc-400 to-zinc-500', desc: 'Select core silicon to evaluate efficiency requirements.' };
    }
    if (peak > 750) {
      return {
        tier: '80 Plus Platinum / Titanium',
        color: 'from-sky-300 via-zinc-300 to-slate-400',
        desc: 'Extreme-load rig detected. High peak draws generate substantial heat. A Titanium/Platinum unit (92%+ conversion efficiency) will save significant power, lower room temperatures, and guarantee superior clean power delivery.'
      };
    }
    if (peak > 450) {
      return {
        tier: '80 Plus Gold Certified',
        color: 'from-yellow-500 via-amber-400 to-yellow-600',
        desc: 'Highly recommended for performance workstations and gaming rigs. Offers 90% peak efficiency, reducing wasted energy as room heat, and utilizes superior Japanese capacitors.'
      };
    }
    return {
      tier: '80 Plus Bronze / Silver',
      color: 'from-amber-700 via-amber-600 to-zinc-500',
      desc: 'Sufficient and cost-effective for budget setups. Convert energy at a secure 85% baseline. Consider upgrading to Gold if system uptime exceeds 8 hours daily.'
    };
  }, [wattageBreakdown.totalPeak]);

  // Reset function
  const handleReset = () => {
    setSelectedCpuId('');
    setSelectedGpuId('');
    setSelectedChipsetId('');
    setCustomFormFactor('');
    setOverclockCpu(false);
    setOverclockGpu(false);
    setRamType('ddr5');
    setRamSticks(2);
    setRamProfile('xmp');
    setNvmeGen5Count(0);
    setNvmeGen4Count(1);
    setSataSsdCount(0);
    setHdd7200Count(0);
    setHdd5400Count(0);
    setSasEnterpriseCount(0);
    setCoolingType('aio_240');
    setCaseFanType('argb_120');
    setCaseFans(3);
    setRgbStrips(2);
    setRgbController(true);
    setUsbHighDrawCount(1);
    setHasSoundCard(false);
    setHasCaptureCard(false);
    setHasWifiCard(false);
    setSafetyMargin(25);
  };

  // WhatsApp helper
  const handleWhatsAppInquiry = () => {
    const cpuName = selectedCpu ? selectedCpu.name : 'Integrated / None';
    const gpuName = selectedGpu ? selectedGpu.name : 'Integrated / None';
    const chipset = selectedChipset ? selectedChipset.name : 'Generic ATX';
    const ramText = ramType ? `${ramSticks}x DDR${ramType === 'ddr5' ? '5' : ramType === 'ddr4' ? '4' : '3'} (${ramProfile === 'rgb' ? 'Extreme RGB' : ramProfile === 'xmp' ? 'EXPO/XMP' : 'Standard'})` : 'None';
    
    const text = `Hi, I am interested in Murari's Assam Doorstep Assembly integration! Here is my custom PC setup from SMPS PSU Calculator:
- CPU: ${cpuName} ${overclockCpu ? '(Overclocked)' : ''}
- GPU: ${gpuName} ${overclockGpu ? '(Turbo Mode)' : ''}
- Motherboard: ${chipset} (${activeFormFactor})
- Memory: ${ramText}
- Peak Wattage Draw: ${wattageBreakdown.totalPeak}W
- Recommended Power Supply Capacity: ${recommendedPower.suggestedPsuSize}W
Please advise on matching cabinetry cable routing, custom cooling loop, and doorstep integration!`;

    const url = `https://wa.me/918453421375?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Aesthetic constants based on theme
  const containerStyle = isMono
    ? 'bg-black border border-white text-white p-4 sm:p-6 md:p-8 rounded-3xl font-mono'
    : isDark
      ? 'bg-zinc-950/90 border border-zinc-900/80 shadow-2xl backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-3xl text-zinc-100'
      : 'bg-white border border-slate-200/90 shadow-2xl shadow-slate-100/50 p-4 sm:p-6 md:p-8 rounded-3xl text-slate-900';

  const cardStyle = isMono
    ? 'border border-white/20 bg-neutral-950 p-4 rounded-2xl relative overflow-hidden text-left'
    : isDark
      ? 'border border-zinc-900/60 bg-zinc-900/20 p-4 rounded-2xl relative overflow-hidden text-left'
      : 'border border-slate-150 bg-slate-50/50 p-4 rounded-2xl relative overflow-hidden text-left';

  const inputStyle = isMono
    ? 'bg-black border border-white/40 text-white rounded-lg p-2 text-xs focus:border-white font-mono outline-none'
    : isDark
      ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg p-2.5 text-xs focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none transition-colors'
      : 'bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none transition-colors shadow-sm';

  const counterBtnStyle = isMono
    ? 'p-1 rounded border border-white/40 text-white hover:border-white'
    : isDark
      ? 'p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
      : 'p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600';

  // Dynamic color variables for technical background
  const strokeColorPrimary = isMono ? 'rgba(255,255,255,0.15)' : isDark ? 'rgba(255,85,0,0.15)' : 'rgba(255,85,0,0.06)';
  const strokeColorSecondary = isMono ? 'rgba(255,255,255,0.1)' : isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)';
  const strokeColorGrid = isMono ? 'rgba(255,255,255,0.02)' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const textColorAccent = isMono ? 'text-white/20' : isDark ? 'text-[#FF5500]/20' : 'text-[#FF5500]/15';
  const textSecondaryAccent = isMono ? 'text-white/10' : isDark ? 'text-indigo-500/20' : 'text-indigo-500/15';

  return (
    <div className={`${containerStyle} w-full transition-colors duration-200 relative`} id="smps-calculator-root">
      
      {/* Modern, Tech-Inspired PSU background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 select-none">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes electric-flow-fast {
            0% { stroke-dashoffset: 120; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes electric-flow-slow {
            0% { stroke-dashoffset: 240; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pulse-glow-bg {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.45; }
          }
          @keyframes lightning-flash {
            0%, 90%, 100% { opacity: 0.05; }
            92% { opacity: 0.25; }
            93% { opacity: 0.1; }
            94% { opacity: 0.35; }
            95% { opacity: 0.05; }
          }
          @keyframes particle-float-1 {
            0% { transform: translate(10%, 90%) scale(1); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translate(15%, 20%) scale(1.5); opacity: 0; }
          }
          @keyframes particle-float-2 {
            0% { transform: translate(80%, 80%) scale(1.2); opacity: 0; }
            15% { opacity: 0.25; }
            85% { opacity: 0.25; }
            100% { transform: translate(75%, 15%) scale(0.8); opacity: 0; }
          }
          @keyframes particle-float-3 {
            0% { transform: translate(45%, 95%) scale(0.8); opacity: 0; }
            20% { opacity: 0.35; }
            80% { opacity: 0.35; }
            100% { transform: translate(50%, 10%) scale(1.4); opacity: 0; }
          }
          @keyframes particle-float-4 {
            0% { transform: translate(25%, 85%) scale(1.5); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translate(30%, 30%) scale(1); opacity: 0; }
          }
          .anim-flow-fast {
            stroke-dasharray: 10, 20;
            animation: electric-flow-fast 4s linear infinite;
          }
          .anim-flow-slow {
            stroke-dasharray: 15, 35;
            animation: electric-flow-slow 8s linear infinite;
          }
          .anim-pulse-glow {
            animation: pulse-glow-bg 4s ease-in-out infinite;
          }
          .anim-lightning {
            animation: lightning-flash 7s ease-in-out infinite;
          }
          .anim-particle-1 { animation: particle-float-1 14s linear infinite; }
          .anim-particle-2 { animation: particle-float-2 18s linear infinite; }
          .anim-particle-3 { animation: particle-float-3 15s linear infinite; }
          .anim-particle-4 { animation: particle-float-4 22s linear infinite; }
        ` }} />

        {/* 1. Grid pattern for blueprint/circuit feeling */}
        <svg className="absolute inset-0 w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="psu-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={strokeColorGrid} strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill={strokeColorGrid} opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#psu-grid)" />
        </svg>

        {/* 2. Circuit Board traces & Electric flow lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Top side traces */}
          <path d="M -50 80 L 120 80 L 180 140 L 350 140 L 410 80 L 600 80" fill="none" stroke={strokeColorPrimary} strokeWidth="1.5" className="opacity-40" />
          <path d="M -50 80 L 120 80 L 180 140 L 350 140 L 410 80 L 600 80" fill="none" stroke={isMono ? '#fff' : '#FF5500'} strokeWidth="1.5" className="anim-flow-fast opacity-50" />
          
          <path d="M 150 0 L 150 60 L 210 120 L 210 240" fill="none" stroke={strokeColorSecondary} strokeWidth="1" className="opacity-30" />
          <path d="M 150 0 L 150 60 L 210 120 L 210 240" fill="none" stroke={isMono ? '#fff' : '#6366f1'} strokeWidth="1" className="anim-flow-slow opacity-40" />

          {/* Left/Middle traces */}
          <path d="M 40 450 L 140 450 L 200 510 L 200 680 L 300 780" fill="none" stroke={strokeColorPrimary} strokeWidth="1" className="opacity-30" />
          <path d="M 40 450 L 140 450 L 200 510 L 200 680 L 300 780" fill="none" stroke={isMono ? '#fff' : '#FF5500'} strokeWidth="1" className="anim-flow-slow opacity-40" />

          {/* Right side traces */}
          <path d="M 1100 200 L 980 200 L 920 260 L 920 400 L 980 460 L 1150 460" fill="none" stroke={strokeColorSecondary} strokeWidth="1.5" className="opacity-40" />
          <path d="M 1100 200 L 980 200 L 920 260 L 920 400 L 980 460 L 1150 460" fill="none" stroke={isMono ? '#fff' : '#6366f1'} strokeWidth="1.5" className="anim-flow-fast opacity-50" />

          {/* Bottom side traces */}
          <path d="M 200 1300 L 450 1300 L 510 1240 L 800 1240 M 800 1240 L 860 1300 L 1050 1300" fill="none" stroke={strokeColorPrimary} strokeWidth="1.2" className="opacity-30" />
          <path d="M 200 1300 L 450 1300 L 510 1240 L 800 1240 M 800 1240 L 860 1300 L 1050 1300" fill="none" stroke={isMono ? '#fff' : '#FF5500'} strokeWidth="1.2" className="anim-flow-slow opacity-40" />

          {/* Glowing junction points (PCB solder pads) */}
          <circle cx="120" cy="80" r="3.5" fill={isMono ? '#fff' : '#FF5500'} className="anim-pulse-glow" />
          <circle cx="180" cy="140" r="3" fill={isMono ? '#fff' : '#6366f1'} />
          <circle cx="350" cy="140" r="3" fill={isMono ? '#fff' : '#FF5500'} />
          <circle cx="410" cy="80" r="3.5" fill={isMono ? '#fff' : '#6366f1'} className="anim-pulse-glow" />
          <circle cx="980" cy="200" r="3.5" fill={isMono ? '#fff' : '#6366f1'} />
          <circle cx="920" cy="260" r="3" fill={isMono ? '#fff' : '#FF5500'} />
          <circle cx="920" cy="400" r="3" fill={isMono ? '#fff' : '#6366f1'} />
          <circle cx="980" cy="460" r="3.5" fill={isMono ? '#fff' : '#FF5500'} className="anim-pulse-glow" />
        </svg>

        {/* 3. Subtle electric wave patterns (flowing sine waves representing alternate current AC to DC) */}
        <div className="absolute top-[25%] left-0 right-0 h-48 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0,100 C150,150 300,50 450,100 C600,150 750,50 900,100 C1050,150 1200,50 1350,100 C1400,116 1420,116 1440,100" 
              fill="none" 
              stroke={isMono ? '#fff' : '#FF5500'} 
              strokeWidth="2.5" 
              strokeDasharray="8, 16"
              className="anim-flow-fast"
            />
            <path 
              d="M0,120 C180,60 360,180 540,120 C720,60 900,180 1080,120 C1260,60 1380,150 1440,120" 
              fill="none" 
              stroke={isMono ? '#fff' : '#6366f1'} 
              strokeWidth="1.5" 
              strokeDasharray="12, 24"
              className="anim-flow-slow"
            />
          </svg>
        </div>

        {/* 4. Moving/Floating Energy Particles */}
        <div className="absolute inset-0">
          <div className={`absolute w-1.5 h-1.5 rounded-full ${isMono ? 'bg-white' : 'bg-[#FF5500]'} blur-[1px] anim-particle-1`} />
          <div className={`absolute w-2.5 h-2.5 rounded-full ${isMono ? 'bg-white/80' : 'bg-indigo-500'} blur-[1px] anim-particle-2`} />
          <div className={`absolute w-1 h-1 rounded-full ${isMono ? 'bg-white/60' : 'bg-amber-400'} blur-[0.5px] anim-particle-3`} />
          <div className={`absolute w-2 h-2 rounded-full ${isMono ? 'bg-white/70' : 'bg-indigo-400'} blur-[1.5px] anim-particle-4`} />
        </div>

        {/* 5. Electricity icons, PSU watt symbols, voltage graphics, lightning accents */}
        {/* Top Right background graphics */}
        <div className={`absolute top-10 right-10 ${textSecondaryAccent} font-mono text-[9px] select-none tracking-widest leading-normal space-y-1 text-right md:block hidden`}>
          <div>INPUT: AC 100-240V ~ 50-60Hz</div>
          <div>DC OUTPUT: +12V | +5V | +3.3V</div>
          <div className="flex items-center justify-end gap-1 font-bold text-[10px]">
            <Zap className="w-3 h-3 text-[#FF5500] anim-pulse-glow" />
            <span>80 PLUS GOLD SIMULATION</span>
          </div>
        </div>

        {/* Middle Left graphics */}
        <div className={`absolute top-[40%] left-6 ${textColorAccent} font-mono text-[8px] select-none tracking-wider space-y-1 md:block hidden`}>
          <div className="font-black text-[10px] tracking-widest">SMPS ATX 3.1 COMPLIANT</div>
          <div>TRANSIENT PEAK LOAD CAP: 200%</div>
          <div>12V-2x6 HIGH POWER CONNECTOR</div>
        </div>

        {/* Subtle Lightning symbol in background */}
        <div className="absolute bottom-16 right-16 opacity-5 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="anim-lightning">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
          </svg>
        </div>

        {/* Subtle PSU Fan structure in bottom-left */}
        <div className="absolute bottom-6 left-6 opacity-5 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.75" className="animate-spin" style={{ animationDuration: '40s' }}>
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="20" />
            <circle cx="50" cy="50" r="5" />
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = (i * 360) / 9;
              return (
                <path 
                  key={i} 
                  d={`M 50 50 L ${50 + 45 * Math.cos((angle * Math.PI) / 180)} ${50 + 45 * Math.sin((angle * Math.PI) / 180)}`} 
                  strokeDasharray="4 2"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-500/10 pb-6 mb-6 relative z-10">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF5500] animate-pulse" />
            <h1 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${isMono ? 'font-mono' : 'font-sans'}`}>
              SMPS PSU Power Calculator
            </h1>
          </div>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Professional diagnostic builder simulating transient load thresholds, safety overhead constraints, and chipset socket dependencies.
          </p>
        </div>
        
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
            isMono 
              ? 'border-white text-white hover:bg-white hover:text-black font-mono' 
              : 'border-[#FF5500]/20 bg-[#FF5500]/5 text-[#FF5500] hover:bg-[#FF5500]/10 active:scale-95'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Configuration</span>
        </button>
      </div>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Input Configuration Deck (Left: 7cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card 1: Silicon Processing Units (CPU & GPU) */}
          <div 
            className={`${cardStyle.replace('overflow-hidden', 'overflow-visible')} ${isCpuOpen || isGpuOpen ? 'z-40' : 'z-10'}`} 
            id="silicon-core-engines-section"
          >
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2.5 mb-4">
              <Cpu className="w-4 h-4 text-[#FF5500]" />
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isMono ? 'font-mono' : 'font-sans'}`}>
                1. Silicon Core Engines
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CPU Selector Search */}
              <div ref={cpuRef} className={`space-y-1.5 text-left relative ${isCpuOpen ? 'z-50' : 'z-20'}`}>
                <label className="text-[10px] font-extrabold uppercase tracking-wide flex justify-between">
                  <span>Processor (CPU)</span>
                  {selectedCpu && <span className="text-[9px] text-[#FF5500] font-mono">{selectedCpu.socket}</span>}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={isCpuOpen ? cpuSearch : (selectedCpu ? selectedCpu.name : '')}
                    onFocus={() => {
                      setIsCpuOpen(true);
                      setIsGpuOpen(false);
                      setCpuSearch(selectedCpu ? selectedCpu.name : '');
                    }}
                    onChange={(e) => {
                      setCpuSearch(e.target.value);
                      setIsCpuOpen(true);
                    }}
                    placeholder="Search Processor..."
                    className={`w-full p-3 pl-11 pr-24 rounded-xl text-xs transition-all ${
                      isMono 
                        ? 'bg-black border border-white/40 text-white font-mono focus:border-white outline-none' 
                        : isDark 
                          ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none' 
                          : 'bg-white border border-slate-200 text-slate-800 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none shadow-sm'
                    } text-left font-bold relative z-40 cursor-text hover:border-[#FF5500]/50`}
                  />
                  {/* Cpu icon inside the input on the left */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-40">
                    <Cpu className="w-4 h-4 text-[#FF5500]" />
                  </div>
                  {/* Search / Chevron / Clear icon on the right */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-40">
                    {selectedCpu && !isCpuOpen && (
                      <span className="text-[9px] bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] px-1.5 py-0.5 rounded font-mono font-bold select-none">
                        {selectedCpu.socket}
                      </span>
                    )}
                    {(isCpuOpen ? cpuSearch : selectedCpu) ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCpuOpen) {
                            setCpuSearch('');
                          } else {
                            setSelectedCpuId('');
                            setCpuSearch('');
                          }
                        }}
                        className="p-1 rounded-full hover:bg-zinc-500/10 text-zinc-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-zinc-500 hover:text-[#FF5500]" />
                      </button>
                    ) : (
                      <Search className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </div>

                  {/* Closed on click outside via useEffect ref */}

                  {/* Inline Dropdown for CPU */}
                  <AnimatePresence>
                    {isCpuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-0 right-0 top-full mt-1.5 max-h-80 rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-40 ${
                          isMono 
                            ? 'bg-black border-white text-white font-mono' 
                            : isDark 
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
                              : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {/* Categories horizontal scroll pills */}
                        <div className={`p-2 shrink-0 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b ${
                          isMono ? 'border-white/20' : 'border-zinc-500/5 bg-zinc-500/5'
                        }`}>
                          {[
                            { id: 'all', label: 'All Series' },
                            { id: 'intel-ultra', label: 'Intel Ultra' },
                            { id: 'intel-core', label: 'Intel Core' },
                            { id: 'amd-ryzen-9000', label: 'Ryzen 9000' },
                            { id: 'amd-ryzen-7000-5000', label: 'Ryzen 7000/5000' },
                            { id: 'hedt-server', label: 'HEDT / Server' },
                            { id: 'budget-legacy', label: 'Budget / Legacy' }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCpuCategory(tab.id);
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md shrink-0 transition-colors uppercase tracking-wider ${
                                cpuCategory === tab.id 
                                  ? 'bg-[#FF5500] text-white shadow-sm' 
                                  : isMono 
                                    ? 'hover:bg-neutral-800 border border-white/20 text-white font-mono' 
                                    : isDark 
                                      ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Dropdown Scroll List */}
                        <div className={`flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar ${
                          isMono ? 'bg-black' : isDark ? 'bg-zinc-950' : 'bg-white'
                        }`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCpuId('');
                              setCpuSearch('');
                              setIsCpuOpen(false);
                            }}
                            className={`w-full p-2.5 text-left text-xs rounded-xl flex items-center justify-between border transition-all ${
                              !selectedCpuId 
                                ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500] font-black' 
                                : isMono
                                  ? 'border-white/20 text-zinc-400 hover:border-white bg-black'
                                  : isDark
                                    ? 'border-zinc-800/50 hover:bg-zinc-900 text-zinc-400 bg-zinc-950/40 hover:border-zinc-700'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 bg-white shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="font-semibold text-[11px]">None / Integrated Graphics Only</span>
                            </div>
                            {!selectedCpuId && <Check className="w-3.5 h-3.5 text-[#FF5500]" />}
                          </button>

                          {Object.keys(groupedCpus).length === 0 ? (
                            <div className="text-zinc-500 text-[11px] py-6 text-center flex flex-col items-center justify-center gap-1.5">
                              <Search className="w-6 h-6 opacity-20" />
                              <span>No matching processors found</span>
                              <span className="text-[9px] text-zinc-600">Try modifying your search filter</span>
                            </div>
                          ) : (
                            (Object.entries(groupedCpus) as [string, CpuModel[]][]).map(([series, list]) => (
                              <div key={series} className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 bg-zinc-500/5 rounded">
                                  {series}
                                </div>
                                <div className="space-y-1">
                                  {list.map(cpu => (
                                    <button
                                      key={cpu.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCpuId(cpu.id);
                                        setCpuSearch(cpu.name);
                                        setIsCpuOpen(false);
                                      }}
                                      className={`w-full p-2.5 text-left rounded-lg transition-all flex items-center justify-between border ${
                                        selectedCpuId === cpu.id
                                          ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500] dark:text-[#FF5500] font-bold'
                                          : isMono
                                            ? 'border-white/10 hover:border-white bg-neutral-950 text-white font-mono'
                                            : isDark
                                              ? 'border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
                                              : 'border-slate-150 bg-slate-50/60 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex flex-col text-left truncate pr-2">
                                        <span className={`text-[11px] font-bold truncate ${selectedCpuId === cpu.id && !isMono ? 'text-[#FF5500]' : ''}`}>
                                          {cpu.name}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 truncate mt-0.5 font-medium">
                                          {cpu.socket} • TDP: {cpu.tdp}W
                                        </span>
                                      </div>
                                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                                        selectedCpuId === cpu.id 
                                          ? 'bg-[#FF5500] text-white' 
                                          : 'bg-zinc-500/10 text-zinc-400'
                                      }`}>
                                        {cpu.peak}W Peak
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedCpu && (
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                    <span>Peak draw: {selectedCpu.peak}W</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overclockCpu}
                        onChange={(e) => setOverclockCpu(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3 h-3 cursor-pointer"
                      />
                      <span className="hover:text-[#FF5500] transition-colors select-none">
                        CPU Overclock (+50W)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* GPU Selector Search */}
              <div ref={gpuRef} className={`space-y-1.5 text-left relative ${isGpuOpen ? 'z-50' : 'z-10'}`}>
                <label className="text-[10px] font-extrabold uppercase tracking-wide flex justify-between">
                  <span>Graphics (GPU)</span>
                  {selectedGpu && <span className="text-[9px] text-[#FF5500] font-mono">{selectedGpu.vram} VRAM</span>}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={isGpuOpen ? gpuSearch : (selectedGpu ? selectedGpu.name : '')}
                    onFocus={() => {
                      setIsGpuOpen(true);
                      setIsCpuOpen(false);
                      setGpuSearch(selectedGpu ? selectedGpu.name : '');
                    }}
                    onChange={(e) => {
                      setGpuSearch(e.target.value);
                      setIsGpuOpen(true);
                    }}
                    placeholder="Search Graphics Card..."
                    className={`w-full p-3 pl-11 pr-24 rounded-xl text-xs transition-all ${
                      isMono 
                        ? 'bg-black border border-white/40 text-white font-mono focus:border-white outline-none' 
                        : isDark 
                          ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none' 
                          : 'bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm'
                    } text-left font-bold relative z-40 cursor-text hover:border-indigo-500/50`}
                  />
                  {/* Gpu icon inside the input on the left */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-40">
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                  {/* Search / Chevron / Clear icon on the right */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-40">
                    {selectedGpu && !isGpuOpen && (
                      <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold select-none">
                        {selectedGpu.vram}
                      </span>
                    )}
                    {(isGpuOpen ? gpuSearch : selectedGpu) ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isGpuOpen) {
                            setGpuSearch('');
                          } else {
                            setSelectedGpuId('');
                            setGpuSearch('');
                          }
                        }}
                        className="p-1 rounded-full hover:bg-zinc-500/10 text-zinc-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-zinc-500 hover:text-indigo-500" />
                      </button>
                    ) : (
                      <Search className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </div>

                  {/* Closed on click outside via useEffect ref */}

                  {/* Inline Dropdown for GPU */}
                  <AnimatePresence>
                    {isGpuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-0 right-0 top-full mt-1.5 max-h-80 rounded-2xl border shadow-2xl flex flex-col overflow-hidden z-40 ${
                          isMono 
                            ? 'bg-black border-white text-white font-mono' 
                            : isDark 
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
                              : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {/* Categories horizontal scroll pills */}
                        <div className={`p-2 shrink-0 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b ${
                          isMono ? 'border-white/20' : 'border-zinc-500/5 bg-zinc-500/5'
                        }`}>
                          {[
                            { id: 'all', label: 'All GPUs' },
                            { id: 'nvidia-rtx-50', label: 'RTX 50-Series' },
                            { id: 'nvidia-rtx-40', label: 'RTX 40-Series' },
                            { id: 'nvidia-rtx-30-20', label: 'RTX 30/20' },
                            { id: 'amd-radeon-7000', label: 'RX 7000' },
                            { id: 'amd-radeon-6000-5000', label: 'RX 6000/5000' },
                            { id: 'arc-legacy', label: 'Arc / Classic' }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGpuCategory(tab.id);
                              }}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md shrink-0 transition-colors uppercase tracking-wider ${
                                gpuCategory === tab.id 
                                  ? 'bg-indigo-500 text-white shadow-sm' 
                                  : isMono 
                                    ? 'hover:bg-neutral-800 border border-white/20 text-white font-mono' 
                                    : isDark 
                                      ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Dropdown Scroll List */}
                        <div className={`flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar ${
                          isMono ? 'bg-black' : isDark ? 'bg-zinc-950' : 'bg-white'
                        }`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGpuId('');
                              setGpuSearch('');
                              setIsGpuOpen(false);
                            }}
                            className={`w-full p-2.5 text-left text-xs rounded-xl flex items-center justify-between border transition-all ${
                              !selectedGpuId 
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-black' 
                                : isMono
                                  ? 'border-white/20 text-zinc-400 hover:border-white bg-black'
                                  : isDark
                                    ? 'border-zinc-800/50 hover:bg-zinc-900 text-zinc-400 bg-zinc-950/40 hover:border-zinc-700'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 bg-white shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="font-semibold text-[11px]">None / Integrated Silicon only</span>
                            </div>
                            {!selectedGpuId && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                          </button>

                          {Object.keys(groupedGpus).length === 0 ? (
                            <div className="text-zinc-500 text-[11px] py-6 text-center flex flex-col items-center justify-center gap-1.5">
                              <Search className="w-6 h-6 opacity-20" />
                              <span>No matching graphics cards found</span>
                              <span className="text-[9px] text-zinc-600">Try modifying your search filter</span>
                            </div>
                          ) : (
                            (Object.entries(groupedGpus) as [string, GpuModel[]][]).map(([series, list]) => (
                              <div key={series} className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 bg-zinc-500/5 rounded">
                                  {series}
                                </div>
                                <div className="space-y-1">
                                  {list.map(gpu => (
                                    <button
                                      key={gpu.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGpuId(gpu.id);
                                        setGpuSearch(gpu.name);
                                        setIsGpuOpen(false);
                                      }}
                                      className={`w-full p-2.5 text-left rounded-lg transition-all flex items-center justify-between border ${
                                        selectedGpuId === gpu.id
                                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold'
                                          : isMono
                                            ? 'border-white/10 hover:border-white bg-neutral-950 text-white font-mono'
                                            : isDark
                                              ? 'border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
                                              : 'border-slate-150 bg-slate-50/60 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex flex-col text-left truncate pr-2">
                                        <span className={`text-[11px] font-bold truncate ${selectedGpuId === gpu.id && !isMono ? 'text-indigo-400' : ''}`}>
                                          {gpu.name}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 truncate mt-0.5 font-medium">
                                          VRAM: {gpu.vram}
                                        </span>
                                      </div>
                                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                                        selectedGpuId === gpu.id 
                                          ? 'bg-indigo-500 text-white' 
                                          : 'bg-zinc-500/10 text-zinc-400'
                                      }`}>
                                        {gpu.wattage}W
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedGpu && (
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                    <span>TDP draw: {selectedGpu.wattage}W</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overclockGpu}
                        onChange={(e) => setOverclockGpu(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3 h-3 cursor-pointer"
                      />
                      <span className="hover:text-[#FF5500] transition-colors select-none">
                        Turbo / OC (+80W)
                      </span>
                    </label>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Card 2: Motherboard Chipset Compatibility Matching & RAM */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2.5 mb-4">
              <Layers className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isMono ? 'font-mono' : 'font-sans'}`}>
                2. Platform Connection (Board &amp; RAM)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Motherboard Chipset Selection */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide">
                    Motherboard Chipset
                  </label>
                  {selectedCpu && (
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-md font-mono">
                      {selectedCpu.socket} Compatible
                    </span>
                  )}
                </div>

                <select
                  value={selectedChipsetId}
                  onChange={(e) => setSelectedChipsetId(e.target.value)}
                  className={`w-full ${inputStyle} cursor-pointer`}
                >
                  {compatibleChipsets.map(chip => (
                    <option key={chip.id} value={chip.id}>
                      {chip.name} ({chip.socket} • {chip.tdp}W)
                    </option>
                  ))}
                </select>

                {/* Form Factor Override Grid */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Form Factor Override</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['EATX', 'ATX', 'mATX', 'ITX'] as const).map(ff => (
                      <button
                        key={ff}
                        type="button"
                        onClick={() => setCustomFormFactor(ff)}
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                          activeFormFactor === ff
                            ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500] font-black'
                            : isMono
                              ? 'border-white/20 text-neutral-400 hover:border-white'
                              : 'border-zinc-800 hover:bg-zinc-500/5 text-zinc-400'
                        }`}
                      >
                        {ff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memory Configuration */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wide block">
                  System Memory (RAM)
                </label>
                
                <div className="grid grid-cols-12 gap-1.5">
                  {/* Generation Select */}
                  <div className="col-span-8">
                    <select
                      value={ramType}
                      onChange={(e) => setRamType(e.target.value as any)}
                      className={`w-full ${inputStyle} cursor-pointer`}
                    >
                      <option value="">No Memory Module</option>
                      <option value="ddr5">DDR5 High-Frequency</option>
                      <option value="ddr4">DDR4 Mainstream</option>
                      <option value="ddr3">DDR3 Legacy</option>
                    </select>
                  </div>

                  {/* Count Counter */}
                  {ramType && (
                    <div className="col-span-4">
                      <div className={`flex items-center justify-between border rounded-lg p-1.5 h-[37px] ${
                        isMono ? 'border-white/40 bg-black' : isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setRamSticks(Math.max(1, ramSticks - 1))}
                          className="p-1 hover:text-[#FF5500] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black font-mono">{ramSticks}</span>
                        <button
                          type="button"
                          onClick={() => setRamSticks(Math.min(8, ramSticks + 1))}
                          className="p-1 hover:text-[#FF5500] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {ramType && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Memory Profile</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'standard', label: 'Standard' },
                        { id: 'xmp', label: 'EXPO / XMP' },
                        { id: 'rgb', label: 'Extreme RGB' }
                      ].map(prof => (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => setRamProfile(prof.id as any)}
                          className={`py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all ${
                            ramProfile === prof.id
                              ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500]'
                              : isMono
                                ? 'border-white/20 text-neutral-400 hover:border-white'
                                : 'border-zinc-800 text-zinc-400 hover:bg-zinc-500/5'
                          }`}
                        >
                          {prof.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Card 3: Storage Configuration (Highly Categorized!) */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2.5 mb-4">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isMono ? 'font-mono' : 'font-sans'}`}>
                3. Storage Arrays &amp; Drives
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* M.2 NVMe Gen 5 */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">M.2 Gen 5 NVMe</span>
                  <span className="text-[8px] text-zinc-500 font-mono">12W peak load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNvmeGen5Count(Math.max(0, nvmeGen5Count - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{nvmeGen5Count}</span>
                  <button
                    type="button"
                    onClick={() => setNvmeGen5Count(Math.min(6, nvmeGen5Count + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* M.2 NVMe Gen 4/3 */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">M.2 Gen 4/3 NVMe</span>
                  <span className="text-[8px] text-zinc-500 font-mono">7.5W peak load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNvmeGen4Count(Math.max(0, nvmeGen4Count - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{nvmeGen4Count}</span>
                  <button
                    type="button"
                    onClick={() => setNvmeGen4Count(Math.min(10, nvmeGen4Count + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 2.5" SATA SSD */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">2.5" SATA SSD</span>
                  <span className="text-[8px] text-zinc-500 font-mono">4W peak load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSataSsdCount(Math.max(0, sataSsdCount - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{sataSsdCount}</span>
                  <button
                    type="button"
                    onClick={() => setSataSsdCount(Math.min(10, sataSsdCount + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* HDD 7200 RPM */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">HDD 7200 RPM</span>
                  <span className="text-[8px] text-zinc-500 font-mono">10W spindle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHdd7200Count(Math.max(0, hdd7200Count - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{hdd7200Count}</span>
                  <button
                    type="button"
                    onClick={() => setHdd7200Count(Math.min(8, hdd7200Count + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* HDD 5400 RPM */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">HDD 5400 RPM</span>
                  <span className="text-[8px] text-zinc-500 font-mono">6W spindle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHdd5400Count(Math.max(0, hdd5400Count - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{hdd5400Count}</span>
                  <button
                    type="button"
                    onClick={() => setHdd5400Count(Math.min(8, hdd5400Count + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SAS Enterprise Drives */}
              <div className="border border-zinc-500/10 p-2.5 rounded-xl flex items-center justify-between">
                <div className="text-left leading-tight pr-2">
                  <span className="text-[10px] font-bold block uppercase">SAS Enterprise</span>
                  <span className="text-[8px] text-zinc-500 font-mono">15W high-seek</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSasEnterpriseCount(Math.max(0, sasEnterpriseCount - 1))}
                    className={counterBtnStyle}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-3.5 text-center">{sasEnterpriseCount}</span>
                  <button
                    type="button"
                    onClick={() => setSasEnterpriseCount(Math.min(6, sasEnterpriseCount + 1))}
                    className={counterBtnStyle}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Cooling Equipment & Chassis Fans */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2.5 mb-4">
              <Wind className="w-4 h-4 text-teal-400" />
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isMono ? 'font-mono' : 'font-sans'}`}>
                4. Thermal Coolers &amp; Chassis Fans
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CPU Cooling Solution */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wide block">
                  CPU Cooler Equipment
                </label>
                <select
                  value={coolingType}
                  onChange={(e) => setCoolingType(e.target.value)}
                  className={`w-full ${inputStyle} cursor-pointer`}
                >
                  <option value="stock">Intel/AMD OEM stock cooler (4W)</option>
                  <option value="air_single">Compact single-tower Air cooler (6W)</option>
                  <option value="air_dual">Premium double-tower Air cooler (Noctua D15, 12W)</option>
                  <option value="aio_120">Single 120/140mm Liquid AIO (15W)</option>
                  <option value="aio_240">Standard 240/280mm Dual Liquid AIO (22W)</option>
                  <option value="aio_360">High-end 360/420mm Triple Liquid AIO (30W)</option>
                  <option value="custom_loop">Custom Loop liquid system - Single Pump (35W)</option>
                  <option value="extreme_loop">Extreme custom loop - Dual Pumps (60W)</option>
                </select>
              </div>

              {/* Chassis Case Fans */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wide block">
                  Chassis Case Fans (Quiet / ARGB)
                </label>
                
                <div className="grid grid-cols-12 gap-1.5">
                  <div className="col-span-8">
                    <select
                      value={caseFanType}
                      onChange={(e) => setCaseFanType(e.target.value as any)}
                      className={`w-full ${inputStyle} cursor-pointer`}
                    >
                      <option value="std_120">120mm PWM Standard (2W)</option>
                      <option value="argb_120">120mm PWM ARGB Glow (3.5W)</option>
                      <option value="std_140">140mm PWM Standard (2.5W)</option>
                      <option value="argb_140">140mm PWM ARGB Glow (4.5W)</option>
                      <option value="industrial">High-Amp Industrial PPC (8W)</option>
                    </select>
                  </div>

                  <div className="col-span-4">
                    <div className={`flex items-center justify-between border rounded-lg p-1.5 h-[37px] ${
                      isMono ? 'border-white/40 bg-black' : isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setCaseFans(Math.max(0, caseFans - 1))}
                        className="p-1 hover:text-[#FF5500] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black font-mono">{caseFans}</span>
                      <button
                        type="button"
                        onClick={() => setCaseFans(Math.min(18, caseFans + 1))}
                        className="p-1 hover:text-[#FF5500] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 5: Aesthetic RGB Accessories, USB Ports & Expansion PCIe Cards */}
          <div className={cardStyle}>
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2.5 mb-4">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isMono ? 'font-mono' : 'font-sans'}`}>
                5. Accessories, Peripherals &amp; expansion
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Counters & Aesthetic Sliders */}
              <div className="space-y-3">
                {/* RGB LED Strips */}
                <div className="flex justify-between items-center border-b border-zinc-500/5 pb-2">
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold block uppercase">ARGB Diffuser LED Strips</span>
                    <span className="text-[8px] text-zinc-500 font-mono">4.5W per strip</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRgbStrips(Math.max(0, rgbStrips - 1))}
                      className={counterBtnStyle}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono w-3.5 text-center">{rgbStrips}</span>
                    <button
                      type="button"
                      onClick={() => setRgbStrips(Math.min(12, rgbStrips + 1))}
                      className={counterBtnStyle}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* High Draw USB Accessories */}
                <div className="flex justify-between items-center border-b border-zinc-500/5 pb-2">
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold block uppercase">High-Power USB Devices</span>
                    <span className="text-[8px] text-zinc-500 font-mono">Audio/VR/Lights (10W)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUsbHighDrawCount(Math.max(0, usbHighDrawCount - 1))}
                      className={counterBtnStyle}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono w-3.5 text-center">{usbHighDrawCount}</span>
                    <button
                      type="button"
                      onClick={() => setUsbHighDrawCount(Math.min(8, usbHighDrawCount + 1))}
                      className={counterBtnStyle}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* RGB Fan Controller */}
                <div className="flex justify-between items-center">
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-bold block uppercase">Unified ARGB Controller/Hub</span>
                    <span className="text-[8px] text-zinc-500 font-mono">8W standalone</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRgbController(!rgbController)}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all active:scale-95 ${
                      rgbController
                        ? 'bg-[#FF5500]/10 border-[#FF5500]/20 text-[#FF5500]'
                        : isMono
                          ? 'border-white/20 text-neutral-500'
                          : 'bg-zinc-500/5 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {rgbController ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* PCIe Expansion Checkbox Grid */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-500 block text-left">
                  PCIe Add-on Cards
                </span>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/5 bg-black/5 hover:bg-zinc-500/5 cursor-pointer transition-colors select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasSoundCard}
                        onChange={(e) => setHasSoundCard(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs">Professional PCIe Sound Card / DAC</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">+10W</span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/5 bg-black/5 hover:bg-zinc-500/5 cursor-pointer transition-colors select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasCaptureCard}
                        onChange={(e) => setHasCaptureCard(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs">4K Video Capture card (Elgato)</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">+15W</span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/5 bg-black/5 hover:bg-zinc-500/5 cursor-pointer transition-colors select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasWifiCard}
                        onChange={(e) => setHasWifiCard(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs">Wi-Fi 7 / 10G Super Network Card</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">+12W</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Diagnostic Results HUD Dashboard (Right: 5cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main calculated results & glowing SVG dial */}
          <div className={`p-6 rounded-2xl border ${
            isMono 
              ? 'bg-black border-white text-white' 
              : isDark 
                ? 'bg-zinc-900/30 border-zinc-900 shadow-xl' 
                : 'bg-slate-50 border-slate-200/90 shadow-lg'
          } relative overflow-hidden flex flex-col items-center text-center`}>
            
            <div className="absolute top-3 left-3 bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 rounded-lg py-0.5 px-2 text-[9px] font-mono uppercase tracking-widest">
              Live Diagnostics Load HUD
            </div>

            {/* Glowing gauge radial ring */}
            <div className="relative w-40 h-40 flex items-center justify-center mt-6">
              
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="5"
                  stroke={isMono ? '#1c1c1e' : isDark ? '#18181b' : '#f1f5f9'}
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="6"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * Math.min(wattageBreakdown.totalPeak, 1300)) / 1300}
                  stroke={
                    isFormEmpty 
                      ? (isDark ? '#27272a' : '#e2e8f0')
                      : wattageBreakdown.totalPeak > 750 
                        ? '#ef4444' 
                        : wattageBreakdown.totalPeak > 450 
                          ? '#f97316' 
                          : '#10b981'
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Peak Demand</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={wattageBreakdown.totalPeak}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black font-mono tracking-tighter"
                  >
                    {wattageBreakdown.totalPeak}W
                  </motion.span>
                </AnimatePresence>
                
                {selectedGpu && (
                  <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-500 px-1.5 py-0.5 rounded-md mt-1 font-mono tracking-wider">
                    ~{estimatedTransientSpike}W Spike Peak
                  </span>
                )}
              </div>
            </div>

            {/* Recommended Size Box */}
            <div className="w-full border-t border-zinc-500/10 mt-5 pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                Recommended Power Supply (SMPS)
              </span>
              <div className="text-4xl font-black font-mono tracking-tighter text-[#FF5500]">
                {recommendedPower.suggestedPsuSize === 0 ? '0W' : `${recommendedPower.suggestedPsuSize}W`}
              </div>
              <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-normal font-sans">
                {isFormEmpty 
                  ? 'Total calculated wattage is 0W. Choose core engines to evaluate.'
                  : `Includes peak combined load of ${wattageBreakdown.totalPeak}W + a target safety headroom overhead of +${safetyMargin}% (${recommendedPower.rawRecommended}W recommended).`
                }
              </p>
            </div>
          </div>

          {/* Safety overhead margin settings slider */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                Custom Overhead Safety Headroom
              </span>
              <span className="text-xs font-black font-mono text-[#FF5500]">+{safetyMargin}%</span>
            </div>
            
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              disabled={isFormEmpty}
              value={safetyMargin}
              onChange={(e) => setSafetyMargin(Number(e.target.value))}
              className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF5500] ${
                isFormEmpty ? 'opacity-35 cursor-not-allowed' : ''
              }`}
            />
            
            <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase">
              <span>Eco (10%)</span>
              <span>Optimal Sweet Spot (25%)</span>
              <span>Ultra Upgradeable (50%)</span>
            </div>
          </div>

          {/* Certification Badge Display */}
          <div className={`p-4 rounded-2xl border ${
            isMono ? 'bg-black border-white' : isDark ? 'bg-zinc-900/10 border-zinc-800/80' : 'bg-slate-50 border-slate-200/60'
          } text-left space-y-2.5`}>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white bg-gradient-to-r ${psuEfficiencyAdvice.color} border border-white/5`}>
                {psuEfficiencyAdvice.tier}
              </span>
              <Gauge className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              {psuEfficiencyAdvice.desc}
            </p>
          </div>

          {/* Intelligent Hardware Advisories & Warnings Panel */}
          {!isFormEmpty && (
            <div className="text-left space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                Dynamic Builder Advisories
              </h4>
              <div className="space-y-1.5">
                {/* ATX 3.0 warning */}
                {selectedGpu && selectedGpu.isNvidia12VHPWR && (
                  <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-300 block">ATX 3.0 PCIe 5.0 Requirement</span>
                      <span className="text-[10px] text-blue-400 leading-normal block">
                        This GPU uses the high-power 12VHPWR / 12V2x6 cable standard. A modern ATX 3.0 certified PSU is highly recommended to eliminate unsafe 3x/4x adapter bundle cable mess.
                      </span>
                    </div>
                  </div>
                )}

                {/* Overclock warnings */}
                {overclockCpu && selectedCpu && selectedCpu.peak > 200 && (
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">High CPU Thermal Requirements</span>
                      <span className="text-[10px] text-amber-400 leading-normal block">
                        Overclocking premium silicon can exceed 300W peak. Ensure your motherboard has dual 8-pin EPS 12V connections and a minimum 360mm Liquid AIO for thermal stability.
                      </span>
                    </div>
                  </div>
                )}

                {/* PCIe 5.0 SSD thermal warning */}
                {nvmeGen5Count > 0 && (
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">M.2 PCIe 5.0 Thermal Warning</span>
                      <span className="text-[10px] text-amber-400 leading-normal block">
                        Gen 5 NVMe drives draw up to 12W and generate extreme heat. Heatsinks with active fans or direct liquid blocks are mandatory to prevent heavy speed throttling.
                      </span>
                    </div>
                  </div>
                )}

                {/* Efficiency sweet spot reminder */}
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300 block">Power Efficiency Sweet-Spot Match</span>
                    <span className="text-[10px] text-emerald-400 leading-normal block">
                      Estimated continuous gaming/load zone sits perfectly within the optimal 40% - 60% conversion spectrum of a {recommendedPower.suggestedPsuSize}W supply, yielding peak 80 Plus conservation.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Component Continuous Energy Breakdown list */}
          {!isFormEmpty && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 text-left"
            >
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                Peak Energy Draw Allocation
              </h4>
              <div className={`p-4 rounded-xl border ${
                isMono ? 'border-white/20' : 'border-zinc-500/5 bg-black/10'
              } space-y-2.5`}>
                {/* cpu */}
                {wattageBreakdown.cpu > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>Processor (CPU Core)</span>
                      <span className="font-bold">{wattageBreakdown.cpu}W</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${(wattageBreakdown.cpu / wattageBreakdown.totalPeak) * 100}%` }} />
                    </div>
                  </div>
                )}
                {/* gpu */}
                {wattageBreakdown.gpu > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>Graphics Card (GPU Core)</span>
                      <span className="font-bold">{wattageBreakdown.gpu}W</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(wattageBreakdown.gpu / wattageBreakdown.totalPeak) * 100}%` }} />
                    </div>
                  </div>
                )}
                {/* other modules */}
                {(wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>Motherboard, RAM, Storage &amp; Fans</span>
                      <span className="font-bold">
                        {wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories}W
                      </span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ 
                        width: `${((wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories) / wattageBreakdown.totalPeak) * 100}%` 
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Local Doorstep Integration Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF5500]/5 to-indigo-500/5 border border-[#FF5500]/15 text-left space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase text-[#FF5500] tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Assam Doorstep Assembly Integration</span>
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
              Avoid incorrect motherboard socket pins or critical cable wiring shorts. Murari provides premium cabinetry cable routing, custom liquid loop debugging, and absolute performance evaluation locally.
            </p>

            <button
              onClick={handleWhatsAppInquiry}
              disabled={isFormEmpty}
              className={`w-full py-2.5 px-4 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md transition-all ${
                isFormEmpty 
                  ? 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500' 
                  : 'bg-[#FF5500] hover:bg-[#FF4400] text-white hover:shadow-[#FF5500]/20 active:scale-98 cursor-pointer'
              }`}
            >
              <WhatsAppIcon size={12} />
              <span className="text-center">Inquire Assembly Support</span>
            </button>
          </div>

        </div>

      </div>


    </div>
  );
}
