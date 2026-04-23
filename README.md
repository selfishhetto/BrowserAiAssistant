# AI Hotkey → Telegram

Выдели текст в браузере → нажми **Ctrl+Shift+A** → получи ответ от **Gemma 3 27B** в Telegram.

Модель бесплатная: [Google AI Studio](https://aistudio.google.com/) даёт ~500 запросов в день без карты.

---

## Структура проекта

```
ai-hotkey/
├── extension/              ← Браузерное расширение
│   ├── manifest.json           Chrome / Edge
│   ├── manifest_firefox.json   Firefox
│   ├── background.js           Chrome background
│   ├── background_firefox.js   Firefox background
│   ├── content.js              Получение выделенного текста
│   ├── popup.html / popup.js   Интерфейс настроек
│   └── icons/
└── server/                 ← Локальный Node.js сервер
    ├── server.js
    ├── package.json
    └── .env
```

---

## ШАГ 1 — Получить Gemini API ключ (бесплатно)

1. Открой [aistudio.google.com](https://aistudio.google.com/)
2. Войди через Google аккаунт
3. Нажми **Get API key** → **Create API key**
4. Скопируй ключ вида `AIzaSy...`

---

## ШАГ 2 — Создать Telegram бота

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

## ШАГ 3 — Настроить сервер

```bash
cd server
npm install
```

Создай файл `.env` в папке `server/`:
```env
GEMINI_API_KEY=AIzaSy...           # из Google AI Studio
TELEGRAM_BOT_TOKEN=1234567890:...  # от @BotFather
TELEGRAM_CHAT_ID=123456789         # из getUpdates
```

Запусти сервер:
```bash
node server.js
```

Ты увидишь:
```
╔══════════════════════════════════════╗
║        AI Hotkey Server v1.0         ║
╠══════════════════════════════════════╣
║  Модель: Gemma 3 27B                 ║
║  Лимит: 500 запросов/день            ║
║  Порт: 3747                          ║
╚══════════════════════════════════════╝
```

> **Сервер должен быть запущен всегда, когда хочешь пользоваться хоткеем.**
> Для автозапуска см. раздел ниже.

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

## ШАГ 5 — Использование

1. **Выдели любой текст** на любой странице
2. Нажми **Ctrl+Shift+A** (Mac: Cmd+Shift+A)
3. В правом углу появится уведомление браузера
4. Через несколько секунд — **ответ в Telegram**

---

## Автозапуск сервера

### Windows — bat файл в автозагрузке

Создай файл `start-ai-hotkey.bat`:
```bat
@echo off
cd /d C:\путь\до\ai-hotkey\server
node server.js
```

Нажми Win+R → `shell:startup` → скопируй bat файл туда.

### macOS — LaunchAgent

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

### Linux — systemd

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

---

## Изменить хоткей

В Chrome: `chrome://extensions/shortcuts`
В Firefox: `about:addons` → шестерёнка → «Управление горячими клавишами»

---

## Изменить системный промпт

**Вариант 1:** Открой popup расширения (кликни на иконку) → измени поле «Системный промпт»

**Вариант 2:** Добавь в `.env`:
```env
SYSTEM_PROMPT=Отвечай кратко на русском языке.
```
