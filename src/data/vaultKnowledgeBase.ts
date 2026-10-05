export interface VaultLinkItem {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  icon?: string;
  notes?: string;
  order: number;
}

export interface InitialVaultDoc {
  id: string;
  name: string;
  description: string;
  category: string;
  folder: string;
  fileType: 'text' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'other';
  content: string;
  links?: Array<{ title: string; url: string; status?: 'valid' | 'invalid' | 'warning' }>;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isProtected?: boolean;
}

export const KNOWLEDGE_BASE_FOLDERS = [
  { id: 'folder_private', name: '00 – Private & Confidential', color: '#EF4444' },
  { id: 'folder_win', name: '01 – Windows', color: '#0078D4' },
  { id: 'folder_mac', name: '02 – macOS', color: '#A855F7' },
  { id: 'folder_drivers', name: '03 – Drivers', color: '#10B981' },
  { id: 'folder_cmd', name: '04 – CMD Commands', color: '#F59E0B' },
  { id: 'folder_ps', name: '05 – PowerShell', color: '#3B82F6' },
  { id: 'folder_sw', name: '06 – Software', color: '#EC4899' },
  { id: 'folder_hw', name: '07 – Hardware Troubleshooting', color: '#FF5500' },
  { id: 'folder_net', name: '08 – Networking', color: '#06B6D4' },
  { id: 'folder_links', name: '09 – Useful Links', color: '#84CC16' }
];

export const INITIAL_KNOWLEDGE_DOCS: InitialVaultDoc[] = [
  // 00 - Private Protected File
  {
    id: 'vault_private_credential_doc',
    name: 'Confidential – Master Network Passkeys & Client Server Access',
    description: 'Separately encrypted private credentials for doorstep network configurations, router admin logins, and active directory servers.',
    category: 'Confidential',
    folder: '00 – Private & Confidential',
    fileType: 'text',
    isProtected: true,
    sizeBytes: 1420,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Lead Admin',
    content: `# Pixel Fix — Highly Confidential Master Credentials

[LOCKED RECORD: Access strictly authorized with file security clearance]

## 1. Primary Doorstep IT Service Router Gateway Defaults
- Default Gateway: 192.168.1.1 / 192.168.0.1
- Standard Diagnostics SSID: PF-TechField-Diag-5G
- Technician Diagnostic Passkey: PixelFix@FieldTech2025

## 2. Doorstep Remote Support Credentials
- AnyDesk Corporate Unattended ID: 863-887-5231
- WinPE Diagnostic Environment Passcode: PF#DiagnosticSecure

## 3. Secured Backup Sync Storage Target
- Google Drive Infrastructure Folder ID: 1PixelFixDriveSecureVault2025
- Offsite Mirror Node: Guwahati-Central-NAS-Node01`,
    links: [
      { title: 'Google Drive Private Cloud Mirror', url: 'https://drive.google.com', status: 'valid' }
    ]
  },

  // 01 - Windows
  {
    id: 'kb_win_install',
    name: 'Windows 10/11 Clean Installation & Partitioning SOP',
    description: 'Complete guide for UEFI/GPT media creation, TPM 2.0 bypass procedures for older machines, and recovery partition setup.',
    category: 'Operating Systems',
    folder: '01 – Windows',
    fileType: 'text',
    sizeBytes: 2840,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Murari Panjiyar',
    content: `# Windows 10/11 Clean Installation Standard Operating Procedure

## Preparation
1. Create official bootable media via Rufus or Windows Media Creation Tool in UEFI (GPT) partition scheme.
2. For legacy CPU upgrades (bypassing TPM / SecureBoot):
   - At installation setup screen, press Shift + F10.
   - Type regedit and navigate to:
     HKEY_LOCAL_MACHINE\\SYSTEM\\Setup\\LabConfig
   - Create DWORD (32-bit): BypassTPMCheck = 1
   - Create DWORD (32-bit): BypassSecureBootCheck = 1
   - Create DWORD (32-bit): BypassRAMCheck = 1

## Partitioning Scheme
- Diskpart -> select disk 0 -> clean -> convert gpt
- Create EFI System Partition (100MB FAT32), MSR (16MB), and Primary OS partition.`,
    links: [
      { title: 'Official Windows 11 ISO Download', url: 'https://www.microsoft.com/software-download/windows11', status: 'valid' },
      { title: 'Rufus Bootable USB Creator', url: 'https://rufus.ie', status: 'valid' }
    ]
  },
  {
    id: 'kb_win_activation',
    name: 'Windows Retail License Key Activation & Troubleshooting',
    description: 'Slmgr commands, digital entitlement verification, and phone activation fallback steps for retail keys.',
    category: 'Licensing',
    folder: '01 – Windows',
    fileType: 'text',
    sizeBytes: 1980,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Murari Panjiyar',
    content: `# Windows License Key Activation Guide

## Command Line Activation
Open Command Prompt as Administrator:
1. Uninstall existing license:
   \`slmgr.vbs /upk\`
2. Clear product key from registry:
   \`slmgr.vbs /cpky\`
3. Install new genuine retail key:
   \`slmgr.vbs /ipk <25-DIGIT-PRODUCT-KEY>\`
4. Activate online:
   \`slmgr.vbs /ato\`
5. Verify permanent activation status:
   \`slmgr.vbs /xpr\`

## Error 0xC004C003 / 0x803FA067 Resolution
- Check system clock and time zone sync.
- Disconnect internet, input generic key to trigger edition upgrade, then apply retail key online.`,
    links: [
      { title: 'Microsoft Licensing Support Portal', url: 'https://support.microsoft.com/windows', status: 'valid' }
    ]
  },

  // 04 - CMD Commands
  {
    id: 'kb_cmd_reference',
    name: 'CMD Technical Troubleshooting Commands Reference',
    description: 'Essential Windows Command Prompt diagnostics for network, system integrity, disk health, and process inspection.',
    category: 'Commands',
    folder: '04 – CMD Commands',
    fileType: 'text',
    sizeBytes: 3100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Murari Panjiyar',
    content: `# Pixel Fix — CMD Essential Technical Reference

## 1. Network Diagnostics
- \`ipconfig /all\` : Full network interface details, MAC address, DHCP server & DNS servers.
- \`ipconfig /flushdns\` : Clears DNS resolver cache to fix unreachable domains.
- \`ipconfig /release && ipconfig /renew\` : Re-negotiates local IP address with router DHCP.
- \`ping -t 8.8.8.8\` : Continuous latency test to Google DNS to identify packet loss.
- \`tracert 1.1.1.1\` : Traces router hops to determine where connection bottlenecks occur.
- \`netstat -ano\` : Lists all active TCP/UDP ports and owning process IDs (PID).

## 2. System Integrity & File Repair
- \`sfc /scannow\` : System File Checker scans and repairs corrupted Windows binaries.
- \`DISM /Online /Cleanup-Image /RestoreHealth\` : Downloads fresh component store from Windows Update.
- \`chkdsk C: /f /r\` : Scans NTFS filesystem for corrupted file clusters and bad disk sectors.

## 3. Hardware & Power Analysis
- \`powercfg /batteryreport\` : Generates detailed laptop battery capacity and wear report in HTML.
- \`wmic diskdrive get model,status\` : Queries SMART hardware status of all connected drives.
- \`systeminfo\` : Full BIOS version, motherboard model, uptime, and installed hotfixes.`,
    links: [
      { title: 'Microsoft Command-Line Documentation', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands', status: 'valid' }
    ]
  },

  // 05 - PowerShell
  {
    id: 'kb_powershell_reference',
    name: 'PowerShell System Administration & Diagnostics Scriptbook',
    description: 'Curated PowerShell one-liners for driver extraction, hardware telemetry, service restarts, and package management.',
    category: 'Scripts',
    folder: '05 – PowerShell',
    fileType: 'text',
    sizeBytes: 2950,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Murari Panjiyar',
    content: `# Pixel Fix — PowerShell Systems Administrator Reference

## 1. Hardware Inspection
\`\`\`powershell
# Get exact RAM stick models, speeds, and capacity
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, PartNumber, Speed, @{Name="CapacityGB";Expression={$_.Capacity/1GB}}

# Storage drive health and media type (NVMe SSD vs SATA HDD)
Get-PhysicalDisk | Select-Object DeviceId, FriendlyName, MediaType, OperationalStatus, HealthStatus, @{Name="SizeGB";Expression={[math]::Round($_.Size/1GB)}}
\`\`\`

## 2. Driver Export Backup
\`\`\`powershell
# Export all 3rd-party installed drivers to external USB folder before formatting
Export-WindowsDriver -Online -Destination "D:\\DriverBackup"
\`\`\`

## 3. Package Management
\`\`\`powershell
# Install software via Windows Package Manager
winget install Google.Chrome
winget install 7zip.7zip
winget install VideoLAN.VLC
winget install AnyDeskSoftwareGmbH.AnyDesk
\`\`\``,
    links: [
      { title: 'Microsoft PowerShell Documentation', url: 'https://learn.microsoft.com/en-us/powershell/', status: 'valid' }
    ]
  },

  // 07 - Hardware Troubleshooting
  {
    id: 'kb_hw_ram_ssd',
    name: 'Hardware Diagnostics: RAM, NVMe SSD & PSU Failure Signs',
    description: 'Symptom matrix for memory corruption, NVMe thermal throttling, cold solder joints, and fluctuating 12V PSU rail voltage.',
    category: 'Hardware',
    folder: '07 – Hardware Troubleshooting',
    fileType: 'text',
    sizeBytes: 3400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Murari Panjiyar',
    content: `# Hardware Diagnostic Protocols

## 1. RAM (Memory) Failure Symptoms
- Random Blue Screens: \`MEMORY_MANAGEMENT\`, \`IRQL_NOT_LESS_OR_EQUAL\`, \`PAGE_FAULT_IN_NONPAGED_AREA\`.
- Applications crashing silently with no event log.
- Diagnostic Test: Run Windows Memory Diagnostic (\`mdsched.exe\`) or boot MemTest86 USB for 4 full passes.
- Fix: Reseat modules, clean gold contact pins with 99% isopropyl alcohol, test single DIMMs sequentially.

## 2. NVMe SSD Thermal & Controller Failure
- Symptoms: Drive disappears from BIOS after heavy sustained write load.
- Cause: Phison/Silicon Motion controller hitting 85°C+ safety shutdown threshold.
- Fix: Apply 1mm thermal pad under aluminum motherboard heatsink, verify PCIe link speed in CrystalDiskInfo.

## 3. Power Supply (PSU) Voltage Drops
- Measure 24-pin ATX connector under GPU load:
  - +12V rail tolerance: 11.40V - 12.60V (any drop below 11.40V causes instant black screen reboot).
  - +5V rail tolerance: 4.75V - 5.25V.
  - +3.3V rail tolerance: 3.14V - 3.47V.`,
    links: [
      { title: 'MemTest86 RAM Diagnostic Tool', url: 'https://www.memtest86.com', status: 'valid' },
      { title: 'CrystalDiskInfo SMART Health Monitor', url: 'https://crystalmark.info/en/software/crystaldiskinfo/', status: 'valid' }
    ]
  }
];

export const INITIAL_TECHNICAL_LINKS: VaultLinkItem[] = [
  {
    id: 'link_nvidia',
    name: 'NVIDIA Driver Downloads',
    category: 'Drivers',
    description: 'Official GeForce, RTX, and Studio driver selector for desktop and mobile GPUs.',
    url: 'https://www.nvidia.com/Download/index.aspx',
    icon: 'Cpu',
    notes: 'Choose Game Ready for gaming or Studio Driver for Adobe/DaVinci Resolve stability.',
    order: 1
  },
  {
    id: 'link_amd',
    name: 'AMD Drivers & Support',
    category: 'Drivers',
    description: 'Radeon Adrenalin graphics software and Ryzen chipset drivers for AM4/AM5.',
    url: 'https://www.amd.com/en/support',
    icon: 'Cpu',
    notes: 'Always install Ryzen Chipset Drivers before installing GPU drivers on fresh Windows installs.',
    order: 2
  },
  {
    id: 'link_intel',
    name: 'Intel Driver & Support Assistant (DSA)',
    category: 'Drivers',
    description: 'Automated scan utility for Intel Wi-Fi 6E/7, Bluetooth, and UHD/Iris Xe drivers.',
    url: 'https://www.intel.com/content/www/us/en/support/detect.html',
    icon: 'Wifi',
    notes: 'Essential for laptops with missing network adapters out of the box.',
    order: 3
  },
  {
    id: 'link_sysinternals',
    name: 'Microsoft Sysinternals Suite',
    category: 'Software',
    description: 'Advanced Windows diagnostics: Process Explorer, Autoruns, TCPView, and ProcMon.',
    url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite',
    icon: 'FileCode',
    notes: 'Autoruns is the gold standard for identifying stealth startup malware and driver hooks.',
    order: 4
  },
  {
    id: 'link_anydesk',
    name: 'AnyDesk Official Download',
    category: 'Software',
    description: 'Ultra-fast low-latency remote technician desktop software.',
    url: 'https://anydesk.com/en/downloads',
    icon: 'ExternalLink',
    notes: 'Use unattended access for client maintenance after client authorization.',
    order: 5
  },
  {
    id: 'link_crystaldisk',
    name: 'CrystalDiskInfo & CrystalDiskMark',
    category: 'Software',
    description: 'Drive health monitoring (SMART) and sequential/random IOPS speed benchmarks.',
    url: 'https://crystalmark.info/en/',
    icon: 'HardDrive',
    notes: 'Check Percentage Used and Critical Warning attributes on NVMe drives.',
    order: 6
  }
];
