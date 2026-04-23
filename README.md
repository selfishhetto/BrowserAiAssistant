# AI Hotkey → Telegram

Select text in your browser → press **Ctrl+Shift+A** → get a **Gemma 3 27B** response in Telegram.

The model is free: [Google AI Studio](https://aistudio.google.com/) gives ~500 requests/day with no card required.

---

## Project Structure

```
ai-hotkey/
├── extension/              ← Browser extension
│   ├── manifest.json           Chrome / Edge
│   ├── manifest_firefox.json   Firefox
│   ├── background.js           Chrome background
│   ├── background_firefox.js   Firefox background
│   ├── content.js              Gets selected text
│   ├── popup.html / popup.js   Settings UI
│   └── icons/
└── server/                 ← Local Node.js server
    ├── server.js
    ├── package.json
    └── .env
```

---

## STEP 1 — Get a Gemini API key (free)

1. Open [aistudio.google.com](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key (looks like `AIzaSy...`)

---

## STEP 2 — Create a Telegram bot

1. Open Telegram, find **@BotFather**
2. Send `/newbot`, choose a name and username
3. Copy the **token** (looks like `1234567890:ABCdef...`)
4. Send `/start` to your new bot
5. Open in your browser (replace with your token):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
6. Find `"chat":{"id": XXXXXXX}` — that's your **Chat ID**

---

## STEP 3 — Configure the server

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:
```env
GEMINI_API_KEY=AIzaSy...           # from Google AI Studio
TELEGRAM_BOT_TOKEN=1234567890:...  # from @BotFather
TELEGRAM_CHAT_ID=123456789         # from getUpdates
```

Start the server:
```bash
node server.js
```

You should see:
```
╔══════════════════════════════════════╗
║        AI Hotkey Server v1.0         ║
╠══════════════════════════════════════╣
║  Model: Gemma 3 27B                  ║
║  Limit: 500 requests/day             ║
║  Port: 3747                          ║
╚══════════════════════════════════════╝
```

> **The server must be running whenever you want to use the hotkey.**
> See the auto-start section below.

---

## STEP 4 — Install the extension

### Chrome / Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (top right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder

### Firefox

1. Rename `manifest_firefox.json` → `manifest.json`
2. Open `about:debugging` → **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `extension/manifest.json`

---

## STEP 5 — Usage

1. **Select any text** on any page
2. Press **Ctrl+Shift+A** (Mac: Cmd+Shift+A)
3. A browser notification will appear in the corner
4. A few seconds later — **response in Telegram**

---

## Auto-start the server

### Windows — bat file in Startup

Create `start-ai-hotkey.bat`:
```bat
@echo off
cd /d C:\path\to\ai-hotkey\server
node server.js
```

Press Win+R → `shell:startup` → copy the bat file there.

### macOS — LaunchAgent

Create `~/Library/LaunchAgents/ai.hotkey.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.hotkey</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/ai-hotkey/server/server.js</string>
  </array>
  <key>WorkingDirectory</key><string>/path/to/ai-hotkey/server</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```
```bash
launchctl load ~/Library/LaunchAgents/ai.hotkey.plist
```

### Linux — systemd

```ini
# ~/.config/systemd/user/ai-hotkey.service
[Unit]
Description=AI Hotkey Server

[Service]
WorkingDirectory=/path/to/ai-hotkey/server
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=default.target
```
```bash
systemctl --user enable ai-hotkey
systemctl --user start ai-hotkey
```

---

## Change the hotkey

Chrome: `chrome://extensions/shortcuts`
Firefox: `about:addons` → gear icon → Manage Extension Shortcuts

---

## Change the system prompt

**Option 1:** Open the extension popup (click the icon) → edit the System Prompt field

**Option 2:** Add to `.env`:
```env
SYSTEM_PROMPT=Answer briefly and clearly.
```
