import { log } from '../modules/utility';

log('Popup script loaded!');

function restoreOptions() {
  chrome.storage.sync.get(['furigana'], function (items) {
    log('fetched storage sync items:', items);
    if (items.furigana) {
      (document.getElementById('furigana-select') as HTMLSelectElement).value =
        items.furigana;
    } else {
      (document.getElementById('furigana-select') as HTMLSelectElement).value =
        'none';
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
  chrome.storage.sync.set({ furigana: FuriganaType }, function () {
    log('Furigana Value is set to ' + FuriganaType);
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
