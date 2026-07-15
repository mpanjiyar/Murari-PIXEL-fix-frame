export interface KeyboardShortcut {
  keys: string[];
  description: string;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  color: string; // TailWind Accent styling class
  description: string;
  shortcuts: KeyboardShortcut[];
}

export const SHORTCUTS_DATABASE: ShortcutCategory[] = [
  {
    id: 'windows',
    name: 'Windows OS',
    iconName: 'Laptop',
    color: 'from-blue-500/10 to-indigo-500/5 text-blue-500 border-blue-500/20',
    description: 'Essential operating system controls, workspace management, and navigation shortcuts.',
    shortcuts: [
      { keys: ['Win', 'D'], description: 'Show or hide the desktop instantly' },
      { keys: ['Win', 'E'], description: 'Open File Explorer' },
      { keys: ['Win', 'L'], description: 'Lock your PC or switch user accounts' },
      { keys: ['Win', 'R'], description: 'Open the Run dialog box' },
      { keys: ['Win', 'V'], description: 'Open Clipboard History (highly useful for multiple copies)' },
      { keys: ['Win', 'Shift', 'S'], description: 'Open Snipping Tool to take a customizable screenshot' },
      { keys: ['Win', 'Tab'], description: 'Open Task View (virtual desktops and timeline)' },
      { keys: ['Alt', 'Tab'], description: 'Switch between active applications' },
      { keys: ['Alt', 'F4'], description: 'Close the active item or exit the active app' },
      { keys: ['Ctrl', 'Shift', 'Esc'], description: 'Open Task Manager directly' },
      { keys: ['Win', 'Comma (,)'], description: 'Temporarily peek at the desktop' },
      { keys: ['Win', 'Arrow Keys'], description: 'Snap active window to sides or corners' },
      { keys: ['Win', 'I'], description: 'Open Windows Settings' },
      { keys: ['Win', 'Period (.)'], description: 'Open Emoji and special character panel' },
      { keys: ['Ctrl', 'Esc'], description: 'Open the Start Menu' }
    ]
  },
  {
    id: 'pc_general',
    name: 'PC & General Keys',
    iconName: 'Keyboard',
    color: 'from-zinc-500/10 to-slate-500/5 text-zinc-500 border-zinc-500/20 dark:text-zinc-400',
    description: 'Standard baseline keyboard combinations working in almost any general software.',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Select all items or text in current workspace' },
      { keys: ['Ctrl', 'C'], description: 'Copy selected items or text' },
      { keys: ['Ctrl', 'V'], description: 'Paste copied items or text' },
      { keys: ['Ctrl', 'X'], description: 'Cut selected items or text' },
      { keys: ['Ctrl', 'Z'], description: 'Undo the last action' },
      { keys: ['Ctrl', 'Y'], description: 'Redo the last undone action' },
      { keys: ['Ctrl', 'S'], description: 'Save the current file or progress' },
      { keys: ['Ctrl', 'F'], description: 'Open search / find bar' },
      { keys: ['Ctrl', 'H'], description: 'Open find & replace panel' },
      { keys: ['Ctrl', 'P'], description: 'Print current document or web page' },
      { keys: ['Ctrl', 'N'], description: 'Open a new window or create a new document' },
      { keys: ['Ctrl', 'O'], description: 'Open an existing file or document' },
      { keys: ['Ctrl', 'W'], description: 'Close the active tab or document window' },
      { keys: ['F2'], description: 'Rename the selected file, folder, or element' },
      { keys: ['F5'], description: 'Refresh current window, page, or document' }
    ]
  },
  {
    id: 'ms_word',
    name: 'Microsoft Word',
    iconName: 'FileText',
    color: 'from-blue-600/10 to-cyan-500/5 text-blue-600 border-blue-600/20',
    description: 'Document formatting, text styling, alignment, and editor shortcuts.',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Toggle bold formatting on selected text' },
      { keys: ['Ctrl', 'I'], description: 'Toggle italic formatting on selected text' },
      { keys: ['Ctrl', 'U'], description: 'Toggle underline formatting on selected text' },
      { keys: ['Ctrl', '['], description: 'Decrease font size by 1 point' },
      { keys: ['Ctrl', ']'], description: 'Increase font size by 1 point' },
      { keys: ['Ctrl', 'L'], description: 'Align selected text or paragraph to the Left' },
      { keys: ['Ctrl', 'E'], description: 'Align selected text or paragraph to the Center' },
      { keys: ['Ctrl', 'R'], description: 'Align selected text or paragraph to the Right' },
      { keys: ['Ctrl', 'J'], description: 'Align selected text or paragraph to Justified' },
      { keys: ['Ctrl', 'K'], description: 'Insert a hyperlink' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy formatting only (Format Painter)' },
      { keys: ['Ctrl', 'Shift', 'V'], description: 'Paste copied formatting onto selected text' },
      { keys: ['Ctrl', 'Backspace'], description: 'Delete one entire word to the left of cursor' },
      { keys: ['Alt', 'Shift', 'D'], description: 'Insert current date automatically' },
      { keys: ['Alt', 'Shift', 'T'], description: 'Insert current time automatically' }
    ]
  },
  {
    id: 'ms_excel',
    name: 'Microsoft Excel',
    iconName: 'FileSpreadsheet',
    color: 'from-emerald-500/10 to-green-500/5 text-emerald-500 border-emerald-500/20',
    description: 'Grid navigation, formula generation, formatting, and cell editing.',
    shortcuts: [
      { keys: ['F2'], description: 'Edit the active cell directly' },
      { keys: ['F4'], description: 'Toggle absolute/relative cell references ($A$1) or repeat last action' },
      { keys: ['Alt', '='], description: 'Insert AutoSum formula automatically on adjacent range' },
      { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle filters on or off for the dataset' },
      { keys: ['Ctrl', ';'], description: 'Insert current date into the active cell' },
      { keys: ['Ctrl', 'Shift', ':'], description: 'Insert current time into the active cell' },
      { keys: ['Ctrl', 'Arrow Keys'], description: 'Jump to the extreme edge of the active data range' },
      { keys: ['Ctrl', 'PageUp / PageDown'], description: 'Move between spreadsheet worksheets' },
      { keys: ['Ctrl', '1'], description: 'Open the Format Cells dialog box' },
      { keys: ['Ctrl', 'Shift', '~'], description: 'Apply General number format' },
      { keys: ['Ctrl', 'Shift', '$'], description: 'Apply Currency number format with two decimals' },
      { keys: ['Ctrl', 'Shift', '%'], description: 'Apply Percentage format (no decimals)' },
      { keys: ['Ctrl', 'Spacebar'], description: 'Select the entire worksheet column' },
      { keys: ['Shift', 'Spacebar'], description: 'Select the entire worksheet row' },
      { keys: ['Ctrl', '9'], description: 'Hide selected rows' }
    ]
  },
  {
    id: 'ms_powerpoint',
    name: 'Microsoft PowerPoint',
    iconName: 'Presentation',
    color: 'from-orange-500/10 to-red-500/5 text-orange-500 border-orange-500/20',
    description: 'Presentation control, slide manipulation, grouping, and text scaling.',
    shortcuts: [
      { keys: ['Ctrl', 'M'], description: 'Insert a new blank slide' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate the selected slide, shape, or textbox' },
      { keys: ['F5'], description: 'Start the slideshow presentation from the first slide' },
      { keys: ['Shift', 'F5'], description: 'Start presentation from the currently active slide' },
      { keys: ['Esc'], description: 'End or exit the active slideshow presentation' },
      { keys: ['Ctrl', 'G'], description: 'Group selected shapes or objects together' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup selected grouped objects' },
      { keys: ['Ctrl', 'Shift', '>'], description: 'Increase font size of selected text' },
      { keys: ['Ctrl', 'Shift', '<'], description: 'Decrease font size of selected text' },
      { keys: ['B'], description: 'Display a black blank screen during slideshow (press again to return)' },
      { keys: ['W'], description: 'Display a white blank screen during slideshow (press again to return)' },
      { keys: ['Ctrl', 'P'], description: 'Change pointer to pen tool during slideshow' },
      { keys: ['Ctrl', 'A'], description: 'Change pen tool back to pointer arrow during slideshow' },
      { keys: ['Ctrl', 'E'], description: 'Erase on-screen pen markings during presentation' },
      { keys: ['Alt', 'PrntScrn'], description: 'Take screenshot of current window to paste into slide' }
    ]
  },
  {
    id: 'adobe_photoshop',
    name: 'Adobe Photoshop',
    iconName: 'Image',
    color: 'from-cyan-500/10 to-blue-500/5 text-cyan-500 border-cyan-500/20',
    description: 'Tool palette selection, layers, brush adjustments, and canvas transforms.',
    shortcuts: [
      { keys: ['V'], description: 'Select the Move tool' },
      { keys: ['M'], description: 'Select the Marquee (selection) tool' },
      { keys: ['L'], description: 'Select the Lasso tool' },
      { keys: ['W'], description: 'Select the Quick Selection / Magic Wand tool' },
      { keys: ['B'], description: 'Select the Paint Brush tool' },
      { keys: ['E'], description: 'Select the Eraser tool' },
      { keys: ['[', 'or', ']'], description: 'Decrease / Increase brush diameter size' },
      { keys: ['Shift', '['], description: 'Decrease brush hardness by 25%' },
      { keys: ['Shift', ']'], description: 'Increase brush hardness by 25%' },
      { keys: ['Ctrl', 'T'], description: 'Enter Free Transform mode' },
      { keys: ['Ctrl', 'J'], description: 'Duplicate active layer or selection into a new layer' },
      { keys: ['Ctrl', 'Shift', 'N'], description: 'Create a new blank layer' },
      { keys: ['Ctrl', 'Alt', 'I'], description: 'Open Image Size parameter dialog box' },
      { keys: ['Ctrl', 'Shift', 'Alt', 'E'], description: 'Merge all visible layers into a new, separate layer on top' },
      { keys: ['Ctrl', 'D'], description: 'Deselect any active marquee selections' }
    ]
  },
  {
    id: 'adobe_premiere',
    name: 'Adobe Premiere Pro',
    iconName: 'Clapperboard',
    color: 'from-violet-500/10 to-fuchsia-500/5 text-violet-500 border-violet-500/20',
    description: 'Video timeline editing, cutting, tool switching, and playback controls.',
    shortcuts: [
      { keys: ['V'], description: 'Select the standard Selection tool' },
      { keys: ['C'], description: 'Select the Razor tool (slice/cut tool)' },
      { keys: ['B'], description: 'Select the Ripple Edit tool' },
      { keys: ['R'], description: 'Select the Rate Stretch tool' },
      { keys: ['Spacebar'], description: 'Play or pause timeline playback' },
      { keys: ['I'], description: 'Mark source monitor In point' },
      { keys: ['O'], description: 'Mark source monitor Out point' },
      { keys: ['Up / Down Arrow'], description: 'Jump forward / backward to adjacent edit cuts' },
      { keys: ['Shift', 'Delete'], description: 'Perform a Ripple Delete (closes the empty track gap)' },
      { keys: ['Ctrl', 'D'], description: 'Apply default Video transition' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Apply default Audio transition' },
      { keys: ['Backslash (\\)'], description: 'Scale/fit entire timeline sequence to active window size' },
      { keys: ['J', 'K', 'L'], description: 'Reverse Play (J) / Pause (K) / Fast Forward Play (L)' },
      { keys: ['M'], description: 'Add a timeline or clip marker' },
      { keys: ['Ctrl', 'M'], description: 'Export media sequence settings' }
    ]
  },
  {
    id: 'adobe_after_effects',
    name: 'Adobe After Effects',
    iconName: 'Video',
    color: 'from-purple-500/10 to-indigo-500/5 text-purple-500 border-purple-500/20',
    description: 'Motion graphics keyframing, layer property reveal, and compositions.',
    shortcuts: [
      { keys: ['V'], description: 'Select the Selection tool' },
      { keys: ['H'], description: 'Select the Hand tool' },
      { keys: ['W'], description: 'Select the Rotation tool' },
      { keys: ['Q'], description: 'Select / cycle through Mask and Shape vector tools' },
      { keys: ['G'], description: 'Select the Pen tool' },
      { keys: ['T'], description: 'Select the Horizontal Type tool' },
      { keys: ['P'], description: 'Reveal the selected layer\'s Position property' },
      { keys: ['S'], description: 'Reveal the selected layer\'s Scale property' },
      { keys: ['R'], description: 'Reveal the selected layer\'s Rotation property' },
      { keys: ['T', '(opacity)'], description: 'Reveal the selected layer\'s Opacity (Transparency) property' },
      { keys: ['U'], description: 'Reveal all keyframes and active effects on selected layers' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected layers' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Pre-compose selected layers into a sub-comp' },
      { keys: ['Spacebar'], description: 'Initiate RAM preview playback' },
      { keys: ['B', 'or', 'N'], description: 'Set Work Area start (B) or end (N) to playhead position' }
    ]
  },
  {
    id: 'vscode',
    name: 'VS Code',
    iconName: 'Code',
    color: 'from-sky-500/10 to-indigo-500/5 text-sky-500 border-sky-500/20',
    description: 'Source code management, multi-cursor, navigation, and workspace utilities.',
    shortcuts: [
      { keys: ['Ctrl', 'P'], description: 'Quick Open (search and open files by name)' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Open the Command Palette to access all editor tools' },
      { keys: ['Ctrl', '`'], description: 'Toggle the integrated terminal panel' },
      { keys: ['Alt', 'Up / Down'], description: 'Move the active code line up or down' },
      { keys: ['Shift', 'Alt', 'Up / Down'], description: 'Copy and duplicate the active line up or down' },
      { keys: ['Ctrl', '/'], description: 'Toggle single-line comment status' },
      { keys: ['Ctrl', 'D'], description: 'Select current word / add next occurrence to selection' },
      { keys: ['Ctrl', 'Shift', 'L'], description: 'Select all instances of current word in active file' },
      { keys: ['Alt', 'Click'], description: 'Add multiple cursors to manually edit several spots' },
      { keys: ['Alt', 'Z'], description: 'Toggle word wrap on and off' },
      { keys: ['Ctrl', 'Shift', 'O'], description: 'Navigate to symbols / functions in active file' },
      { keys: ['Ctrl', 'F'], description: 'Find search query' },
      { keys: ['Ctrl', 'H'], description: 'Replace search query' },
      { keys: ['Ctrl', 'B'], description: 'Toggle the primary left sidebar visibility' },
      { keys: ['Ctrl', 'G'], description: 'Go to a specific line number' }
    ]
  },
  {
    id: 'web_browsers',
    name: 'Web Browsers',
    iconName: 'Globe',
    color: 'from-amber-500/10 to-orange-500/5 text-amber-500 border-amber-500/20',
    description: 'Chrome, Edge, Firefox navigation, tabs, zoom, and history management.',
    shortcuts: [
      { keys: ['Ctrl', 'T'], description: 'Open a new browser tab' },
      { keys: ['Ctrl', 'W'], description: 'Close the active tab' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Reopen the last closed tab (crucial for accidental closes)' },
      { keys: ['Ctrl', 'L'], description: 'Highlight and focus the address bar url' },
      { keys: ['F5', 'or', 'Ctrl', 'R'], description: 'Reload the active page' },
      { keys: ['Ctrl', 'Shift', 'R'], description: 'Force reload (bypasses browser cache, hard reload)' },
      { keys: ['Ctrl', 'H'], description: 'Open browser history page' },
      { keys: ['Ctrl', 'J'], description: 'Open browser downloads folder page' },
      { keys: ['Ctrl', 'Shift', 'N'], description: 'Open an Incognito / Private browsing window' },
      { keys: ['Ctrl', 'Tab'], description: 'Switch forward to next browser tab' },
      { keys: ['Ctrl', 'Shift', 'Tab'], description: 'Switch backward to previous browser tab' },
      { keys: ['Ctrl', '1 - 8'], description: 'Switch to tab at corresponding number' },
      { keys: ['Ctrl', '9'], description: 'Switch directly to the last tab on the right' },
      { keys: ['Spacebar'], description: 'Scroll down active page' },
      { keys: ['Shift', 'Spacebar'], description: 'Scroll up active page' }
    ]
  },
  {
    id: 'file_explorer',
    name: 'File Explorer',
    iconName: 'FolderOpen',
    color: 'from-amber-600/10 to-yellow-500/5 text-amber-600 border-amber-600/20',
    description: 'Folder system management, fast navigation, property checks, and creation.',
    shortcuts: [
      { keys: ['Win', 'E'], description: 'Launch a new File Explorer window' },
      { keys: ['Alt', 'Up Arrow'], description: 'Navigate up a folder level in tree directory' },
      { keys: ['Alt', 'Left Arrow'], description: 'Go back to previous folder view' },
      { keys: ['Alt', 'Right Arrow'], description: 'Go forward to next folder view' },
      { keys: ['F2'], description: 'Rename the selected file or folder' },
      { keys: ['Ctrl', 'Shift', 'N'], description: 'Create a new folder in active directory' },
      { keys: ['Alt', 'Enter'], description: 'Show properties panel of selected file or folder' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Expand all folders in navigation tree' },
      { keys: ['F11'], description: 'Toggle full screen mode' },
      { keys: ['Ctrl', 'Shift', '1 - 8'], description: 'Change folder view mode (icons, list, details)' },
      { keys: ['Alt', 'P'], description: 'Toggle the preview pane on the right side' },
      { keys: ['Alt', 'Shift', 'P'], description: 'Toggle the details pane on the right side' },
      { keys: ['Delete'], description: 'Move selected files to Recycle Bin' },
      { keys: ['Shift', 'Delete'], description: 'Delete selected files permanently (bypasses Recycle Bin)' },
      { keys: ['Ctrl', 'N'], description: 'Open a new File Explorer window identical to active directory' }
    ]
  },
  {
    id: 'tally',
    name: 'Tally Prime / ERP',
    iconName: 'Calculator',
    color: 'from-rose-500/10 to-pink-500/5 text-rose-500 border-rose-500/20',
    description: 'Financial accounting vouchers, masters, ledgers, and database exports.',
    shortcuts: [
      { keys: ['Alt', 'C'], description: 'Create a new master/ledger directly from voucher entry screen' },
      { keys: ['Alt', 'D'], description: 'Delete a voucher, master, or ledger entry' },
      { keys: ['Ctrl', 'A'], description: 'Accept and save current voucher, form, or setup screen' },
      { keys: ['Esc'], description: 'Cancel current form, go back, or exit Tally screen' },
      { keys: ['F1'], description: 'Select a company from the list' },
      { keys: ['Alt', 'F3'], description: 'Open Company Info settings menu' },
      { keys: ['Alt', 'F1'], description: 'Toggle Detailed or Condensed report/balance sheet view' },
      { keys: ['F12'], description: 'Open configuration options of current screen' },
      { keys: ['Alt', 'P'], description: 'Print the current voucher entry or active report' },
      { keys: ['Alt', 'I'], description: 'Insert a new voucher at a selected line' },
      { keys: ['Alt', 'A'], description: 'Add a voucher to the end of selected list' },
      { keys: ['Ctrl', 'N'], description: 'Toggle calculators panel in voucher screen' },
      { keys: ['Alt', 'E'], description: 'Export the active report / sheet format' },
      { keys: ['Alt', 'O'], description: 'Import data from XML sheets' },
      { keys: ['Alt', 'M'], description: 'E-mail current invoice or transaction report directly' }
    ]
  },
  {
    id: 'macos_general',
    name: 'macOS General',
    iconName: 'Monitor',
    color: 'from-neutral-400/10 to-neutral-500/5 text-neutral-500 border-neutral-500/20 dark:text-neutral-300',
    description: 'Essential shortcuts for Apple macOS operating system and desktop.',
    shortcuts: [
      { keys: ['Cmd', 'Spacebar'], description: 'Open Spotlight search' },
      { keys: ['Cmd', 'Tab'], description: 'Switch between open applications' },
      { keys: ['Cmd', 'Shift', '3'], description: 'Take a screenshot of the entire screen' },
      { keys: ['Cmd', 'Shift', '4'], description: 'Take a screenshot of a selected area' },
      { keys: ['Cmd', 'Comma (,)'], description: 'Open preferences for the frontmost application' },
      { keys: ['Cmd', 'Option', 'Esc'], description: 'Force Quit applications dialog box' },
      { keys: ['Cmd', 'W'], description: 'Close the front window of the active app' },
      { keys: ['Cmd', 'Q'], description: 'Quit the active application completely' },
      { keys: ['Cmd', 'Up Arrow'], description: 'Go up one folder directory in Finder' },
      { keys: ['Cmd', 'Delete'], description: 'Move selected items to Trash' }
    ]
  }
];
