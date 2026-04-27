chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const text = window.getSelection()?.toString() || '';
    sendResponse({ text });
  }
  if (message.type === 'HIGHLIGHT_ANSWER') {
    highlightAnswer(message.answer);
    sendResponse({ ok: true });
  }
  return true;
});

function highlightAnswer(answerText) {
  // Убрать предыдущую подсветку
  document.querySelectorAll('.ai-answer-highlight').forEach(el => {
    el.style.removeProperty('outline');
    el.style.removeProperty('background-color');
    el.style.removeProperty('border-radius');
    el.classList.remove('ai-answer-highlight');
  });

  const trimmed = answerText.trim();

  // Извлечь букву ответа: "b - text", "b) text", "B." → "b"
  // Или True/False целиком
  let letter = null;
  const letterMatch = trimmed.match(/^([a-zA-Z])\s*[-–)\]\.:\s]/);
  const tfMatch = trimmed.match(/^(true|false)/i);

  if (letterMatch) {
    letter = letterMatch[1].toLowerCase();
  } else if (tfMatch) {
    letter = tfMatch[1].toLowerCase();
  }

  if (!letter) return;

  const isTF = letter === 'true' || letter === 'false';
  // Паттерн для вариантов типа "b)", "b.", "b -", "(b)", "[b]"
  const regex = isTF
    ? new RegExp(`^\\s*${letter}(\\s|$|:)`, 'i')
    : new RegExp(`^\\s*[\\(\\[]?${letter}[\\)\\]\\.\\s:\\-–]`, 'i');

  const candidates = document.querySelectorAll(
    'label, li, [role="radio"], [role="option"], [role="listitem"],' +
    '[class*="answer"], [class*="option"], [class*="choice"], [class*="variant"], [class*="item"]'
  );

  for (const el of candidates) {
    if (!regex.test(el.textContent)) continue;

    el.style.outline = '3px solid #22c55e';
    el.style.backgroundColor = 'rgba(34, 197, 94, 0.18)';
    el.style.borderRadius = '4px';
    el.classList.add('ai-answer-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    break;
  }
}
