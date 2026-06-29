import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ExternalLink, Check, Copy, Share2, QrCode } from 'lucide-react';

interface ReviewQRCodeProps {
  currentTheme?: 'light' | 'normal' | 'mono';
  triggerToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ReviewQRCode: React.FC<ReviewQRCodeProps> = ({
  currentTheme = 'normal',
  triggerToast
}) => {
  const targetUrl = 'https://g.page/r/CW6idauiDG_FEBM/review';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(targetUrl)}`;
  
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      if (triggerToast) {
        triggerToast("Review link copied!", "success");
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (triggerToast) {
        triggerToast("Failed to copy link.", "error");
      }
    }
  };

  const handleDownloadQR = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'pixel_review_qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      if (triggerToast) {
        triggerToast("QR Code downloaded!", "success");
      }
    } catch (err) {
      window.open(qrImageUrl, '_blank');
      if (triggerToast) {
        triggerToast("QR Code opened in new tab.", "info");
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Review Pixel Fix & Frame',
          url: targetUrl,
        });
      } catch (err) {
        // Ignore share abort
      }
    } else {
      handleCopyLink(e);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 25 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  const qrContainerVariants = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 14
      }
    }
  };

  const actionsBarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const actionButtonVariants = {
    hidden: { scale: 0.75, opacity: 0, y: 8 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 140,
        damping: 12
      }
    }
  };

  const isLight = currentTheme === 'light';
  const isMono = currentTheme === 'mono';

  return (
    <motion.div 
      className={`ReviewQRCode-container w-full max-w-[330px] mx-auto flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all duration-300 ${
        isLight 
          ? 'bg-slate-50/80 border-slate-200/50 shadow-md shadow-slate-100/40' 
          : isMono
          ? 'bg-white/[0.02] border-zinc-800/60 backdrop-blur-sm'
          : 'bg-white/[0.03] border-white/5 backdrop-blur-md shadow-2xl shadow-black/10'
      }`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={containerVariants}
      whileHover={{
        y: -8,
        scale: 1.03,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      <motion.div 
        id="google-maps-review-qr-card"
        variants={cardVariants}
        className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 p-6 flex flex-col items-center gap-5 shadow-2xl ${
          isLight 
            ? 'bg-white border-slate-200/80 text-slate-800' 
            : isMono
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100'
            : 'bg-gradient-to-b from-slate-950/40 to-slate-950/90 border-white/5 text-slate-100'
        }`}
        style={{ width: '280px' }}
      >
        {/* Subtle background gradient glow for visual interest */}
        {!isLight && !isMono && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5500]/5 via-transparent to-indigo-500/5 rounded-full blur-2xl pointer-events-none z-0" />
        )}

        {/* Headline Section */}
        <div className="text-center space-y-1 z-10 select-none">
          <h4 className={`text-sm font-black uppercase tracking-widest ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Review Us on Google
          </h4>
          <p className={`text-[10px] font-medium leading-normal ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Scan QR code to rate & share feedback
          </p>
        </div>

        {/* QR Code Container */}
        <motion.div className="relative z-10 w-full flex flex-col items-center" variants={qrContainerVariants}>
          <motion.div 
            className={`relative p-3 rounded-2xl bg-white shadow-xl overflow-hidden border-2 transition-all ${
              isLight ? 'border-slate-100' : 'border-white/5 hover:border-[#FF5500]/25'
            }`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => window.open(targetUrl, '_blank')}
            title="Scan or click to open Google Business Review"
          >
            {/* Ambient sliding laser animation */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF5500] to-transparent animate-pulse" style={{ animationDuration: '2.5s' }} />

            {/* Scan guidance overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-3 z-20"
                >
                  <ExternalLink size={24} className="text-[#FF5500] mb-1.5 animate-bounce" />
                  <span className="text-[9px] font-black tracking-widest text-white uppercase font-sans">OPEN REVIEW</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main QR Code Image */}
            <div className="relative w-44 h-44 bg-white rounded-lg flex items-center justify-center p-0.5">
              <img 
                src={qrImageUrl} 
                alt="Google Maps Review QR Code" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            
            {/* Embedded Logo Badge in Center */}
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md border border-slate-100 z-10 pointer-events-none">
              <span className="font-black text-[8px] tracking-tighter text-[#FF5500] leading-none uppercase text-center font-sans">
                PIXEL<br />FIX
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Minimal Actions Bar - Clean and Icon-Only */}
        <motion.div className="relative z-10 flex items-center justify-center gap-3 w-full" variants={actionsBarVariants}>
          <motion.a 
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            variants={actionButtonVariants}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center hover:-translate-y-0.5 ${
              isLight 
                ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white border border-slate-200 text-slate-700 shadow-sm' 
                : 'bg-white/5 hover:bg-[#FF5500] hover:text-white border border-white/5 text-slate-200'
            }`}
            title="Open Review Link"
          >
            <ExternalLink size={14} />
          </motion.a>

          <motion.button
            type="button"
            onClick={handleDownloadQR}
            variants={actionButtonVariants}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center hover:-translate-y-0.5 cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white border border-slate-200 text-slate-700 shadow-sm' 
                : 'bg-white/5 hover:bg-[#FF5500] hover:text-white border border-white/5 text-slate-200'
            }`}
            title="Download QR Code"
          >
            <Download size={14} />
          </motion.button>

          <motion.button
            type="button"
            onClick={handleCopyLink}
            variants={actionButtonVariants}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center hover:-translate-y-0.5 cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white border border-slate-200 text-slate-700 shadow-sm' 
                : 'bg-white/5 hover:bg-[#FF5500] hover:text-white border border-white/5 text-slate-200'
            }`}
            title="Copy Review Link"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleShare}
            variants={actionButtonVariants}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center hover:-translate-y-0.5 cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-[#FF5500] hover:text-white border border-slate-200 text-slate-700 shadow-sm' 
                : 'bg-white/5 hover:bg-[#FF5500] hover:text-white border border-white/5 text-slate-200'
            }`}
            title="Share"
          >
            <Share2 size={14} />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
