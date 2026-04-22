// Firefox использует browser.* вместо chrome.* (с промисами)
const SERVER_URL = 'http://localhost:3747';

browser.commands.onCommand.addListener(async (command) => {
  if (command === 'send-to-ai') {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
      const text = response?.text?.trim();

      if (!text) {
        showNotification('⚠️ Ничего не выделено', 'Сначала выдели текст на странице');
        return;
      }

      showNotification('⏳ Отправляю...', text.slice(0, 80) + (text.length > 80 ? '…' : ''));
      await sendToServer(text, tab.url, tab.title);

    } catch (err) {
      console.error('AI Hotkey error:', err);
      showNotification('❌ Ошибка', 'Сервер не отвечает. Запущен ли server.js?');
    }
  }
});

async function sendToServer(text, sourceUrl, sourceTitle) {
  const res = await fetch(`${SERVER_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceUrl, sourceTitle })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  showNotification('✅ Отправлено!', 'Ответ придёт в Telegram через несколько секунд');
  return res.json();
}

function showNotification(title, message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
}
