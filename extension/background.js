const SERVER_URL = 'https://browseraiassistant-production.up.railway.app';

// Слушаем хоткей
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'send-to-ai') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Запрашиваем выделенный текст у content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
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

  const data = await res.json();
  showNotification('✅ Отправлено в Telegram!', 'Ответ придёт через несколько секунд');
  return data;
}

/*function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
} */
