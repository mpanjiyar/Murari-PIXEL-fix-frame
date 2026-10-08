import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64Url: string) => void;
  currentTheme?: 'light' | 'dark' | 'normal' | 'mono' | string;
  label?: string;
}

export function ImageUploader({ value, onChange, currentTheme, label = "Upload Image" }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Compress if dimensions exceed 800px
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality to reduce string size significantly
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            onChange(compressedBase64);
          } else {
            onChange(result); // Fallback to raw base64 if canvas drawing fails
          }
        };
        img.onerror = () => {
          setError('Failed to process image structure.');
        };
        img.src = result;
      } else {
        setError('Failed to process image file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{label}</span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-rose-500 hover:text-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <X size={10} /> Clear Image
          </button>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[95px] overflow-hidden ${
          isDragActive
            ? 'border-[#FF5500] bg-[#FF5500]/5'
            : currentTheme === 'light'
            ? 'border-slate-300 hover:border-[#FF5500] hover:bg-slate-50 bg-white'
            : 'border-white/10 hover:border-[#FF5500] hover:bg-white/5 bg-black/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {value ? (
          <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-white/15 bg-slate-100 flex-shrink-0">
              <img
                src={value}
                alt="Upload preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className={`text-[10px] font-bold block truncate ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                {isBase64 ? 'Local Upload Image File' : 'External Image URL Link'}
              </span>
              <span className="text-[9px] text-zinc-500 block truncate leading-tight">
                {isBase64 ? 'Compressed Base64 format string' : value}
              </span>
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-[9px] text-[#FF5500] font-black uppercase tracking-wider mt-1 hover:underline cursor-pointer"
              >
                Click to Replace Image File
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-1">
            <Upload size={18} className={isDragActive ? 'text-[#FF5500] animate-bounce' : 'text-slate-400'} />
            <div>
              <p className={`text-[10px] font-bold ${currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                Drag & Drop or <span className="text-[#FF5500] underline">Browse</span>
              </p>
              <p className="text-[8px] text-zinc-500 mt-0.5">Supports PNG, JPG, WEBP • Max 4MB</p>
            </div>
          </div>
        )}

        {isDragActive && (
          <div className="absolute inset-0 bg-[#FF5500]/5 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#FF5500] uppercase tracking-wider animate-pulse">Drop photo to import</span>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-[9px] text-rose-500 bg-rose-500/5 p-1.5 rounded-lg border border-rose-500/10">
          <AlertCircle size={10} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
