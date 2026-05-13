const saveBtn    = document.getElementById('saveBtn');
const toast      = document.getElementById('toast');
const posLeft    = document.getElementById('posLeft');
const posRight   = document.getElementById('posRight');
const durationEl = document.getElementById('duration');
const modelSelect = document.getElementById('modelSelect');

chrome.storage.sync.get(['overlayPosition', 'overlayDuration', 'model'], (data) => {
  durationEl.value   = data.overlayDuration ?? 1.5;
  modelSelect.value  = data.model || 'gemma-4-31b-it';
  setActivePos(data.overlayPosition || 'right');
});

function setActivePos(pos) {
  posLeft.classList.toggle('active', pos === 'left');
  posRight.classList.toggle('active', pos === 'right');
}

posLeft.addEventListener('click',  () => setActivePos('left'));
posRight.addEventListener('click', () => setActivePos('right'));

saveBtn.addEventListener('click', () => {
  const pos = posLeft.classList.contains('active') ? 'left' : 'right';
  chrome.storage.sync.set({
    overlayPosition: pos,
    overlayDuration: parseFloat(durationEl.value) || 1.5,
    model:           modelSelect.value,
  }, () => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
});
