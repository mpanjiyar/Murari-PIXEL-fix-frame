export interface BeepCodeInfo {
  id: string;
  pattern: string; // e.g. "1 Short", "1 Long + 2 Short"
  patternDescription: string; // detailed pattern representation
  patternType: 'short' | 'long' | 'mixed' | 'continuous' | 'intervals';
  beepBeats: ('S' | 'L' | 'P')[]; // S=Short, L=Long, P=Pause. Used for visualizer or synthesizer!
  biosBrand: string; // "AMI BIOS", "Award BIOS", "Phoenix BIOS", "Dell", "HP", "Lenovo", "ASUS / Gigabyte / MSI", "Apple"
  possibleCause: string;
  affectedComponent: 'RAM' | 'CPU' | 'GPU/Video' | 'Motherboard/Chipset' | 'Power Supply' | 'BIOS/CMOS' | 'Keyboard' | 'Display' | 'Thermal' | 'Other';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  troubleshooting: string[];
}

export const BEEP_CODES_DATABASE: BeepCodeInfo[] = [
  // --- AMI BIOS ---
  {
    id: "ami-1s",
    pattern: "1 Short Beep",
    patternDescription: "•",
    patternType: "short",
    beepBeats: ['S'],
    biosBrand: "AMI BIOS",
    possibleCause: "DRAM refresh failure. The motherboard's timing circuit is unable to refresh the memory cells.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Shut down the PC, unplug power, and open the side panel.",
      "Remove all RAM modules.",
      "Clean the gold pins of the RAM with an eraser or microfibre cloth.",
      "Insert a single RAM stick into the primary slot (usually A2) and boot.",
      "Try different slots to isolate a potential motherboard memory slot failure."
    ]
  },
  {
    id: "ami-2s",
    pattern: "2 Short Beeps",
    patternDescription: "• •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Parity circuit failure in the first 64KB block of RAM.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "This indicates a low-level memory failure.",
      "If running dual-channel, test each RAM stick individually.",
      "Verify RAM voltage and speed settings are at defaults (or disable XMP/DOCP temporarily).",
      "Replace the faulty memory module if errors persist in memtest86."
    ]
  },
  {
    id: "ami-3s",
    pattern: "3 Short Beeps",
    patternDescription: "• • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Base 64KB RAM read/write test failure.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "The first memory block is unusable. BIOS cannot initialize standard operations.",
      "Perform a full CMOS reset (remove CR2032 battery for 5 minutes) to clear bad memory registers.",
      "Reseat the RAM securely into slots until both side latches click in firmly.",
      "Try a known working RAM stick to rule out physical damage to the motherboard's RAM slots."
    ]
  },
  {
    id: "ami-4s",
    pattern: "4 Short Beeps",
    patternDescription: "• • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "System timer / Motherboard clock generator malfunction.",
    affectedComponent: "Motherboard/Chipset",
    severity: "Critical",
    troubleshooting: [
      "The timer clock on the motherboard has stopped ticking correctly.",
      "Try replacing the CR2032 CMOS battery on the motherboard, as a weak battery can cause register sync issues.",
      "Power cycle the PC: unplug power cord, hold the physical power button down for 30 seconds, plug back in.",
      "If the issue persists, the motherboard's clock controller chip may be physically damaged."
    ]
  },
  {
    id: "ami-5s",
    pattern: "5 Short Beeps",
    patternDescription: "• • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Processor (CPU) failure or detection issue.",
    affectedComponent: "CPU",
    severity: "Critical",
    troubleshooting: [
      "Ensure the 8-pin CPU power cable is firmly connected to the motherboard.",
      "Check if the CPU cooler fan is connected to the 'CPU_FAN' header. Some motherboards refuse to boot if no fan speed is reported.",
      "Check for CPU overheating. Re-apply fresh high-quality thermal paste.",
      "If recently installed or dropped, carefully inspect CPU socket pins on the motherboard for bends."
    ]
  },
  {
    id: "ami-6s",
    pattern: "6 Short Beeps",
    patternDescription: "• • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Keyboard controller (Gate A20) register error.",
    affectedComponent: "Keyboard",
    severity: "Medium",
    troubleshooting: [
      "Unplug the keyboard from the USB or PS/2 port, reboot the PC to see if it boots past the error.",
      "Try connecting the keyboard to a different USB port (preferably a USB 2.0 port instead of USB 3.0).",
      "Check the keyboard cable for severe bends or cuts that may be causing a short circuit.",
      "Try a different keyboard or test with no peripheral devices attached."
    ]
  },
  {
    id: "ami-7s",
    pattern: "7 Short Beeps",
    patternDescription: "• • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Virtual Mode Exception Error. Indicates CPU hardware exception or internal interrupt line fault.",
    affectedComponent: "CPU",
    severity: "High",
    troubleshooting: [
      "Ensure the CPU is not overclocked. Clear CMOS settings to reset frequencies and voltages.",
      "Update BIOS to the latest stable version if the PC can intermittently POST.",
      "Verify the motherboard's VRM capacitors surrounding the CPU socket are not bulging or leaking.",
      "Test with another compatible processor to verify CPU physical integrity."
    ]
  },
  {
    id: "ami-8s",
    pattern: "8 Short Beeps",
    patternDescription: "• • • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Display memory read/write test failure. System is unable to interface with video RAM.",
    affectedComponent: "GPU/Video",
    severity: "High",
    troubleshooting: [
      "Power down the computer and remove the dedicated graphics card.",
      "Clean the PCI-Express golden contacts on the graphics card with standard isopropyl alcohol.",
      "Re-seat the GPU firmly into the PCIe slot, ensuring the slot locking tab clicks shut.",
      "Ensure all external 6-pin/8-pin PCIe power cables are completely snapped in.",
      "If your CPU supports integrated graphics, remove the GPU and connect the display to the motherboard."
    ]
  },
  {
    id: "ami-9s",
    pattern: "9 Short Beeps",
    patternDescription: "• • • • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "ROM Checksum error. The loaded BIOS firmware is corrupted or damaged.",
    affectedComponent: "BIOS/CMOS",
    severity: "High",
    troubleshooting: [
      "Trigger a manual CMOS reset using the 'JBAT1' or 'CLR_CMOS' jumpers on the motherboard.",
      "If your motherboard has a 'BIOS Flashback' button, format a USB to FAT32, load the correct firmware renaming it, and flash with the system off.",
      "If the BIOS chip is modular and socketed, it may need to be replaced or reprogrammed with an EEPROM programmer.",
      "Replace the CR2032 battery with a fresh 3V battery."
    ]
  },
  {
    id: "ami-10s",
    pattern: "10 Short Beeps",
    patternDescription: "• • • • • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "CMOS shutdown register read/write error. Motherboard unable to save configurations.",
    affectedComponent: "BIOS/CMOS",
    severity: "High",
    troubleshooting: [
      "Typically points to a physical defect on the CMOS registry chip.",
      "Remove the battery, unplug the power cord, and short the CMOS jumper for 30 seconds to force reset.",
      "Replace the old CR2032 battery with a fresh one.",
      "If it still fails, the motherboard's Super I/O or southbridge chipset is likely malfunctioning."
    ]
  },
  {
    id: "ami-11s",
    pattern: "11 Short Beeps",
    patternDescription: "• • • • • • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "L2 Cache memory test failure inside the CPU.",
    affectedComponent: "CPU",
    severity: "High",
    troubleshooting: [
      "The CPU's high-speed level 2 cache has failed diagnostics.",
      "Disable 'CPU L2 Cache' or 'CPU Internal Cache' in BIOS if you can enter BIOS settings temporarily.",
      "Reset voltage profiles to stock settings.",
      "Replace CPU or inspect motherboard socket pins."
    ]
  },
  {
    id: "ami-1l2s",
    pattern: "1 Long + 2 Short Beeps",
    patternDescription: "▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Graphics card detection failure or monitor connection error.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "Verify that the monitor cable is plugged into the GPU port, NOT the motherboard output (unless using integrated graphics).",
      "Re-seat the graphics card and check its extra power connectors.",
      "Check if your graphics card is properly seated and the motherboard slot is clear of dust."
    ]
  },
  {
    id: "ami-1l3s",
    pattern: "1 Long + 3 Short Beeps",
    patternDescription: "▬ • • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "AMI BIOS",
    possibleCause: "Conventional / Extended memory test failure, or GPU DAC error.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Main memory cannot be addressed or graphics controller RAM has failed.",
      "Check your RAM installation first. Test modules one-by-one in different slots.",
      "Verify that dual-channel setups use slots 2 and 4 (A2 and B2).",
      "Clean physical contact pins on both the RAM and GPU."
    ]
  },
  {
    id: "ami-cont",
    pattern: "Continuous Beep",
    patternDescription: "▬ ▬ ▬ ▬...",
    patternType: "continuous",
    beepBeats: ['L', 'L', 'L', 'L'],
    biosBrand: "AMI BIOS",
    possibleCause: "RAM or Graphic Card missing entirely. BIOS cannot detect essential boot hardware.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Verify that at least one RAM module is inserted securely in the correct slot.",
      "Ensure graphics card is properly pushed in until the PCIe slot lever snaps upward.",
      "Verify that all modular cables on the Power Supply Unit (PSU) are fully inserted."
    ]
  },

  // --- Award BIOS ---
  {
    id: "award-1s",
    pattern: "1 Short Beep",
    patternDescription: "•",
    patternType: "short",
    beepBeats: ['S'],
    biosBrand: "Award BIOS",
    possibleCause: "System booting successfully (Normal POST).",
    affectedComponent: "Other",
    severity: "Low",
    troubleshooting: [
      "No issue. This is the successful standard POST (Power On Self Test) notification beep.",
      "If nothing appears on screen despite the single beep, verify your monitor is turned on and connected to the correct output port."
    ]
  },
  {
    id: "award-2s",
    pattern: "2 Short Beeps",
    patternDescription: "• •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "CMOS setting error or battery dead.",
    affectedComponent: "BIOS/CMOS",
    severity: "Medium",
    troubleshooting: [
      "Enter BIOS setup (usually by pressing DEL or F2) and load 'Setup Defaults' or 'Optimized Defaults'.",
      "Save settings and exit.",
      "If the PC loses time or prompts you on every cold boot, replace the CR2032 lithium CMOS coin battery on the motherboard."
    ]
  },
  {
    id: "award-1l1s",
    pattern: "1 Long + 1 Short Beeps",
    patternDescription: "▬ •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "RAM or Motherboard internal error.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Unplug computer, extract RAM sticks, inspect for damage.",
      "Try to boot with only a single RAM module.",
      "Clean any dust build-up in the memory channels using compressed air."
    ]
  },
  {
    id: "award-1l2s",
    pattern: "1 Long + 2 Short Beeps",
    patternDescription: "▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "Monitor or graphics card error. System cannot initialize display output.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "Verify the video cable (HDMI/DisplayPort) is functional and plugged in correctly.",
      "Remove dedicated GPU, check for debris in PCIe slot, and insert again with secure locking.",
      "Plug power cables directly into the GPU from the PSU, avoiding cheap adapters."
    ]
  },
  {
    id: "award-1l3s",
    pattern: "1 Long + 3 Short Beeps",
    patternDescription: "▬ • • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "Keyboard controller error or Graphics Card VRAM error.",
    affectedComponent: "Keyboard",
    severity: "High",
    troubleshooting: [
      "Ensure no keys are stuck down during startup.",
      "Disconnect all USB peripherals except the mouse/keyboard.",
      "Re-seat your graphics card as some Award configurations map 3 short beeps to video memory."
    ]
  },
  {
    id: "award-contl",
    pattern: "Continuous Long Beeps",
    patternDescription: "▬ ▬ ▬ ▬...",
    patternType: "continuous",
    beepBeats: ['L', 'L', 'L', 'L'],
    biosBrand: "Award BIOS",
    possibleCause: "Memory (DRAM) module not inserted correctly or completely faulty.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Verify RAM is compatible with motherboard specifications.",
      "Push RAM down until the motherboard locking clips snap automatically.",
      "If multiple sticks are installed, test them one-by-one to identify the broken module."
    ]
  },
  {
    id: "award-conts",
    pattern: "Continuous Short Beeps",
    patternDescription: "• • • •...",
    patternType: "continuous",
    beepBeats: ['S', 'S', 'S', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "Power supply (PSU) voltage anomaly or power level fluctuation.",
    affectedComponent: "Power Supply",
    severity: "Critical",
    troubleshooting: [
      "Ensure the main 24-pin and 8-pin ATX power cables are inserted perfectly flush into the motherboard headers.",
      "Check if the wattage of your PSU is adequate for your graphics card and processor setup (use a PSU calculator).",
      "Test with a replacement PSU to see if voltages are sagging."
    ]
  },
  {
    id: "award-hilow",
    pattern: "High/Low Repeating Beeps",
    patternDescription: "▲▼▲▼ repeating",
    patternType: "intervals",
    beepBeats: ['L', 'S', 'L', 'S'],
    biosBrand: "Award BIOS",
    possibleCause: "CPU over-temperature warning or CPU physical damage.",
    affectedComponent: "Thermal",
    severity: "Critical",
    troubleshooting: [
      "Turn off the system immediately to prevent thermal destruction of the silicon.",
      "Ensure the CPU cooler is installed flush and tight against the IHS (Integrated Heat Spreader).",
      "Ensure the protective plastic peel at the base of the CPU cooler was removed before thermal paste application.",
      "Verify CPU Fan spinning speed; plug the cooler fan directly into 'CPU_FAN'."
    ]
  },

  // --- Dell BIOS / Diagnostics ---
  {
    id: "dell-1b",
    pattern: "1 Beep",
    patternDescription: "•",
    patternType: "short",
    beepBeats: ['S'],
    biosBrand: "Dell",
    possibleCause: "BIOS ROM Checksum failure or Motherboard chipset breakdown.",
    affectedComponent: "Motherboard/Chipset",
    severity: "Critical",
    troubleshooting: [
      "Perform a hard reset: remove power cord, hold power button for 20 seconds, plug back in.",
      "Try to initiate a BIOS recovery by holding Ctrl + Esc keys while inserting power.",
      "If recovery fails, the motherboard's SPI flash chip or northbridge is defective."
    ]
  },
  {
    id: "dell-2b",
    pattern: "2 Beeps",
    patternDescription: "• •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "No memory (RAM) detected.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Dell systems strictly require compatible memory speeds.",
      "Extract RAM modules, blow out slots with canned air.",
      "Re-seat the RAM and make sure the latch mechanism snaps down.",
      "If upgrading, ensure non-ECC modules are used as ECC is unsupported on home Dell models."
    ]
  },
  {
    id: "dell-3b",
    pattern: "3 Beeps",
    patternDescription: "• • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "Motherboard / Chipset / DMA Controller failure.",
    affectedComponent: "Motherboard/Chipset",
    severity: "Critical",
    troubleshooting: [
      "Indicates a low-level motherboard architecture fault.",
      "Try disconnecting all auxiliary cards, storage drives, and extra front-panel headers.",
      "If it still gives 3 beeps with only PSU, CPU, and RAM, the motherboard is bad."
    ]
  },
  {
    id: "dell-4b",
    pattern: "4 Beeps",
    patternDescription: "• • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "RAM Read/Write test failure.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "A memory module is active but failing to store byte structures.",
      "Test each stick of RAM separately in Slot 1.",
      "Replace the RAM sticks. If using high speed RAM, make sure it operates at stock 2133/2400/2666Mhz standard voltages first."
    ]
  },
  {
    id: "dell-5b",
    pattern: "5 Beeps",
    patternDescription: "• • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "Real-time Clock (RTC) power failure. Weak or dead CMOS battery.",
    affectedComponent: "BIOS/CMOS",
    severity: "Medium",
    troubleshooting: [
      "Locate the silver CR2032 coin battery on the motherboard.",
      "Slide the metal clasp outward to release the battery.",
      "Insert a brand new CR2032 lithium battery (3V).",
      "Reboot, enter BIOS, reset system time and save configurations."
    ]
  },
  {
    id: "dell-6b",
    pattern: "6 Beeps",
    patternDescription: "• • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "Video card / Graphics subsystem chip failure.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "For Dell Desktops: Reseat your external PCI-e graphics card.",
      "For Dell Laptops: The integrated GPU chip on the motherboard is failing. This may require professional motherboard BGA reflow or system board replacement."
    ]
  },
  {
    id: "dell-7b",
    pattern: "7 Beeps",
    patternDescription: "• • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "CPU failure or processor cache register crash.",
    affectedComponent: "CPU",
    severity: "Critical",
    troubleshooting: [
      "Verify CPU is securely seated with the load lever pushed under the tab.",
      "Ensure the 12V CPU power connector (4-pin or 8-pin) is firmly plugged in.",
      "Overheating warning: Ensure thermal paste is fresh and CPU fan is connected."
    ]
  },
  {
    id: "dell-8b",
    pattern: "8 Beeps",
    patternDescription: "• • • • • • • •",
    patternType: "short",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Dell",
    possibleCause: "LCD Display panel failure (commonly on Dell laptops and All-In-Ones).",
    affectedComponent: "Display",
    severity: "High",
    troubleshooting: [
      "The BIOS is unable to connect to the internal LCD panel's display controller.",
      "Unplug laptop, remove battery, and check if the screen's eDP/LVDS flexible cable has backed out of the socket.",
      "Plug in an external monitor via HDMI or VGA. If it outputs video, the internal screen is dead or disconnected."
    ]
  },

  // --- HP Diagnostics ---
  {
    id: "hp-1l1s",
    pattern: "1 Long + 1 Short Beeps",
    patternDescription: "▬ •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Primary Memory (RAM) failure or module unseated.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Unplug computer, extract RAM modules.",
      "Insert a single RAM stick in Slot 1 (closest to CPU) and test.",
      "Blow out any carbon deposits or dust particles in the DIMM socket."
    ]
  },
  {
    id: "hp-1l2s",
    pattern: "1 Long + 2 Short Beeps",
    patternDescription: "▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Integrated or external graphics processing unit failure.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "On HP Desktops: Reseat discrete GPU card.",
      "Try connecting display cable to motherboards onboard port if your CPU contains internal graphics.",
      "Verify graphics card power rail connections."
    ]
  },
  {
    id: "hp-3l2s",
    pattern: "3 Long + 2 Short Beeps",
    patternDescription: "▬ ▬ ▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'L', 'P', 'L', 'P', 'S', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Memory initialization failed / Bad Memory Bank.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Commonly indicates memory controller mismatch inside CPU or bad RAM speed profiles.",
      "Reset BIOS CMOS completely to clear fast-boot caching.",
      "Ensure RAM sticks match identical capacity, speed, and timings.",
      "Ensure you are using standard non-ECC modules unless operating an HP Z-Workstation."
    ]
  },
  {
    id: "hp-3l3s",
    pattern: "3 Long + 3 Short Beeps",
    patternDescription: "▬ ▬ ▬ • • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'L', 'P', 'L', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Graphics controller initialization failed.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "Check if expansion slots are bent.",
      "Try to boot without dedicated graphics card.",
      "Check motherboard BIOS jumper positions."
    ]
  },
  {
    id: "hp-4l2s",
    pattern: "4 Long + 2 Short Beeps",
    patternDescription: "▬ ▬ ▬ ▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'S', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Processor Thermal / Temperature Protection circuit triggered.",
    affectedComponent: "Thermal",
    severity: "Critical",
    troubleshooting: [
      "The system detected catastrophic processor core heat levels.",
      "Verify CPU heatsink fan is spinning freely and not blocked by wire cables.",
      "Remove processor cooler, scrape dry crusty thermal paste, apply new thin layer, and tighten thermal screws diagonally in sequence."
    ]
  },
  {
    id: "hp-5l2s",
    pattern: "5 Long + 2 Short Beeps",
    patternDescription: "▬ ▬ ▬ ▬ ▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'S', 'P', 'S'],
    biosBrand: "HP",
    possibleCause: "Embedded Controller (EC) handshake timed out.",
    affectedComponent: "Motherboard/Chipset",
    severity: "Critical",
    troubleshooting: [
      "Perform hard hardware discharge: unplug PSU, press motherboard power button for 60 seconds.",
      "Leave completely isolated for 10 minutes to reset the PMIC controller.",
      "Plug power cable directly into wall socket and restart."
    ]
  },

  // --- Lenovo ThinkPad ---
  {
    id: "lenovo-1l3s",
    pattern: "1 Long + 3 Short Beeps",
    patternDescription: "▬ • • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Lenovo",
    possibleCause: "Display Adapter / Graphics error or memory connection issue.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "Ensure internal Display flex cables are properly attached.",
      "Try connecting an external screen via HDMI or USB-C DisplayPort.",
      "Test RAM configuration as Lenovo graphics chipsets leverage shared system memory."
    ]
  },
  {
    id: "lenovo-3s1s",
    pattern: "3 Short + 1 Short Beeps",
    patternDescription: "• • • [pause] •",
    patternType: "intervals",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'P', 'S'],
    biosBrand: "Lenovo",
    possibleCause: "Memory module (RAM) initialization failed.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Lenovo ThinkPads are highly sensitive to RAM configurations.",
      "Verify RAM speed matches CPU standard memory profiles exactly.",
      "Reseat DDR4/DDR5 SO-DIMM sticks in laptop memory bays.",
      "Clean out any carbon deposits with isopropyl alcohol on the contacts."
    ]
  },
  {
    id: "lenovo-4scont",
    pattern: "4 Short Beeps (repeating)",
    patternDescription: "• • • • [pause] • • • •...",
    patternType: "intervals",
    beepBeats: ['S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'P'],
    biosBrand: "Lenovo",
    possibleCause: "TPM / Security Chip initialization error.",
    affectedComponent: "Motherboard/Chipset",
    severity: "High",
    troubleshooting: [
      "Hardware security checks failed. Unplug battery or drain power to clear safety logs.",
      "Reset BIOS settings to system defaults to clear cached TPM encryption keys.",
      "Contact support if cryptographic chips are physically corrupted."
    ]
  },

  // --- ASUS / Gigabyte / MSI ---
  {
    id: "asus-1l2s",
    pattern: "1 Long + 2 Short Beeps",
    patternDescription: "▬ • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S'],
    biosBrand: "ASUS / Gigabyte / MSI",
    possibleCause: "Memory (RAM) error. Detection failure or bad RAM parameters.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Verify RAM modules are inserted in recommended slots A2/B2 (2nd and 4th slot from CPU).",
      "Gently blow out any dust from the slots.",
      "Ensure any memory overclock (XMP, EXPO, DOCP) is disabled.",
      "Check if any motherboard motherboard diagnostic LEDs (DRAM LED) are glowing red."
    ]
  },
  {
    id: "asus-1l3s",
    pattern: "1 Long + 3 Short Beeps",
    patternDescription: "▬ • • •",
    patternType: "mixed",
    beepBeats: ['L', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "ASUS / Gigabyte / MSI",
    possibleCause: "Graphics Card (GPU) detection failure or PCI-Express power supply missing.",
    affectedComponent: "GPU/Video",
    severity: "Critical",
    troubleshooting: [
      "Check if the PCIe power cable is securely connected to your GPU.",
      "Verify the GPU is pushed fully into the motherboard slot until the lock latch snaps down.",
      "Test with another PCIe slot if available on the motherboard."
    ]
  },
  {
    id: "asus-4l",
    pattern: "4 Long Beeps",
    patternDescription: "▬ ▬ ▬ ▬",
    patternType: "long",
    beepBeats: ['L', 'P', 'L', 'P', 'L', 'P', 'L'],
    biosBrand: "ASUS / Gigabyte / MSI",
    possibleCause: "CPU Fan rotation speed threshold error. CPU fan disconnected.",
    affectedComponent: "Thermal",
    severity: "High",
    troubleshooting: [
      "Locate the CPU cooler fan cable.",
      "Ensure it is plugged specifically into the motherboard header labeled 'CPU_FAN', NOT 'SYS_FAN' or 'AIO_PUMP'.",
      "Check if the CPU fan is obstructed by a wire and unable to rotate."
    ]
  },

  // --- Phoenix BIOS ---
  {
    id: "phx-113",
    pattern: "1-1-3 Beeps",
    patternDescription: "• [pause] • [pause] • • •",
    patternType: "intervals",
    beepBeats: ['S', 'P', 'P', 'S', 'P', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Phoenix BIOS",
    possibleCause: "CMOS Read/Write failure. Motherboard cannot retrieve configurations.",
    affectedComponent: "BIOS/CMOS",
    severity: "High",
    troubleshooting: [
      "This indicates a low level storage register error.",
      "Replace the CMOS CR2032 backup battery.",
      "Perform a full power cycle to force-reload BIOS static tables."
    ]
  },
  {
    id: "phx-114",
    pattern: "1-1-4 Beeps",
    patternDescription: "• [pause] • [pause] • • • •",
    patternType: "intervals",
    beepBeats: ['S', 'P', 'P', 'S', 'P', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S'],
    biosBrand: "Phoenix BIOS",
    possibleCause: "BIOS ROM Checksum failed.",
    affectedComponent: "BIOS/CMOS",
    severity: "High",
    troubleshooting: [
      "The onboard boot ROM contains corrupt instruction blocks.",
      "Perform a physical jumper bios reset.",
      "Look for motherboard model BIOS support updates and reflash using USB tools."
    ]
  },
  {
    id: "phx-131",
    pattern: "1-3-1 Beeps",
    patternDescription: "• [pause] • • • [pause] •",
    patternType: "intervals",
    beepBeats: ['S', 'P', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'P', 'S'],
    biosBrand: "Phoenix BIOS",
    possibleCause: "DRAM refresh verification test failed.",
    affectedComponent: "RAM",
    severity: "Critical",
    troubleshooting: [
      "Low level RAM control circuits failed.",
      "Remove and reseat all memory modules.",
      "Verify RAM voltage standards in computer specifications."
    ]
  }
];
