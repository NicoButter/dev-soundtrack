# Media Assets

This folder contains media assets for Dev Soundtrack.

## Required Files

### Icon
- `icon.png` - Extension icon (128x128 or 256x256 recommended)

### Sound Effects (Optional)
Place your custom sound files in the `sounds/` folder:
- `save.mp3` or `save.wav` - File save sound
- `success.mp3` - Build success sound  
- `error.mp3` - Build error sound
- `commit.mp3` - Git commit sound
- `drumroll.mp3` - Drum roll effect
- `fanfare.mp3` - Fanfare effect
- `powerup.mp3` - Power up effect
- `achievement.mp3` - Achievement effect

## Creating an Icon

You can create a simple icon using any image editor. Recommended specifications:
- Size: 128x128 or 256x256 pixels
- Format: PNG with transparency
- Theme: Music-related (🎵, 🎧, 🎹)

### Quick SVG Icon
You can use this SVG as a base:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="16" fill="#1e1e1e"/>
  <circle cx="64" cy="64" r="40" fill="none" stroke="#007acc" stroke-width="4"/>
  <polygon points="54,44 54,84 84,64" fill="#007acc"/>
  <circle cx="64" cy="64" r="8" fill="#4ec9b0"/>
</svg>
```
