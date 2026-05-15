# Salesforce SlipStream

<div align="center">
  <h3>⚡ Lightning-fast Salesforce commands at your fingertips</h3>
  <p>A Chrome extension that accelerates Salesforce development with a Spotlight-style command palette</p>
</div>

---

## 🚀 Quick Start

### Installation (Development Mode)

1. Clone or download this repository
2. Open Chrome or Edge and navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `Salesforce SlipStream v2.0` folder
6. Navigate to any Salesforce Lightning page (any `*.salesforce.com` or `*.force.com` URL)
7. Press `F8` or `⌘ Cmd + Shift + L` (Mac) or `Ctrl + Shift + L` (Windows/Linux)

> **Multiple shortcuts available!** See [KEYBOARD_SHORTCUTS.md](KEYBOARD_SHORTCUTS.md)

> **Note:** Works identically on Chrome and Edge (both Chromium-based)

---

## ✨ Features (v0.1.0 - Current)

### ✅ Implemented
- **Spotlight-style UI** - Beautiful, Apple-inspired command palette
- **Keyboard shortcut** - `CMD+Shift+K` to trigger on Salesforce orgs
- **Glassmorphism design** - Modern blur effects and smooth animations
- **Dark mode support** - Automatically adapts to system preferences
- **ESC to close** - Quick dismiss functionality

### 🚧 Coming in v0.2.0
- Command parser and execution
- Navigation commands (open setup, dev console, etc.)
- Search functionality
- Fuzzy matching
- Command history

---

## 🎨 Design Philosophy

SlipStream is inspired by macOS Spotlight and Apple's design language:
- **Keyboard-first** - Built for speed and efficiency
- **Minimal & beautiful** - Clean UI that stays out of your way
- **Context-aware** - Works seamlessly within Salesforce Lightning
- **Progressive enhancement** - Start simple, grow powerful

---

## 🛠️ Tech Stack

- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern styling with backdrop-filter and transitions
- **Salesforce Lightning** - Injected into Lightning Experience pages

---

## 📁 Project Structure

```
Salesforce SlipStream v2.0/
├── manifest.json           # Extension configuration
├── content.js              # Main logic & keyboard handling
├── spotlight-ui.css        # Apple-style UI design
├── popup.html              # Extension popup (badge icon)
├── icons/                  # Extension icons (16, 48, 128px)
├── ROADMAP.md             # Product roadmap & releases
└── README.md              # This file
```

---

## 🎯 Roadmap

### v0.1.0 - MVP (Current) ✅
- UI foundation
- Keyboard trigger
- Extension infrastructure

### v0.2.0 - Command Execution
- Navigation commands
- Search functionality
- Command parser
- Fuzzy search

### v0.3.0 - Developer Tools
- Field & object creation
- Metadata operations
- Safe deletion

### v1.0.0 - Major Release
- Analysis tools
- Code execution (Apex, SOQL)
- Export/import utilities
- Advanced automation

[See full roadmap](ROADMAP.md)

---

## 🧑‍💻 Development

### Local Testing
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on the SlipStream extension
4. Reload your Salesforce page
5. Test with `CMD+Shift+K`

### File Watching
For rapid development, consider using a file watcher to auto-reload the extension:
```bash
# Install extension reloader (optional)
# https://chromewebstore.google.com/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
```

---

## 🤝 Contributing

This is currently in early development (v0.1.0). Once we reach v0.2.0 with command execution, we'll open up for contributions!

---

## 📝 License

MIT License - feel free to use and modify as needed.

---

## 🙏 Credits

- Design inspiration: macOS Spotlight & Apple Safari
- Built for the Salesforce developer community
- Powered by Chrome Extensions Manifest V3

---

<div align="center">
  <strong>Made with ⚡ by developers, for developers</strong>
</div>
