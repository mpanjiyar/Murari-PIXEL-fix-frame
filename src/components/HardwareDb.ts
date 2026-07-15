export interface CpuModel {
  id: string;
  name: string;
  tdp: number;
  peak: number;
  socket: string;
  series: string;
  category: 'intel-ultra' | 'intel-core' | 'amd-ryzen-9000' | 'amd-ryzen-7000-5000' | 'hedt-server' | 'budget-legacy';
}

export interface GpuModel {
  id: string;
  name: string;
  wattage: number;
  vram: string;
  series: string;
  isNvidia12VHPWR?: boolean;
  transientMultiplier: number;
  category: 'nvidia-rtx-50' | 'nvidia-rtx-40' | 'nvidia-rtx-30-20' | 'amd-radeon-7000' | 'amd-radeon-6000-5000' | 'arc-legacy';
}

export interface MotherboardChipset {
  id: string;
  name: string;
  socket: string;
  formFactor: 'EATX' | 'ATX' | 'mATX' | 'ITX';
  tdp: number;
  overclockSupport: boolean;
  tier: 'High-end Enthusiast' | 'Mainstream' | 'Budget / Entry';
}

export const CPU_DATABASE: CpuModel[] = [
  // Intel Core Ultra Series (LGA1851)
  { id: 'ultra-9-285k', name: 'Intel Core Ultra 9 285K', tdp: 125, peak: 250, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },
  { id: 'ultra-7-265k', name: 'Intel Core Ultra 7 265K', tdp: 125, peak: 240, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },
  { id: 'ultra-5-245k', name: 'Intel Core Ultra 5 245K', tdp: 125, peak: 159, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },
  { id: 'ultra-9-285', name: 'Intel Core Ultra 9 285', tdp: 65, peak: 200, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },
  { id: 'ultra-7-265', name: 'Intel Core Ultra 7 265', tdp: 65, peak: 195, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },
  { id: 'ultra-5-245', name: 'Intel Core Ultra 5 245', tdp: 65, peak: 145, socket: 'LGA1851', series: 'Intel Core Ultra', category: 'intel-ultra' },

  // Intel Core 14th & 13th Gen (LGA1700)
  { id: 'i9-14900ks', name: 'Intel Core i9-14900KS (Extreme)', tdp: 150, peak: 320, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i9-14900k', name: 'Intel Core i9-14900K / 13900K', tdp: 125, peak: 253, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i7-14700k', name: 'Intel Core i7-14700K / 13700K', tdp: 125, peak: 253, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i5-14600k', name: 'Intel Core i5-14600K / 13600K', tdp: 125, peak: 181, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i9-14900', name: 'Intel Core i9-14900 / 13900', tdp: 65, peak: 219, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i7-14700', name: 'Intel Core i7-14700 / 13700', tdp: 65, peak: 219, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i5-14500', name: 'Intel Core i5-14500 / 13500', tdp: 65, peak: 154, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i5-14400', name: 'Intel Core i5-14400 / 13400', tdp: 65, peak: 110, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },
  { id: 'i3-14100', name: 'Intel Core i3-14100 / 13100', tdp: 60, peak: 110, socket: 'LGA1700', series: 'Intel Core 14th/13th Gen', category: 'intel-core' },

  // Intel Core 12th Gen (LGA1700)
  { id: 'i9-12900ks', name: 'Intel Core i9-12900KS Elite', tdp: 150, peak: 260, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },
  { id: 'i9-12900k', name: 'Intel Core i9-12900K', tdp: 125, peak: 241, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },
  { id: 'i7-12700k', name: 'Intel Core i7-12700K', tdp: 125, peak: 190, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },
  { id: 'i5-12600k', name: 'Intel Core i5-12600K', tdp: 125, peak: 150, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },
  { id: 'i5-12400', name: 'Intel Core i5-12400 / 12400F', tdp: 65, peak: 117, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },
  { id: 'i3-12100', name: 'Intel Core i3-12100 / 12100F', tdp: 60, peak: 89, socket: 'LGA1700', series: 'Intel Core 12th Gen', category: 'intel-core' },

  // Intel Core 11th & 10th Gen (LGA1200)
  { id: 'i9-11900k', name: 'Intel Core i9-11900K', tdp: 125, peak: 250, socket: 'LGA1200', series: 'Intel Core 11th Gen', category: 'intel-core' },
  { id: 'i7-11700k', name: 'Intel Core i7-11700K', tdp: 125, peak: 230, socket: 'LGA1200', series: 'Intel Core 11th Gen', category: 'intel-core' },
  { id: 'i5-11600k', name: 'Intel Core i5-11600K', tdp: 125, peak: 180, socket: 'LGA1200', series: 'Intel Core 11th Gen', category: 'intel-core' },
  { id: 'i5-11400', name: 'Intel Core i5-11400', tdp: 65, peak: 154, socket: 'LGA1200', series: 'Intel Core 11th Gen', category: 'intel-core' },
  { id: 'i3-11100', name: 'Intel Core i3-11100', tdp: 65, peak: 100, socket: 'LGA1200', series: 'Intel Core 11th Gen', category: 'intel-core' },
  { id: 'i9-10900k', name: 'Intel Core i9-10900K', tdp: 125, peak: 250, socket: 'LGA1200', series: 'Intel Core 10th Gen', category: 'intel-core' },
  { id: 'i7-10700k', name: 'Intel Core i7-10700K', tdp: 125, peak: 229, socket: 'LGA1200', series: 'Intel Core 10th Gen', category: 'intel-core' },
  { id: 'i5-10600k', name: 'Intel Core i5-10600K', tdp: 125, peak: 182, socket: 'LGA1200', series: 'Intel Core 10th Gen', category: 'intel-core' },
  { id: 'i5-10400', name: 'Intel Core i5-10400', tdp: 65, peak: 134, socket: 'LGA1200', series: 'Intel Core 10th Gen', category: 'intel-core' },
  { id: 'i3-10100', name: 'Intel Core i3-10100', tdp: 65, peak: 90, socket: 'LGA1200', series: 'Intel Core 10th Gen', category: 'intel-core' },

  // Intel Core 9th & 8th Gen (LGA1151-v2) - Legacy / Budget
  { id: 'i9-9900k', name: 'Intel Core i9-9900K', tdp: 95, peak: 210, socket: 'LGA1151-v2', series: 'Intel Core 9th Gen', category: 'budget-legacy' },
  { id: 'i7-9700k', name: 'Intel Core i7-9700K', tdp: 95, peak: 190, socket: 'LGA1151-v2', series: 'Intel Core 9th Gen', category: 'budget-legacy' },
  { id: 'i5-9600k', name: 'Intel Core i5-9600K', tdp: 95, peak: 150, socket: 'LGA1151-v2', series: 'Intel Core 9th Gen', category: 'budget-legacy' },
  { id: 'i3-9100', name: 'Intel Core i3-9100', tdp: 65, peak: 90, socket: 'LGA1151-v2', series: 'Intel Core 9th Gen', category: 'budget-legacy' },
  { id: 'i7-8700k', name: 'Intel Core i7-8700K', tdp: 95, peak: 145, socket: 'LGA1151-v2', series: 'Intel Core 8th Gen', category: 'budget-legacy' },
  { id: 'i5-8400', name: 'Intel Core i5-8400', tdp: 65, peak: 110, socket: 'LGA1151-v2', series: 'Intel Core 8th Gen', category: 'budget-legacy' },
  { id: 'i3-8100', name: 'Intel Core i3-8100', tdp: 65, peak: 85, socket: 'LGA1151-v2', series: 'Intel Core 8th Gen', category: 'budget-legacy' },

  // Intel Core 7th & 6th Gen (LGA1151)
  { id: 'i7-7700k', name: 'Intel Core i7-7700K', tdp: 91, peak: 130, socket: 'LGA1151', series: 'Intel Core 7th Gen', category: 'budget-legacy' },
  { id: 'i5-7500', name: 'Intel Core i5-7500', tdp: 65, peak: 90, socket: 'LGA1151', series: 'Intel Core 7th Gen', category: 'budget-legacy' },
  { id: 'i3-7100', name: 'Intel Core i3-7100', tdp: 51, peak: 75, socket: 'LGA1151', series: 'Intel Core 7th Gen', category: 'budget-legacy' },
  { id: 'i7-6700k', name: 'Intel Core i7-6700K', tdp: 91, peak: 135, socket: 'LGA1151', series: 'Intel Core 6th Gen', category: 'budget-legacy' },
  { id: 'i5-6500', name: 'Intel Core i5-6500', tdp: 65, peak: 90, socket: 'LGA1151', series: 'Intel Core 6th Gen', category: 'budget-legacy' },
  { id: 'i3-6100', name: 'Intel Core i3-6100', tdp: 47, peak: 70, socket: 'LGA1151', series: 'Intel Core 6th Gen', category: 'budget-legacy' },

  // Intel Core 5th & 4th Gen (LGA1150)
  { id: 'i7-5775c', name: 'Intel Core i7-5775C', tdp: 65, peak: 105, socket: 'LGA1150', series: 'Intel Core 5th Gen', category: 'budget-legacy' },
  { id: 'i5-5675c', name: 'Intel Core i5-5675C', tdp: 65, peak: 95, socket: 'LGA1150', series: 'Intel Core 5th Gen', category: 'budget-legacy' },
  { id: 'i7-4790k', name: 'Intel Core i7-4790K (Devil\'s Canyon)', tdp: 88, peak: 125, socket: 'LGA1150', series: 'Intel Core 4th Gen', category: 'budget-legacy' },
  { id: 'i5-4690k', name: 'Intel Core i5-4690K', tdp: 88, peak: 120, socket: 'LGA1150', series: 'Intel Core 4th Gen', category: 'budget-legacy' },
  { id: 'i3-4130', name: 'Intel Core i3-4130', tdp: 54, peak: 75, socket: 'LGA1150', series: 'Intel Core 4th Gen', category: 'budget-legacy' },

  // Intel Core 3rd & 2nd Gen (LGA1155)
  { id: 'i7-3770k', name: 'Intel Core i7-3770K', tdp: 77, peak: 115, socket: 'LGA1155', series: 'Intel Core 3rd Gen', category: 'budget-legacy' },
  { id: 'i5-3570k', name: 'Intel Core i5-3570K', tdp: 77, peak: 110, socket: 'LGA1155', series: 'Intel Core 3rd Gen', category: 'budget-legacy' },
  { id: 'i3-3220', name: 'Intel Core i3-3220', tdp: 55, peak: 75, socket: 'LGA1155', series: 'Intel Core 3rd Gen', category: 'budget-legacy' },
  { id: 'i7-2600k', name: 'Intel Core i7-2600K', tdp: 95, peak: 135, socket: 'LGA1155', series: 'Intel Core 2nd Gen', category: 'budget-legacy' },
  { id: 'i5-2500k', name: 'Intel Core i5-2500K', tdp: 95, peak: 130, socket: 'LGA1155', series: 'Intel Core 2nd Gen', category: 'budget-legacy' },
  { id: 'i3-2100', name: 'Intel Core i3-2100', tdp: 65, peak: 85, socket: 'LGA1155', series: 'Intel Core 2nd Gen', category: 'budget-legacy' },

  // Intel Core 1st Gen (LGA1156 / LGA1366)
  { id: 'i7-920', name: 'Intel Core i7-920 (Nehalem Classic)', tdp: 130, peak: 180, socket: 'LGA1366', series: 'Intel Core 1st Gen', category: 'budget-legacy' },
  { id: 'i5-750', name: 'Intel Core i5-750', tdp: 95, peak: 140, socket: 'LGA1156', series: 'Intel Core 1st Gen', category: 'budget-legacy' },
  { id: 'i3-530', name: 'Intel Core i3-530', tdp: 73, peak: 95, socket: 'LGA1156', series: 'Intel Core 1st Gen', category: 'budget-legacy' },

  // Intel Pentium & Celeron Families
  { id: 'pentium-g7400', name: 'Intel Pentium Gold G7400', tdp: 46, peak: 58, socket: 'LGA1700', series: 'Intel Pentium / Celeron', category: 'budget-legacy' },
  { id: 'celeron-g6900', name: 'Intel Celeron G6900', tdp: 46, peak: 55, socket: 'LGA1700', series: 'Intel Pentium / Celeron', category: 'budget-legacy' },
  { id: 'pentium-g6400', name: 'Intel Pentium Gold G6400', tdp: 58, peak: 70, socket: 'LGA1200', series: 'Intel Pentium / Celeron', category: 'budget-legacy' },
  { id: 'celeron-g5900', name: 'Intel Celeron G5900', tdp: 58, peak: 68, socket: 'LGA1200', series: 'Intel Pentium / Celeron', category: 'budget-legacy' },
  { id: 'pentium-g4560', name: 'Intel Pentium G4560 (The Budget Legend)', tdp: 54, peak: 68, socket: 'LGA1151', series: 'Intel Pentium / Celeron', category: 'budget-legacy' },

  // Intel Xeon Server & Workstation Series
  { id: 'xeon-w9-3495x', name: 'Intel Xeon w9-3495X Workstation', tdp: 350, peak: 420, socket: 'LGA4677', series: 'Intel Xeon Series', category: 'hedt-server' },
  { id: 'xeon-w7-2495x', name: 'Intel Xeon w7-2495X Workstation', tdp: 225, peak: 270, socket: 'LGA4677', series: 'Intel Xeon Series', category: 'hedt-server' },
  { id: 'xeon-e5-2697v4', name: 'Intel Xeon E5-2697 v4 Server', tdp: 145, peak: 180, socket: 'LGA2011-3', series: 'Intel Xeon Series', category: 'hedt-server' },
  { id: 'xeon-e5-2680v3', name: 'Intel Xeon E5-2680 v3 Server', tdp: 120, peak: 150, socket: 'LGA2011-3', series: 'Intel Xeon Series', category: 'hedt-server' },
  { id: 'xeon-e3-1230v3', name: 'Intel Xeon E3-1230 v3 Quad-Core', tdp: 80, peak: 110, socket: 'LGA1150', series: 'Intel Xeon Series', category: 'budget-legacy' },

  // AMD Ryzen 9000 Series (AM5)
  { id: 'r9-9950x', name: 'AMD Ryzen 9 9950X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 9000 Series', category: 'amd-ryzen-9000' },
  { id: 'r9-9900x', name: 'AMD Ryzen 9 9900X', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 9000 Series', category: 'amd-ryzen-9000' },
  { id: 'r7-9800x3d', name: 'AMD Ryzen 7 9800X3D (3D V-Cache)', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 9000 Series', category: 'amd-ryzen-9000' },
  { id: 'r7-9700x', name: 'AMD Ryzen 7 9700X', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 9000 Series', category: 'amd-ryzen-9000' },
  { id: 'r5-9600x', name: 'AMD Ryzen 5 9600X', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 9000 Series', category: 'amd-ryzen-9000' },

  // AMD Ryzen 8000 Series APU (AM5)
  { id: 'r7-8700g', name: 'AMD Ryzen 7 8700G APU', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 8000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-8600g', name: 'AMD Ryzen 5 8600G APU', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 8000 Series', category: 'amd-ryzen-7000-5000' },

  // AMD Ryzen 7000 Series (AM5)
  { id: 'r9-7950x3d', name: 'AMD Ryzen 9 7950X3D', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r9-7950x', name: 'AMD Ryzen 9 7950X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r9-7900x3d', name: 'AMD Ryzen 9 7900X3D', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r9-7900x', name: 'AMD Ryzen 9 7900X', tdp: 170, peak: 230, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D', tdp: 120, peak: 162, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-7700x', name: 'AMD Ryzen 7 7700X', tdp: 105, peak: 142, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-7600x', name: 'AMD Ryzen 5 7600X', tdp: 105, peak: 142, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-7500f', name: 'AMD Ryzen 5 7500F OEM', tdp: 65, peak: 88, socket: 'AM5', series: 'AMD Ryzen 7000 Series', category: 'amd-ryzen-7000-5000' },

  // AMD Ryzen 5000 Series (AM4)
  { id: 'r9-5950x', name: 'AMD Ryzen 9 5950X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r9-5900x', name: 'AMD Ryzen 9 5900X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-5800x3d', name: 'AMD Ryzen 7 5800X3D', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-5800x', name: 'AMD Ryzen 7 5800X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-5700x3d', name: 'AMD Ryzen 7 5700X3D', tdp: 105, peak: 140, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r7-5700x', name: 'AMD Ryzen 7 5700X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-5600x', name: 'AMD Ryzen 5 5600X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-5600', name: 'AMD Ryzen 5 5600', tdp: 65, peak: 78, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r5-5500', name: 'AMD Ryzen 5 5500', tdp: 65, peak: 75, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },
  { id: 'r3-5300g', name: 'AMD Ryzen 3 5300G APU', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen 5000 Series', category: 'amd-ryzen-7000-5000' },

  // AMD Ryzen 3000 Series (AM4) - Budget / Legacy
  { id: 'r9-3950x', name: 'AMD Ryzen 9 3950X', tdp: 105, peak: 145, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r9-3900x', name: 'AMD Ryzen 9 3900X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r7-3800x', name: 'AMD Ryzen 7 3800X', tdp: 105, peak: 142, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r7-3700x', name: 'AMD Ryzen 7 3700X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r5-3600x', name: 'AMD Ryzen 5 3600X', tdp: 95, peak: 115, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r5-3600', name: 'AMD Ryzen 5 3600', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r3-3300x', name: 'AMD Ryzen 3 3300X', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },
  { id: 'r3-3100', name: 'AMD Ryzen 3 3100', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen 3000 Series', category: 'budget-legacy' },

  // AMD Ryzen 2000 & 1000 Series (AM4)
  { id: 'r7-2700x', name: 'AMD Ryzen 7 2700X', tdp: 105, peak: 140, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r5-2600x', name: 'AMD Ryzen 5 2600X', tdp: 95, peak: 120, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r5-2600', name: 'AMD Ryzen 5 2600', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r3-2200g', name: 'AMD Ryzen 3 2200G APU', tdp: 65, peak: 85, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r7-1800x', name: 'AMD Ryzen 7 1800X', tdp: 95, peak: 140, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r7-1700x', name: 'AMD Ryzen 7 1700X', tdp: 95, peak: 135, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r5-1600', name: 'AMD Ryzen 5 1600 (Zen Classic)', tdp: 65, peak: 88, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },
  { id: 'r3-1200', name: 'AMD Ryzen 3 1200', tdp: 65, peak: 80, socket: 'AM4', series: 'AMD Ryzen 2000/1000 Series', category: 'budget-legacy' },

  // AMD Athlon Family
  { id: 'athlon-3000g', name: 'AMD Athlon 3000G Dual-Core', tdp: 35, peak: 45, socket: 'AM4', series: 'AMD Athlon Series', category: 'budget-legacy' },
  { id: 'athlon-200ge', name: 'AMD Athlon 200GE Dual-Core', tdp: 35, peak: 42, socket: 'AM4', series: 'AMD Athlon Series', category: 'budget-legacy' },

  // HEDT & Server (Threadripper, Epyc)
  { id: 'tr-7995wx', name: 'AMD Threadripper PRO 7995WX (96 Cores)', tdp: 350, peak: 480, socket: 'sTR5', series: 'AMD Threadripper HEDT', category: 'hedt-server' },
  { id: 'tr-7980x', name: 'AMD Threadripper 7980X (64 Cores)', tdp: 350, peak: 450, socket: 'sTR5', series: 'AMD Threadripper HEDT', category: 'hedt-server' },
  { id: 'tr-3990x', name: 'AMD Threadripper 3990X (64 Cores)', tdp: 280, peak: 380, socket: 'sTRX4', series: 'AMD Threadripper HEDT', category: 'hedt-server' },
  { id: 'tr-1950x', name: 'AMD Threadripper 1950X', tdp: 180, peak: 250, socket: 'TR4', series: 'AMD Threadripper HEDT', category: 'hedt-server' },
  { id: 'epyc-9654', name: 'AMD EPYC 9654 Genoa Server (96 Cores)', tdp: 360, peak: 400, socket: 'SP5', series: 'AMD EPYC Server', category: 'hedt-server' },
  { id: 'epyc-7763', name: 'AMD EPYC 7763 Milan Server (64 Cores)', tdp: 280, peak: 320, socket: 'SP3', series: 'AMD EPYC Server', category: 'hedt-server' },

  // AMD FX Series Legacy
  { id: 'fx-9590', name: 'AMD FX-9590 Octa-Core (Beast)', tdp: 220, peak: 300, socket: 'AM3+', series: 'AMD FX Series Legacy', category: 'budget-legacy' },
  { id: 'fx-8350', name: 'AMD FX-8350 Octa-Core', tdp: 125, peak: 180, socket: 'AM3+', series: 'AMD FX Series Legacy', category: 'budget-legacy' }
];

export const GPU_DATABASE: GpuModel[] = [
  // NVIDIA RTX 50 Series (Blackwell)
  { id: 'rtx-5090', name: 'NVIDIA GeForce RTX 5090 Flagship', wattage: 600, vram: '32GB', series: 'NVIDIA RTX 50 Series', isNvidia12VHPWR: true, transientMultiplier: 1.9, category: 'nvidia-rtx-50' },
  { id: 'rtx-5080', name: 'NVIDIA GeForce RTX 5080 Elite', wattage: 400, vram: '16GB', series: 'NVIDIA RTX 50 Series', isNvidia12VHPWR: true, transientMultiplier: 1.7, category: 'nvidia-rtx-50' },
  { id: 'rtx-5070ti', name: 'NVIDIA GeForce RTX 5070 Ti', wattage: 275, vram: '16GB', series: 'NVIDIA RTX 50 Series', isNvidia12VHPWR: true, transientMultiplier: 1.5, category: 'nvidia-rtx-50' },
  { id: 'rtx-5070', name: 'NVIDIA GeForce RTX 5070', wattage: 250, vram: '12GB', series: 'NVIDIA RTX 50 Series', isNvidia12VHPWR: true, transientMultiplier: 1.4, category: 'nvidia-rtx-50' },

  // NVIDIA RTX 40 Series (Ada Lovelace)
  { id: 'rtx-4090', name: 'NVIDIA GeForce RTX 4090 Extreme', wattage: 450, vram: '24GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: true, transientMultiplier: 1.8, category: 'nvidia-rtx-40' },
  { id: 'rtx-4080s', name: 'NVIDIA GeForce RTX 4080 Super', wattage: 320, vram: '16GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: true, transientMultiplier: 1.6, category: 'nvidia-rtx-40' },
  { id: 'rtx-4070tis', name: 'NVIDIA GeForce RTX 4070 Ti Super', wattage: 285, vram: '16GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: true, transientMultiplier: 1.5, category: 'nvidia-rtx-40' },
  { id: 'rtx-4070s', name: 'NVIDIA GeForce RTX 4070 Super', wattage: 220, vram: '12GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: true, transientMultiplier: 1.4, category: 'nvidia-rtx-40' },
  { id: 'rtx-4060ti', name: 'NVIDIA GeForce RTX 4060 Ti', wattage: 165, vram: '8GB/16GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'nvidia-rtx-40' },
  { id: 'rtx-4060', name: 'NVIDIA GeForce RTX 4060', wattage: 115, vram: '8GB', series: 'NVIDIA RTX 40 Series', isNvidia12VHPWR: false, transientMultiplier: 1.2, category: 'nvidia-rtx-40' },

  // NVIDIA RTX 30 & 20 Series (Ampere / Turing)
  { id: 'rtx-3090ti', name: 'NVIDIA GeForce RTX 3090 Ti', wattage: 450, vram: '24GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.8, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3090', name: 'NVIDIA GeForce RTX 3090', wattage: 350, vram: '24GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.6, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3080ti', name: 'NVIDIA GeForce RTX 3080 Ti', wattage: 350, vram: '12GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.6, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3080', name: 'NVIDIA GeForce RTX 3080', wattage: 320, vram: '10GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.5, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3070ti', name: 'NVIDIA GeForce RTX 3070 Ti', wattage: 290, vram: '8GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.4, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3070', name: 'NVIDIA GeForce RTX 3070', wattage: 220, vram: '8GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.4, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3060ti', name: 'NVIDIA GeForce RTX 3060 Ti', wattage: 200, vram: '8GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-3060', name: 'NVIDIA GeForce RTX 3060', wattage: 170, vram: '12GB', series: 'NVIDIA RTX 30 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-2080ti', name: 'NVIDIA GeForce RTX 2080 Ti', wattage: 250, vram: '11GB', series: 'NVIDIA RTX 20 Series', isNvidia12VHPWR: false, transientMultiplier: 1.4, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-2070s', name: 'NVIDIA GeForce RTX 2070 Super', wattage: 215, vram: '8GB', series: 'NVIDIA RTX 20 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'nvidia-rtx-30-20' },
  { id: 'rtx-2060', name: 'NVIDIA GeForce RTX 2060', wattage: 160, vram: '6GB', series: 'NVIDIA RTX 20 Series', isNvidia12VHPWR: false, transientMultiplier: 1.2, category: 'nvidia-rtx-30-20' },

  // AMD Radeon RX 7000 Series (RDNA3)
  { id: 'rx-7900xtx', name: 'AMD Radeon RX 7900 XTX Premium', wattage: 355, vram: '24GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.5, category: 'amd-radeon-7000' },
  { id: 'rx-7900xt', name: 'AMD Radeon RX 7900 XT', wattage: 315, vram: '20GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.4, category: 'amd-radeon-7000' },
  { id: 'rx-7900gre', name: 'AMD Radeon RX 7900 GRE', wattage: 260, vram: '16GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'amd-radeon-7000' },
  { id: 'rx-7800xt', name: 'AMD Radeon RX 7800 XT', wattage: 263, vram: '16GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'amd-radeon-7000' },
  { id: 'rx-7700xt', name: 'AMD Radeon RX 7700 XT', wattage: 245, vram: '12GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'amd-radeon-7000' },
  { id: 'rx-7600xt', name: 'AMD Radeon RX 7600 XT', wattage: 190, vram: '16GB', series: 'AMD RX 7000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.2, category: 'amd-radeon-7000' },

  // AMD Radeon RX 6000 & 5000 Series
  { id: 'rx-6950xt', name: 'AMD Radeon RX 6950 XT', wattage: 335, vram: '16GB', series: 'AMD RX 6000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.6, category: 'amd-radeon-6000-5000' },
  { id: 'rx-6900xt', name: 'AMD Radeon RX 6900 XT', wattage: 300, vram: '16GB', series: 'AMD RX 6000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.5, category: 'amd-radeon-6000-5000' },
  { id: 'rx-6800xt', name: 'AMD Radeon RX 6800 XT', wattage: 300, vram: '16GB', series: 'AMD RX 6000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.4, category: 'amd-radeon-6000-5000' },
  { id: 'rx-6700xt', name: 'AMD Radeon RX 6700 XT', wattage: 230, vram: '12GB', series: 'AMD RX 6000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'amd-radeon-6000-5000' },
  { id: 'rx-5700xt', name: 'AMD Radeon RX 5700 XT', wattage: 225, vram: '8GB', series: 'AMD RX 5000 Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'amd-radeon-6000-5000' },

  // Intel Arc & Legacy Graphics
  { id: 'arc-b580', name: 'Intel Arc B580 (Battlemage)', wattage: 190, vram: '12GB', series: 'Intel Arc Graphics', isNvidia12VHPWR: false, transientMultiplier: 1.2, category: 'arc-legacy' },
  { id: 'arc-a770', name: 'Intel Arc A770 Alchemist', wattage: 225, vram: '16GB', series: 'Intel Arc Graphics', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'arc-legacy' },
  { id: 'gtx-1080ti', name: 'NVIDIA GeForce GTX 1080 Ti Classic', wattage: 250, vram: '11GB', series: 'NVIDIA GTX Series', isNvidia12VHPWR: false, transientMultiplier: 1.3, category: 'arc-legacy' },
  { id: 'rx-580', name: 'AMD Radeon RX 580 (Polaris Core)', wattage: 185, vram: '8GB', series: 'AMD Radeon Legacy', isNvidia12VHPWR: false, transientMultiplier: 1.2, category: 'arc-legacy' },
  { id: 'gtx-1660s', name: 'NVIDIA GeForce GTX 1660 Super', wattage: 125, vram: '6GB', series: 'NVIDIA GTX Series', isNvidia12VHPWR: false, transientMultiplier: 1.15, category: 'arc-legacy' },
  { id: 'gtx-750ti', name: 'NVIDIA GeForce GTX 750 Ti Low-Power', wattage: 60, vram: '2GB', series: 'NVIDIA GTX Series', isNvidia12VHPWR: false, transientMultiplier: 1.1, category: 'arc-legacy' },
];

export const CHIPSET_DATABASE: MotherboardChipset[] = [
  // LGA1851 (Intel Ultra 200)
  { id: 'z890', name: 'Intel Z890 Premium', socket: 'LGA1851', formFactor: 'ATX', tdp: 75, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b860', name: 'Intel B860 Gaming', socket: 'LGA1851', formFactor: 'mATX', tdp: 50, overclockSupport: false, tier: 'Mainstream' },
  { id: 'h810', name: 'Intel H810 Office', socket: 'LGA1851', formFactor: 'ITX', tdp: 35, overclockSupport: false, tier: 'Budget / Entry' },

  // LGA1700 (Intel 12/13/14th Gen)
  { id: 'z790', name: 'Intel Z790 Enthusiast', socket: 'LGA1700', formFactor: 'ATX', tdp: 70, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b760', name: 'Intel B760 Creator', socket: 'LGA1700', formFactor: 'mATX', tdp: 45, overclockSupport: false, tier: 'Mainstream' },
  { id: 'h610', name: 'Intel H610 Budget', socket: 'LGA1700', formFactor: 'ITX', tdp: 30, overclockSupport: false, tier: 'Budget / Entry' },

  // LGA1200 (Intel 10/11th Gen)
  { id: 'z590', name: 'Intel Z590 Enthusiast', socket: 'LGA1200', formFactor: 'ATX', tdp: 68, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b560', name: 'Intel B560 Gaming', socket: 'LGA1200', formFactor: 'mATX', tdp: 42, overclockSupport: false, tier: 'Mainstream' },
  { id: 'h510', name: 'Intel H510 Entry', socket: 'LGA1200', formFactor: 'mATX', tdp: 28, overclockSupport: false, tier: 'Budget / Entry' },

  // LGA1151-v2 (Intel 8/9th Gen)
  { id: 'z390', name: 'Intel Z390 Gaming', socket: 'LGA1151-v2', formFactor: 'ATX', tdp: 65, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b365', name: 'Intel B365 Express', socket: 'LGA1151-v2', formFactor: 'mATX', tdp: 38, overclockSupport: false, tier: 'Mainstream' },

  // LGA1151 (Intel 6/7th Gen)
  { id: 'z270', name: 'Intel Z270 Enthusiast', socket: 'LGA1151', formFactor: 'ATX', tdp: 60, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b250', name: 'Intel B250 Pro', socket: 'LGA1151', formFactor: 'mATX', tdp: 35, overclockSupport: false, tier: 'Mainstream' },

  // LGA1150 (Intel 4/5th Gen)
  { id: 'z97', name: 'Intel Z97 Overclocking', socket: 'LGA1150', formFactor: 'ATX', tdp: 55, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'h81', name: 'Intel H81 Budget', socket: 'LGA1150', formFactor: 'mATX', tdp: 25, overclockSupport: false, tier: 'Budget / Entry' },

  // LGA1155 (Intel 2/3rd Gen)
  { id: 'z77', name: 'Intel Z77 Enthusiast', socket: 'LGA1155', formFactor: 'ATX', tdp: 50, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'h61', name: 'Intel H61 Value', socket: 'LGA1155', formFactor: 'mATX', tdp: 25, overclockSupport: false, tier: 'Budget / Entry' },

  // AM5 (AMD Ryzen 7000/8000/9000)
  { id: 'x870e', name: 'AMD X870E Premium Dual-Chipset', socket: 'AM5', formFactor: 'ATX', tdp: 80, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'x870', name: 'AMD X870 High-Performance', socket: 'AM5', formFactor: 'ATX', tdp: 65, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b650', name: 'AMD B650 / B650E Gaming', socket: 'AM5', formFactor: 'mATX', tdp: 50, overclockSupport: true, tier: 'Mainstream' },
  { id: 'a620', name: 'AMD A620 Value', socket: 'AM5', formFactor: 'ITX', tdp: 35, overclockSupport: false, tier: 'Budget / Entry' },

  // AM4 (AMD Ryzen 1000 to 5000)
  { id: 'x570', name: 'AMD X570 Active-Cooling', socket: 'AM4', formFactor: 'ATX', tdp: 60, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'b550', name: 'AMD B550 Gaming', socket: 'AM4', formFactor: 'mATX', tdp: 40, overclockSupport: true, tier: 'Mainstream' },
  { id: 'a320', name: 'AMD A320 Value Core', socket: 'AM4', formFactor: 'ITX', tdp: 25, overclockSupport: false, tier: 'Budget / Entry' },

  // AM3+ / Other Legacy
  { id: '990fx', name: 'AMD 990FX Chipset', socket: 'AM3+', formFactor: 'ATX', tdp: 45, overclockSupport: true, tier: 'High-end Enthusiast' },

  // HEDT / Server
  { id: 'trx50', name: 'AMD TRX50 Threadripper Board', socket: 'sTR5', formFactor: 'EATX', tdp: 110, overclockSupport: true, tier: 'High-end Enthusiast' },
  { id: 'wrx90', name: 'AMD WRX90 Enterprise Station', socket: 'sTR5', formFactor: 'EATX', tdp: 140, overclockSupport: true, tier: 'High-end Enthusiast' },
];
