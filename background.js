chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensión instalada');
});

chrome.action.onClicked.addListener(async (tab) => {

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  chrome.tabs.sendMessage(tab.id, { type: 'toggle-ui' });
});





