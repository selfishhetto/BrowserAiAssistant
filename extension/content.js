// Слушаем запрос на получение выделенного текста
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const text = window.getSelection()?.toString() || '';
    sendResponse({ text });
  }
  return true;
});
