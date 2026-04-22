# ⚡ AI Hotkey → Telegram

Выдели текст в браузере → нажми **Ctrl+Shift+A** → получи ответ от Claude в Telegram.

---

## Структура проекта

```
ai-hotkey/
├── extension/           ← Браузерное расширение
│   ├── manifest.json        Chrome / Edge
│   ├── manifest_firefox.json Firefox
│   ├── background.js        Chrome background
│   ├── background_firefox.js Firefox background
│   ├── content.js           Получение выделенного текста
│   ├── popup.html/js        Интерфейс настроек
│   └── icons/
└── server/              ← Локальный сервер
    ├── server.js
    ├── package.json
    └── .env.example
```

---

## ШАГ 1 — Создать Telegram бота

1. Открой Telegram, найди **@BotFather**
2. Напиши `/newbot`, выбери имя и username
3. Скопируй **токен** (вида `1234567890:ABCdef...`)
4. Напиши своему новому боту `/start`
5. Открой в браузере (подставь свой токен):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
6. Найди в ответе `"chat":{"id": XXXXXXX}` — это твой **Chat ID**

---

## ШАГ 2 — Настроить сервер

```bash
cd server

# Установить зависимости
npm install

# Создать файл с токенами
cp .env.example .env
```

Открой `.env` и заполни:
```env
ANTHROPIC_API_KEY=sk-ant-...      # console.anthropic.com
TELEGRAM_BOT_TOKEN=1234567890:... # от @BotFather
TELEGRAM_CHAT_ID=123456789        # из getUpdates
```

Запустить сервер:
```bash
node server.js
```

Ты увидишь:
```
╔══════════════════════════════════════╗
║        AI Hotkey Server v1.0         ║
╠══════════════════════════════════════╣
║  Порт: 3747                          ║
║  Хоткей: Ctrl+Shift+A                ║
╚══════════════════════════════════════╝
```

> **Сервер должен быть запущен всегда, когда хочешь пользоваться хоткеем.**
> Для автозапуска см. раздел ниже.

---

## ШАГ 3 — Установить расширение

### Chrome / Edge

1. Открой `chrome://extensions/` (или `edge://extensions/`)
2. Включи **«Режим разработчика»** (правый верхний угол)
3. Нажми **«Загрузить распакованное»**
4. Выбери папку `extension/`
5. Расширение появится в панели

### Firefox

1. Скопируй `manifest_firefox.json` → переименуй в `manifest.json`
   (или временно замени оригинальный)
2. Открой `about:debugging`
3. Нажми **«Этот Firefox»** → **«Загрузить временное дополнение»**
4. Выбери файл `extension/manifest.json`

---

## ШАГ 4 — Использование

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
SYSTEM_PROMPT=Ты эксперт по программированию. Отвечай с примерами кода.
```
