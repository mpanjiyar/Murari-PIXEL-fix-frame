export interface BiosBootKeyInfo {
  id: string;
  brand: string;
  type: 'laptop' | 'desktop' | 'motherboard' | 'all';
  name: string;
  biosKeyNew: string;
  biosKeyOld: string;
  bootMenuNew: string;
  bootMenuOld: string;
  notes: string;
  popularModels?: string[];
}

export const BIOS_BOOT_KEYS_DATABASE: BiosBootKeyInfo[] = [
  {
    id: 'hp',
    brand: 'HP',
    type: 'all',
    name: 'HP (Hewlett-Packard) Laptops & Desktops',
    biosKeyNew: 'F10',
    biosKeyOld: 'F1 or F2',
    bootMenuNew: 'F9',
    bootMenuOld: 'Esc or F9',
    popularModels: ['Pavilion', 'EliteBook', 'ProBook', 'Spectre', 'Envy', 'OMEN', 'Victus', 'HP EliteDesk', 'HP ProDesk'],
    notes: 'Tap Esc repeatedly immediately after powering on to open the Startup Menu, then press F9 for Boot Menu or F10 for BIOS/UEFI Setup.'
  },
  {
    id: 'dell',
    brand: 'Dell',
    type: 'all',
    name: 'Dell Laptops & Desktops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2 or Delete',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['XPS', 'Inspiron', 'Latitude', 'Vostro', 'Precision', 'Alienware', 'OptiPlex', 'PowerEdge'],
    notes: 'Tap F12 rapidly when the Dell logo appears to access the one-time boot menu. For older OptiPlex/Precision models, Del or F2 is preferred for BIOS setup.'
  },
  {
    id: 'asus_laptop',
    brand: 'ASUS',
    type: 'laptop',
    name: 'ASUS Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2 or Delete',
    bootMenuNew: 'Esc',
    bootMenuOld: 'Esc',
    popularModels: ['ZenBook', 'VivoBook', 'ROG Zephyrus', 'TUF Gaming', 'ExpertBook', 'Chromebook'],
    notes: 'Power off completely. Hold down the F2 key, then press the Power button once. Keep holding F2 until the UEFI/BIOS utility appears.'
  },
  {
    id: 'asus_motherboard',
    brand: 'ASUS',
    type: 'motherboard',
    name: 'ASUS Motherboards & Custom Desktops',
    biosKeyNew: 'Delete or F2',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F8',
    bootMenuOld: 'F8',
    popularModels: ['ROG Strix', 'TUF Gaming', 'PRIME', 'ProArt', 'ROG Maximus'],
    notes: 'Tap Delete or F2 continuously as soon as the screen turns on. Press F8 repeatedly during startup to trigger the Boot Device Selection menu.'
  },
  {
    id: 'lenovo_thinkpad',
    brand: 'Lenovo',
    type: 'laptop',
    name: 'Lenovo ThinkPad & ThinkCentre',
    biosKeyNew: 'F1 or Enter',
    biosKeyOld: 'F1 or F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['ThinkPad X1 Carbon', 'ThinkPad T-Series', 'ThinkPad L-Series', 'ThinkCentre', 'ThinkStation'],
    notes: 'Press the Power button, then immediately tap Enter repeatedly to interrupt normal startup. Press F1 for BIOS or F12 for the Boot Menu. Note: Fn+F1/Fn+F12 may be required.'
  },
  {
    id: 'lenovo_ideapad',
    brand: 'Lenovo',
    type: 'laptop',
    name: 'Lenovo IdeaPad, Yoga, Legion & LOQ Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'Fn + F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'Fn + F12',
    popularModels: ['IdeaPad Slim', 'Yoga Pro', 'Legion Pro', 'LOQ Gaming', 'Flex', 'Duet'],
    notes: 'Press the "Novo" button (a small pinhole with a counter-clockwise arrow icon on the side or bottom) while powered off to enter the Novo Menu, then select BIOS Setup or Boot Menu.'
  },
  {
    id: 'acer',
    brand: 'Acer',
    type: 'all',
    name: 'Acer Laptops & Desktops',
    biosKeyNew: 'F2',
    biosKeyOld: 'Delete or F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'Esc or F9',
    popularModels: ['Aspire', 'Nitro 5/16', 'Predator Helios', 'Swift', 'Spin', 'Veriton'],
    notes: 'By default, the F12 Boot Menu is disabled on Acer laptops. Boot into BIOS first using F2, go to the "Main" tab, enable "F12 Boot Menu", save changes, and restart.'
  },
  {
    id: 'msi_laptop',
    brand: 'MSI',
    type: 'laptop',
    name: 'MSI Gaming & Creator Laptops',
    biosKeyNew: 'Delete',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F11',
    bootMenuOld: 'F11',
    popularModels: ['Raider', 'Stealth', 'Katana', 'Cyborg', 'Prestige', 'Summit', 'Modern'],
    notes: 'Tap Delete repeatedly immediately after power-on to load MSI UEFI Click BIOS. Tap F11 to select the bootable flash drive.'
  },
  {
    id: 'msi_motherboard',
    brand: 'MSI',
    type: 'motherboard',
    name: 'MSI Motherboards',
    biosKeyNew: 'Delete',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F11',
    bootMenuOld: 'F11',
    popularModels: ['MAG B650/B760', 'MPG', 'MEG', 'PRO Series'],
    notes: 'Tap Delete on keyboard after powering on to enter the Click BIOS setup. Press F11 for the interactive Boot selection menu.'
  },
  {
    id: 'gigabyte',
    brand: 'Gigabyte / Aorus',
    type: 'all',
    name: 'Gigabyte Motherboards & Aorus Gaming Laptops',
    biosKeyNew: 'Delete',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['AORUS Elite', 'GIGABYTE UD', 'AERO', 'G5/G7 Gaming'],
    notes: 'Tap Delete continuously on startup to access Gigabyte BIOS Setup. Press F12 repeatedly to display the boot device override list.'
  },
  {
    id: 'asrock',
    brand: 'ASRock',
    type: 'motherboard',
    name: 'ASRock Motherboards & Mini PCs',
    biosKeyNew: 'Delete or F2',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F11',
    bootMenuOld: 'F11',
    popularModels: ['Pro4', 'Steel Legend', 'Taichi', 'Phantom Gaming', 'DeskMini'],
    notes: 'Tap Delete or F2 repeatedly when the ASRock splash logo appears. Press F11 to trigger the Boot Selection window.'
  },
  {
    id: 'apple_intel',
    brand: 'Apple',
    type: 'laptop',
    name: 'Apple Mac (Intel-based)',
    biosKeyNew: 'N/A (Hold Cmd+R)',
    biosKeyOld: 'N/A',
    bootMenuNew: 'Hold Option (Alt)',
    bootMenuOld: 'Hold Option (Alt)',
    popularModels: ['MacBook Pro (Intel)', 'MacBook Air (Intel)', 'iMac (Intel)', 'Mac mini (Intel)'],
    notes: 'Intel Macs do not use a standard BIOS. To boot from a USB drive, hold down the Option (Alt) key immediately after the startup chime.'
  },
  {
    id: 'apple_silicon',
    brand: 'Apple',
    type: 'laptop',
    name: 'Apple Mac (M1/M2/M3 Silicon)',
    biosKeyNew: 'N/A (Hold Power)',
    biosKeyOld: 'N/A',
    bootMenuNew: 'Hold Power Button',
    bootMenuOld: 'N/A',
    popularModels: ['MacBook Pro (M1/M2/M3)', 'MacBook Air (M1/M2/M3)', 'iMac (M-Series)', 'Mac Studio', 'Mac mini (M-Series)'],
    notes: 'Completely shut down the Mac. Press and hold the Power button. Continue holding it until you see "Loading startup options" to select bootable volumes or Recovery tools.'
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    type: 'laptop',
    name: 'Samsung Galaxy Book Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'F10',
    bootMenuOld: 'Esc or F10',
    popularModels: ['Galaxy Book4 Ultra', 'Galaxy Book Pro', 'Galaxy Book Flex', 'Samsung Odyssey'],
    notes: 'Tap F2 key on startup to access the Samsung BIOS Utility. Tap F10 continuously to load the Boot Device Selection list.'
  },
  {
    id: 'microsoft_surface',
    brand: 'Microsoft',
    type: 'laptop',
    name: 'Microsoft Surface Book, Laptop & Pro Tablets',
    biosKeyNew: 'Hold Vol Up + Power',
    biosKeyOld: 'Hold Vol Up + Power',
    bootMenuNew: 'Hold Vol Down + Power',
    bootMenuOld: 'Hold Vol Down + Power',
    popularModels: ['Surface Pro 7/8/9/10', 'Surface Laptop 5/6', 'Surface Book 3', 'Surface Go'],
    notes: 'Ensure device is off. Press and hold the Volume Up button, then press/release Power. Release Volume Up when the Surface logo appears to access UEFI. For Boot Menu, hold Volume Down instead.'
  },
  {
    id: 'intel_nuc',
    brand: 'Intel',
    type: 'desktop',
    name: 'Intel NUC Mini PCs',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'F10',
    bootMenuOld: 'F10',
    popularModels: ['NUC 11/12/13 Extreme', 'NUC Pro', 'NUC Core Kits'],
    notes: 'Press F2 on startup for Visual BIOS Setup. Press F10 to load Boot Menu. F7 can be pressed on startup to directly upgrade BIOS from a USB drive.'
  },
  {
    id: 'biostar',
    brand: 'Biostar',
    type: 'motherboard',
    name: 'Biostar Motherboards',
    biosKeyNew: 'Delete',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F9',
    bootMenuOld: 'F9',
    popularModels: ['RACING series', 'VALKYRIE', 'Silver series', 'Biostar H610/B660'],
    notes: 'Tap Delete repeatedly on power-on to load BIOS. Tap F9 repeatedly to open the select boot drive menu.'
  },
  {
    id: 'evga',
    brand: 'EVGA',
    type: 'motherboard',
    name: 'EVGA Motherboards',
    biosKeyNew: 'Delete',
    biosKeyOld: 'Delete',
    bootMenuNew: 'F7',
    bootMenuOld: 'F7',
    popularModels: ['FTW series', 'Classified series', 'DARK series'],
    notes: 'Tap Delete continuously immediately after powering on for BIOS/UEFI. Tap F7 for the interactive Boot Menu.'
  },
  {
    id: 'fujitsu',
    brand: 'Fujitsu',
    type: 'laptop',
    name: 'Fujitsu LifeBook Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['LifeBook E-Series', 'LifeBook U-Series', 'Fujitsu ESPRIMO'],
    notes: 'Tap F2 repeatedly during power-on to open Fujitsu BIOS Setup. Tap F12 continuously for the Boot Menu.'
  },
  {
    id: 'toshiba',
    brand: 'Toshiba',
    type: 'laptop',
    name: 'Toshiba / Dynabook Laptops',
    biosKeyNew: 'F2 or Esc',
    biosKeyOld: 'F1 or F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['Satellite', 'Tecra', 'Portégé', 'Qosmio', 'Dynabook Tecra'],
    notes: 'Hold F2 while turning on the laptop. On older models, press Esc repeatedly during startup, then press F1 when requested on screen.'
  },
  {
    id: 'sony_vaio',
    brand: 'Sony VAIO',
    type: 'laptop',
    name: 'Sony VAIO Laptops',
    biosKeyNew: 'Assist Button or F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'Assist Button or F11',
    bootMenuOld: 'F11',
    popularModels: ['VAIO Pro', 'VAIO Fit', 'VAIO Duo', 'VAIO Z'],
    notes: 'If your laptop has an "ASSIST" button, press it while the VAIO is completely turned OFF. It boots into VAIO Care Rescue Mode where you can choose BIOS Setup or Boot Menu.'
  },
  {
    id: 'razer',
    brand: 'Razer',
    type: 'laptop',
    name: 'Razer Blade Gaming Laptops',
    biosKeyNew: 'Delete or F1',
    biosKeyOld: 'F1',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['Razer Blade 14/15/16/18', 'Razer Blade Stealth', 'Razer Blade Pro'],
    notes: 'Tap Delete or F1 continuously during startup when the Razer triple-headed snake logo appears to launch UEFI setup.'
  },
  {
    id: 'xiaomi',
    brand: 'Xiaomi',
    type: 'laptop',
    name: 'Xiaomi Mi Notebook & RedmiBook Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['Mi Notebook Pro', 'RedmiBook Pro', 'Xiaomi Book Air'],
    notes: 'Tap F2 immediately on cold startup to access the bios setup. Press F12 for the quick boot device overlay.'
  },
  {
    id: 'huawei',
    brand: 'Huawei',
    type: 'laptop',
    name: 'Huawei MateBook & Honor MagicBook Laptops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F2',
    bootMenuNew: 'F12',
    bootMenuOld: 'F12',
    popularModels: ['MateBook X Pro', 'MateBook D14/D15', 'MagicBook Pro', 'MateBook 14'],
    notes: 'Tap F2 continuously during power-on to load UEFI settings. Tap F12 repeatedly on boot to open the boot option list.'
  },
  {
    id: 'packard_bell',
    brand: 'Packard Bell',
    type: 'all',
    name: 'Packard Bell Laptops & Desktops',
    biosKeyNew: 'F2',
    biosKeyOld: 'F1 or Delete',
    bootMenuNew: 'F12',
    bootMenuOld: 'Esc',
    popularModels: ['EasyNote', 'iMedia', 'iXtreme'],
    notes: 'Tap F2 on startup for BIOS. Ensure F12 Boot Menu is enabled in BIOS settings first. If F12 does not work, try Esc.'
  },
  {
    id: 'zebronics',
    brand: 'Zebronics',
    type: 'motherboard',
    name: 'Zebronics Motherboards',
    biosKeyNew: 'Delete',
    biosKeyOld: 'F2',
    bootMenuNew: 'F11',
    bootMenuOld: 'F8',
    popularModels: ['ZEB-G31', 'ZEB-G41', 'ZEB-H61', 'ZEB-H81', 'ZEB-H110', 'ZEB-H310'],
    notes: 'Common on budget desktop builds. Tap Delete repeatedly during the splash screen for BIOS setup, or tap F11 (sometimes F8) to display the boot device selection menu.'
  },
  {
    id: 'enter',
    brand: 'Enter',
    type: 'motherboard',
    name: 'Enter Motherboards',
    biosKeyNew: 'Delete',
    biosKeyOld: 'F2',
    bootMenuNew: 'F11',
    bootMenuOld: 'F8 or Esc',
    popularModels: ['Enter G31', 'Enter G41', 'Enter H61', 'Enter H81'],
    notes: 'Tap Delete repeatedly upon cold boot to access CMOS Setup. To open the multi-boot menu directly, tap F11 or F8.'
  }
];
