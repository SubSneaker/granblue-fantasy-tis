import { log } from '../modules/utility';

log('Popup script loaded!');

function restoreOptions() {
  chrome.storage.sync.get(['furigana', 'targetLanguage'], function (items) {
    log('fetched storage sync items:', items);
    if (items.furigana) {
      (document.getElementById('furigana-select') as HTMLSelectElement).value =
        items.furigana;
    } else {
      (document.getElementById('furigana-select') as HTMLSelectElement).value =
        'none';
    }
    if (items.targetLanguage) {
      (document.getElementById('language-select') as HTMLSelectElement).value =
        items.targetLanguage;
    } else {
      (document.getElementById('language-select') as HTMLSelectElement).value =
        'JA';
    }
  });
}

restoreOptions();

function resetOptions() {
  chrome.storage.sync.clear(function () {
    log('Options reset');
  });
  chrome.storage.local.clear(function () {
    log('Local storage reset');
  });
  alert('Options Reset!');
  restoreOptions();
}

function saveOptions() {
  const FuriganaType = (
    document.getElementById('furigana-select') as HTMLSelectElement
  ).value;
  const targetLanguage = (
    document.getElementById('language-select') as HTMLSelectElement
  ).value;
  chrome.storage.sync.set(
    { furigana: FuriganaType, targetLanguage },
    function () {
      log('Furigana Value is set to: ' + FuriganaType);
      log('Target Language is set to: ' + targetLanguage);
    }
  );

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    log('Active tab:', tabs[0]);
    // Check if the active tab's URL is Granblue Fantasy
    log('Sending message to content script at tab Id:', tabs[0].id, ' tab URL:', tabs[0].url);
    if(tabs[0].url?.startsWith("https://game.granbluefantasy.jp/")) {
        // Send a message directly to the content script running in the active granblue tab
        
        chrome.tabs.sendMessage(tabs[0].id!, 
          {
            type: 'TO_ISOLATED_WORLD',
            action: "configUpdate"
          });
    }
});

  alert('Options Saved!');
}

(document.getElementById('save') as HTMLButtonElement).addEventListener(
  'click',
  saveOptions
);
(document.getElementById('reset') as HTMLButtonElement).addEventListener(
  'click',
  resetOptions
);
