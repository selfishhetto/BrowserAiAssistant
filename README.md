⚡ AI Hotkey → Telegram
Скопируй текст → нажми хоткей → получи ответ в Telegram.
Работает как браузерное расширение (Chrome/Firefox) или desktop приложение (Python).

Структура проекта
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

Требования

Node.js 18+
Python 3.8+ (только для desktop версии)
Telegram бот
API ключ Google AI Studio (бесплатно)


ШАГ 1 — Создать Telegram бота

Открой Telegram, найди @BotFather
Напиши /newbot, придумай имя и username
Скопируй токен вида 1234567890:ABCdef...
Напиши своему боту /start
Открой в браузере (подставь свой токен):

   https://api.telegram.org/bot<TOKEN>/getUpdates

Найди "chat":{"id": XXXXXXX} — это твой Chat ID


ШАГ 2 — Получить API ключ
Зайди на aistudio.google.com → Get API key → создай ключ.
Бесплатный лимит: 14 400 запросов в день (Gemma модели).

ШАГ 3 — Настроить сервер
bashcd server
npm install
cp .env.example .env
Открой .env и заполни:
envGEMINI_API_KEY=AIza...
TELEGRAM_BOT_TOKEN=1234567890:...
TELEGRAM_CHAT_ID=123456789
Запусти сервер:
bashnode server.js

Сервер должен быть запущен пока пользуешься расширением или desktop приложением.


ШАГ 4 — Установить расширение
Chrome / Edge

Открой chrome://extensions/
Включи «Режим разработчика» (правый верхний угол)
Нажми «Загрузить распакованное»
Выбери папку extension/

Firefox

Переименуй manifest_firefox.json → manifest.json
Открой about:debugging → «Этот Firefox»
Нажми «Загрузить временное дополнение»
Выбери файл extension/manifest.json
