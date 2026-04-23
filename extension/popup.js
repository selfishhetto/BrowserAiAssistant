const SERVER = 'https://browseraiassistant-production.up.railway.app';

const systemPromptEl = document.getElementById('systemPrompt');
const accessTokenEl = document.getElementById('accessToken');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const toast = document.getElementById('toast');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const statusBar = document.getElementById('statusBar');

chrome.storage.sync.get(['systemPrompt', 'accessToken'], (data) => {
  systemPromptEl.value = data.systemPrompt || '';
  accessTokenEl.value = data.accessToken || '';
});

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
  chrome.storage.sync.set({
    systemPrompt: systemPromptEl.value,
    accessToken: accessTokenEl.value.trim()
  }, () => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

testBtn.addEventListener('click', async () => {
  testBtn.textContent = 'Отправляю...';
  testBtn.disabled = true;
  try {
    const { accessToken } = await chrome.storage.sync.get(['accessToken']);
    const res = await fetch(`${SERVER}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Привет! Расширение работает.', sourceTitle: 'Тест', token: accessToken || '' })
    });
    if (res.ok) {
      testBtn.textContent = '✓ Проверь Telegram!';
    } else {
      const err = await res.json().catch(() => ({}));
      testBtn.textContent = err.error?.includes('доступ') ? '✗ Неверный ключ' : '✗ Ошибка сервера';
    }
  } catch {
    testBtn.textContent = '✗ Сервер недоступен';
  }
  setTimeout(() => {
    testBtn.textContent = 'Тест → отправить привет в Telegram';
    testBtn.disabled = false;
  }, 3000);
});
