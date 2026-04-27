const SERVER = 'https://browseraiassistant-production.up.railway.app';

const systemPromptEl = document.getElementById('systemPrompt');
const saveBtn        = document.getElementById('saveBtn');
const testBtn        = document.getElementById('testBtn');
const toast          = document.getElementById('toast');
const statusDot      = document.getElementById('statusDot');
const statusText     = document.getElementById('statusText');
const statusBar      = document.getElementById('statusBar');
const posLeft        = document.getElementById('posLeft');
const posRight       = document.getElementById('posRight');
const durationEl     = document.getElementById('duration');

chrome.storage.sync.get(['systemPrompt', 'overlayPosition', 'overlayDuration'], (data) => {
  systemPromptEl.value = data.systemPrompt || '';
  durationEl.value     = data.overlayDuration ?? 1.5;
  setActivePos(data.overlayPosition || 'right');
});

function setActivePos(pos) {
  posLeft.classList.toggle('active', pos === 'left');
  posRight.classList.toggle('active', pos === 'right');
}

posLeft.addEventListener('click',  () => setActivePos('left'));
posRight.addEventListener('click', () => setActivePos('right'));

async function checkServer() {
  try {
    const res = await fetch(`${SERVER}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      statusDot.classList.remove('offline');
      statusText.textContent = 'Сервер работает';
      statusBar.style.background = 'rgba(0, 229, 160, 0.10)';
      statusBar.style.color = 'var(--accent)';
    } else {
      throw new Error();
    }
  } catch {
    statusDot.classList.add('offline');
    statusText.textContent = 'Сервер недоступен';
    statusBar.style.background = 'rgba(255, 77, 106, 0.10)';
    statusBar.style.color = 'var(--danger)';
  }
}

checkServer();

saveBtn.addEventListener('click', () => {
  const pos = posLeft.classList.contains('active') ? 'left' : 'right';
  chrome.storage.sync.set({
    systemPrompt:    systemPromptEl.value,
    overlayPosition: pos,
    overlayDuration: parseFloat(durationEl.value) || 1.5,
  }, () => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

testBtn.addEventListener('click', async () => {
  testBtn.textContent = 'Отправляю...';
  testBtn.disabled = true;
  try {
    const res = await fetch(`${SERVER}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Привет! Расширение работает.', sourceTitle: 'Тест' })
    });
    if (res.ok) {
      testBtn.textContent = '✓ Проверь Telegram!';
    } else {
      testBtn.textContent = '✗ Ошибка сервера';
    }
  } catch {
    testBtn.textContent = '✗ Сервер недоступен';
  }
  setTimeout(() => {
    testBtn.textContent = 'Тест → отправить привет в Telegram';
    testBtn.disabled = false;
  }, 3000);
});
