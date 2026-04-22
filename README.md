# ⚡ AI Hotkey → Telegram

Скопируй текст → нажми хоткей → получи ответ в Telegram.

Работает как браузерное расширение (Chrome/Firefox) или desktop приложение (Python).

---

## Структура проекта

```
ai-hotkey/
├── extension/               ← Браузерное расширение
│   ├── manifest.json            Chrome / Edge
│   ├── manifest_firefox.json    Firefox
│   ├── background.js            Chrome background
│   ├── background_firefox.js    Firefox background
│   ├── content.js               Получение выделенного текста
│   ├── popup.html / popup.js    Интерфейс настроек
│   └── icons/
├── server/                  ← Локальный Node.js сервер
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── desktop/                 ← Desktop приложение (Python)
    ├── ai_hotkey.py
    ├── requirements.txt
    └── .env
```

---

## Требования

- Node.js 18+
- Python 3.8+ (только для desktop версии)
- Telegram бот
- API ключ Google AI Studio (бесплатно)

---

## ШАГ 1 — Создать Telegram бота

1. Открой Telegram, найди **@BotFather**
2. Напиши `/newbot`, придумай имя и username
3. Скопируй токен вида `1234567890:ABCdef...`
4. Напиши своему боту `/start`
5. Открой в браузере (подставь свой токен):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
6. Найди `"chat":{"id": XXXXXXX}` — это твой **Chat ID**

---

## ШАГ 2 — Получить API ключ

Зайди на [aistudio.google.com](https://aistudio.google.com) → **Get API key** → создай ключ.

Бесплатный лимит: **14 400 запросов в день** (Gemma модели).

---

## ШАГ 3 — Настроить сервер

```bash
cd server
npm install
cp .env.example .env
```

Открой `.env` и заполни:
```env
GEMINI_API_KEY=AIza...
TELEGRAM_BOT_TOKEN=1234567890:...
TELEGRAM_CHAT_ID=123456789
```

Запусти сервер:
```bash
node server.js
```

> Сервер должен быть запущен пока пользуешься расширением или desktop приложением.

---

## ШАГ 4 — Установить расширение

### Chrome / Edge

1. Открой `chrome://extensions/`
2. Включи **«Режим разработчика»** (правый верхний угол)
3. Нажми **«Загрузить распакованное»**
4. Выбери папку `extension/`

### Firefox

1. Переименуй `manifest_firefox.json` → `manifest.json`
2. Открой `about:debugging` → **«Этот Firefox»**
3. Нажми **«Загрузить временное дополнение»**
4. Выбери файл `extension/manifest.json`

---

## ШАГ 4 (альтернатива) — Desktop приложение

Если расширение недоступно (например заблокировано на рабочем/школьном компьютере):

```bash
cd desktop
pip install -r requirements.txt
python ai_hotkey.py
```

Появится иконка в трее. Использование:
1. Скопируй текст **(Ctrl+C)**
2. Нажми хоткей **(Ctrl+Shift+Y)**
3. Жди ответа в Telegram

---

## Использование (расширение)

1. Выдели любой текст на странице
2. Нажми **Ctrl+Shift+Y**
3. Через несколько секунд — ответ в Telegram

---

## Изменить хоткей

**Расширение:**
- Chrome: `chrome://extensions/shortcuts`
- Firefox: `about:addons` → шестерёнка → «Управление горячими клавишами»

**Desktop приложение** — в файле `desktop/.env`:
```env
HOTKEY=ctrl+shift+y
```

---

## Изменить системный промпт

В `server/.env`:
```env
SYSTEM_PROMPT=You are an expert assistant. Answer briefly.
```

---

## Автозапуск сервера

### Windows

Создай файл `start.bat`:
```bat
@echo off
cd /d C:\путь\до\ai-hotkey\server
node server.js
```

Нажми **Win+R** → `shell:startup` → скопируй `start.bat` туда.

### macOS

Создай `~/Library/LaunchAgents/ai.hotkey.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.hotkey</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/путь/до/ai-hotkey/server/server.js</string>
  </array>
  <key>WorkingDirectory</key><string>/путь/до/ai-hotkey/server</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```
```bash
launchctl load ~/Library/LaunchAgents/ai.hotkey.plist
```

### Linux

```ini
# ~/.config/systemd/user/ai-hotkey.service
[Unit]
Description=AI Hotkey Server

[Service]
WorkingDirectory=/путь/до/ai-hotkey/server
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=default.target
```
```bash
systemctl --user enable ai-hotkey
systemctl --user start ai-hotkey
```
