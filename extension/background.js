const SERVER_URL = 'https://browseraiassistant-production.up.railway.app';

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'send-to-ai') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
      const text = response?.text?.trim();

      if (!text) return;

      const result = await sendToServer(text, tab.url, tab.title);

      if (result?.answer) {
        await chrome.tabs.sendMessage(tab.id, { type: 'HIGHLIGHT_ANSWER', answer: result.answer });
      }

    } catch (err) {
      console.error('AI Hotkey error:', err);
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

  return res.json();
}
