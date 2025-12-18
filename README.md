<div align="center">

![Dev Soundtrack Logo](media/icon.png)

# Dev Soundtrack 🎵

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://marketplace.visualstudio.com/items?itemName=your-publisher.dev-soundtrack)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-blue.svg)](https://code.visualstudio.com/)

### **Your coding session deserves an epic soundtrack!**

*Play background music and epic sound effects while you code. Hear dramatic drum rolls when you save, fanfares on successful builds, and customize your entire coding soundtrack!*

</div>

---

## 📸 Screenshots

<div align="center">

### Main Control Panel
![Control Panel](media/screenshots/panel.png)
*Full control over your coding soundtrack with mood selection and volume controls*

### Sound Effects in Action
![Sound Effects](media/screenshots/effects.png)
*Epic sound effects triggered by your coding actions*

### Settings Configuration
![Settings](media/screenshots/settings.png)
*Customize every aspect of your soundtrack experience*

</div>

---

## 🎬 Demo

![Dev Soundtrack Demo](media/demo.gif)
*See Dev Soundtrack in action!*

## ✨ Features

### 🎵 Background Music
- **Multiple moods to choose from:**
  - ⚔️ **Epic** - Heroic orchestral music for intense coding
  - ☕ **Lo-Fi** - Chill beats to relax and code
  - 🌆 **Synthwave** - Retro 80s vibes
  - 👾 **8-Bit** - Classic chiptune sounds
  - 🌿 **Ambient** - Calm and peaceful soundscapes
  - 🤘 **Metal** - Heavy riffs for hardcore debugging

### 🔊 Sound Effects on Actions
Automatic sound effects triggered by your actions:

| Action | Sound Effect |
|--------|-------------|
| **Save file** (Ctrl+S) | Epic checkpoint sound |
| **Build success** | Victory fanfare |
| **Build error** | Dramatic failure sound |
| **Git commit** | Achievement unlocked |
| **Undo** | Rewind sound |
| **Open file** | Page turn sound |

### 🎛️ Full Control
- Individual volume controls for music and effects
- Mute/unmute with a single shortcut
- Beautiful control panel with modern UI
- Persistent settings across sessions

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install your-publisher.dev-soundtrack`
4. Press Enter

### From VSIX file
1. Download the `.vsix` file from releases
2. In VS Code, press `Ctrl+Shift+P`
3. Type "Install from VSIX"
4. Select the downloaded file

## 🚀 Quick Start

1. **Open the Music Panel**: Press `Ctrl+Alt+M` (or `Cmd+Alt+M` on Mac)
2. **Select a mood**: Click on your preferred music style
3. **Press Play**: Hit the play button and start coding!
4. **Save a file**: Press `Ctrl+S` and hear the epic save sound!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+M` | Open Music Panel |
| `Ctrl+Alt+P` | Play/Pause Music |
| `Ctrl+Alt+0` | Toggle Mute |
| `Ctrl+Alt+→` | Next Track |
| `Ctrl+Alt+←` | Previous Track |

## ⚙️ Settings

Access settings via `File > Preferences > Settings` and search for "Dev Soundtrack":

| Setting | Default | Description |
|---------|---------|-------------|
| `devSoundtrack.enabled` | `true` | Enable/disable the extension |
| `devSoundtrack.musicVolume` | `50` | Background music volume (0-100) |
| `devSoundtrack.effectsVolume` | `70` | Sound effects volume (0-100) |
| `devSoundtrack.currentMood` | `epic` | Current music mood |
| `devSoundtrack.playOnStartup` | `false` | Auto-play when VS Code opens |
| `devSoundtrack.soundEffects.onSave` | `true` | Play sound on file save |
| `devSoundtrack.soundEffects.onBuildSuccess` | `true` | Play fanfare on build success |
| `devSoundtrack.soundEffects.onBuildError` | `true` | Play sound on build error |
| `devSoundtrack.soundEffects.onGitCommit` | `true` | Play sound on git commit |
| `devSoundtrack.customSoundsPath` | `""` | Path to custom sound files |

## 🎨 Custom Sounds

You can use your own sound files:

1. Create a folder with your `.mp3`, `.wav`, or `.ogg` files
2. Set `devSoundtrack.customSoundsPath` to your folder path
3. Name files according to their purpose:
   - `save.mp3` - Played on file save
   - `success.mp3` - Played on build success
   - `error.mp3` - Played on build error
   - `commit.mp3` - Played on git commit

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for epic coding sessions
- Thanks to all contributors and users
- Built with ❤️ for the developer community

---

**Enjoy your coding soundtrack!** 🎵🚀

If you like this extension, please consider:
- ⭐ Starring the repository
- 📝 Writing a review on the marketplace
- 🐛 Reporting bugs and suggesting features
