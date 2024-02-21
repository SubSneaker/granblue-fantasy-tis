import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

import {
  GBChangeLanguage,
  GBRequestSceneInfo,
} from '../modules/granblueInteractions';
import { log, resetConsoleLog } from '../modules/utility';
resetConsoleLog();

log('EXTENSION CONTENT SCRIPT LOADED');
log(`Current URL: ${window.location.href}`);

const USE_FURIGANA = true;
let GAME_VERSION: string;
(async () => {
  const kuroshiro = new Kuroshiro();
  if (window.location.href.includes('quest/scene')) {
    // Initialize
    // Here uses async/await, you could also use Promise
    await kuroshiro.init(
      new KuromojiAnalyzer({
        dictPath: 'https://cdn.jsdelivr.net/npm/kuromoji/dict/',
      })
    );
    // Instantiate

    // await getGameVariable();

    log('This is a scene page');
    const sceneType: string =
      window.location.href.match(/#quest\/scene\/([^\/]+)/)?.[1] ?? '';
    log(`scene type: ${sceneType}`);

    // get updated Cookies from page
    const cookies: string = document.cookie;
    log(cookies);
    // use cookies to change user lang to JP temporarily in order to fetch Japanese text

    window.addEventListener('load', async function () {
      log('$$$$$$$$$$$ PAGE loaded!');
      log('window object:', window);

      log('Sending message to background page to get game variable');
      // GAME_VERSION = chrome.runtime.sendMessage({ message: "getGameVariable" }) as unknown as string;

      await waitForElm('.prt-message-area');

      await GBChangeLanguage('JA');
      const sceneJPData: { scene_list: Array<{ detail: string }> } = JSON.parse(
        await GBRequestSceneInfo(sceneType)
      );
      let currentSceneSlide: number = 0;
      GBChangeLanguage('EN');

      log('sceneData in Japanese:', sceneJPData);
      log(
        'Example japanese:',
        sceneJPData?.scene_list[currentSceneSlide].detail
      );

      const nextSlideElements: HTMLElement[] = [
        (await waitForElm('.prt-next-btn-area')) as HTMLElement,
        (await waitForElm('.prt-scene-comment')) as HTMLElement,
      ];

      const textBox: HTMLElement | null = await waitForElm('.prt-message-area');
      if (textBox) {
        textBox.style.display = 'flex';
        textBox.style.flexFlow = 'column';
      }

      observeCurrentProgress((currentSlide: number) =>
        insertDualSub(sceneJPData?.scene_list[currentSlide].detail)
      );
    });
  }

  async function insertDualSub(altText: string) {
    const textBoxInner: HTMLElement | null = await waitForElm(
      '.txt-message.typist-container'
    );
    if (textBoxInner) {
      log('textBoxInner:', textBoxInner.textContent);
      log('altText:', altText);
      let newAltText = altText;
      if (USE_FURIGANA) {
        log('textBefore: ', altText);
        const furiganaText = await kuroshiro.convert(altText, {
          mode: 'furigana',
          to: 'hiragana',
        });
        newAltText = furiganaText;
        log('newAltText:', newAltText);
      }
      textBoxInner.style.fontSize = '12px';
      textBoxInner.style.fontFamily = 'initial';
      textBoxInner.insertAdjacentElement(
        'afterend',
        (() => {
          const altLangText = textBoxInner.cloneNode() as HTMLElement;
          altLangText.innerHTML = newAltText;
          return altLangText;
        })()
      );
    }
  }
})();

function observeCurrentProgress(callback: (currentSlide: number) => void) {
  const progressElm: Element | null =
    document.querySelector('.prt-log-display');
  const observer = new MutationObserver((mutations) => {
    log('progress changed:', mutations);
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        log('progress added:', mutation.addedNodes);

        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.classList &&
            node.classList.contains('prt-log-each')
          ) {
            // get data-scenario-index attribute
            const currentSlide: number = parseInt(
              node.getAttribute('data-scenario-index') || '0'
            );
            log('new Slide:', node, ', index: ', currentSlide);
            callback(currentSlide);
          }
        }
      }
    }
  });
  if (progressElm) {
    // This observer never gets disconnected because the progressElm is never removed from the DOM.
    // When the page changes, the content is refreshed so the observer is removed anyways
    observer.observe(progressElm, {
      childList: true,
      subtree: true,
    });
  }
}

function waitForElm(selector: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    log('waiting for element:', selector);
    // If Immediately found the element, resolve it
    if (document.querySelector(selector)) {
      log('element found:', document.querySelector(selector));
      return resolve(document.querySelector(selector) as HTMLElement);
    }

    // Otherwise, create a MutationObserver to watch for the element to be added to the DOM
    // and resolve it when it is found
    const observer = new MutationObserver((mutations) => {
      log('mutation observer:', mutations);
      log('checking for element:', selector);
      if (document.querySelector(selector)) {
        log(
          'element found, disconnect observer:',
          document.querySelector(selector)
        );
        observer.disconnect();
        resolve(document.querySelector(selector) as HTMLElement);
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function getGameVariable(): any {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', function (event) {
      if (event.source !== window) return;

      if (event.data.type && event.data.type === 'FROM_PAGE') {
        const gameVariable = event.data.Game;
        if (gameVariable) {
          resolve(gameVariable);
        } else {
          reject(new Error('Game variable not found'));
        }
      }
    });
  });
}
