chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const text = window.getSelection()?.toString() || '';
    sendResponse({ text });
  }
  if (message.type === 'HIGHLIGHT_ANSWER') {
    showOverlay(message.answer);
    highlightDom(message.answer);
    sendResponse({ ok: true });
  }
  return true;
});

// ── Плавающий оверлей ──────────────────────────────────────────────────────

function showOverlay(answerText) {
  let box = document.getElementById('ai-hotkey-overlay');
  if (!box) {
    box = document.createElement('div');
    box.id = 'ai-hotkey-overlay';
    Object.assign(box.style, {
      position:     'fixed',
      bottom:       '24px',
      right:        '24px',
      zIndex:       '2147483647',
      maxWidth:     '340px',
      background:   '#18181b',
      color:        '#f4f4f5',
      fontFamily:   'system-ui, sans-serif',
      fontSize:     '15px',
      lineHeight:   '1.5',
      padding:      '14px 18px',
      borderRadius: '12px',
      boxShadow:    '0 4px 24px rgba(0,0,0,0.45)',
      borderLeft:   '4px solid #22c55e',
      cursor:       'pointer',
      userSelect:   'none',
      transition:   'opacity 0.2s',
    });
    box.title = 'Нажми чтобы закрыть';
    box.addEventListener('click', () => box.remove());
    document.body.appendChild(box);
  }

  box.innerHTML =
    `<div style="font-size:11px;color:#71717a;margin-bottom:4px;letter-spacing:.05em">AI ANSWER</div>` +
    `<div>${escapeHtml(answerText.trim())}</div>`;

  // Автоскрытие через 12 секунд
  clearTimeout(box._timer);
  box._timer = setTimeout(() => box?.remove(), 12000);
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── DOM-подсветка (бонус, работает если вёрстка стандартная) ──────────────

function highlightDom(answerText) {
  document.querySelectorAll('.ai-answer-highlight').forEach(el => {
    el.style.removeProperty('outline');
    el.style.removeProperty('background-color');
    el.style.removeProperty('border-radius');
    el.classList.remove('ai-answer-highlight');
  });

  const trimmed = answerText.trim();
  const letterMatch = trimmed.match(/^([a-zA-Z])\s*[-–)\]\.:\s]/);
  const tfMatch     = trimmed.match(/^(true|false)/i);

  let letter = null;
  if (letterMatch) letter = letterMatch[1].toLowerCase();
  else if (tfMatch) letter = tfMatch[1].toLowerCase();
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
    el.style.outline         = '3px solid #22c55e';
    el.style.backgroundColor = 'rgba(34,197,94,0.18)';
    el.style.borderRadius    = '4px';
    el.classList.add('ai-answer-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    break;
  }
}
