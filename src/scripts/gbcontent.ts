import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

import {
  GBChangeLanguage,
  GBRequestSceneInfo,
  setConfigHeaders,
} from '../modules/granblueInteractions';
import { getConfig, appConfig } from '../modules/config';
import { log, logLogo, resetConsoleLog } from '../modules/utility';
resetConsoleLog();

logLogo();
log(`Current URL: ${window.location.href}`);
let SOURCE_LANGUAGE = 'EN',
  SCENE_ID = '';

// listens to messages from the page context sent by `bridgeContent.ts`
window.addEventListener('message', (event: MessageEvent) => {
  // log('Message received : ', event);

  if (event.data?.type === 'TO_ISOLATED_WORLD') {
    log('Message received from: ', event.origin);
    switch (event.data?.action) {
      case 'gameData':
        log('Game version: ', event.data.gameVersion);
        log('Game language: ', event.data.gameLanguage);
        log('Game current scene: ', event.data.gameSceneId);
        setConfigHeaders({ 'X-VERSION': event.data?.gameVersion });
        SOURCE_LANGUAGE = event.data.gameLanguage.toUpperCase();
        SCENE_ID = event.data.gameSceneId;
        break;
    }
  }
});
// Listens to messages from popup when config updates.
chrome.runtime.onMessage.addListener(function (event, sender) {
  if (event.type === 'TO_ISOLATED_WORLD' && event.action === 'configUpdate') {
    getConfig();
  }
});

const kuroshiro = new Kuroshiro();

(async () => {
  await kuroshiro.init(
    new KuromojiAnalyzer({
      dictPath: 'https://cdn.jsdelivr.net/npm/kuromoji/dict/',
    })
  );

  log('Kuroshiro initialized, setting up translation loop handlers');
  window.addEventListener('load', async function () {
    // TODO: In the future, this should be replaced with a guaranteed promise to assure
    //the function only waits as much as it needs for the result, rather than an arbitrary timeout.
    window.postMessage(
      { type: 'TO_PAGE_CONTEXT' },
      'https://game.granbluefantasy.jp/'
    );
    this.setTimeout(async () => await startTransInSubsLoop(), 300);
  });

  window.addEventListener(
    'hashchange',
    async function (event: HashChangeEvent) {
      log('navigated to new URL!: ', event.newURL);
      window.postMessage(
        { type: 'TO_PAGE_CONTEXT' },
        'https://game.granbluefantasy.jp/'
      );
      this.setTimeout(async () => await startTransInSubsLoop(), 300);
    }
  );
})();

/**
 * This function is the main function that runs the translation loop, it will be called whenever the code is ready to run
 * based on the conditions it's called under
 * @param url string - The URL of the page to run the translation loop on
 *
 */
async function startTransInSubsLoop(url: string = window.location.href) {
  if (url.includes('/scene/')) {
    await getConfig();
    log('appConfig:', appConfig);

    log('scene page detected, starting translation loop');
    const sceneId: string = SCENE_ID;
    log(`scene Id: ${sceneId}`);
    const sceneType = url.match(/#([^\/]+)/)?.[1] ?? '';
    log(`scene Type: ${sceneType}`);

    // Runs when the page starts finished loading and the code is ready to run
    await waitForElm('.prt-message-area');

    const sceneData = await getSceneData(sceneType, sceneId, {
      from: SOURCE_LANGUAGE,
      to: appConfig.targetLanguage,
    });
    await preparePageForDualSubs();
    observeCurrentProgress((currentSlide: number) =>
      insertDualSub(sceneData?.scene_list[currentSlide].detail)
    );
  }
}

async function preparePageForDualSubs() {
  const textBox: HTMLElement | null = await waitForElm('.prt-message-area');
  if (textBox) {
    textBox.style.display = 'flex';
    textBox.style.flexFlow = 'column';
  }
}

async function getSceneData(
  sceneType: string,
  sceneId: string,
  { from, to }: { from: string; to: string } = { from: 'EN', to: 'JA' }
): Promise<{ scene_list: Array<{ detail: string }> }> {
  await GBChangeLanguage(to);
  const sceneData: { scene_list: Array<{ detail: string }> } = JSON.parse(
    await GBRequestSceneInfo(sceneType, sceneId)
  );
  GBChangeLanguage(from);

  log('sceneData in Japanese:', sceneData);
  log('Example japanese:', sceneData?.scene_list[0].detail);
  return sceneData;
}

async function insertDualSub(altText: string) {
  const textBoxInner: HTMLElement | null = await waitForElm(
    '.txt-message.typist-container'
  );
  if (textBoxInner) {
    log('textBoxInner:', textBoxInner.textContent);
    log('text Before Parsing:', altText);
    const translatedTextBody = new DOMParser().parseFromString(
      altText,
      'text/html'
    ).body;
    log('translatedTextBody:', translatedTextBody);
    if (
      appConfig.furiganaType !== 'none' &&
      appConfig.targetLanguage === 'JA'
    ) {
      await processNode(translatedTextBody);
      log('newAltText after Parsed:', translatedTextBody);
    }
    textBoxInner.style.fontSize = '12px';
    textBoxInner.style.fontFamily = 'initial';
    textBoxInner.insertAdjacentElement(
      'afterend',
      (() => {
        const altLangText = textBoxInner.cloneNode() as HTMLElement;
        altLangText.innerHTML = translatedTextBody.innerHTML;
        log('new AltText data: ', altLangText);
        return altLangText;
      })()
    );
  }
}

async function processNode(node: ChildNode) {
  if (
    node.nodeType === Node.TEXT_NODE &&
    (node.nodeValue || '').trim() !== ''
  ) {
    // Convert text node to Kanji with Romaji Furigana
    log('TEXT NODE FOUND ::: node.nodeValue:', node.nodeValue);
    const furiganaText = await kuroshiro.convert(node.nodeValue, {
      mode: 'furigana',
      to: appConfig.furiganaType,
    });
    log('furiganaText:', furiganaText);
    const tempContainer = document.createElement('span');
    tempContainer.innerHTML = furiganaText;
    log('tempContainer:', tempContainer);
    // Replace the current text node with the new elements
    while (tempContainer.firstChild) {
      node.parentNode!.insertBefore(tempContainer.firstChild, node);
    }
    node.parentNode!.removeChild(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Recursively process child nodes for elements
    for (const child of node.childNodes) {
      // To avoid duplication the code should skip furigana elements
      if (!['RT', 'RP', 'RUBY'].includes(child.nodeName))
        await processNode(child);
    }
  }
}

/**
 * This function observes the progress of the current slide in the game and calls the callback function
 * whenever the slide changes
 * @param callback - The function to call when the slide changes
 * @returns void
 *
 */
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
