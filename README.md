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

---

## Требования

- Node.js 18+
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

