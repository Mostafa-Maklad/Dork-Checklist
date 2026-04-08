// background.js — Service Worker
// Handles tab creation from popup (window.open doesn't work in MV3 popups)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openTab') {
    chrome.tabs.create({ url: msg.url, active: true });
    sendResponse({ ok: true });
  }
  return true;
});
