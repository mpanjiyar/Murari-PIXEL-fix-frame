import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';

// Premium Hardware Power Specs Database
interface CpuModel {
  id: string;
  name: string;
  tdp: number;
  peak: number;
  socket: string;
  series: string;
}

interface GpuModel {
  id: string;
  name: string;
  wattage: number;
  vram: string;
  series: string;
}

const CPU_DATABASE: CpuModel[] = [
  // Intel Core Ultra Series (LGA1851)
  { id: 'ultra-9-285k', name: 'Intel Core Ultra 9 285K', tdp: 125, peak: 250, socket: 'LGA1851', series: 'Intel Core Ultra' },
  { id: 'ultra-7-265k', name: 'Intel Core Ultra 7 265K', tdp: 125, peak: 240, socket: 'LGA1851', series: 'Intel Core Ultra' },
  { id: 'ultra-5-245k', name: 'Intel Core Ultra 5 245K', tdp: 125, peak: 159, socket: 'LGA1851', series: 'Intel Core Ultra' },
  { id: 'ultra-9-285', name: 'Intel Core Ultra 9 285', tdp: 65, peak: 200, socket: 'LGA1851', series: 'Intel Core Ultra' },
  { id: 'ultra-7-265', name: 'Intel Core Ultra 7 265', tdp: 65, peak: 195, socket: 'LGA1851', series: 'Intel Core Ultra' },
  { id: 'ultra-5-245', name: 'Intel Core Ultra 5 245', tdp: 65, peak: 145, socket: 'LGA1851', series: 'Intel Core Ultra' },

  // Intel Core 14th & 13th Gen (LGA1700)
  { id: 'i9-14900ks', name: 'Intel Core i9-14900KS (Extreme Edition)', tdp: 150, peak: 320, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i9-14900k', name: 'Intel Core i9-14900K / 13900K', tdp: 125, peak: 253, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i7-14700k', name: 'Intel Core i7-14700K / 13700K', tdp: 125, peak: 253, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i5-14600k', name: 'Intel Core i5-14600K / 13600K', tdp: 125, peak: 181, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i9-14900', name: 'Intel Core i9-14900 / 13900', tdp: 65, peak: 219, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i7-14700', name: 'Intel Core i7-14700 / 13700', tdp: 65, peak: 219, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i5-14500', name: 'Intel Core i5-14500 / 13500', tdp: 65, peak: 154, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i5-14400', name: 'Intel Core i5-14400 / 13400', tdp: 65, peak: 110, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },
  { id: 'i3-14100', name: 'Intel Core i3-14100 / 13100', tdp: 60, peak: 89, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen' },

  // Intel Core 12th Gen (LGA1700)
  { id: 'i9-12900ks', name: 'Intel Core i9-12900KS', tdp: 150, peak: 260, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i9-12900k', name: 'Intel Core i9-12900K', tdp: 125, peak: 241, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i7-12700k', name: 'Intel Core i7-12700K', tdp: 125, peak: 190, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i5-12600k', name: 'Intel Core i5-12600K', tdp: 125, peak: 150, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i9-12900', name: 'Intel Core i9-12900', tdp: 65, peak: 202, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i7-12700', name: 'Intel Core i7-12700', tdp: 65, peak: 180, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i5-12400', name: 'Intel Core i5-12400', tdp: 65, peak: 117, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  { id: 'i3-12100', name: 'Intel Core i3-12100', tdp: 58, peak: 89, socket: 'LGA1700', series: 'Intel Core 12th Gen' },
  
  // Intel Core 11th & 10th Gen (LGA1200)
  { id: 'i9-11900k', name: 'Intel Core i9-11900K', tdp: 125, peak: 250, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i7-11700k', name: 'Intel Core i7-11700K', tdp: 125, peak: 220, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i5-11600k', name: 'Intel Core i5-11600K', tdp: 125, peak: 182, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i5-11400', name: 'Intel Core i5-11400', tdp: 65, peak: 154, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i9-10900k', name: 'Intel Core i9-10900K', tdp: 125, peak: 250, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i7-10700k', name: 'Intel Core i7-10700K', tdp: 125, peak: 229, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i5-10600k', name: 'Intel Core i5-10600K', tdp: 125, peak: 182, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },
  { id: 'i5-10400', name: 'Intel Core i5-10400', tdp: 65, peak: 134, socket: 'LGA1200', series: 'Intel Core 11th/10th Gen' },

  // Intel Core 9th & 8th Gen (LGA1151-v2)
  { id: 'i9-9900ks', name: 'Intel Core i9-9900KS (Special Edition)', tdp: 127, peak: 250, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i9-9900k', name: 'Intel Core i9-9900K', tdp: 95, peak: 210, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i7-9700k', name: 'Intel Core i7-9700K', tdp: 95, peak: 190, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i5-9600k', name: 'Intel Core i5-9600K', tdp: 95, peak: 140, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i5-9400', name: 'Intel Core i5-9400', tdp: 65, peak: 95, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i3-9100', name: 'Intel Core i3-9100', tdp: 65, peak: 80, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i7-8700k', name: 'Intel Core i7-8700K', tdp: 95, peak: 145, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },
  { id: 'i5-8400', name: 'Intel Core i5-8400', tdp: 65, peak: 90, socket: 'LGA1151-v2', series: 'Intel Core 9th/8th Gen' },

  // Intel Legacy Core (LGA1151 / LGA1150 / LGA1155 / LGA1366 / LGA775)
  { id: 'i7-7700k', name: 'Intel Core i7-7700K', tdp: 91, peak: 130, socket: 'LGA1151', series: 'Intel Legacy Core' },
  { id: 'i5-7600k', name: 'Intel Core i5-7600K', tdp: 91, peak: 115, socket: 'LGA1151', series: 'Intel Legacy Core' },
  { id: 'i7-6700k', name: 'Intel Core i7-6700K', tdp: 91, peak: 120, socket: 'LGA1151', series: 'Intel Legacy Core' },
  { id: 'i5-6600k', name: 'Intel Core i5-6600K', tdp: 91, peak: 110, socket: 'LGA1151', series: 'Intel Legacy Core' },
  { id: 'i7-4790k', name: 'Intel Core i7-4790K (Haswell Devil\'s Canyon)', tdp: 88, peak: 125, socket: 'LGA1150', series: 'Intel Legacy Core' },
  { id: 'i7-4770k', name: 'Intel Core i7-4770K (Haswell Flagship)', tdp: 84, peak: 115, socket: 'LGA1150', series: 'Intel Legacy Core' },
  { id: 'i5-4690k', name: 'Intel Core i5-4690K', tdp: 88, peak: 110, socket: 'LGA1150', series: 'Intel Legacy Core' },
  { id: 'i5-4460', name: 'Intel Core i5-4460', tdp: 84, peak: 105, socket: 'LGA1150', series: 'Intel Legacy Core' },
  { id: 'i7-3770k', name: 'Intel Core i7-3770K (Ivy Bridge)', tdp: 77, peak: 110, socket: 'LGA1155', series: 'Intel Legacy Core' },
  { id: 'i5-3570k', name: 'Intel Core i5-3570K', tdp: 77, peak: 100, socket: 'LGA1155', series: 'Intel Legacy Core' },
  { id: 'i7-2600k', name: 'Intel Core i7-2600K (Sandy Bridge)', tdp: 95, peak: 125, socket: 'LGA1155', series: 'Intel Legacy Core' },
  { id: 'i5-2500k', name: 'Intel Core i5-2500K', tdp: 95, peak: 115, socket: 'LGA1155', series: 'Intel Legacy Core' },
  { id: 'i7-920', name: 'Intel Core i7-920 (Bloomsfield Classic)', tdp: 130, peak: 165, socket: 'LGA1366', series: 'Intel Legacy Core' },
  { id: 'q6600', name: 'Intel Core 2 Quad Q6600 (Kentsfield Legend)', tdp: 95, peak: 120, socket: 'LGA775', series: 'Intel Legacy Core' },
  { id: 'e8400', name: 'Intel Core 2 Duo E8400', tdp: 65, peak: 75, socket: 'LGA775', series: 'Intel Legacy Core' },

  // Intel Xeon Workstation / Server HEDT
  { id: 'xeon-w9-3495x', name: 'Intel Xeon w9-3495X (Sapphire Rapids)', tdp: 350, peak: 420, socket: 'LGA4677', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-w7-2495x', name: 'Intel Xeon w7-2495X', tdp: 225, peak: 300, socket: 'LGA4677', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-gold-6258r', name: 'Intel Xeon Gold 6258R', tdp: 205, peak: 270, socket: 'LGA3647', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-e5-2697v4', name: 'Intel Xeon E5-2697 v4 (18 Cores)', tdp: 145, peak: 180, socket: 'LGA2011-3', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-e5-2680v3', name: 'Intel Xeon E5-2680 v3', tdp: 120, peak: 150, socket: 'LGA2011-3', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-e5-2670', name: 'Intel Xeon E5-2670 v2 (Budget Server)', tdp: 115, peak: 145, socket: 'LGA2011', series: 'Intel Xeon Server/HEDT' },
  { id: 'xeon-x5690', name: 'Intel Xeon X5690 Six-Core Legacy', tdp: 130, peak: 160, socket: 'LGA1366', series: 'Intel Xeon Server/HEDT' },

  // AMD Ryzen 9000 Series (AM5)
  { id: 'r9-9950x', name: 'AMD Ryzen 9 9950X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 9000 Series' },
  { id: 'r9-9900x', name: 'AMD Ryzen 9 9900X', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 9000 Series' },
  { id: 'r7-9800x3d', name: 'AMD Ryzen 7 9800X3D (Extreme Gaming)', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 9000 Series' },
  { id: 'r7-9700x', name: 'AMD Ryzen 7 9700X', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 9000 Series' },
  { id: 'r5-9600x', name: 'AMD Ryzen 5 9600X', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 9000 Series' },
  
  // AMD Ryzen 7000 Series (AM5)
  { id: 'r9-7950x3d', name: 'AMD Ryzen 9 7950X3D (V-Cache)', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r9-7900x3d', name: 'AMD Ryzen 9 7900X3D', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D (Gaming King)', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r9-7950x', name: 'AMD Ryzen 9 7950X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r9-7900x', name: 'AMD Ryzen 9 7900X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r7-7700x', name: 'AMD Ryzen 7 7700X', tdp: 105, peak: 142, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r5-7600x', name: 'AMD Ryzen 5 7600X', tdp: 105, peak: 142, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r7-7700', name: 'AMD Ryzen 7 7700', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r5-7600', name: 'AMD Ryzen 5 7600', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },
  { id: 'r5-7500f', name: 'AMD Ryzen 5 7500F (OEM Special)', tdp: 65, peak: 85, socket: 'AM5', series: 'AMD Ryzen 7000 Series' },

  // AMD Ryzen 5000 Series (AM4)
  { id: 'r9-5950x', name: 'AMD Ryzen 9 5950X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r9-5900x', name: 'AMD Ryzen 9 5900X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r7-5800x3d', name: 'AMD Ryzen 7 5800X3D (AM4 Upgrade)', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r7-5700x3d', name: 'AMD Ryzen 7 5700X3D (Budget Gaming)', tdp: 105, peak: 140, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r7-5800x', name: 'AMD Ryzen 7 5800X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r7-5700x', name: 'AMD Ryzen 7 5700X', tdp: 65, peak: 78, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r5-5600x', name: 'AMD Ryzen 5 5600X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r5-5600', name: 'AMD Ryzen 5 5600', tdp: 65, peak: 78, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },
  { id: 'r5-5500', name: 'AMD Ryzen 5 5500', tdp: 65, peak: 75, socket: 'AM4', series: 'AMD Ryzen 5000 Series' },

  // AMD Ryzen Legacy & APUs (AM4 / FM2+ / AM3+)
  { id: 'r7-3800x', name: 'AMD Ryzen 7 3800X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r7-3700x', name: 'AMD Ryzen 7 3700X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r5-3600x', name: 'AMD Ryzen 5 3600X', tdp: 95, peak: 115, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r5-3600', name: 'AMD Ryzen 5 3600', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r7-2700x', name: 'AMD Ryzen 7 2700X', tdp: 105, peak: 145, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r5-2600', name: 'AMD Ryzen 5 2600', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r7-1800x', name: 'AMD Ryzen 7 1800X', tdp: 95, peak: 140, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'r5-1600', name: 'AMD Ryzen 5 1600 (AF Edition)', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'ryzen-5600g', name: 'AMD Ryzen 5 5600G (Radeon APU)', tdp: 65, peak: 85, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'ryzen-3200g', name: 'AMD Ryzen 3 3200G (Radeon APU)', tdp: 65, peak: 75, socket: 'AM4', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'fx-9590', name: 'AMD FX-9590 (Space Heater Legend)', tdp: 220, peak: 320, socket: 'AM3+', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'fx-8350', name: 'AMD FX-8350 Octa-Core', tdp: 125, peak: 180, socket: 'AM3+', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'fx-6300', name: 'AMD FX-6300 Six-Core', tdp: 95, peak: 130, socket: 'AM3+', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'phenom-1100t', name: 'AMD Phenom II X6 1100T Black Edition', tdp: 125, peak: 160, socket: 'AM3', series: 'AMD Ryzen Legacy & APUs' },
  { id: 'a10-7850k', name: 'AMD A10-7850K APU', tdp: 95, peak: 115, socket: 'FM2+', series: 'AMD Ryzen Legacy & APUs' },

  // AMD Threadripper HEDT
  { id: 'tr-7995wx', name: 'AMD Ryzen Threadripper PRO 7995WX', tdp: 350, peak: 480, socket: 'sTR5', series: 'AMD Threadripper HEDT' },
  { id: 'tr-7980x', name: 'AMD Ryzen Threadripper 7980X', tdp: 350, peak: 450, socket: 'sTR5', series: 'AMD Threadripper HEDT' },
  { id: 'tr-3990x', name: 'AMD Ryzen Threadripper 3990X (64 Cores)', tdp: 280, peak: 380, socket: 'sTRX4', series: 'AMD Threadripper HEDT' },
  { id: 'tr-3970x', name: 'AMD Ryzen Threadripper 3970X', tdp: 280, peak: 350, socket: 'sTRX4', series: 'AMD Threadripper HEDT' },
  { id: 'tr-2990wx', name: 'AMD Ryzen Threadripper 2990WX (32 Cores)', tdp: 250, peak: 320, socket: 'TR4', series: 'AMD Threadripper HEDT' },
  { id: 'tr-1950x', name: 'AMD Ryzen Threadripper 1950X', tdp: 180, peak: 250, socket: 'TR4', series: 'AMD Threadripper HEDT' },

  // Low Power / Entry Level
  { id: 'pentium-g7400', name: 'Intel Pentium Gold G7400', tdp: 46, peak: 58, socket: 'LGA1700', series: 'Low Power / Entry Level' },
  { id: 'celeron-g6900', name: 'Intel Celeron G6900', tdp: 46, peak: 55, socket: 'LGA1700', series: 'Low Power / Entry Level' },
  { id: 'amd-athlon', name: 'AMD Athlon 3000G / Core 2 Duo', tdp: 35, peak: 45, socket: 'AM4/LGA775', series: 'Low Power / Entry Level' },
  { id: 'athlon-640', name: 'AMD Athlon II X4 640 Legacy Quad', tdp: 95, peak: 115, socket: 'AM3', series: 'Low Power / Entry Level' },
  { id: 'e6600', name: 'Intel Core 2 Duo E6600 Classic Duo', tdp: 65, peak: 75, socket: 'LGA775', series: 'Low Power / Entry Level' },
];

const GPU_DATABASE: GpuModel[] = [
  // NVIDIA RTX 50 Series (Next Gen)
  { id: 'rtx-5090', name: 'NVIDIA GeForce RTX 5090 (Blackwell Flagship)', wattage: 600, vram: '32GB', series: 'NVIDIA RTX 50 Series' },
  { id: 'rtx-5080', name: 'NVIDIA GeForce RTX 5080 (Blackwell Elite)', wattage: 400, vram: '16GB', series: 'NVIDIA RTX 50 Series' },
  { id: 'rtx-5070ti', name: 'NVIDIA GeForce RTX 5070 Ti', wattage: 275, vram: '16GB', series: 'NVIDIA RTX 50 Series' },
  { id: 'rtx-5070', name: 'NVIDIA GeForce RTX 5070', wattage: 250, vram: '12GB', series: 'NVIDIA RTX 50 Series' },
  { id: 'rtx-5060ti', name: 'NVIDIA GeForce RTX 5060 Ti', wattage: 175, vram: '12GB', series: 'NVIDIA RTX 50 Series' },
  { id: 'rtx-5060', name: 'NVIDIA GeForce RTX 5060', wattage: 125, vram: '8GB', series: 'NVIDIA RTX 50 Series' },

  // NVIDIA RTX 40 Series
  { id: 'rtx-4090', name: 'NVIDIA GeForce RTX 4090', wattage: 450, vram: '24GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4080s', name: 'NVIDIA GeForce RTX 4080 Super', wattage: 320, vram: '16GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4080', name: 'NVIDIA GeForce RTX 4080', wattage: 320, vram: '16GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4075s', name: 'NVIDIA GeForce RTX 4070 Ti Super', wattage: 285, vram: '16GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4070ti', name: 'NVIDIA GeForce RTX 4070 Ti', wattage: 285, vram: '12GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4070s', name: 'NVIDIA GeForce RTX 4070 Super', wattage: 220, vram: '12GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4070', name: 'NVIDIA GeForce RTX 4070', wattage: 200, vram: '12GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4060t-16', name: 'NVIDIA GeForce RTX 4060 Ti 16GB', wattage: 165, vram: '16GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4060t', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', wattage: 160, vram: '8GB', series: 'NVIDIA RTX 40 Series' },
  { id: 'rtx-4060', name: 'NVIDIA GeForce RTX 4060', wattage: 115, vram: '8GB', series: 'NVIDIA RTX 40 Series' },

  // NVIDIA RTX 30 Series
  { id: 'rtx-3090ti', name: 'NVIDIA GeForce RTX 3090 Ti', wattage: 450, vram: '24GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3090', name: 'NVIDIA GeForce RTX 3090', wattage: 350, vram: '24GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3080ti', name: 'NVIDIA GeForce RTX 3080 Ti', wattage: 350, vram: '12GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3080-12', name: 'NVIDIA GeForce RTX 3080 12GB', wattage: 350, vram: '12GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3080', name: 'NVIDIA GeForce RTX 3080 10GB', wattage: 320, vram: '10GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3075s', name: 'NVIDIA GeForce RTX 3070 Ti', wattage: 290, vram: '8GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3070', name: 'NVIDIA GeForce RTX 3070', wattage: 220, vram: '8GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3060ti', name: 'NVIDIA GeForce RTX 3060 Ti', wattage: 200, vram: '8GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3060-12', name: 'NVIDIA GeForce RTX 3060 12GB', wattage: 170, vram: '12GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3060-8', name: 'NVIDIA GeForce RTX 3060 8GB', wattage: 170, vram: '8GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3050-8', name: 'NVIDIA GeForce RTX 3050 8GB', wattage: 130, vram: '8GB', series: 'NVIDIA RTX 30 Series' },
  { id: 'rtx-3050-6', name: 'NVIDIA GeForce RTX 3050 6GB', wattage: 70, vram: '6GB', series: 'NVIDIA RTX 30 Series' },

  // NVIDIA RTX 20 Series
  { id: 'rtx-2080ti', name: 'NVIDIA GeForce RTX 2080 Ti', wattage: 250, vram: '11GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2080s', name: 'NVIDIA GeForce RTX 2080 Super', wattage: 250, vram: '8GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2080', name: 'NVIDIA GeForce RTX 2080', wattage: 215, vram: '8GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2070s', name: 'NVIDIA GeForce RTX 2070 Super', wattage: 215, vram: '8GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2070', name: 'NVIDIA GeForce RTX 2070', wattage: 175, vram: '8GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2060s', name: 'NVIDIA GeForce RTX 2060 Super', wattage: 175, vram: '8GB', series: 'NVIDIA RTX 20 Series' },
  { id: 'rtx-2060', name: 'NVIDIA GeForce RTX 2060', wattage: 160, vram: '6GB', series: 'NVIDIA RTX 20 Series' },

  // NVIDIA GTX Series
  { id: 'gtx-1080ti', name: 'NVIDIA GeForce GTX 1080 Ti (Pascal King)', wattage: 250, vram: '11GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1080', name: 'NVIDIA GeForce GTX 1080', wattage: 180, vram: '8GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1070ti', name: 'NVIDIA GeForce GTX 1070 Ti', wattage: 180, vram: '8GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1070', name: 'NVIDIA GeForce GTX 1070', wattage: 150, vram: '8GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1060-6', name: 'NVIDIA GeForce GTX 1060 6GB', wattage: 120, vram: '6GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1050ti', name: 'NVIDIA GeForce GTX 1050 Ti', wattage: 75, vram: '4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1660s', name: 'NVIDIA GeForce GTX 1660 Super', wattage: 125, vram: '6GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1660ti', name: 'NVIDIA GeForce GTX 1660 Ti', wattage: 120, vram: '6GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1650s', name: 'NVIDIA GeForce GTX 1650 Super', wattage: 100, vram: '4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-1650', name: 'NVIDIA GeForce GTX 1650', wattage: 75, vram: '4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-980ti', name: 'NVIDIA GeForce GTX 980 Ti (Maxwell Flagship)', wattage: 250, vram: '6GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-980', name: 'NVIDIA GeForce GTX 980', wattage: 165, vram: '4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-970', name: 'NVIDIA GeForce GTX 970 (Classic 3.5GB)', wattage: 145, vram: '4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-960', name: 'NVIDIA GeForce GTX 960', wattage: 120, vram: '2GB/4GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-780ti', name: 'NVIDIA GeForce GTX 780 Ti (Kepler Beast)', wattage: 250, vram: '3GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-770', name: 'NVIDIA GeForce GTX 770', wattage: 230, vram: '2GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-750ti', name: 'NVIDIA GeForce GTX 750 Ti', wattage: 60, vram: '2GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-680', name: 'NVIDIA GeForce GTX 680', wattage: 195, vram: '2GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-580', name: 'NVIDIA GeForce GTX 580 (Fermi Thermonuclear)', wattage: 244, vram: '1.5GB', series: 'NVIDIA GTX Series' },
  { id: 'gtx-480', name: 'NVIDIA GeForce GTX 480 (Fermi Grill)', wattage: 250, vram: '1.5GB', series: 'NVIDIA GTX Series' },

  // AMD Radeon RX 7000 Series
  { id: 'rx-7900xtx', name: 'AMD Radeon RX 7900 XTX', wattage: 355, vram: '24GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7900xt', name: 'AMD Radeon RX 7900 XT', wattage: 315, vram: '20GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7900gre', name: 'AMD Radeon RX 7900 GRE', wattage: 260, vram: '16GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7800xt', name: 'AMD Radeon RX 7800 XT', wattage: 263, vram: '16GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7700xt', name: 'AMD Radeon RX 7700 XT', wattage: 245, vram: '12GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7600xt', name: 'AMD Radeon RX 7600 XT', wattage: 190, vram: '16GB', series: 'AMD RX 7000 Series' },
  { id: 'rx-7600', name: 'AMD Radeon RX 7600', wattage: 165, vram: '8GB', series: 'AMD RX 7000 Series' },

  // AMD Radeon RX 6000 Series
  { id: 'rx-6950xt', name: 'AMD Radeon RX 6950 XT', wattage: 335, vram: '16GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6900xt', name: 'AMD Radeon RX 6900 XT', wattage: 300, vram: '16GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6800xt', name: 'AMD Radeon RX 6800 XT', wattage: 300, vram: '16GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6800', name: 'AMD Radeon RX 6800', wattage: 250, vram: '16GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6750xt', name: 'AMD Radeon RX 6750 XT', wattage: 250, vram: '12GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6700xt', name: 'AMD Radeon RX 6700 XT', wattage: 230, vram: '12GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6650xt', name: 'AMD Radeon RX 6650 XT', wattage: 180, vram: '8GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6600xt', name: 'AMD Radeon RX 6600 XT', wattage: 160, vram: '8GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6600', name: 'AMD Radeon RX 6600', wattage: 132, vram: '8GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6500xt', name: 'AMD Radeon RX 6500 XT', wattage: 107, vram: '4GB', series: 'AMD RX 6000 Series' },
  { id: 'rx-6400', name: 'AMD Radeon RX 6400 Low Profile', wattage: 53, vram: '4GB', series: 'AMD RX 6000 Series' },

  // AMD Radeon RX 5000 Series
  { id: 'rx-5700xt', name: 'AMD Radeon RX 5700 XT', wattage: 225, vram: '8GB', series: 'AMD RX 5000 Series' },
  { id: 'rx-5700', name: 'AMD Radeon RX 5700', wattage: 180, vram: '8GB', series: 'AMD RX 5000 Series' },
  { id: 'rx-5600xt', name: 'AMD Radeon RX 5600 XT', wattage: 160, vram: '6GB', series: 'AMD RX 5000 Series' },
  { id: 'rx-5500xt', name: 'AMD Radeon RX 5500 XT', wattage: 130, vram: '8GB', series: 'AMD RX 5000 Series' },

  // AMD Radeon Legacy
  { id: 'rx-vega-64-liquid', name: 'AMD Radeon RX Vega 64 Liquid Cooled', wattage: 345, vram: '8GB HBM2', series: 'AMD Radeon Legacy' },
  { id: 'rx-vega-64', name: 'AMD Radeon RX Vega 64 Standard', wattage: 295, vram: '8GB HBM2', series: 'AMD Radeon Legacy' },
  { id: 'rx-vega-56', name: 'AMD Radeon RX Vega 56', wattage: 210, vram: '8GB HBM2', series: 'AMD Radeon Legacy' },
  { id: 'rx-590', name: 'AMD Radeon RX 590', wattage: 225, vram: '8GB', series: 'AMD Radeon Legacy' },
  { id: 'rx-580', name: 'AMD Radeon RX 580 (Polaris Core)', wattage: 185, vram: '8GB', series: 'AMD Radeon Legacy' },
  { id: 'rx-570', name: 'AMD Radeon RX 570', wattage: 150, vram: '8GB', series: 'AMD Radeon Legacy' },
  { id: 'rx-480', name: 'AMD Radeon RX 480', wattage: 150, vram: '8GB', series: 'AMD Radeon Legacy' },
  { id: 'r9-fury-x', name: 'AMD Radeon R9 Fury X (Fiji)', wattage: 275, vram: '4GB HBM', series: 'AMD Radeon Legacy' },
  { id: 'r9-390x2', name: 'AMD Radeon R9 390X (Hawaii XT Flagship)', wattage: 275, vram: '8GB', series: 'AMD Radeon Legacy' },
  { id: 'r9-290x', name: 'AMD Radeon R9 290X Classic', wattage: 290, vram: '4GB', series: 'AMD Radeon Legacy' },
  { id: 'hd-7970', name: 'AMD Radeon HD 7970 GHz Edition', wattage: 250, vram: '3GB', series: 'AMD Radeon Legacy' },
  { id: 'hd-6970', name: 'AMD Radeon HD 6970 Dual Fan', wattage: 250, vram: '2GB', series: 'AMD Radeon Legacy' },

  // Intel Arc Graphics
  { id: 'arc-b580', name: 'Intel Arc B580 (Battlemage Next-Gen)', wattage: 190, vram: '12GB', series: 'Intel Arc Graphics' },
  { id: 'arc-b480', name: 'Intel Arc B480 (Battlemage mainstream)', wattage: 150, vram: '8GB', series: 'Intel Arc Graphics' },
  { id: 'arc-a770', name: 'Intel Arc A770 High Performance', wattage: 225, vram: '16GB', series: 'Intel Arc Graphics' },
  { id: 'arc-a750', name: 'Intel Arc A750', wattage: 225, vram: '8GB', series: 'Intel Arc Graphics' },
  { id: 'arc-a580', name: 'Intel Arc A580', wattage: 185, vram: '8GB', series: 'Intel Arc Graphics' },
  { id: 'arc-a380', name: 'Intel Arc A380 Low Profile', wattage: 75, vram: '6GB', series: 'Intel Arc Graphics' },
  
  // Integrated / None
  { id: 'integrated-gp', name: 'Integrated Motherboard/CPU Graphics only', wattage: 0, vram: 'Shared', series: 'Integrated' },
];

const MOTHERBOARD_DRAW = {
  'eatx': 80,
  'atx': 50,
  'matx': 40,
  'itx': 30
};

const MEMORY_DRAW = {
  'ddr5': 6,
  'ddr4': 4,
  'ddr3': 3,
};

const STORAGE_DRAW = {
  'nvme': 8,
  'sata_ssd': 5,
  'hdd': 10
};

const COOLING_DRAW = {
  'air_dual': 12,
  'air_single': 6,
  'aio_360': 35,
  'aio_240': 25,
  'aio_120': 15,
  'custom_loop': 55
};

const STANDARD_PSU_SIZES = [350, 450, 550, 650, 750, 850, 1000, 1200, 1500, 1600];

interface SmpsCalculatorProps {
  currentTheme: 'light' | 'dark';
}

export default function SmpsCalculator({ currentTheme }: SmpsCalculatorProps) {
  // Calculator States - Default to unselected/0W for direct fulfillment of instructions
  const [selectedCpuId, setSelectedCpuId] = useState<string>('');
  const [selectedGpuId, setSelectedGpuId] = useState<string>('');
  const [motherboardType, setMotherboardType] = useState<'eatx' | 'atx' | 'matx' | 'itx' | ''>('');
  const [ramType, setRamType] = useState<'ddr5' | 'ddr4' | 'ddr3' | ''>('');
  const [ramSticks, setRamSticks] = useState<number>(0);
  const [nvmeCount, setNvmeCount] = useState<number>(0);
  const [sataSsdCount, setSataSsdCount] = useState<number>(0);
  const [hddCount, setHddCount] = useState<number>(0);
  const [coolingType, setCoolingType] = useState<keyof typeof COOLING_DRAW | ''>('');
  const [caseFans, setCaseFans] = useState<number>(0);
  const [rgbStrips, setRgbStrips] = useState<number>(0);
  const [rgbController, setRgbController] = useState<boolean>(false);
  const [overclockCpu, setOverclockCpu] = useState<boolean>(false);
  const [overclockGpu, setOverclockGpu] = useState<boolean>(false);
  const [usbHighDrawCount, setUsbHighDrawCount] = useState<number>(0); 
  const [safetyMargin, setSafetyMargin] = useState<number>(25); // percentage: 10%-50%

  // Search UI states for real-time filtering
  const [cpuSearch, setCpuSearch] = useState<string>('');
  const [gpuSearch, setGpuSearch] = useState<string>('');
  const [isCpuOpen, setIsCpuOpen] = useState<boolean>(false);
  const [isGpuOpen, setIsGpuOpen] = useState<boolean>(false);

  // Reset Calculator To Strict 0W Default
  const handleReset = () => {
    setSelectedCpuId('');
    setSelectedGpuId('');
    setMotherboardType('');
    setRamType('');
    setRamSticks(0);
    setNvmeCount(0);
    setSataSsdCount(0);
    setHddCount(0);
    setCoolingType('');
    setCaseFans(0);
    setRgbStrips(0);
    setRgbController(false);
    setOverclockCpu(false);
    setOverclockGpu(false);
    setUsbHighDrawCount(0);
    setSafetyMargin(25);
    setCpuSearch('');
    setGpuSearch('');
    setIsCpuOpen(false);
    setIsGpuOpen(false);
  };

  // Find Models
  const selectedCpu = useMemo(() => CPU_DATABASE.find(c => c.id === selectedCpuId) || null, [selectedCpuId]);
  const selectedGpu = useMemo(() => GPU_DATABASE.find(g => g.id === selectedGpuId) || null, [selectedGpuId]);

  // Wattage Calculation Breakdown
  const wattageBreakdown = useMemo(() => {
    // If no core components are chosen, let's keep all secondary elements from bloating 
    // unless they explicitly increment them, ensuring safe, logical starting point.
    const cpuPower = selectedCpu ? (selectedCpu.peak + (overclockCpu ? 50 : 0)) : 0;
    const gpuPower = selectedGpu ? (selectedGpu.wattage + (overclockGpu && selectedGpu.wattage > 0 ? 80 : 0)) : 0;
    const moboPower = motherboardType ? MOTHERBOARD_DRAW[motherboardType] : 0;
    const ramPower = (ramType && ramSticks > 0) ? (ramSticks * MEMORY_DRAW[ramType]) : 0;
    const storagePower = (nvmeCount * STORAGE_DRAW.nvme) + (sataSsdCount * STORAGE_DRAW.sata_ssd) + (hddCount * STORAGE_DRAW.hdd);
    const coolingPower = coolingType ? (COOLING_DRAW[coolingType] + (caseFans * 3)) : (caseFans * 3);
    const accessoryPower = (rgbStrips * 5) + (rgbController ? 8 : 0) + (usbHighDrawCount * 10);

    const totalPeak = cpuPower + gpuPower + moboPower + ramPower + storagePower + coolingPower + accessoryPower;
    
    return {
      cpu: cpuPower,
      gpu: gpuPower,
      mobo: moboPower,
      ram: ramPower,
      storage: storagePower,
      cooling: coolingPower,
      accessories: accessoryPower,
      totalPeak
    };
  }, [
    selectedCpu, selectedGpu, overclockCpu, overclockGpu, motherboardType, 
    ramType, ramSticks, nvmeCount, sataSsdCount, hddCount, coolingType, 
    caseFans, rgbStrips, rgbController, usbHighDrawCount
  ]);

  // Recommended PSU Calculation with safety overhead margin
  const recommendedPower = useMemo(() => {
    if (wattageBreakdown.totalPeak === 0) {
      return { rawRecommended: 0, suggestedPsuSize: 0 };
    }
    const rawRecommended = wattageBreakdown.totalPeak * (1 + safetyMargin / 100);
    // Find next size standard SMPS rating
    const suggestedPsuSize = STANDARD_PSU_SIZES.find(size => size >= rawRecommended) || 1600;

    return {
      rawRecommended: Math.ceil(rawRecommended),
      suggestedPsuSize
    };
  }, [wattageBreakdown.totalPeak, safetyMargin]);

  // Dynamic advice based on current loaded state
  const isFormEmpty = wattageBreakdown.totalPeak === 0;

  // Generate WhatsApp inquiry text
  const handleWhatsAppInquiry = () => {
    if (isFormEmpty) return;
    const psuRatingStr = recommendedPower.suggestedPsuSize >= 1000 
      ? '80+ Platinum/Titanium Enterprise' 
      : recommendedPower.suggestedPsuSize >= 750 
        ? '80+ Gold Certified Modular' 
        : '80+ Bronze / Gold Workstation Class';

    const buildSpecs = [
      selectedCpu ? `- CPU: ${selectedCpu.name} (${wattageBreakdown.cpu}W peak)` : null,
      selectedGpu ? `- GPU: ${selectedGpu.name} (${wattageBreakdown.gpu}W peak)` : null,
      motherboardType ? `- Motherboard: ${motherboardType.toUpperCase()} (${wattageBreakdown.mobo}W)` : null,
      ramType ? `- RAM: ${ramSticks}x ${ramType.toUpperCase()} (${wattageBreakdown.ram}W)` : null,
      (nvmeCount > 0 || sataSsdCount > 0 || hddCount > 0) ? `- Drives: ${nvmeCount}x NVMe, ${sataSsdCount}x SATA, ${hddCount}x HDD` : null,
      coolingType ? `- Cooling: ${coolingType.toUpperCase()} (+${caseFans} High Performance Fans)` : null,
    ].filter(Boolean).join('\n');

    const messageText = `Hi Murari (Pixel Fix Specialist),\n\nI just designed my custom desktop configuration on your high-precision SMPS Power Calculator!\n\n📋 COMPONENT PROFILE:\n${buildSpecs}\n\n⚡ LOAD PROFILE REPORT:\n- Continuous Combined Peak draw: ~${wattageBreakdown.totalPeak}W\n- Hardware Buffer Margin: +${safetyMargin}%\n- Suggested Target PSU Class: ${recommendedPower.suggestedPsuSize}W (${psuRatingStr})\n\nCould you offer a quotation for door-to-door professional PC assembly or certified SMPS diagnostic and installation services in Assam? I'd love to connect!`;
    
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/918638875231?text=${encoded}`, '_blank');
  };

  // 80 Plus Efficiency tier suggestion based on Recommended supply rating
  const psuEfficiencyAdvice = useMemo(() => {
    const size = recommendedPower.suggestedPsuSize;
    if (size === 0) {
      return {
        tier: 'Standard / 80 PLUS Rated',
        desc: 'Select computer hardware options to map appropriate tier recommendations.',
        color: 'from-slate-400 to-zinc-400'
      };
    }
    if (size >= 1000) {
      return {
        tier: '80 PLUS Platinum / Titanium',
        desc: 'Uncompromising efficiency for heavy rendering clusters or multi-GPU configurations. Restricts line loss to under 8%.',
        color: 'from-slate-300 to-emerald-400'
      };
    } else if (size >= 750) {
      return {
        tier: '80 PLUS Gold Certified',
        desc: 'Optimized efficiency for modular gaming machines. Offers excellent lifespan, protection under high temperature peaks, and low ripples.',
        color: 'from-amber-400 to-yellow-500'
      };
    } else if (size >= 550) {
      return {
        tier: '80 PLUS Bronze / Gold',
        desc: 'Fabulous daily efficiency rating for mid-tier gaming environments or visual workspaces.',
        color: 'from-amber-700 to-amber-500'
      };
    } else {
      return {
        tier: '80 PLUS Standard / Bronze',
        desc: 'Energy efficient baseline for silent multi-media center operations or office workstations.',
        color: 'from-zinc-400 to-zinc-500'
      };
    }
  }, [recommendedPower.suggestedPsuSize]);

  // Grouped Databases filtered dynamically for real-time search autocompletes
  const filteredCpus = useMemo(() => {
    const q = cpuSearch.trim().toLowerCase();
    if (!q) return CPU_DATABASE;
    return CPU_DATABASE.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.socket.toLowerCase().includes(q) || 
      c.series.toLowerCase().includes(q)
    );
  }, [cpuSearch]);

  const groupedCpus = useMemo(() => {
    const groups: Record<string, CpuModel[]> = {};
    filteredCpus.forEach(c => {
      groups[c.series] = groups[c.series] || [];
      groups[c.series].push(c);
    });
    return groups;
  }, [filteredCpus]);

  const filteredGpus = useMemo(() => {
    const q = gpuSearch.trim().toLowerCase();
    if (!q) return GPU_DATABASE;
    return GPU_DATABASE.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.series.toLowerCase().includes(q) ||
      g.vram.toLowerCase().includes(q)
    );
  }, [gpuSearch]);

  const groupedGpus = useMemo(() => {
    const groups: Record<string, GpuModel[]> = {};
    filteredGpus.forEach(g => {
      groups[g.series] = groups[g.series] || [];
      groups[g.series].push(g);
    });
    return groups;
  }, [filteredGpus]);

  // Structural Styles dependent on current theme
  const isDark = currentTheme === 'dark';
  const containerBg = isDark 
    ? 'bg-zinc-950/90 border-zinc-900/80 shadow-2xl backdrop-blur-xl' 
    : 'bg-white border-slate-200/90 shadow-2xl shadow-slate-100/50';
    
  const textHeading = isDark ? 'text-stone-100' : 'text-slate-900';
  const textBody = isDark ? 'text-zinc-400' : 'text-slate-500';
  const labelTextClass = textBody;
  const headerTextClass = textHeading;
  
  const cardBg = isDark 
    ? 'bg-zinc-900/30 border-zinc-850/50' 
    : 'bg-slate-50/50 border-slate-200/60';
  const controlCardBg = cardBg;

  const innerCardBg = isDark 
    ? 'bg-zinc-950/60 border-zinc-900/80' 
    : 'bg-white border-slate-150 shadow-sm';

  const selectStyle = isDark
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-[#FF5500] hover:border-zinc-700'
    : 'bg-white border-slate-200 text-slate-900 focus:border-[#FF5500] hover:border-slate-300';
  const selectElementStyle = selectStyle;

  const badgeAccent = isDark 
    ? 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20' 
    : 'bg-[#FF5500]/5 text-[#FF5500] border-[#FF5500]/15';

  return (
    <div className={`p-6 md:p-10 rounded-[32px] border ${containerBg} space-y-8 relative overflow-hidden`} id="smps-wattage-calculator">
      {/* Visual Ambient Light Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5500]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-500/10 pb-6">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase font-black text-[#FF5500]">
              Certified Pixel Fix Hardware Diagnostic Suite
            </span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${textHeading}`}>
            SMPS PSU Calculator
          </h2>
          <p className={`text-xs md:text-sm max-w-2xl ${textBody}`}>
            Estimate peak computer system load dynamically. Add components to map perfect continuous voltage supply ratings & safety headroom options in Assam.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isFormEmpty}
          className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold transition-all duration-200 flex items-center gap-2 self-start md:self-center bg-transparent ${
            isFormEmpty 
              ? 'opacity-30 cursor-not-allowed border-zinc-500/10 text-zinc-500' 
              : 'border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40 active:scale-95 cursor-pointer shadow-sm'
          }`}
          title="Reset calculations to 0W"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Calculator</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Dynamic Interactive Input HUD (Left: 7cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card 1: Processing Silicon Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className={`p-4 rounded-2xl border ${controlCardBg} space-y-4`}
          >
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2">
              <Cpu className="w-4 h-4 text-[#FF5500]" />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${headerTextClass}`}>
                1. Core Processors &amp; Video Setup
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CPU Core Selector */}
              <div className="space-y-1.5 text-left relative">
                <label className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-between ${labelTextClass}`}>
                  <span>Processor (CPU)</span>
                  {selectedCpu && <span className="font-mono text-[9px] text-[#FF5500]">{selectedCpu.socket}</span>}
                </label>

                {/* Custom Searchable CPU Dropdown */}
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCpuOpen(!isCpuOpen);
                      setIsGpuOpen(false); // Close the other dropdown
                    }}
                    className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-colors flex items-center justify-between font-sans ${selectElementStyle} text-left select-none`}
                  >
                    <span className="truncate pr-4">
                      {selectedCpu ? `${selectedCpu.name} (${selectedCpu.peak}W)` : '-- Select CPU / Power Off (0W) --'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {selectedCpuId && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCpuId('');
                            setCpuSearch('');
                          }}
                          className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                          title="Clear Selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isCpuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {isCpuOpen && (
                      <>
                        {/* Fullscreen transparent backdrop overlay underneath */}
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setIsCpuOpen(false)} 
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-0 right-0 mt-2 p-3 rounded-2xl border shadow-xl z-50 max-h-80 overflow-hidden flex flex-col ${
                            currentTheme === 'light' 
                              ? 'bg-white border-slate-200/90 shadow-slate-200/50' 
                              : 'bg-zinc-950/98 backdrop-blur-md border-zinc-800/80'
                          }`}
                        >
                          {/* Search box header */}
                          <div className="relative mb-2 shrink-0">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                            <input
                              type="text"
                              value={cpuSearch}
                              onChange={(e) => setCpuSearch(e.target.value)}
                              placeholder="Search processors (i9, Ryzen 7, AM4...)"
                              className={`w-full py-2 pl-8 pr-8 rounded-xl text-xs outline-none border focus:border-[#FF5500] transition-colors ${
                                currentTheme === 'light' 
                                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' 
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-100 focus:bg-zinc-900/80'
                              }`}
                              autoFocus
                            />
                            {cpuSearch && (
                              <button
                                type="button"
                                onClick={() => setCpuSearch('')}
                                className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-zinc-500/10 text-zinc-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* List content */}
                          <div className="overflow-y-auto flex-1 max-h-56 pr-1 space-y-3.5 custom-scrollbar">
                            {/* Direct 0W option */}
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCpuId('');
                                  setCpuSearch('');
                                  setIsCpuOpen(false);
                                }}
                                className={`w-full p-2 text-left text-xs font-mono rounded-lg transition-colors flex items-center justify-between ${
                                  !selectedCpuId 
                                    ? 'text-[#FF5500] bg-[#FF5500]/5 font-bold' 
                                    : currentTheme === 'light' 
                                      ? 'text-slate-600 hover:bg-slate-50' 
                                      : 'text-zinc-400 hover:bg-zinc-900/40'
                                }`}
                              >
                                <span>-- No CPU / Power Off (0W) --</span>
                                {!selectedCpuId && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {Object.keys(groupedCpus).length === 0 ? (
                              <div className="text-zinc-500 text-[11px] font-mono py-6 text-center">
                                No matching processors found
                              </div>
                            ) : (
                              (Object.entries(groupedCpus) as [string, CpuModel[]][]).map(([series, list]) => (
                                <div key={series} className="space-y-1">
                                  <div className="text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-500 px-2 py-0.5 border-b border-zinc-500/5">
                                    {series}
                                  </div>
                                  <div className="space-y-0.5 pt-1">
                                    {list.map(cpu => (
                                      <button
                                        key={cpu.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCpuId(cpu.id);
                                          setCpuSearch('');
                                          setIsCpuOpen(false);
                                          if (!motherboardType) setMotherboardType('atx'); // smart default motherboard
                                        }}
                                        className={`w-full px-2 py-1.5 text-left text-xs rounded-lg transition-all flex items-center justify-between ${
                                          selectedCpuId === cpu.id
                                            ? 'text-white bg-[#FF5500] font-black pointer-events-none'
                                            : currentTheme === 'light'
                                              ? 'text-slate-700 hover:bg-slate-100/80 hover:text-[#FF5500]'
                                              : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                                        }`}
                                      >
                                        <div className="flex flex-col text-left">
                                          <span className="font-medium line-clamp-1">{cpu.name}</span>
                                          <span className={`text-[9px] font-mono ${selectedCpuId === cpu.id ? 'text-orange-100' : 'text-zinc-500'}`}>
                                            {cpu.socket} • TDP: {cpu.tdp}W
                                          </span>
                                        </div>
                                        <span className="font-mono text-[9px] shrink-0 ml-2 bg-black/10 px-1.5 py-0.5 rounded font-bold">
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
                      </>
                    )}
                  </AnimatePresence>
                </div>
                
                {selectedCpu && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5"
                  >
                    <span>TDP: {selectedCpu.tdp}W | Peak: {selectedCpu.peak}W</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overclockCpu}
                        onChange={(e) => setOverclockCpu(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3 h-3 cursor-pointer"
                      />
                      <span className="hover:text-[#FF5500] transition-colors select-none">
                        OC mode (+50W)
                      </span>
                    </label>
                  </motion.div>
                )}
              </div>

              {/* GPU Video Selector */}
              <div className="space-y-1.5 text-left relative">
                <label className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-between ${labelTextClass}`}>
                  <span>Graphics (GPU)</span>
                  {selectedGpu && <span className="font-mono text-[9px] text-indigo-400">{selectedGpu.vram}</span>}
                </label>

                {/* Custom Searchable GPU Dropdown */}
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGpuOpen(!isGpuOpen);
                      setIsCpuOpen(false); // Close the other dropdown
                    }}
                    className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-colors flex items-center justify-between font-sans ${selectElementStyle} text-left select-none`}
                  >
                    <span className="truncate pr-4">
                      {selectedGpu ? `${selectedGpu.name} (${selectedGpu.wattage}W)` : '-- Select GPU / Integrated (0W) --'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {selectedGpuId && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGpuId('');
                            setGpuSearch('');
                          }}
                          className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                          title="Clear Selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isGpuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {isGpuOpen && (
                      <>
                        {/* Fullscreen transparent backdrop overlay underneath */}
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setIsGpuOpen(false)} 
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-0 right-0 mt-2 p-3 rounded-2xl border shadow-xl z-50 max-h-80 overflow-hidden flex flex-col ${
                            currentTheme === 'light' 
                              ? 'bg-white border-slate-200/90 shadow-slate-200/50' 
                              : 'bg-zinc-950/98 backdrop-blur-md border-zinc-800/80'
                          }`}
                        >
                          {/* Search box header */}
                          <div className="relative mb-2 shrink-0">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                            <input
                              type="text"
                              value={gpuSearch}
                              onChange={(e) => setGpuSearch(e.target.value)}
                              placeholder="Search graphics cards (RTX 5090, RX 7800...)"
                              className={`w-full py-2 pl-8 pr-8 rounded-xl text-xs outline-none border focus:border-[#FF5500] transition-colors ${
                                currentTheme === 'light' 
                                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' 
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-100 focus:bg-zinc-900/80'
                              }`}
                              autoFocus
                            />
                            {gpuSearch && (
                              <button
                                type="button"
                                onClick={() => setGpuSearch('')}
                                className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-zinc-500/10 text-zinc-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* List content */}
                          <div className="overflow-y-auto flex-1 max-h-56 pr-1 space-y-3.5 custom-scrollbar">
                            {/* Direct 0W option */}
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedGpuId('');
                                  setGpuSearch('');
                                  setIsGpuOpen(false);
                                }}
                                className={`w-full p-2 text-left text-xs font-mono rounded-lg transition-colors flex items-center justify-between ${
                                  !selectedGpuId 
                                    ? 'text-[#FF5500] bg-[#FF5500]/5 font-bold' 
                                    : currentTheme === 'light' 
                                      ? 'text-slate-600 hover:bg-slate-50' 
                                      : 'text-zinc-400 hover:bg-zinc-900/40'
                                }`}
                              >
                                <span>-- No GPU / Integrated (0W) --</span>
                                {!selectedGpuId && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {Object.keys(groupedGpus).length === 0 ? (
                              <div className="text-zinc-500 text-[11px] font-mono py-6 text-center">
                                No matching graphics cards found
                              </div>
                            ) : (
                              (Object.entries(groupedGpus) as [string, GpuModel[]][]).map(([series, list]) => (
                                <div key={series} className="space-y-1">
                                  <div className="text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-500 px-2 py-0.5 border-b border-zinc-500/5">
                                    {series}
                                  </div>
                                  <div className="space-y-0.5 pt-1">
                                    {list.map(gpu => (
                                      <button
                                        key={gpu.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedGpuId(gpu.id);
                                          setGpuSearch('');
                                          setIsGpuOpen(false);
                                        }}
                                        className={`w-full px-2 py-1.5 text-left text-xs rounded-lg transition-all flex items-center justify-between ${
                                          selectedGpuId === gpu.id
                                            ? 'text-white bg-[#FF5500] font-black pointer-events-none'
                                            : currentTheme === 'light'
                                              ? 'text-slate-700 hover:bg-slate-100/80 hover:text-[#FF5500]'
                                              : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                                        }`}
                                      >
                                        <div className="flex flex-col text-left">
                                          <span className="font-medium line-clamp-1">{gpu.name}</span>
                                          <span className={`text-[9px] font-mono ${selectedGpuId === gpu.id ? 'text-orange-100' : 'text-zinc-500'}`}>
                                            VRAM: {gpu.vram}
                                          </span>
                                        </div>
                                        <span className="font-mono text-[9px] shrink-0 ml-2 bg-black/10 px-1.5 py-0.5 rounded font-bold font-mono">
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
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {selectedGpu && selectedGpu.wattage > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5"
                  >
                    <span>VRAM allocation: {selectedGpu.vram}</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overclockGpu}
                        onChange={(e) => setOverclockGpu(e.target.checked)}
                        className="rounded border-zinc-700 accent-[#FF5500] w-3 h-3 cursor-pointer"
                      />
                      <span className="hover:text-[#FF5500] transition-colors select-none">
                        Turbo Core (+80W)
                      </span>
                    </label>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>

          {/* Card 2: Platform Connection System */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className={`p-4 rounded-2xl border ${controlCardBg} space-y-4`}
          >
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${headerTextClass}`}>
                2. Motherboard &amp; System Memory
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Motherboard Selection */}
              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-extrabold uppercase tracking-wide block ${labelTextClass}`}>
                  Motherboard Form Factor
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['eatx', 'atx', 'matx', 'itx'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMotherboardType(type)}
                      className={`py-2 text-[10px] font-bold uppercase border rounded-xl transition-all active:scale-95 ${
                        motherboardType === type
                          ? 'border-[#FF5500] bg-[#FF5500]/10 text-[#FF5500] font-black shadow-sm'
                          : currentTheme === 'light'
                            ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            : 'border-zinc-800 text-zinc-400 bg-black/20 hover:bg-zinc-900/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-zinc-500 block">
                  {motherboardType ? `System baseline draw: ${MOTHERBOARD_DRAW[motherboardType]}W` : 'De-selected / Passive system board (0W)'}
                </span>
              </div>

              {/* Memory / RAM selection */}
              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-extrabold uppercase tracking-wide block ${labelTextClass}`}>
                  RAM Generation &amp; Slots
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={ramType}
                    onChange={(e) => {
                      const newType = e.target.value as 'ddr5' | 'ddr4' | 'ddr3' | '';
                      setRamType(newType);
                      if (newType && ramSticks === 0) setRamSticks(2); // intelligent autoselect
                      if (!newType) setRamSticks(0);
                    }}
                    className={`flex-1 p-2.5 rounded-xl border outline-none text-xs transition-colors cursor-pointer ${selectElementStyle}`}
                  >
                    <option value="">-- No Memory Module (0W) --</option>
                    <option value="ddr5">DDR5 High-Frequency</option>
                    <option value="ddr4">DDR4 Mainstream</option>
                    <option value="ddr3">DDR3 Legacy</option>
                  </select>

                  {ramType && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex items-center border rounded-xl p-1 bg-opacity-40 shrink-0 ${
                        currentTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-zinc-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setRamSticks(Math.max(1, ramSticks - 1))}
                        className="p-1 px-1.5 text-zinc-500 hover:text-[#FF5500] active:scale-90 transition-transform"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1 text-xs font-black font-mono w-4 text-center">{ramSticks}</span>
                      <button
                        type="button"
                        onClick={() => setRamSticks(Math.min(8, ramSticks + 1))}
                        className="p-1 px-1.5 text-zinc-500 hover:text-[#FF5500] active:scale-90 transition-transform"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-500 block">
                  {ramType ? `RAM consumption: ${ramSticks * MEMORY_DRAW[ramType]}W total` : 'Passive channel (0W)'}
                </span>
              </div>

            </div>
          </motion.div>

          {/* Card 3: Disk Drives & Ventilation Arrays */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            className={`p-4 rounded-2xl border ${controlCardBg} space-y-4`}
          >
            <div className="flex items-center gap-2 border-b border-zinc-500/5 pb-2">
              <HardDrive className="w-4 h-4 text-pink-400" />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${headerTextClass}`}>
                3. Storage &amp; Thermal Cooling
              </h3>
            </div>

            {/* Storage Modules layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* NVMe */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>M.2 SSD (NVMe)</span>
                  <span className="text-[9px] text-zinc-500 block">8W peak load</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNvmeCount(Math.max(0, nvmeCount - 1))}
                    className="p-1 rounded bg-zinc-500/5 text-zinc-400 hover:text-[#FF5500] active:scale-90"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center font-mono">{nvmeCount}</span>
                  <button
                    type="button"
                    onClick={() => setNvmeCount(Math.min(6, nvmeCount + 1))}
                    className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* SATA SSD */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>2.5" SATA SSD</span>
                  <span className="text-[9px] text-zinc-500 block">5W peak load</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSataSsdCount(Math.max(0, sataSsdCount - 1))}
                    className="p-1 rounded bg-zinc-500/5 text-zinc-400 hover:text-[#FF5500] active:scale-90"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center font-mono">{sataSsdCount}</span>
                  <button
                    type="button"
                    onClick={() => setSataSsdCount(Math.min(6, sataSsdCount + 1))}
                    className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* HDD magnetic */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>Mechanical HDD</span>
                  <span className="text-[9px] text-zinc-500 block">10W spindle draw</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHddCount(Math.max(0, hddCount - 1))}
                    className="p-1 rounded bg-zinc-500/5 text-zinc-400 hover:text-[#FF5500] active:scale-90"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center font-mono">{hddCount}</span>
                  <button
                    type="button"
                    onClick={() => setHddCount(Math.min(6, hddCount + 1))}
                    className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Thermal / Ventilation Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-500/5 pt-3">
              {/* CPU cooler design selection */}
              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-extrabold uppercase block tracking-wide ${labelTextClass}`}>
                  Cooling Equipment (Cooler)
                </label>
                <select
                  value={coolingType}
                  onChange={(e) => setCoolingType(e.target.value as keyof typeof COOLING_DRAW | '')}
                  className={`w-full p-2.5 rounded-xl border outline-none text-xs transition-colors cursor-pointer ${selectElementStyle}`}
                >
                  <option value="">-- De-selected / Passive Cooling (0W) --</option>
                  <option value="air_single">Compact Single Tower Air (6W)</option>
                  <option value="air_dual">Premium Dual-Tower Air Cooler (12W)</option>
                  <option value="aio_120">Single 120/140mm Liquid AIO (15W)</option>
                  <option value="aio_240">Standard 240/280mm Dual Liquid AIO (25W)</option>
                  <option value="aio_360">High-end 360/420mm Triple Liquid AIO (35W)</option>
                  <option value="custom_loop">Custom loop liquid pump system (55W)</option>
                </select>
              </div>

              {/* Case fan increments */}
              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-extrabold uppercase block tracking-wide ${labelTextClass}`}>
                  Chassis Case Fans (Quiet / RGB)
                </label>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center border rounded-xl p-1 bg-opacity-40 flex-1 justify-between ${
                    currentTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-zinc-800'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setCaseFans(Math.max(0, caseFans - 1))}
                      className="p-1.5 px-2.5 text-zinc-500 hover:text-[#FF5500] active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black font-mono">{caseFans} Fans ({caseFans * 3}W)</span>
                    <button
                      type="button"
                      onClick={() => setCaseFans(Math.min(16, caseFans + 1))}
                      className="p-1.5 px-2.5 text-zinc-500 hover:text-[#FF5500] active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: High Power USBs & Strips */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
            className={`p-4 rounded-2xl border ${controlCardBg} space-y-4`}
          >
            <div className="flex items-center justify-between border-b border-zinc-500/5 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className={`text-xs font-bold uppercase tracking-widest ${headerTextClass}`}>
                  4. Accessories &amp; Aesthetic Strips
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* RGB Strip counters */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>RGB LED Strips</span>
                  <span className="text-[9px] text-zinc-500 block">5W per strip</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRgbStrips(Math.max(0, rgbStrips - 1))}
                    className="p-1 rounded bg-zinc-500/5 text-zinc-400 hover:text-[#FF5500] active:scale-90"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center font-mono">{rgbStrips}</span>
                  <button
                    type="button"
                    onClick={() => setRgbStrips(Math.min(10, rgbStrips + 1))}
                    className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Fan / RGB Hub */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>RGB Fan Hub</span>
                  <span className="text-[9px] text-zinc-500 block">8W standalone</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRgbController(!rgbController)}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all border active:scale-95 ${
                    rgbController
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-zinc-500/5 border-zinc-500/10 text-zinc-500'
                  }`}
                >
                  {rgbController ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* USB High Draw Devices */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-zinc-500/10 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase ${headerTextClass} block`}>USB Accessories</span>
                  <span className="text-[9px] text-zinc-500 block">Audio/VR (+10W)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUsbHighDrawCount(Math.max(0, usbHighDrawCount - 1))}
                    className="p-1 rounded bg-zinc-500/5 text-zinc-400 hover:text-[#FF5500] active:scale-90"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center font-mono">{usbHighDrawCount}</span>
                  <button
                    type="button"
                    onClick={() => setUsbHighDrawCount(Math.min(8, usbHighDrawCount + 1))}
                    className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] active:scale-90"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Minimal Wattage HUD Panel (Right: 5cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time calculated dial/results card */}
          <div className={`p-6 rounded-2xl border ${
            currentTheme === 'light' ? 'bg-slate-50 border-slate-200/90' : 'bg-zinc-900/40 border-zinc-900'
          } relative overflow-hidden flex flex-col items-center justify-center text-center`}>
            
            <div className="absolute top-3 left-3 bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 rounded-lg py-0.5 px-2 text-[9px] font-mono uppercase tracking-wider">
              Diagnostic Load Output
            </div>

            {/* Glowing circle representation */}
            <div className="relative w-36 h-36 flex items-center justify-center mt-4">
              
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="5"
                  stroke={currentTheme === 'light' ? '#f1f5f9' : '#18181b'}
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  strokeWidth="6"
                  strokeDasharray={390}
                  strokeDashoffset={390 - (390 * Math.min(wattageBreakdown.totalPeak, 1200)) / 1200}
                  stroke={
                    isFormEmpty 
                      ? (currentTheme === 'light' ? '#e2e8f0' : '#27272a')
                      : wattageBreakdown.totalPeak > 750 
                        ? '#ef4444' // highly drawing system (red)
                        : wattageBreakdown.totalPeak > 450 
                          ? '#f97316' // medium (orange)
                          : '#10b981' // green
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Peak Demand</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={wattageBreakdown.totalPeak}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-3xl font-black font-mono tracking-tighter ${headerTextClass}`}
                  >
                    {wattageBreakdown.totalPeak}W
                  </motion.span>
                </AnimatePresence>
                <span className="text-[9px] text-zinc-500 font-mono">Continuous loading</span>
              </div>
            </div>

            {/* Suggested Wattage SMPS Box Target */}
            <div className="w-full border-t border-zinc-500/10 mt-5 pt-4 space-y-1.5">
              <span className={`text-[10px] font-black uppercase tracking-widest ${labelTextClass}`}>
                Recommended Supply Size
              </span>
              <div className="text-4xl font-black font-mono tracking-tighter text-[#FF5500]">
                {recommendedPower.suggestedPsuSize === 0 ? '0W' : `${recommendedPower.suggestedPsuSize}W`}
              </div>
              <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-normal">
                {isFormEmpty 
                  ? 'Total calculated wattage is 0W. Choose silicon elements to simulate.'
                  : `Includes peak load of ${wattageBreakdown.totalPeak}W + a custom safety headroom constraint of ${safetyMargin}% (${recommendedPower.rawRecommended}W).`
                }
              </p>
            </div>
          </div>

          {/* safety margins settings slider */}
          <div className={`p-4 rounded-2xl border ${controlCardBg} space-y-3 text-left`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${headerTextClass}`}>
                Custom Overhead headroom
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
              <span>Low (10%)</span>
              <span>Ideal Balance (25%)</span>
              <span>Future Expansion (50%)</span>
            </div>
          </div>

          {/* certification / 80 plus badge recommendation */}
          <div className={`p-3.5 rounded-2xl border ${
            currentTheme === 'light' ? 'bg-slate-50 border-slate-200/60' : 'bg-zinc-900/10 border-zinc-800/80'
          } text-left space-y-2`}>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white bg-gradient-to-r ${psuEfficiencyAdvice.color} border border-white/5`}>
                {psuEfficiencyAdvice.tier}
              </span>
              <Gauge className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <p className={`text-[10px] ${labelTextClass} leading-normal`}>
              {psuEfficiencyAdvice.desc}
            </p>
          </div>

          {/* component power allocation list */}
          {!isFormEmpty && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 text-left"
            >
              <h4 className={`text-[9px] font-bold uppercase tracking-widest ${labelTextClass}`}>
                Continuous Energy Breakdown
              </h4>
              <div className={`p-4 rounded-2xl border ${controlCardBg} space-y-2.5`}>
                {/* cpu */}
                {wattageBreakdown.cpu > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Processor (CPU Core)</span>
                      <span className={`${headerTextClass} font-bold`}>{wattageBreakdown.cpu}W</span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${(wattageBreakdown.cpu / wattageBreakdown.totalPeak) * 100}%` }} />
                    </div>
                  </div>
                )}
                {/* gpu */}
                {wattageBreakdown.gpu > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Graphics Accelerator (GPU)</span>
                      <span className={`${headerTextClass} font-bold`}>{wattageBreakdown.gpu}W</span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(wattageBreakdown.gpu / wattageBreakdown.totalPeak) * 100}%` }} />
                    </div>
                  </div>
                )}
                {/* other modules */}
                {(wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Motherboard, cooling &amp; peripherals</span>
                      <span className={`${headerTextClass} font-bold`}>
                        {wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories}W
                      </span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ 
                        width: `${((wattageBreakdown.mobo + wattageBreakdown.ram + wattageBreakdown.storage + wattageBreakdown.cooling + wattageBreakdown.accessories) / wattageBreakdown.totalPeak) * 100}%` 
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* expert specialized assembly doorstep help */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF5500]/5 to-indigo-500/5 border border-[#FF5500]/15 text-left space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase text-[#FF5500] tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Assam Doorstep Assembly Integration</span>
            </h4>
            <p className={`text-[10px] ${labelTextClass} leading-normal`}>
              Avoid incorrect wiring connections or micro-volt shorts. Murari provides professional, certified cabinet cable routing, custom liquid loop debugging, and continuous performance evaluations locally.
            </p>

            <button
              onClick={handleWhatsAppInquiry}
              disabled={isFormEmpty}
              className={`w-full py-2.5 px-4 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all ${
                isFormEmpty 
                  ? 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500' 
                  : 'bg-[#FF5500] hover:bg-[#FF4400] text-white hover:shadow-[#FF5500]/20 active:scale-98 cursor-pointer'
              }`}
            >
              <WhatsAppIcon size={12} />
              <span>Inquire Assembly with special list</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
