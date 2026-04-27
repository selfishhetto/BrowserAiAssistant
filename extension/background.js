const SERVER_URL = 'https://browseraiassistant-production.up.railway.app';

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'send-to-ai') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    // Получить выделенный текст напрямую, без content.js
    const [{ result: text }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || '',
    });

    if (!text?.trim()) return;

    const result = await sendToServer(text.trim(), tab.url, tab.title);

    if (result?.answer) {
      const settings = await chrome.storage.sync.get(['overlayPosition', 'overlayDuration']);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injectAnswerUI,
        args: [result.answer, settings.overlayPosition || 'right', settings.overlayDuration ?? 1.5],
      });
    }

  } catch (err) {
    console.error('AI Hotkey error:', err);
  }
});

// Эта функция сериализуется и выполняется прямо на странице
function injectAnswerUI(answerText, position, durationSec) {
  document.getElementById('ai-hotkey-overlay')?.remove();

  const box = document.createElement('div');
  box.id = 'ai-hotkey-overlay';
  Object.assign(box.style, {
    position:   'fixed',
    bottom:     '20px',
    [position === 'left' ? 'left' : 'right']: '20px',
    zIndex:     '2147483647',
    color:      '#000',
    fontFamily: 'system-ui, sans-serif',
    fontSize:   '12px',
    fontWeight: '700',
    lineHeight: '1.4',
    textShadow: '0 0 4px #fff, 0 0 8px #fff',
    cursor:     'pointer',
    userSelect: 'none',
    maxWidth:   '280px',
  });
  box.onclick = () => box.remove();

  const body = document.createElement('div');
  body.textContent = answerText.trim();

  box.append(body);
  document.body.appendChild(box);
  setTimeout(() => box.remove(), durationSec * 1000);

  // DOM-подсветка нужного варианта
  const trimmed = answerText.trim();
  const letterMatch = trimmed.match(/^([a-zA-Z])\s*[-–)\]\.:\s]/);
  const tfMatch     = trimmed.match(/^(true|false)/i);
  const letter      = letterMatch ? letterMatch[1].toLowerCase()
                    : tfMatch     ? tfMatch[1].toLowerCase()
                    : null;
  if (!letter) return;

  const isTF  = letter === 'true' || letter === 'false';
  const regex = isTF
    ? new RegExp(`^\\s*${letter}(\\s|$|:)`, 'i')
    : new RegExp(`^\\s*[\\(\\[]?${letter}[\\)\\]\\.\\s:\\-–]`, 'i');

  const candidates = document.querySelectorAll(
    'label, li, [role="radio"], [role="option"], [role="listitem"],' +
    '[class*="answer"], [class*="option"], [class*="choice"], [class*="variant"], [class*="item"]'
  );

  for (const el of candidates) {
    if (!regex.test(el.textContent)) continue;
    Object.assign(el.style, {
      outline:         '3px solid #22c55e',
      backgroundColor: 'rgba(34,197,94,0.18)',
      borderRadius:    '4px',
    });
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    break;
  }
}

async function sendToServer(text, sourceUrl, sourceTitle) {
  const res = await fetch(`${SERVER_URL}/ask`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text, sourceUrl, sourceTitle }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
