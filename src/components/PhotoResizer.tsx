import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  FileImage, 
  Check, 
  RotateCcw, 
  Download, 
  Maximize2, 
  Sliders, 
  Lock, 
  Unlock, 
  Settings, 
  Sparkles, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Scaling,
  Expand
} from 'lucide-react';

interface PhotoResizerProps {
  currentTheme: 'normal' | 'mono' | 'light';
}

interface PresetSize {
  id: string;
  name: string;
  width: number;
  height: number;
  quality?: number;
  description: string;
}

const PRESETS: PresetSize[] = [
  { id: 'custom', name: 'Custom Size', width: 1920, height: 1080, description: 'Freely adjust width and height' },
  { id: 'instagram_post', name: 'Instagram Post', width: 1080, height: 1080, description: '1:1 Square - Standard social feed' },
  { id: 'instagram_story', name: 'Instagram Story', width: 1080, height: 1920, description: '9:16 Portrait - Full screen story' },
  { id: 'facebook_cover', name: 'Facebook Cover', width: 820, height: 312, description: 'Banner ratio - Optimized for profile banners' },
  { id: 'twitter_header', name: 'Twitter / X Header', width: 1500, height: 500, description: '3:1 Ultra-wide top header banner' },
  { id: 'tiny_avatar', name: 'Tiny Email Avatar', width: 80, height: 80, description: 'Ultra small square profile icon' },
  { id: 'extreme_compression', name: 'Extreme Comp (~2KB)', width: 120, height: 120, quality: 10, description: 'Ultra-small thumbnail, target ~2KB size' },
];

export default function PhotoResizer({ currentTheme }: PhotoResizerProps) {
  const isDark = currentTheme !== 'light';
  const accentColor = '#FF5500';

  // State Management
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageType, setImageType] = useState<string>('image/jpeg');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Compression Controls State
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(true);
  const [quality, setQuality] = useState<number>(80);
  const [exportFormat, setExportFormat] = useState<string>('image/jpeg');

  // Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [optimizedWidth, setOptimizedWidth] = useState<number>(0);
  const [optimizedHeight, setOptimizedHeight] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // UI Interactive States
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<'fit' | 'fill' | 'original'>('fit');
  const [activePreviewTab, setActivePreviewTab] = useState<'optimized' | 'before_after'>('before_after');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Aspect ratio calculated state
  const originalAspectRatio = originalWidth && originalHeight ? originalWidth / originalHeight : 1;

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process File Upload Helper
  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage('');
    setImageName(file.name.substring(0, file.name.lastIndexOf('.')) || 'image');
    setImageType(file.type);
    setOriginalSize(file.size);
    setExportFormat(file.type === 'image/png' ? 'image/png' : 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);

      // Read dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        
        // Default resized sizes to fit standard dimensions smoothly
        if (img.width > 1920 || img.height > 1080) {
          const ratio = Math.min(1920 / img.width, 1080 / img.height);
          setWidth(Math.round(img.width * ratio));
          setHeight(Math.round(img.height * ratio));
        } else {
          setWidth(img.width);
          setHeight(img.height);
        }
        setSelectedPreset('custom');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Click
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger input selection
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Update dimension constraints based on lock state
  const handleWidthChange = (val: number) => {
    if (val <= 0 || isNaN(val)) {
      setWidth(0);
      return;
    }
    setWidth(val);
    if (aspectRatioLocked && originalAspectRatio) {
      setHeight(Math.round(val / originalAspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    if (val <= 0 || isNaN(val)) {
      setHeight(0);
      return;
    }
    setHeight(val);
    if (aspectRatioLocked && originalAspectRatio) {
      setWidth(Math.round(val * originalAspectRatio));
    }
  };

  // Handle preset change
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (presetId === 'custom') {
      setWidth(originalWidth || 1080);
      setHeight(originalHeight || 1080);
      return;
    }

    setWidth(preset.width);
    setHeight(preset.height);
    
    if (preset.quality !== undefined) {
      setQuality(preset.quality);
      setExportFormat('image/jpeg'); // Jpeg supports extreme compression best
    }
  };

  // Clear loaded image and reset state
  const resetImage = () => {
    setOriginalImage(null);
    setOptimizedImage(null);
    setImageName('');
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalSize(0);
    setWidth(1080);
    setHeight(1080);
    setQuality(80);
    setExportFormat('image/jpeg');
    setSelectedPreset('custom');
    setProgress(0);
    setIsProcessing(false);
    setErrorMessage('');
  };

  // Compression engine triggered on input state changes
  useEffect(() => {
    if (!originalImage || width <= 0 || height <= 0) return;

    const timer = setTimeout(() => {
      runOptimization();
    }, 150); // debounce input changes slightly for visual fluidity

    return () => clearTimeout(timer);
  }, [originalImage, width, height, quality, exportFormat]);

  // Core Canvas Resizer & Optimization Process
  const runOptimization = () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProgress(15);

    const img = new Image();
    img.src = originalImage;
    imgRef.current = img;

    img.onload = () => {
      setProgress(40);
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setErrorMessage('Could not initialize canvas graphics rendering context.');
        setIsProcessing(false);
        return;
      }

      // Smooth resizing algorithm
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw original image resized into canvas boundary
      ctx.drawImage(img, 0, 0, width, height);
      setProgress(75);

      // Perform direct lossy/lossless canvas compression
      // Quality goes from 0.0 to 1.0 in browsers
      const compressionQuality = quality / 100;
      
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setOptimizedImage(url);
              setOptimizedSize(blob.size);
              setOptimizedWidth(width);
              setOptimizedHeight(height);
              setProgress(100);
              
              // End loading animation after brief delay for natural visual transition
              setTimeout(() => {
                setIsProcessing(false);
              }, 200);
            } else {
              setErrorMessage('Failed to generate optimized image blob.');
              setIsProcessing(false);
            }
          },
          exportFormat,
          exportFormat === 'image/png' ? undefined : compressionQuality
        );
      } catch (err) {
        console.error(err);
        setErrorMessage('An error occurred during canvas compression compilation.');
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setErrorMessage('Failed to load image element assets source.');
      setIsProcessing(false);
    };
  };

  // Download action trigger
  const triggerDownload = () => {
    if (!optimizedImage) return;
    const link = document.createElement('a');
    
    // Construct optimized file suffix
    const extension = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    link.href = optimizedImage;
    link.download = `${imageName}_optimized_${width}x${height}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper formatting for file size readouts
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Quality rating label helper
  const getQualityLabel = () => {
    if (exportFormat === 'image/png') return 'Lossless (PNG)';
    if (quality <= 10) return `Ultra Small (Target ~2KB)`;
    if (quality <= 30) return 'Low Quality (Maximum Compression)';
    if (quality <= 65) return 'Medium Quality (Optimized Balance)';
    if (quality <= 85) return 'High Quality (Professional Portfolio)';
    return 'Lossless Preset / Maximum Quality';
  };

  // Compression savings percentage
  const sizeReductionPercent = originalSize && optimizedSize 
    ? Math.max(0, ((originalSize - optimizedSize) / originalSize) * 100) 
    : 0;

  return (
    <div id="photo-resizer-tool" className="w-full text-left space-y-6">
      {/* Invisible Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container */}
      <div className={`border rounded-3xl ${isDark ? 'bg-zinc-950/40 border-white/5' : 'bg-slate-50 border-slate-200'} p-6 md:p-8 relative overflow-hidden`}>
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-dashed border-slate-200/50 dark:border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#FF5500]" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF5500] font-bold">Advanced Utility</span>
            </div>
            <h3 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              High-Speed Image Optimizer & Resizer
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Compress portfolio files instantly to light, web-optimized sizes. Seamlessly resize dimensions, lock aspect ratios, or downsize files for high-speed online load times.
            </p>
          </div>
          {originalImage && (
            <button
              onClick={resetImage}
              className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark 
                  ? 'border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-950/20' 
                  : 'border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 shadow-sm'
              }`}
            >
              <Trash2 size={13} /> Reset Image
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!originalImage ? (
            /* DRAG AND DROP ZONE */
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`w-full aspect-video md:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[#FF5500] bg-[#FF5500]/5 scale-[0.99] shadow-inner'
                    : isDark 
                      ? 'border-white/10 hover:border-[#FF5500]/40 bg-white/2 hover:bg-[#FF5500]/2' 
                      : 'border-slate-200 hover:border-[#FF5500]/40 bg-white hover:bg-slate-50 shadow-sm'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-zinc-900 text-slate-300 border border-white/5' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-[#FF5500] animate-bounce' : ''}`} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Drag and drop your photography image here
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Supports JPEG, PNG, or WebP files • Up to 25 MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex bg-[#FF5500] text-white text-xs font-extrabold uppercase px-5 py-2.5 rounded-lg shadow hover:bg-[#FF4400] transition-colors"
                  >
                    Select File From Device
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* INTERACTIVE WORKSPACE AREA */
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
            >
              {/* CONTROLS COLUMN (LEFT) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Image Specs Card */}
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                } space-y-3`}>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-1.5`}>
                    <FileImage size={13} className="text-[#FF5500]" /> Source Image Info
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase font-mono`}>Filename</span>
                      <strong className={`block truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={imageName}>{imageName}</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase font-mono`}>Original Size</span>
                      <strong className="block text-slate-500">{formatFileSize(originalSize)}</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase font-mono`}>Original Dimensions</span>
                      <strong className="block text-[#FF5500] font-mono">{originalWidth} x {originalHeight} px</strong>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase font-mono`}>Aspect Ratio</span>
                      <strong className="block text-slate-500 font-mono">{originalAspectRatio.toFixed(2)}:1</strong>
                    </div>
                  </div>
                </div>

                {/* Sizing Preset Selector */}
                <div className="space-y-2">
                  <label className={`text-xs font-black uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                    <Scaling size={13} className="text-[#FF5500]" /> Dimensions Preset
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className={`w-full text-xs font-bold p-3 rounded-xl border appearance-none outline-none focus:ring-1 focus:ring-[#FF5500]/30 transition-all ${
                        isDark 
                          ? 'bg-zinc-900 border-white/5 text-white focus:border-[#FF5500]' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#FF5500] shadow-sm'
                      }`}
                    >
                      {PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                  <p className={`text-[10px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {PRESETS.find(p => p.id === selectedPreset)?.description}
                  </p>
                </div>

                {/* Manual Size Inputs */}
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                } space-y-4`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-1.5`}>
                      <Settings size={13} className="text-[#FF5500]" /> Target Dimensions
                    </h4>
                    
                    {/* Aspect Ratio Lock Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatioLocked(!aspectRatioLocked);
                        // Force update dimensions relative to lock trigger
                        if (!aspectRatioLocked && originalAspectRatio) {
                          setHeight(Math.round(width / originalAspectRatio));
                        }
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                        aspectRatioLocked
                          ? 'bg-[#FF5500]/10 border-[#FF5500]/25 text-[#FF5500]'
                          : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      {aspectRatioLocked ? <Lock size={10} /> : <Unlock size={10} />}
                      <span>{aspectRatioLocked ? 'Lock Ratio' : 'Free Ratio'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Width (px)</span>
                      <input
                        type="number"
                        value={width || ''}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                        min="1"
                        max="8000"
                        className={`w-full text-xs font-mono font-bold p-2.5 rounded-lg border outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20 transition-all ${
                          isDark ? 'bg-zinc-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Height (px)</span>
                      <input
                        type="number"
                        value={height || ''}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                        min="1"
                        max="8000"
                        className={`w-full text-xs font-mono font-bold p-2.5 rounded-lg border outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/20 transition-all ${
                          isDark ? 'bg-zinc-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Compression Specs */}
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                } space-y-4`}>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-1.5`}>
                    <Sliders size={13} className="text-[#FF5500]" /> Format & Quality Controls
                  </h4>

                  {/* Format Selector */}
                  <div className="space-y-2">
                    <span className={`block text-[10px] uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Export File Format</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'image/jpeg', label: 'JPEG (Best Comp)' },
                        { id: 'image/webp', label: 'WEBP (Modern)' },
                        { id: 'image/png', label: 'PNG (Lossless)' }
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setExportFormat(fmt.id)}
                          className={`py-2 text-[10px] font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
                            exportFormat === fmt.id
                              ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-md'
                              : isDark
                                ? 'bg-zinc-950 border-white/5 text-slate-400 hover:text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {fmt.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Compression Quality</span>
                      <span className="font-extrabold text-[#FF5500] font-mono bg-[#FF5500]/10 px-2 py-0.5 rounded-md">
                        {exportFormat === 'image/png' ? 'N/A' : `${quality}%`}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      disabled={exportFormat === 'image/png'}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full accent-[#FF5500] h-1.5 rounded-lg bg-slate-200 dark:bg-zinc-850 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    />

                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {getQualityLabel()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREVIEW & METRICS COLUMN (RIGHT) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                
                {/* Real-time Compression Metrics Banner */}
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#FF5500]/5 border-[#FF5500]/20' : 'bg-orange-50/50 border-orange-200 shadow-sm'
                } flex items-center justify-between gap-4 relative overflow-hidden`}>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-[#FF5500]" />
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#FF5500]">
                        Optimization Metrics
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatFileSize(optimizedSize)}
                      </span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        (was {formatFileSize(originalSize)})
                      </span>
                    </div>
                  </div>

                  {sizeReductionPercent > 0 && (
                    <div className="bg-[#FF5500] text-white px-3 py-2 rounded-xl text-center shadow-lg relative z-10">
                      <span className="block text-[8px] font-bold uppercase tracking-wider opacity-90">Shrunk by</span>
                      <span className="text-sm font-black font-mono">
                        {sizeReductionPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Backdrop accent icon */}
                  <Sparkles className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-[#FF5500]/5 pointer-events-none" />
                </div>

                {/* Tab select before/after vs output preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActivePreviewTab('before_after')}
                        className={`px-3 py-1.5 text-xs uppercase font-extrabold rounded-lg transition-colors cursor-pointer ${
                          activePreviewTab === 'before_after'
                            ? 'bg-[#FF5500]/10 text-[#FF5500]'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Side-By-Side Info
                      </button>
                      <button
                        onClick={() => setActivePreviewTab('optimized')}
                        className={`px-3 py-1.5 text-xs uppercase font-extrabold rounded-lg transition-colors cursor-pointer ${
                          activePreviewTab === 'optimized'
                            ? 'bg-[#FF5500]/10 text-[#FF5500]'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Full Optimized View
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isProcessing && (
                        <div className="flex items-center gap-1 text-[10px] text-[#FF5500] font-bold font-mono">
                          <RefreshCw size={11} className="animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Display stage */}
                  <div className={`relative aspect-video rounded-2xl border ${
                    isDark ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'
                  } overflow-hidden flex items-center justify-center p-2`}>
                    
                    {activePreviewTab === 'before_after' ? (
                      /* SIDE BY SIDE METRICS VIEW */
                      <div className="w-full h-full grid grid-cols-2 gap-2 text-center">
                        {/* Before Frame */}
                        <div className="relative h-full rounded-xl overflow-hidden flex flex-col justify-between border border-dashed border-slate-200 dark:border-white/5 p-2 bg-black/10">
                          <div className="w-full flex-1 min-h-0 flex items-center justify-center relative">
                            {originalImage && (
                              <img
                                src={originalImage}
                                alt="Original Preview"
                                className="max-w-full max-h-32 object-contain rounded-lg filter drop-shadow"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div className="pt-2 text-center">
                            <span className="inline-block px-2 py-0.5 text-[8px] font-bold bg-slate-500/20 text-slate-400 rounded-md mb-1">ORIGINAL SOURCE</span>
                            <p className={`text-[10px] font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                              {originalWidth} x {originalHeight} px
                            </p>
                            <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono`}>
                              {formatFileSize(originalSize)}
                            </p>
                          </div>
                        </div>

                        {/* After Frame */}
                        <div className="relative h-full rounded-xl overflow-hidden flex flex-col justify-between border border-dashed border-[#FF5500]/20 p-2 bg-[#FF5500]/2">
                          <div className="w-full flex-1 min-h-0 flex items-center justify-center relative">
                            {optimizedImage && (
                              <img
                                src={optimizedImage}
                                alt="Optimized Preview"
                                className="max-w-full max-h-32 object-contain rounded-lg filter drop-shadow"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div className="pt-2 text-center">
                            <span className="inline-block px-2 py-0.5 text-[8px] font-extrabold bg-[#FF5500]/20 text-[#FF5500] rounded-md mb-1">COMPRESSED FILE</span>
                            <p className={`text-[10px] font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                              {optimizedWidth} x {optimizedHeight} px
                            </p>
                            <p className={`text-[9px] text-[#FF5500] font-mono font-black`}>
                              {formatFileSize(optimizedSize)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* FULL VIEW WITH ZOOM SETTINGS */
                      <div className="w-full h-full flex items-center justify-center relative">
                        {optimizedImage && (
                          <img
                            src={optimizedImage}
                            alt="Optimized Output File"
                            className={`rounded-lg filter drop-shadow transition-all max-w-full max-h-full ${
                              zoomMode === 'fit' ? 'object-contain h-full w-full' : zoomMode === 'fill' ? 'object-cover h-full w-full' : 'object-none'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Image overlay display format info pill */}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5">
                          <ImageIcon size={10} className="text-[#FF5500]" />
                          <span>{exportFormat.replace('image/', '').toUpperCase()} • {optimizedWidth}x{optimizedHeight}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={triggerDownload}
                    disabled={isProcessing || !optimizedImage}
                    className="flex-1 bg-[#FF5500] hover:bg-[#FF4400] disabled:bg-slate-400 text-white font-extrabold uppercase text-xs tracking-wider py-4 rounded-xl shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download Optimized Image
                  </button>

                  <button
                    type="button"
                    onClick={runOptimization}
                    disabled={isProcessing}
                    className={`px-5 py-4 text-xs font-extrabold uppercase rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isDark 
                        ? 'border-white/10 hover:border-white/25 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                    <span>Apply Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
